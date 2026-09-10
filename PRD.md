# Relay --- Product Requirements Document

**Project:** Relay\
**Type:** API Gateway + Developer Platform\
**Status:** Planned\
**Primary goal:** Build a production-style API gateway that demonstrates
strong backend, distributed-systems, and full-stack engineering skills.

## 1. What is Relay?

Relay is a self-hostable API gateway that sits between clients and
backend services.

It handles common API infrastructure concerns:

-   Authentication
-   API keys
-   Rate limiting
-   Request routing
-   Request logging
-   Usage analytics
-   Access control
-   API configuration
-   Health monitoring

``` text
                    Relay
                      |
          +-----------+-----------+
          |           |           |
        Auth      Rate Limit   Logging
                      |
          +-----------+-----------+
          |           |           |
       Users       Orders      Payments
```

## 2. Problem

When an application grows from one backend service to multiple services,
infrastructure starts getting duplicated.

For example:

``` text
Frontend
   |
   +-- User Service
   |     +-- Auth
   |     +-- Rate limiting
   |     +-- Logging
   |
   +-- Order Service
   |     +-- Auth
   |     +-- Rate limiting
   |     +-- Logging
   |
   +-- Payment Service
         +-- Auth
         +-- Rate limiting
         +-- Logging
```

Relay centralizes these concerns.

## 3. Goals

### Primary goals

Relay should allow a developer to:

1.  Create an API
2.  Configure its upstream service
3.  Generate API keys
4.  Route requests through Relay
5.  Apply rate limits
6.  View request logs
7.  View API usage
8.  Manage API access
9.  Monitor upstream health

### Engineering goals

The project should demonstrate:

-   REST API design
-   PostgreSQL data modeling
-   Redis
-   Concurrency
-   Caching
-   Authentication
-   Authorization
-   Reverse proxying
-   Asynchronous processing
-   Observability
-   Distributed-system concepts
-   Containerization

## 4. Non-Goals

For the first version, Relay will not attempt to become a complete
enterprise API-management product.

Do not initially build:

-   Billing
-   Payments
-   Kubernetes operator
-   Complex service mesh
-   OAuth provider
-   Full API documentation generator
-   GraphQL gateway
-   AI features

These can be considered later.

## 5. Target Users

### Developer

Wants to expose and protect an API quickly.

### Small engineering team

Wants centralized API management without building infrastructure
themselves.

### API consumer

Uses an API through a Relay-generated endpoint and API key.

## 6. Core User Flow

``` text
Register
   |
Create Workspace
   |
Create API
   |
Configure Upstream
   |
Generate API Key
   |
Configure Rate Limit
   |
Send Request
   |
Relay processes request
   |
Upstream API
   |
Response
```

## 7. Example

Suppose the developer has:

``` text
Backend:
https://my-app.com
```

They create:

``` text
API Name: User Service
Slug: users
Upstream: https://my-app.com
```

Relay provides:

``` text
https://relay.example.com/users
```

Client sends:

``` bash
curl https://relay.example.com/users \
  -H "x-api-key: relay_xxxxxxxxx"
```

Relay:

``` text
Request
   |
Find API
   |
Validate API key
   |
Check rate limit
   |
Forward request
   |
Receive response
   |
Record metrics
   |
Return response
```

## 8. MVP Features

### 8.1 Authentication

Users can:

-   Register
-   Login
-   Logout
-   View current user

User fields:

``` text
id
name
email
password_hash
created_at
updated_at
```

Passwords must never be stored directly.

Use:

``` text
Argon2 / bcrypt
```

## 9. Workspaces

Every user can create or belong to a workspace.

``` text
Mohit's Workspace
|
+-- APIs
+-- API Keys
+-- Members
+-- Logs
+-- Analytics
```

Roles:

``` text
OWNER
ADMIN
MEMBER
VIEWER
```

Permissions should be enforced on the backend.

## 10. API Management

Users can create APIs.

### API fields

``` text
id
workspace_id
name
slug
description
upstream_url
status
created_at
updated_at
```

Example:

``` text
Name:
User Service

Slug:
users

Upstream:
http://localhost:4000

Status:
ACTIVE
```

## 11. Routing

Relay acts as a reverse proxy.

Request:

``` text
GET /users/42
```

Relay forwards:

``` text
GET http://user-service:4000/users/42
```

Relay must preserve:

-   HTTP method
-   Path
-   Query parameters
-   Request body
-   Appropriate headers

It should return the upstream response to the client.

## 12. API Keys

Developers can create keys.

Example:

``` text
Name: Mobile App
Environment: Production
```

Relay generates:

``` text
relay_live_xxxxxxxxxxxxx
```

### Security requirement

The raw API key must not be stored.

``` text
Raw Key
   |
  Hash
   |
PostgreSQL
```

When a request arrives:

``` text
Incoming API key
       |
      Hash
       |
Compare with database
```

The complete key should only be displayed once after creation.

## 13. Rate Limiting

Each API can have a configurable rate limit.

Example:

``` text
100 requests / minute
```

Flow:

``` text
Request
   |
API key validation
   |
Redis rate limiter
   |
Allowed?
 +-----+-----+
 |           |
YES          NO
 |           |
Proxy        429
```

Response when exceeded:

``` json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests"
}
```

Headers should expose useful information such as remaining requests
where practical.

### Initial algorithm

Use **Fixed Window**.

Later implement **Token Bucket**.

## 14. Request Logging

Relay records metadata for every request.

Example:

``` json
{
  "api_id": "api_123",
  "api_key_id": "key_456",
  "method": "GET",
  "path": "/users/42",
  "status_code": 200,
  "latency_ms": 37,
  "timestamp": "2026-09-08T12:00:00Z"
}
```

Do not log:

-   API keys
-   Passwords
-   Authorization tokens
-   Sensitive request bodies

## 15. Analytics

The dashboard should provide:

### Overview

``` text
Total Requests     1,284,291
Success Rate       99.2%
Error Rate         0.8%
Average Latency    84ms
```

### Analytics

Developers can see:

-   Requests over time
-   2xx / 3xx / 4xx / 5xx
-   Average latency
-   P95 latency
-   P99 latency
-   Most-used APIs
-   Most-used API keys
-   Rate-limit violations
-   Upstream failures

## 16. Request Logs UI

Users should be able to filter logs by:

-   API
-   Status
-   Method
-   API Key
-   Time range

Example:

``` text
GET    /users/42       200    37ms
POST   /users          201    82ms
GET    /orders         500    421ms
DELETE /users/12       204    29ms
```

Clicking a request should show:

-   Method
-   Path
-   Status
-   Latency
-   Timestamp
-   API
-   API Key

Sensitive headers must be redacted.

## 17. API Health

Relay periodically checks configured upstream services.

Example:

``` text
User API       Healthy
Order API      Healthy
Payment API    Unhealthy
```

Track:

``` text
last_check
status
response_time
failure_count
```

## 18. Environments

Support:

``` text
development
staging
production
```

Example:

``` text
Users API

Development
http://localhost:4000

Staging
https://staging-api.example.com

Production
https://api.example.com
```

Environment configuration should be isolated.

## 19. API Versioning

Support API versions:

``` text
/users/v1
/users/v2
```

A developer should be able to configure different upstreams:

``` text
v1 -> old service
v2 -> new service
```

This feature can be introduced after the core gateway works.

## 20. Caching

Optional caching for safe requests.

``` text
GET /products
       |
     Redis
    /     \
  HIT     MISS
   |        |
Response  Backend
             |
           Redis
             |
          Response
```

Configuration:

``` text
Cache: Enabled
TTL: 60 seconds
```

Initially support caching only for explicitly configured GET endpoints.

## 21. Audit Logs

Important workspace actions should be recorded.

Example:

``` text
Mohit created "Users API"

Mohit generated API key

Admin changed rate limit
100/min -> 500/min

Admin revoked API key
```

Audit log:

``` text
actor
action
resource
metadata
timestamp
```

## 22. Dashboard

``` text
+------------------------------------------+
| Relay                         Workspace ▼ |
+------------------------------------------+
|                                          |
| Requests   Success   Errors   Avg Latency|
| 1.28M      99.2%     0.8%       84ms     |
|                                          |
| Requests                                 |
|  +------+                                |
| /       \______                           |
|/                \____                     |
|                                          |
| Recent Requests                          |
| GET /users        200       37ms          |
| POST /orders      201       82ms          |
| GET /products     200       41ms          |
+------------------------------------------+
```

## 23. Frontend Pages

``` text
/login
/register

/dashboard

/apis
/apis/:id
/apis/:id/settings

/api-keys

/logs
/analytics

/team
/audit-logs

/settings
```

## 24. Backend Architecture

Start with a **modular monolith + separate gateway process**.

``` text
                  Browser
                     |
                     v
              Next.js Dashboard
                     |
                     v
              Management API
                     |
          +----------+----------+
          |          |          |
          v          v          v
      PostgreSQL   Redis      Kafka
                               |
                               v
                            Workers


Client
  |
  v
Relay Gateway
  |
  +-- Authentication
  +-- Rate Limiting
  +-- Routing
  +-- Logging
  +-- Metrics
  |
  v
Upstream Services
```

## 25. Technology Stack

### Frontend

``` text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Recharts
```

### Management API

``` text
Node.js
TypeScript
Fastify / Express
```

### Gateway

``` text
Go
```

Go is used specifically for the gateway so the project has a clear
reason to discuss concurrency and high-throughput request handling.

### Storage

``` text
PostgreSQL
Redis
```

### Events

``` text
Kafka
```

### Infrastructure

``` text
Docker
Docker Compose
Prometheus
Grafana
```

## 26. Database

Core schema:

``` text
users
  |
  v
workspace_members
  |
  v
workspaces
  |
  +----------------+
  v                v
apis           api_keys
  |
  +-- rate_limit_configs
  |
  +-- api_versions

request_logs
audit_logs
```

## 27. Management API

### Authentication

``` http
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Workspaces

``` http
POST /workspaces
GET  /workspaces
GET  /workspaces/:id
```

### APIs

``` http
POST   /apis
GET    /apis
GET    /apis/:id
PATCH  /apis/:id
DELETE /apis/:id
```

### API Keys

``` http
POST   /apis/:id/keys
GET    /apis/:id/keys
DELETE /api-keys/:id
```

### Logs

``` http
GET /logs
GET /logs/:id
```

### Analytics

``` http
GET /analytics/overview
GET /analytics/requests
GET /analytics/errors
GET /analytics/latency
```

## 28. Gateway API

The gateway should support arbitrary HTTP methods:

``` http
ANY /gateway/:apiSlug/*
```

Example:

``` text
/gateway/users/users/42
```

becomes:

``` text
http://user-service/users/42
```

Eventually simplify the public URL structure to:

``` text
https://relay.example.com/users/42
```

## 29. Error Handling

Relay should return consistent errors.

### Invalid API key

``` json
{
  "error": "invalid_api_key"
}
```

### Rate limited

``` json
{
  "error": "rate_limit_exceeded"
}
```

### API doesn't exist

``` json
{
  "error": "api_not_found"
}
```

### Upstream unavailable

``` json
{
  "error": "upstream_unavailable"
}
```

## 30. Reliability

### Timeout

Every upstream request should have a configurable timeout.

``` text
Gateway
   |
Upstream
   |
5 seconds
   |
Timeout
```

### Retry

Retries should be carefully restricted to requests where retrying is
safe.

### Circuit breaker --- later

``` text
HEALTHY
   |
Repeated failures
   |
OPEN
   |
Stop sending requests
   |
Recovery
   |
CLOSED
```

## 31. Observability

Expose metrics:

``` text
relay_requests_total
relay_request_duration_seconds
relay_errors_total
relay_rate_limit_hits_total
relay_upstream_errors_total
```

Prometheus collects them.

Grafana displays:

``` text
Requests/sec
P50 latency
P95 latency
P99 latency
5xx rate
4xx rate
Upstream failures
Rate-limit hits
```

## 32. Security

Relay must implement:

-   Password hashing
-   API-key hashing
-   RBAC
-   Input validation
-   Rate limiting
-   Secure cookies/tokens
-   CORS configuration
-   HTTPS in deployment
-   Secret management
-   Audit logs
-   Sensitive-data redaction

### Critical requirement

Relay must **never become an open proxy**.

Users can only route requests to upstream services they've configured.

## 33. Performance Requirements

For the MVP:

-   Gateway should add minimal latency
-   Requests should be processed concurrently
-   Redis should handle rate-limit checks
-   PostgreSQL should not be queried on every request when avoidable
-   Gateway configuration should be cached
-   Logs should not block the request path

Ideal request flow:

``` text
Request
   |
Memory/cache
   |
Redis
   |
Upstream
   |
Response
   |
Async logging
```

Avoid:

``` text
Request
 |
Postgres
 |
Postgres
 |
Postgres
 |
Upstream
```

## 34. Advanced Architecture

Once MVP works, introduce Kafka:

``` text
                     Gateway
                        |
                        v
                    Event Bus
                        |
                      Kafka
                        |
         +--------------+--------------+
         v              v              v
    Analytics       Audit Worker   Notification
      Worker
         |
         v
    PostgreSQL
```

Gateway should not wait for analytics processing before responding to
the client.

## 35. Development Roadmap

### Milestone 1 --- Foundation

-   Repository setup
-   Docker Compose
-   PostgreSQL
-   Redis
-   Next.js
-   Backend
-   Authentication

### Milestone 2 --- API Management

-   Workspaces
-   API CRUD
-   Upstream configuration
-   API status

### Milestone 3 --- Gateway

-   Go gateway
-   Routing
-   Proxying
-   API-key authentication

### Milestone 4 --- Rate Limiting

-   Redis integration
-   Fixed-window limiter
-   429 responses
-   Rate-limit headers

### Milestone 5 --- Observability

-   Request logs
-   Analytics
-   Prometheus
-   Grafana

### Milestone 6 --- Production Features

-   RBAC
-   Audit logs
-   API versions
-   Environments
-   Caching

### Milestone 7 --- Distributed Systems

-   Kafka
-   Background workers
-   Event processing
-   Notifications

### Milestone 8 --- Reliability

-   Timeouts
-   Retries
-   Circuit breaker
-   Health checks
-   Load testing

## 36. Definition of Done

Relay MVP is considered complete when a developer can:

``` text
Register
   |
Create workspace
   |
Create API
   |
Configure upstream
   |
Generate API key
   |
Set rate limit
   |
Send request
   |
Relay authenticates
   |
Relay rate-limits
   |
Relay forwards request
   |
Upstream responds
   |
Relay returns response
   |
Request appears in dashboard
```

And the entire system can be started with:

``` bash
docker compose up
```

## 37. Placement-Focused Target

The strongest practical version to build is:

``` text
                RELAY
                  |
        +---------+---------+
        |                   |
    Dashboard            Gateway
        |                   |
        |          +--------+--------+
        |          v        v        v
        |        Auth     Redis    Routing
        |                   |
        |              Rate Limit
        |                            |
        |                            v
        |                     Backend APIs
        |
        +-- Analytics
        +-- Request Logs
        +-- API Keys
        +-- API Management
```

Then add **Kafka + Prometheus/Grafana + caching + circuit breaker** only
after the core system is solid.

The finished project should give you meaningful interview discussion
around:

-   Why Redis?
-   Why not PostgreSQL for rate limiting?
-   What happens with 10 gateway instances?
-   How are race conditions handled?
-   Why Kafka?
-   What happens if Kafka goes down?
-   How would you horizontally scale Relay?
-   How do you prevent an open-proxy vulnerability?
-   Why Go for the gateway?
