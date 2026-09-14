# Low-Level Design (LLD): Relay

## 1. System Modules & Code Architecture

### 1.1 Management API (`apps/api/src/`)
- **Framework**: Express.js with TypeScript.
- **Entry Point (`server.ts`)**: Initializes Pino logger, connects to PostgreSQL via `pg` Pool, establishes Redis connection for rate-limiting and BullMQ, mounts `/routes`, and handles graceful shutdown on SIGINT/SIGTERM.
- **Middleware**:
  - `authMiddleware` (`middleware/auth.ts`): Decodes Authorization headers. If JWT, verifies via `jwks-rsa` against Neon Auth. If session cookie, proxies to Neon Auth `/get-session`. If `relay_ws_*` token, performs SHA-256 hash lookup in `workspace_api_keys`.
  - `validateMiddleware` (`middleware/validate.ts`): Wraps Zod schema validation for strict request typing.
  - `rateLimit` (`utils/rate-limit.ts`): Custom Redis-backed sliding window keyed by `X-Forwarded-For` or authenticated user ID.
- **Audit System (`utils/audit.ts`)**: Intercepts mutating actions, synchronously writes to `audit_logs` table, and asynchronously fetches configured webhooks to enqueue into BullMQ.

### 1.2 Gateway Proxy (`gateway/`)
- **Language**: Go (Golang) standard library.
- **Entry Point (`main.go`)**: Initializes `initDB()` and `initRedis()`, mounts catch-all route to `proxyHandler`.
- **Proxy Handler (`proxy.go`)**:
  1. Parses slug from `r.URL.Path` (`/:slug/path`).
  2. Queries `getApiBySlug(slug)`.
  3. Extracts `X-API-Key` header and computes `sha256(key)`.
  4. Queries `getApiKeyByHash(hash, apiID)`. Validates `revoked_at` and `expires_at`.
  5. Evaluates `CheckRateLimit()` via Redis.
  6. Constructs `httputil.ReverseProxy`. Uses custom `retryTransport` to catch 502/503/504 errors and retry once with a 50ms backoff.
  7. Strips external `X-API-Key`, injects internal `X-Relay-Api-Id` and `X-Relay-Signature`.
  8. Dispatches asynchronous goroutines to `updateApiKeyLastUsed()` and `logRequest()`.

### 1.3 Dashboard (`apps/dashboard/`)
- **Framework**: Next.js 16 App Router.
- **Data Fetching**: Server-side fetching using custom `fetchAPI` wrapper that attaches the Neon Auth session cookie.
- **State Management**: React Server Components (RSC) for initial data load, standard React `useState` for interactive forms.

## 2. Database Schema (PostgreSQL)

```sql
-- Users and Workspaces
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Actually stores OAuth Subject ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspace_members (
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin', -- 'owner', 'admin', 'viewer'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
);

-- Core API Gateway Configuration
CREATE TABLE apis (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  upstream_url VARCHAR(255) NOT NULL,
  shared_secret VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  environment VARCHAR(50) DEFAULT 'production',
  rate_limit_enabled BOOLEAN DEFAULT false,
  rate_limit_max INTEGER DEFAULT 100,
  rate_limit_window INTEGER DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  api_id INTEGER REFERENCES apis(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(50) NOT NULL,
  environment VARCHAR(50) DEFAULT 'production',
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

-- Telemetry & Events
CREATE TABLE api_request_logs (
  id SERIAL PRIMARY KEY,
  api_id INTEGER REFERENCES apis(id) ON DELETE CASCADE,
  api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  path VARCHAR(255) NOT NULL DEFAULT '/',
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_api_request_logs_api_id ON api_request_logs(api_id);
CREATE INDEX idx_api_request_logs_created_at ON api_request_logs(created_at);

CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL,
  secret VARCHAR(255),
  events JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 3. Rate Limiting Algorithm

Relay uses a Fixed Window Counter via Redis `INCR` and `EXPIRE`.

**Implementation Details:**
1. Generate key: `rl:api:{api_id}:{key_id}`.
2. Execute `INCR {key}`.
3. If result == 1, execute `EXPIRE {key} {window_seconds}`.
4. Retrieve TTL: `TTL {key}`.
5. If result > `max_requests`, deny request with `429 Too Many Requests` and set `Retry-After` header to TTL.
6. Else, allow request and set `X-RateLimit-Remaining` to `max_requests - result`.

*Failure Mode*: If Redis is unavailable, the Gateway and API default to "fail-open" to prevent caching outages from causing total system downtime.

## 4. Webhook Dispatch Pipeline

1. **Trigger**: `utils/audit.ts` calls `logAuditAction()`.
2. **Filter**: Queries DB for active webhooks subscribed to the specific event (or `*`).
3. **Queue**: For each matched webhook, calls `dispatchWebhook()` which adds a job to the `webhook-queue` BullMQ instance with configuration: `{ attempts: 3, backoff: { type: 'exponential', delay: 1000 } }`.
4. **Worker Execution**:
   - Worker (`jobs/webhookWorker.ts`) pulls job.
   - Computes `HMAC-SHA256` signature using the webhook secret and payload string.
   - Executes POST request with `x-relay-signature` header.
   - Awaits 2xx response. Non-2xx triggers retry loop.

## 5. Security & Cryptography

### API Key Generation
1. API Keys are generated securely using `crypto.randomBytes(32).toString('hex')`.
2. The key is presented to the user ONCE prefixed with `relay_`.
3. The server computes `crypto.createHash('sha256').update(key).digest('hex')` and stores ONLY the hash and a short prefix (for UI display) in the `api_keys` table.

### Upstream Verification
Relay injects `X-Relay-Signature` containing the `apis.shared_secret`. Upstream services should validate this header against their local environment variables to ensure requests originated from Relay and were successfully authenticated/rate-limited, thereby preventing direct bypassing.
