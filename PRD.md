# Product Requirements Document (PRD): Relay

## 1. Executive Summary

**Relay** is an open-source, high-performance API management platform. It provides a unified control plane (Dashboard & Management API) and a distributed data plane (Go Gateway Proxy) to help engineering teams secure, monitor, and rate-limit their internal and external APIs without writing infrastructure code.

## 2. Problem Statement

Engineering teams building service-oriented architectures inevitably face the same challenges:
- How do we authenticate external clients without hardcoding logic into every microservice?
- How do we prevent abuse and enforce rate limits globally?
- How do we get unified visibility into API traffic, errors, and latency?
- How do we notify users of events (via webhooks) reliably without crashing our main API threads?

Existing solutions like Kong, Tyk, and AWS API Gateway are either too complex to self-host, prohibitively expensive, or locked into a specific cloud provider ecosystem.

## 3. Target Audience & User Personas

1. **The Startup CTO (Primary)**: Needs a reliable, easy-to-deploy API gateway to monetize their API without spending weeks building billing/rate-limiting infrastructure.
2. **The Backend Engineer**: Wants to rip out repetitive authentication and logging middleware from their Node.js/Python services and offload it to a robust edge proxy.
3. **The DevOps Operator**: Needs unified visibility into traffic patterns and the ability to instantly revoke compromised API keys across the organization.

## 4. Product Goals & Success Metrics

**Goals:**
- **Developer Experience**: Provide a beautiful, zero-configuration dashboard that is a joy to use.
- **Performance**: The Gateway must add less than 2ms of latency to upstream requests.
- **Reliability**: Decouple asynchronous systems (like webhooks) from the critical path using isolated job queues.

**Success Metrics:**
- Gateway latency overhead (Target: <2ms p95)
- Dashboard Time-to-Interactive (Target: <1s)
- System Uptime (Target: 99.99%)

## 5. Core Features Specifications

### 5.1 Gateway & Routing (Data Plane)
- **High-Performance Proxy**: Written in Go using `net/http` and `httputil.ReverseProxy`.
- **Slug-Based Routing**: Maps incoming requests like `/:slug/path` to configured `upstream_url/path`.
- **Resilience**: Built-in retry transport for 502, 503, and 504 upstream errors.
- **Authentication**: Intercepts `X-API-Key`, hashes it via SHA-256, and verifies against the PostgreSQL database.
- **Header Injection**: Strips the external API key and injects internal trusted headers (`X-Relay-Api-Id`, `X-Relay-Signature`) for upstream validation.

### 5.2 Rate Limiting
- **Global & Per-API Limits**: Configurable sliding-window rate limiting backed by Redis.
- **Proxy Enforcement**: Gateway drops requests with `429 Too Many Requests` *before* they reach the upstream service.
- **Management API Enforcement**: Dashboard API is protected from abuse using `X-Forwarded-For` aware Redis limits (e.g., 500 req/min for authenticated users).

### 5.3 Webhooks & Asynchronous Events
- **Event-Driven Architecture**: Audit events and system alerts trigger webhooks.
- **Worker Isolation**: Webhooks are dispatched via a BullMQ Redis queue to prevent third-party server latency from blocking the main API thread.
- **Security**: All webhook payloads are signed using HMAC-SHA256.
- **Reliability**: Configured with 3 automatic retries and exponential backoff.

### 5.4 Team & Workspace Management
- **RBAC**: Three-tier role system (Owner, Admin, Viewer).
- **Isolation**: APIs, Keys, and Webhooks are strictly scoped to workspaces.
- **Personal Access Tokens**: Workspace API keys for programmatic access to the Relay Management API.

### 5.5 Analytics & Observability
- **Request Logging**: The gateway asynchronously logs method, path, status, and latency for every request.
- **Dashboard Charts**: Real-time visualization of traffic volume, error rates, and p95 latency.
- **Audit Trails**: Immutable logs of all administrative actions (key creation, API updates, member invitations).

## 6. Non-Functional Requirements

### Security
- **No Plaintext Keys**: API keys are generated once, displayed once, and stored purely as SHA-256 hashes.
- **Authentication**: Dashboard access is secured via Neon Auth (OpenID Connect / Google OAuth).
- **Privilege Escalation Prevention**: Strict middleware checks ensure users cannot access resources outside their authorized workspaces.

### Performance
- **Gateway Scaling**: The Go gateway is stateless and can be horizontally scaled infinitely behind a load balancer.
- **Database Pooling**: Both Node.js and Go services utilize database connection pooling to minimize connection overhead.

## 7. Competitive Analysis

| Feature | Relay | Kong | AWS API Gateway |
| :--- | :--- | :--- | :--- |
| **Setup Complexity** | Low (Docker Compose / Render) | High (Cassandra/Postgres + Lua) | Medium (AWS ecosystem knowledge) |
| **Dashboard UI** | Excellent (Modern Next.js) | Enterprise Only | Functional but clunky |
| **Vendor Lock-in** | None (Open Source) | Low | High |
| **Extensibility** | Go source code | Lua plugins | Lambda authorizers |

## 8. Future Roadmap

### v1.1 - Analytics Upgrade
- Implement ClickHouse or TimescaleDB for high-volume analytics storage (currently using Postgres).
- Advanced percentile filtering (p50, p90, p99).

### v1.2 - Monetization & Billing
- Stripe integration to bill end-users based on API usage volume.
- Quota enforcement (e.g., "10,000 requests per month").

### v2.0 - Edge Gateway
- Port the Go Gateway to Rust / WebAssembly for deployment directly to Cloudflare Workers or Vercel Edge.
