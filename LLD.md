# Relay --- Low-Level Design (LLD)

## 1. Document Information

**Project:** Relay\
**Type:** API Gateway + Developer Platform\
**Architecture:** Management API + Gateway + Async Workers\
**Primary stack:** Go, TypeScript/Node.js, Next.js, PostgreSQL, Redis,
Kafka, Docker

------------------------------------------------------------------------

# 2. System Architecture

Relay consists of four major parts:

``` text
                         ┌─────────────────────┐
                         │     Next.js UI      │
                         │     Dashboard       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Management API    │
                         │ Node.js / TypeScript│
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └────────────┐
                    ▼                               ▼
             ┌─────────────┐                 ┌─────────────┐
             │ PostgreSQL  │                 │    Redis    │
             └─────────────┘                 └─────────────┘

Client
  │
  ▼
┌─────────────────────┐
│    Relay Gateway    │
│        Go           │
└──────┬──────────────┘
       │
       ├── API Key Auth
       ├── Rate Limiting
       ├── Routing
       ├── Proxy
       ├── Metrics
       └── Async Events
              │
              ▼
           Kafka
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
   Analytics Audit  Notification
    Worker   Worker    Worker

       │
       ▼
  Upstream APIs
```

------------------------------------------------------------------------

# 3. Repository Structure

Recommended monorepo:

``` text
relay/
├── apps/
│   ├── dashboard/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── management-api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── workspace/
│       │   │   ├── api/
│       │   │   ├── api-key/
│       │   │   ├── logs/
│       │   │   ├── analytics/
│       │   │   └── audit/
│       │   ├── middleware/
│       │   ├── config/
│       │   ├── db/
│       │   └── server.ts
│       └── package.json
│
├── services/
│   ├── gateway/
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── auth/
│   │   │   ├── routing/
│   │   │   ├── ratelimit/
│   │   │   ├── proxy/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── metrics/
│   │   │   └── events/
│   │   └── go.mod
│   │
│   └── workers/
│       ├── analytics/
│       ├── audit/
│       └── notification/
│
├── packages/
│   ├── types/
│   └── config/
│
├── infra/
│   ├── docker/
│   ├── prometheus/
│   └── grafana/
│
├── docker-compose.yml
└── README.md
```

------------------------------------------------------------------------

# 4. Core Domain Models

## 4.1 User

``` text
User
----
id
name
email
password_hash
created_at
updated_at
```

Relationships:

``` text
User 1 ──── N WorkspaceMember
```

------------------------------------------------------------------------

# 5. Workspace

``` text
Workspace
---------
id
name
slug
created_at
updated_at
```

A workspace owns the APIs and API keys.

``` text
Workspace
   ├── APIs
   ├── API Keys
   ├── Members
   ├── Logs
   └── Audit Logs
```

------------------------------------------------------------------------

# 6. Workspace Member

``` text
WorkspaceMember
---------------
id
workspace_id
user_id
role
created_at
```

Roles:

``` text
OWNER
ADMIN
MEMBER
VIEWER
```

------------------------------------------------------------------------

# 7. API

``` text
API
---
id
workspace_id
name
slug
description
upstream_url
status
environment
created_at
updated_at
```

Example:

``` text
id: api_123
name: User API
slug: users
upstream_url: http://users:4000
status: ACTIVE
environment: production
```

------------------------------------------------------------------------

# 8. API Key

``` text
APIKey
------
id
workspace_id
api_id
name
key_hash
key_prefix
environment
expires_at
last_used_at
created_at
revoked_at
```

Never store the complete API key.

Example:

``` text
Raw:
relay_live_7f9d....

Database:
key_hash = SHA256(raw_key)
key_prefix = relay_live_7f
```

------------------------------------------------------------------------

# 9. Rate Limit Configuration

``` text
RateLimitConfig
---------------
id
api_id
algorithm
max_requests
window_seconds
enabled
```

Example:

``` text
algorithm: fixed_window
max_requests: 100
window_seconds: 60
enabled: true
```

------------------------------------------------------------------------

# 10. Request Log

``` text
RequestLog
----------
id
workspace_id
api_id
api_key_id
request_id
method
path
status_code
latency_ms
upstream_status
timestamp
```

Avoid storing sensitive headers or request bodies.

------------------------------------------------------------------------

# 11. Audit Log

``` text
AuditLog
--------
id
workspace_id
actor_id
action
resource_type
resource_id
metadata
created_at
```

Example:

``` text
actor_id: user_123
action: API_KEY_REVOKED
resource_type: api_key
resource_id: key_456
```

------------------------------------------------------------------------

# 12. API Version

``` text
APIVersion
----------
id
api_id
version
upstream_url
status
created_at
```

Example:

``` text
v1 → http://users-v1:4000
v2 → http://users-v2:4000
```

------------------------------------------------------------------------

# 13. PostgreSQL Relationships

``` text
users
  │
  └──────────────┐
                 ▼
        workspace_members
                 │
                 ▼
             workspaces
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      apis    api_keys  audit_logs
        │
        ├── rate_limit_configs
        │
        └── api_versions
        │
        ▼
   request_logs
```

------------------------------------------------------------------------

# 14. Gateway Request Lifecycle

This is the most important part of the LLD.

``` text
Client
  │
  ▼
HTTP Request
  │
  ▼
Request ID Middleware
  │
  ▼
Route Matcher
  │
  ▼
API Configuration
  │
  ▼
API Key Authentication
  │
  ▼
Rate Limiter
  │
  ▼
Optional Cache
  │
  ▼
Reverse Proxy
  │
  ▼
Upstream Service
  │
  ▼
Response
  │
  ├── Metrics
  ├── Async Event
  │
  ▼
Client
```

------------------------------------------------------------------------

# 15. Request ID Middleware

Every request receives a unique ID.

Example:

``` text
X-Request-ID: req_01JABC123
```

If the client already sends a trusted request ID, Relay can propagate it
subject to validation.

The ID should appear in:

-   logs
-   metrics/tracing context
-   error responses where useful
-   upstream request headers

------------------------------------------------------------------------

# 16. Route Matching

Incoming request:

``` http
GET /users/42
```

Relay extracts:

``` text
slug = users
path = /users/42
method = GET
```

It finds:

``` text
API:
slug = users
upstream = http://users:4000
```

Then builds:

``` text
http://users:4000/users/42
```

The routing layer should not contain authentication or rate-limit logic.
Keep these responsibilities separate.

------------------------------------------------------------------------

# 17. API Configuration Cache

Do not query PostgreSQL for every request.

Bad:

``` text
Request
  ↓
PostgreSQL
  ↓
Authenticate
  ↓
Proxy
```

Preferred:

``` text
Request
  ↓
In-memory API config
  ↓
Redis fallback
  ↓
PostgreSQL fallback
  ↓
Cache config
```

Example cached object:

``` json
{
  "api_id": "api_123",
  "slug": "users",
  "upstream_url": "http://users:4000",
  "rate_limit": {
    "max_requests": 100,
    "window_seconds": 60
  }
}
```

When an API configuration changes, invalidate/update the cache.

------------------------------------------------------------------------

# 18. API Key Authentication

Request:

``` http
GET /users/42
X-API-Key: relay_live_xxxxx
```

Flow:

``` text
Header
  ↓
Extract key
  ↓
Hash key
  ↓
Find matching key hash
  ↓
Check revoked_at
  ↓
Check expiration
  ↓
Check API/workspace relationship
  ↓
Allow / Reject
```

Invalid key:

``` http
401 Unauthorized
```

Example:

``` json
{
  "error": "invalid_api_key"
}
```

------------------------------------------------------------------------

# 19. Rate Limiter

Use Redis for the first implementation.

For fixed window:

``` text
Key:
rate:{api_id}:{api_key_id}:{window}
```

Example:

``` text
rate:api_123:key_456:1725782400
```

Redis operation:

``` text
INCR key
EXPIRE key 60
```

If:

``` text
count <= limit
```

allow.

If:

``` text
count > limit
```

return:

``` http
429 Too Many Requests
```

Important: the increment + expiry behavior must be designed atomically,
preferably with a Redis Lua script or equivalent atomic mechanism, so
concurrent requests cannot create inconsistent state.

------------------------------------------------------------------------

# 20. Rate Limit Response Headers

For allowed requests:

``` http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1725782460
```

For rejected requests:

``` http
HTTP/1.1 429 Too Many Requests
Retry-After: 24
```

------------------------------------------------------------------------

# 21. Reverse Proxy

The proxy receives the authenticated request and forwards it upstream.

Responsibilities:

-   Build upstream URL
-   Forward method
-   Forward query parameters
-   Forward body
-   Forward safe headers
-   Add request ID
-   Apply timeout
-   Receive response
-   Return response

Do not blindly forward hop-by-hop headers.

------------------------------------------------------------------------

# 22. Upstream Timeout

Default:

``` text
5 seconds
```

Configurable per API.

Flow:

``` text
Gateway
   │
   ▼
Upstream
   │
   ├── response → return
   │
   └── timeout → upstream_unavailable
```

Example:

``` json
{
  "error": "upstream_timeout"
}
```

------------------------------------------------------------------------

# 23. Retry Policy

Do not retry every request.

Initial policy:

``` text
GET/HEAD:
  retry limited transient failures

POST/PATCH/DELETE:
  no automatic retry by default
```

Retries should use:

-   small maximum retry count
-   exponential backoff
-   jitter
-   timeout budget

Example:

``` text
Attempt 1
   ↓
50ms
   ↓
Attempt 2
   ↓
100ms
   ↓
Attempt 3
```

------------------------------------------------------------------------

# 24. Circuit Breaker

Later implement per-upstream circuit breakers.

States:

``` text
CLOSED
  ↓
Failures exceed threshold
  ↓
OPEN
  ↓
Cooldown
  ↓
HALF_OPEN
  ↓
Successful probe → CLOSED
Failed probe → OPEN
```

When OPEN, Relay immediately fails requests without calling the
unhealthy upstream.

------------------------------------------------------------------------

# 25. Response Caching

Only explicitly configured safe requests should be cached.

Initial support:

``` text
GET
HEAD
```

Cache key:

``` text
cache:{api_id}:{method}:{normalized_path_and_query}:{relevant_variant}
```

Flow:

``` text
Request
  ↓
Cache lookup
  ├── HIT → Response
  │
  └── MISS
       ↓
    Upstream
       ↓
     Redis
       ↓
    Response
```

Do not cache responses containing sensitive or user-specific data unless
the cache policy explicitly supports safe isolation.

------------------------------------------------------------------------

# 26. Async Request Events

Gateway should avoid blocking on analytics.

After processing:

``` text
Gateway
   │
   ├── Return response
   │
   └── Publish event
             ↓
           Kafka
```

Example event:

``` json
{
  "event": "request.completed",
  "request_id": "req_123",
  "api_id": "api_123",
  "api_key_id": "key_456",
  "method": "GET",
  "path": "/users/42",
  "status_code": 200,
  "latency_ms": 37,
  "timestamp": "2026-09-08T12:00:00Z"
}
```

------------------------------------------------------------------------

# 27. Kafka Topics

Suggested topics:

``` text
relay.request.completed
relay.api.created
relay.api.updated
relay.api-key.created
relay.api-key.revoked
relay.rate-limit.exceeded
relay.upstream.failed
```

Partition request events by a stable key such as:

``` text
workspace_id
```

or:

``` text
api_id
```

depending on the ordering requirements.

------------------------------------------------------------------------

# 28. Analytics Worker

Consumes:

``` text
relay.request.completed
```

Responsibilities:

-   Aggregate request counts
-   Aggregate status codes
-   Calculate latency statistics
-   Update analytics storage

Do not calculate expensive analytics synchronously inside the gateway.

------------------------------------------------------------------------

# 29. Audit Worker

Consumes management events:

``` text
relay.api.created
relay.api.updated
relay.api-key.revoked
```

Writes audit records.

------------------------------------------------------------------------

# 30. Management API Architecture

Use a modular architecture:

``` text
HTTP Controller
      ↓
Service
      ↓
Repository
      ↓
PostgreSQL
```

Example:

``` text
POST /apis

APIController
    ↓
APIService
    ↓
APIRepository
    ↓
PostgreSQL
```

Keep business logic out of controllers.

------------------------------------------------------------------------

# 31. API Module

Responsibilities:

``` text
Create API
Get API
List APIs
Update API
Delete API
Validate upstream
Invalidate cache
Publish event
```

Service interface:

``` text
CreateAPI()
GetAPI()
ListAPIs()
UpdateAPI()
DeleteAPI()
```

------------------------------------------------------------------------

# 32. API Key Module

Responsibilities:

``` text
CreateKey()
ListKeys()
RevokeKey()
ValidateKey()
```

Creation flow:

``` text
Generate random secret
       ↓
Create public prefix
       ↓
Hash secret
       ↓
Store hash
       ↓
Return raw key once
```

------------------------------------------------------------------------

# 33. Workspace Authorization

Every management request should pass:

``` text
Authentication
      ↓
Workspace membership
      ↓
Role check
      ↓
Resource access
```

Example:

``` text
DELETE /apis/api_123
```

Checks:

``` text
Is user authenticated?
       ↓
Is user member of workspace?
       ↓
Does role allow deletion?
       ↓
Does API belong to workspace?
       ↓
Delete
```

Never trust a workspace ID supplied by the client without checking
ownership/membership.

------------------------------------------------------------------------

# 34. REST API Contracts

## Create API

``` http
POST /apis
Content-Type: application/json
```

Request:

``` json
{
  "name": "User API",
  "slug": "users",
  "upstream_url": "http://users:4000",
  "environment": "production"
}
```

Response:

``` json
{
  "id": "api_123",
  "name": "User API",
  "slug": "users",
  "status": "ACTIVE"
}
```

------------------------------------------------------------------------

# 35. Create API Key

``` http
POST /apis/api_123/keys
```

Request:

``` json
{
  "name": "Mobile App",
  "environment": "production"
}
```

Response:

``` json
{
  "id": "key_123",
  "name": "Mobile App",
  "key": "relay_live_xxxxxxxxx",
  "expires_at": null
}
```

The raw key should only be returned at creation time.

------------------------------------------------------------------------

# 36. Request Logs API

``` http
GET /logs?api_id=api_123&status=500&page=1
```

Response:

``` json
{
  "data": [
    {
      "request_id": "req_123",
      "method": "GET",
      "path": "/users/42",
      "status_code": 500,
      "latency_ms": 421,
      "timestamp": "2026-09-08T12:00:00Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 102
}
```

Use pagination.

------------------------------------------------------------------------

# 37. Analytics API

``` http
GET /analytics/overview
GET /analytics/requests
GET /analytics/status-codes
GET /analytics/latency
```

Example:

``` json
{
  "requests": 1284291,
  "success_rate": 99.2,
  "error_rate": 0.8,
  "avg_latency_ms": 84,
  "p95_latency_ms": 192,
  "p99_latency_ms": 401
}
```

------------------------------------------------------------------------

# 38. Error Model

Use a consistent format:

``` json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The API key is invalid or revoked",
    "request_id": "req_123"
  }
}
```

Common errors:

``` text
INVALID_API_KEY
API_NOT_FOUND
API_DISABLED
RATE_LIMIT_EXCEEDED
UPSTREAM_TIMEOUT
UPSTREAM_UNAVAILABLE
INVALID_REQUEST
FORBIDDEN
INTERNAL_ERROR
```

------------------------------------------------------------------------

# 39. HTTP Status Codes

``` text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

------------------------------------------------------------------------

# 40. Concurrency

The Go gateway must process many requests concurrently.

Conceptually:

``` text
Incoming Requests
   │
   ├── Request 1 → goroutine
   ├── Request 2 → goroutine
   ├── Request 3 → goroutine
   ├── Request 4 → goroutine
   └── Request N → goroutine
```

Avoid shared mutable state where possible.

For shared configuration:

``` text
Read-heavy
   ↓
Immutable snapshots / atomic replacement
```

instead of locking every request.

------------------------------------------------------------------------

# 41. Configuration Reloading

When an API changes:

``` text
Dashboard
   ↓
Management API
   ↓
PostgreSQL
   ↓
Publish config update
   ↓
Gateway updates local configuration
```

For MVP, Redis pub/sub can be used.

Later:

``` text
Kafka
```

can distribute configuration events.

------------------------------------------------------------------------

# 42. Gateway Configuration Strategy

Gateway maintains:

``` text
API Config Cache
```

Example:

``` text
api_123:
  slug: users
  upstream: http://users:4000
  auth: api_key
  rate_limit: 100/min
```

Startup:

``` text
Gateway
   ↓
Load active configs
   ↓
Memory
```

Runtime updates:

``` text
Config Event
   ↓
Gateway
   ↓
Atomic config replacement
```

------------------------------------------------------------------------

# 43. Health Checks

Gateway periodically checks:

``` text
GET /health
```

or a configured health endpoint.

Track:

``` text
healthy
unhealthy
latency
last_checked
consecutive_failures
```

Avoid allowing health checks to overload upstream services.

------------------------------------------------------------------------

# 44. Observability

## Metrics

Gateway exposes:

``` text
relay_requests_total
relay_request_duration_seconds
relay_request_errors_total
relay_rate_limit_hits_total
relay_upstream_requests_total
relay_upstream_errors_total
relay_upstream_latency_seconds
relay_cache_hits_total
relay_cache_misses_total
```

## Logs

Use structured JSON logs:

``` json
{
  "level": "info",
  "service": "gateway",
  "request_id": "req_123",
  "api_id": "api_123",
  "status": 200,
  "latency_ms": 37
}
```

------------------------------------------------------------------------

# 45. Security Model

## API Keys

-   Generate cryptographically secure random keys
-   Hash before storage
-   Never log raw keys
-   Show only once
-   Support revocation
-   Support expiration

## Authentication

Management API:

``` text
Session/JWT
```

Gateway:

``` text
API Key
```

## Authorization

Use workspace-level RBAC.

## SSRF Protection

This is a critical gateway concern.

Because users provide upstream URLs, Relay must not blindly allow access
to arbitrary internal destinations.

At minimum, validate/restrict:

-   localhost targets
-   private IP ranges
-   link-local addresses
-   cloud metadata endpoints
-   unsupported URL schemes
-   unsafe redirects

For a production deployment, resolve and validate destinations carefully
to reduce DNS-rebinding and SSRF risks.

------------------------------------------------------------------------

# 46. Open Proxy Prevention

Never do:

``` text
GET /proxy?url=https://anything.com
```

Instead:

``` text
API ID
   ↓
Trusted stored upstream
   ↓
Proxy
```

Only administrators/developers with permission can create or modify
upstream configuration.

------------------------------------------------------------------------

# 47. Idempotency

For future payment/order-style upstreams, support:

``` http
Idempotency-Key: abc123
```

Flow:

``` text
Request
   ↓
Idempotency key
   ↓
Redis
   ├── existing → return stored result
   └── new → process
```

Do not implement this globally without defining the semantics carefully.
Make it opt-in per API/route.

------------------------------------------------------------------------

# 48. Caching Consistency

Cache invalidation rules:

``` text
API config changed
    ↓
Invalidate config cache

Cached API response changed
    ↓
TTL expiration / explicit invalidation
```

For MVP, prefer short TTLs and explicit configuration over complex
invalidation logic.

------------------------------------------------------------------------

# 49. Database Indexes

Important indexes:

``` text
users(email)

workspace_members(workspace_id, user_id)

apis(workspace_id)
apis(slug)
apis(workspace_id, slug)

api_keys(key_hash)
api_keys(api_id)
api_keys(workspace_id)

request_logs(api_id, timestamp)
request_logs(workspace_id, timestamp)
request_logs(status_code, timestamp)

audit_logs(workspace_id, created_at)
```

For high-volume request logs, consider time-based partitioning later.

------------------------------------------------------------------------

# 50. Transaction Boundaries

Creating an API:

``` text
BEGIN
  Insert API
  Insert default rate-limit configuration
COMMIT
```

Creating an API key:

``` text
Generate key
Hash key

BEGIN
  Insert API key
COMMIT

Return raw key
```

Publishing events should be designed carefully so database state and
event delivery do not diverge. For production, use an **outbox pattern**
rather than relying on a database transaction plus a separate Kafka
publish.

------------------------------------------------------------------------

# 51. Outbox Pattern --- Advanced

``` text
Management API
      ↓
PostgreSQL Transaction
   ├── API update
   └── Outbox event
          ↓
     Outbox Worker
          ↓
        Kafka
```

This prevents:

``` text
DB updated
Kafka publish failed
```

from leaving the system inconsistent.

------------------------------------------------------------------------

# 52. Failure Scenarios

## Redis unavailable

Rate limiting should fail according to an explicit policy.

For security-sensitive APIs:

``` text
Redis unavailable
      ↓
Fail closed
```

For less critical APIs:

``` text
Redis unavailable
      ↓
Temporary fallback / degraded mode
```

Make this configurable rather than silently bypassing limits.

## PostgreSQL unavailable

Existing gateway traffic should ideally continue using cached
configuration where possible.

Management operations fail until PostgreSQL recovers.

## Kafka unavailable

Gateway should not fail normal API requests solely because analytics
events cannot be published.

Use:

``` text
bounded local buffering / retry
```

with clear limits.

## Upstream unavailable

Return:

``` text
502 Bad Gateway
```

or:

``` text
503 Service Unavailable
```

depending on the failure type.

------------------------------------------------------------------------

# 53. Docker Compose

Development environment:

``` text
services:

  dashboard
    port: 3000

  management-api
    port: 4000

  gateway
    port: 8080

  postgres
    port: 5432

  redis
    port: 6379

  kafka
    port: 9092

  prometheus
    port: 9090

  grafana
    port: 3001
```

------------------------------------------------------------------------

# 54. Local Demo Setup

Example upstream services:

``` text
users-service
  :5001

orders-service
  :5002

payments-service
  :5003
```

Relay:

``` text
:8080
```

Demo:

``` text
GET :8080/users/123
       ↓
Relay
       ↓
users-service:5001/users/123
```

Then demonstrate:

``` text
1. Valid API key
2. Invalid API key
3. Rate-limit violation
4. Upstream failure
5. Request logs
6. Analytics
7. API configuration change
```

------------------------------------------------------------------------

# 55. Testing Strategy

## Unit Tests

Test:

-   API key hashing
-   API key validation
-   route matching
-   rate-limit calculations
-   RBAC
-   cache key generation
-   error mapping

## Integration Tests

Test:

``` text
Gateway + Redis
Gateway + PostgreSQL
Gateway + Upstream
Management API + PostgreSQL
```

## End-to-End

Scenario:

``` text
Create workspace
   ↓
Create API
   ↓
Generate API key
   ↓
Configure rate limit
   ↓
Send request
   ↓
Receive upstream response
   ↓
Check request log
   ↓
Check analytics
```

## Load Testing

Use a tool such as:

``` text
k6
```

Measure:

``` text
Requests/sec
P50 latency
P95 latency
P99 latency
Error rate
CPU
Memory
```

------------------------------------------------------------------------

# 56. Recommended Build Order

Do not start with Kafka or microservices.

### Step 1

Build:

``` text
Next.js
Node API
PostgreSQL
```

### Step 2

Implement:

``` text
Auth
Workspaces
API CRUD
```

### Step 3

Build the Go gateway:

``` text
Routing
Reverse proxy
API-key authentication
```

### Step 4

Add Redis:

``` text
Rate limiting
Config caching
```

### Step 5

Add:

``` text
Request logging
Analytics
```

### Step 6

Add:

``` text
Docker
Prometheus
Grafana
```

### Step 7

Add Kafka:

``` text
Async events
Analytics worker
Audit worker
```

### Step 8

Add advanced reliability:

``` text
Timeouts
Retries
Circuit breaker
Health checks
```

------------------------------------------------------------------------

# 57. Final Architecture

The target architecture should look like:

``` text
                         ┌──────────────────┐
                         │    Next.js UI    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Management API  │
                         │   TypeScript     │
                         └───────┬───┬──────┘
                                 │   │
                    ┌────────────┘   └────────────┐
                    ▼                             ▼
             ┌─────────────┐               ┌─────────────┐
             │ PostgreSQL  │               │    Redis    │
             └─────────────┘               └─────────────┘


Client
  │
  ▼
┌─────────────────────────────────────────┐
│             Relay Gateway               │
│                   Go                    │
│                                         │
│  Request ID                             │
│      ↓                                  │
│  Route Match                            │
│      ↓                                  │
│  API Config                             │
│      ↓                                  │
│  API Key Auth                           │
│      ↓                                  │
│  Rate Limit ────────────────→ Redis     │
│      ↓                                  │
│  Cache                                  │
│      ↓                                  │
│  Reverse Proxy                          │
│      ↓                                  │
│  Timeout / Retry / Circuit Breaker      │
└──────────────┬──────────────────────────┘
               │
               ├───────────────→ Kafka
               │                   │
               │              ┌────┴────┐
               │              ▼         ▼
               │         Analytics    Audit
               │          Worker      Worker
               │
               ▼
        Upstream Services
        ┌──────┼──────┐
        ▼      ▼      ▼
      Users  Orders Payments


Monitoring:

Gateway ──→ Prometheus ──→ Grafana
```

------------------------------------------------------------------------

# 58. MVP Definition

The first production-quality milestone is complete when:

``` text
                    RELAY MVP

                         │
          ┌──────────────┴──────────────┐
          │                             │
      Management                    Gateway
          │                             │
      Auth                             Routing
      Workspace                        Proxy
      API CRUD                         API Key Auth
      API Keys                         Rate Limiting
                                      Redis
                                       │
                                       ▼
                                  Upstream API
                                       │
                                       ▼
                                    Response
                                       │
                                       ▼
                                  Request Logs
```

MVP should work end-to-end before Kafka, caching, circuit breakers, or
advanced analytics are added.

------------------------------------------------------------------------

# 59. Interview Talking Points

Relay should be designed so you can explain:

### Why Go for the gateway?

Because the gateway is a high-concurrency, I/O-heavy component where
Go's lightweight concurrency model and standard HTTP tooling are a good
fit.

### Why Redis?

Rate limiting requires fast atomic counters and low latency. Redis
provides atomic operations and TTLs.

### Why not PostgreSQL for rate limiting?

PostgreSQL can implement counters, but using it for every gateway
request creates unnecessary database load and contention.

### Why Kafka?

Analytics and audit processing do not need to block the request path.
Kafka decouples the gateway from asynchronous consumers.

### Why cache API configuration?

The gateway should not perform a database lookup for every request.

### How do you scale Relay?

Run multiple stateless gateway instances behind a load balancer:

``` text
                 Load Balancer
                 /     |     \
                /      |      \
         Gateway 1  Gateway 2  Gateway 3
              \       |       /
               \      |      /
                  Redis
                    |
                Upstreams
```

### What happens when Redis fails?

The rate-limit failure policy must be explicit. Security-sensitive APIs
can fail closed; less critical workloads can use a controlled degraded
mode.

### How do you prevent an open proxy?

Only route to upstream URLs stored in authorized API configuration, with
SSRF protections and destination validation.

------------------------------------------------------------------------

# 60. Success Criteria

Relay is successful when it demonstrates all of the following:

-   A real request passes through the gateway
-   API keys are securely validated
-   Rate limiting works under concurrent requests
-   Redis is used for fast state
-   API configuration is cached
-   Upstream failures are handled
-   Requests are observable
-   Analytics are asynchronous
-   Workspace authorization works
-   The gateway can run multiple instances
-   The entire system can be started locally with Docker Compose
-   Automated tests cover the critical request path
-   Load testing demonstrates measurable performance

The core principle is:

> **Build the gateway first. Add the platform around it.**
