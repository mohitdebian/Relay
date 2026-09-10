# Relay --- High-Level Design (HLD)

## 1. Overview

**Relay** is a self-hostable API Gateway and Developer Platform.

It sits between clients and backend services and provides centralized:

-   API routing
-   API-key authentication
-   Rate limiting
-   Request logging
-   Analytics
-   Caching
-   Access control
-   Health monitoring
-   Observability

The system is designed to start as a small, understandable architecture
and evolve toward a distributed system.

------------------------------------------------------------------------

# 2. High-Level Architecture

``` text
                              ┌─────────────────────┐
                              │      Browser        │
                              │   Relay Dashboard   │
                              └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   Management API    │
                              │  Node.js / TypeScript│
                              └──────┬─────────┬─────┘
                                     │         │
                         ┌───────────┘         └───────────┐
                         ▼                                 ▼
                  ┌─────────────┐                   ┌─────────────┐
                  │ PostgreSQL  │                   │    Redis    │
                  │  Metadata   │                   │ Cache / RL  │
                  └─────────────┘                   └─────────────┘


Client
  │
  ▼
┌──────────────────────────────────────────┐
│              Relay Gateway               │
│                   Go                     │
│                                          │
│  Routing → Auth → Rate Limit → Proxy     │
│       │         │          │             │
│       └─────────┴──────────┘             │
│                 │                        │
│             Metrics / Events             │
└──────────────┬───────────────┬───────────┘
               │               │
               │               ▼
               │          ┌─────────┐
               │          │  Kafka  │
               │          └────┬────┘
               │               │
               │       ┌───────┼────────┐
               │       ▼       ▼        ▼
               │   Analytics  Audit  Notifications
               │    Worker    Worker    Worker
               │
               ▼
       ┌─────────────────────┐
       │   Upstream APIs     │
       ├─────────────────────┤
       │ User Service        │
       │ Order Service       │
       │ Payment Service     │
       │ Other Services      │
       └─────────────────────┘

Monitoring:
Gateway ──→ Prometheus ──→ Grafana
```

------------------------------------------------------------------------

# 3. Architectural Principles

## 3.1 Stateless Gateway

Gateway instances should not maintain important persistent state
locally.

``` text
Gateway 1 ─┐
Gateway 2 ─┼──→ Redis / PostgreSQL
Gateway 3 ─┘
```

This makes horizontal scaling straightforward.

## 3.2 Fast Request Path

The gateway request path should contain only work necessary to serve the
request.

``` text
Request
  ↓
Routing
  ↓
Authentication
  ↓
Rate Limit
  ↓
Proxy
  ↓
Response
```

Analytics, auditing, and notifications should happen asynchronously.

## 3.3 PostgreSQL as Source of Truth

PostgreSQL stores persistent configuration and metadata.

Redis is used for fast temporary state and caching.

## 3.4 Event-Driven Processing

Kafka decouples the gateway from background processing.

``` text
Gateway
   ↓
Kafka
   ├── Analytics
   ├── Audit
   └── Notifications
```

------------------------------------------------------------------------

# 4. Major Components

## 4.1 Dashboard

Technology:

``` text
Next.js
TypeScript
Tailwind CSS
```

Responsibilities:

-   User authentication UI
-   Workspace management
-   API management
-   API key management
-   Rate-limit configuration
-   Request logs
-   Analytics
-   Team management
-   Audit logs
-   Settings

The dashboard communicates with the Management API.

------------------------------------------------------------------------

# 5. Management API

Technology:

``` text
Node.js
TypeScript
Fastify / Express
```

Responsibilities:

-   Authentication
-   Workspace management
-   RBAC
-   API CRUD
-   API-key lifecycle
-   Configuration management
-   Analytics queries
-   Log queries
-   Audit operations

It should not proxy application traffic.

------------------------------------------------------------------------

# 6. Relay Gateway

Technology:

``` text
Go
```

This is the core of the project.

Responsibilities:

-   Request routing
-   API-key authentication
-   Rate limiting
-   Reverse proxying
-   Timeout handling
-   Retry policy
-   Circuit breaking
-   Cache lookup
-   Metrics
-   Request IDs
-   Event publishing

The gateway should be optimized for high-concurrency I/O.

------------------------------------------------------------------------

# 7. PostgreSQL

PostgreSQL stores persistent application state.

Main entities:

``` text
users
workspaces
workspace_members
apis
api_keys
rate_limit_configs
api_versions
request_logs
audit_logs
```

PostgreSQL is the source of truth for management data.

------------------------------------------------------------------------

# 8. Redis

Redis handles low-latency state.

Primary use cases:

``` text
Rate limiting
API configuration cache
Response cache
Idempotency state
Configuration invalidation
```

Example:

``` text
Gateway
   │
   ├── Config → Redis
   │
   ├── Rate Limit → Redis
   │
   └── Cache → Redis
```

------------------------------------------------------------------------

# 9. Kafka

Kafka handles asynchronous events.

Example topics:

``` text
relay.request.completed
relay.api.created
relay.api.updated
relay.api-key.created
relay.api-key.revoked
relay.rate-limit.exceeded
relay.upstream.failed
```

Kafka allows consumers to scale independently.

------------------------------------------------------------------------

# 10. Workers

## Analytics Worker

Consumes request events.

Responsibilities:

-   Request aggregation
-   Status-code aggregation
-   Latency metrics
-   Usage statistics

## Audit Worker

Consumes administrative events.

Responsibilities:

-   Persist audit events
-   Track important workspace changes

## Notification Worker

Potential future responsibilities:

-   Upstream outage alerts
-   Rate-limit alerts
-   API-key expiration alerts

------------------------------------------------------------------------

# 11. Request Flow

The most important system flow:

``` text
                    Client
                      │
                      ▼
               Relay Gateway
                      │
                      ▼
                Request ID
                      │
                      ▼
                 Route Match
                      │
                      ▼
               API Config
                      │
                      ▼
              API Key Auth
                      │
                      ▼
               Rate Limiter
                      │
                      ▼
                Cache Lookup
                  /       \
                HIT       MISS
                 │          │
                 │          ▼
                 │      Reverse Proxy
                 │          │
                 │          ▼
                 │      Upstream API
                 │          │
                 │          ▼
                 │       Response
                 │          │
                 └──────┬───┘
                        │
                        ▼
                    Client
                        │
                        └────→ Async Event → Kafka
```

------------------------------------------------------------------------

# 12. API Configuration Flow

When a developer creates an API:

``` text
Dashboard
   ↓
Management API
   ↓
Validate configuration
   ↓
PostgreSQL
   ↓
Publish configuration event
   ↓
Gateway updates local cache
```

Example:

``` text
API:
users

Upstream:
http://users-service:4000

Rate Limit:
100 req/min
```

------------------------------------------------------------------------

# 13. API Request Routing

Example client request:

``` http
GET /users/123
X-API-Key: relay_live_xxx
```

Gateway extracts:

``` text
API slug = users
Path = /users/123
Method = GET
```

It resolves:

``` text
users → http://users-service:4000
```

Then forwards:

``` http
GET http://users-service:4000/users/123
```

------------------------------------------------------------------------

# 14. Authentication Architecture

Management API:

``` text
Browser
   ↓
Session / JWT
   ↓
Management API
```

Gateway:

``` text
Client
   ↓
X-API-Key
   ↓
Gateway
   ↓
Hash key
   ↓
Validate
```

API keys are hashed before storage.

------------------------------------------------------------------------

# 15. Rate Limiting Architecture

``` text
                    Request
                       │
                       ▼
                  Rate Limiter
                       │
                       ▼
                     Redis
                       │
               ┌───────┴───────┐
               │               │
            Allowed          Denied
               │               │
               ▼               ▼
            Upstream           429
```

Initial algorithm:

``` text
Fixed Window
```

Future:

``` text
Token Bucket
Sliding Window
```

------------------------------------------------------------------------

# 16. Caching Architecture

Configuration cache:

``` text
Gateway
   ↓
Memory
   ↓ miss
Redis
   ↓ miss
PostgreSQL
```

Response cache:

``` text
Client
   ↓
Gateway
   ↓
Redis
   ├── HIT → Response
   └── MISS
          ↓
       Upstream
          ↓
        Redis
          ↓
       Response
```

------------------------------------------------------------------------

# 17. Async Event Architecture

Gateway should not synchronously write analytics data.

Instead:

``` text
Gateway
   │
   ├── Return response
   │
   └── Publish event
           ↓
         Kafka
           │
      ┌────┼─────┐
      ▼    ▼     ▼
 Analytics Audit Notification
```

This keeps the request path fast.

------------------------------------------------------------------------

# 18. Observability Architecture

``` text
                  Relay Gateway
                  /     |      \
                 /      |       \
             Metrics   Logs    Events
                │        │        │
                ▼        ▼        ▼
          Prometheus   Logger    Kafka
                │
                ▼
             Grafana
```

Important metrics:

``` text
Requests/sec
Error rate
P50 latency
P95 latency
P99 latency
Upstream latency
Rate-limit hits
Cache hit rate
Active connections
```

------------------------------------------------------------------------

# 19. Deployment Architecture

Initial deployment:

``` text
                         Internet
                            │
                            ▼
                       Load Balancer
                       /           \
                      ▼             ▼
               Gateway 1       Gateway 2
                   │               │
                   └───────┬───────┘
                           │
                  ┌────────┼────────┐
                  ▼        ▼        ▼
                Redis   PostgreSQL  Kafka
                           │
                           ▼
                       Upstreams
```

All gateway instances are interchangeable.

------------------------------------------------------------------------

# 20. Horizontal Scaling

Because the gateway is stateless:

``` text
                Load Balancer
              /       |       \
             /        |        \
      Gateway 1  Gateway 2  Gateway 3
             \        |        /
              \       |       /
                  Redis
                    |
                Upstreams
```

Adding capacity means adding gateway instances.

------------------------------------------------------------------------

# 21. High Availability

Potential production topology:

``` text
             Load Balancer
              /         \
             ▼           ▼
        Gateway Pool   Gateway Pool
             \           /
              \         /
                Redis
              /       \
          Redis 1     Redis 2

              PostgreSQL
              /        \
        Primary       Replica
```

For the student project, Docker Compose can provide the local version.
Production HA can be documented rather than fully implemented.

------------------------------------------------------------------------

# 22. Failure Handling

## Upstream failure

``` text
Gateway
   ↓
Upstream
   ↓
Failure
   ↓
Retry policy
   ↓
Circuit breaker
   ↓
502 / 503
```

## Redis failure

The system should have an explicit rate-limit failure policy.

Security-sensitive APIs may fail closed.

Less critical APIs can enter a controlled degraded mode.

## Kafka failure

Normal API requests should continue.

Analytics may temporarily lag or use bounded retry/buffering.

## PostgreSQL failure

Management operations fail.

The gateway should continue using valid cached configuration where
possible.

------------------------------------------------------------------------

# 23. Security Architecture

Security boundaries:

``` text
Internet
   ↓
Load Balancer
   ↓
Relay Gateway
   ↓
Authentication
   ↓
Authorization / Rate Limit
   ↓
Upstream
```

Security requirements:

-   API-key hashing
-   Password hashing
-   RBAC
-   Input validation
-   TLS
-   Secure cookies/tokens
-   Secret management
-   Sensitive-data redaction
-   Audit logging
-   SSRF protection
-   Open-proxy prevention

------------------------------------------------------------------------

# 24. SSRF Protection

Because users configure upstream URLs, Relay must validate destinations.

Block or restrict:

``` text
localhost
127.0.0.1
private IP ranges
link-local addresses
cloud metadata endpoints
unsafe URL schemes
```

Destination validation should also consider DNS rebinding and redirects.

------------------------------------------------------------------------

# 25. Open Proxy Prevention

Relay must never expose:

``` text
/proxy?url=https://anything.com
```

Instead:

``` text
Client
  ↓
API slug
  ↓
Stored API configuration
  ↓
Validated upstream
  ↓
Proxy
```

Only authorized workspace members can modify upstream configuration.

------------------------------------------------------------------------

# 26. Data Flow: Create API

``` text
Developer
    ↓
Dashboard
    ↓
POST /apis
    ↓
Management API
    ↓
Authentication
    ↓
RBAC
    ↓
Validate input
    ↓
PostgreSQL
    ↓
Outbox
    ↓
Kafka
    ↓
Gateway config update
```

------------------------------------------------------------------------

# 27. Data Flow: API Request

``` text
Client
   ↓
Gateway
   ↓
Extract API key
   ↓
Resolve API config
   ↓
Validate API key
   ↓
Check rate limit
   ↓
Cache lookup
   ↓
Proxy upstream
   ↓
Response
   ↓
Return response
   │
   └──→ Kafka event
```

------------------------------------------------------------------------

# 28. Data Flow: Analytics

``` text
Gateway
   ↓
request.completed
   ↓
Kafka
   ↓
Analytics Worker
   ↓
Aggregation
   ↓
Analytics Storage
   ↓
Management API
   ↓
Dashboard
```

------------------------------------------------------------------------

# 29. Data Flow: API Key Creation

``` text
Dashboard
   ↓
Management API
   ↓
Generate secure random secret
   ↓
Hash secret
   ↓
PostgreSQL
   ↓
Return raw key once
```

Example:

``` text
relay_live_8d91...
```

The raw secret is never stored or logged.

------------------------------------------------------------------------

# 30. Data Consistency

PostgreSQL is the source of truth.

Redis is derived state.

Kafka carries events.

For operations requiring reliable database + event consistency, use an
outbox pattern:

``` text
PostgreSQL transaction
    ├── Update business data
    └── Insert outbox event
             ↓
        Outbox worker
             ↓
           Kafka
```

This avoids the problem:

``` text
Database update succeeded
Kafka publish failed
```

------------------------------------------------------------------------

# 31. API Versioning

Example:

``` text
/users/v1
/users/v2
```

High-level flow:

``` text
Request
   ↓
Version Resolver
   ↓
v1 / v2
   ↓
Configured Upstream
```

Versioning is not required for the first MVP.

------------------------------------------------------------------------

# 32. Multi-Tenancy

Relay is workspace-based.

``` text
Workspace A
   ├── APIs
   ├── Keys
   └── Logs

Workspace B
   ├── APIs
   ├── Keys
   └── Logs
```

Every resource should be associated with a workspace.

Authorization must prevent:

``` text
Workspace A user
      ↓
Workspace B resource
```

------------------------------------------------------------------------

# 33. Database Scaling

Initial:

``` text
Single PostgreSQL
```

Later:

``` text
Primary
  ↓
Read Replica
```

For request logs at large scale:

``` text
request_logs
    ↓
Time-based partitions
```

Analytics can eventually move to specialized storage if volume becomes
large.

------------------------------------------------------------------------

# 34. Redis Scaling

Initial:

``` text
Single Redis
```

Later:

``` text
Redis Cluster
```

Rate-limit keys should be designed so traffic is distributed
appropriately.

------------------------------------------------------------------------

# 35. Kafka Scaling

Kafka allows independent scaling of consumers.

Example:

``` text
relay.request.completed
            │
       ┌────┴────┐
       ▼         ▼
 Analytics 1  Analytics 2
```

Consumers can be increased as traffic grows.

------------------------------------------------------------------------

# 36. Gateway Performance

The gateway should minimize:

-   Database calls
-   Network hops
-   Synchronous processing
-   Lock contention
-   Large allocations

Preferred path:

``` text
Memory
  ↓
Redis
  ↓
Upstream
```

Avoid:

``` text
Gateway
  ↓
PostgreSQL
  ↓
PostgreSQL
  ↓
Redis
  ↓
Upstream
```

for every request.

------------------------------------------------------------------------

# 37. Reliability Targets

For the student version, target measurable goals rather than claiming
production SLAs.

Suggested targets:

``` text
Gateway overhead:
< 10–20ms in a local benchmark for simple routing

Rate-limit decision:
single-digit millisecond range locally

No database query:
for normal request routing after configuration is cached

Async analytics:
must not block the response path
```

Actual numbers should be reported only after load testing.

------------------------------------------------------------------------

# 38. Testing Architecture

``` text
                Tests
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     Unit    Integration    E2E
       │          │          │
       ▼          ▼          ▼
   Modules     Services   Full Flow
```

Test:

-   Authentication
-   Routing
-   API-key validation
-   Rate limiting
-   Cache
-   Proxy
-   Timeouts
-   Error handling
-   RBAC
-   Analytics
-   Failure scenarios

------------------------------------------------------------------------

# 39. Local Development Architecture

Docker Compose:

``` text
┌─────────────────────────────────────┐
│          Docker Compose             │
│                                     │
│  dashboard       :3000              │
│  management-api  :4000              │
│  gateway         :8080              │
│  postgres        :5432              │
│  redis           :6379              │
│  kafka           :9092              │
│  prometheus      :9090              │
│  grafana         :3001              │
│                                     │
└─────────────────────────────────────┘
```

Example upstream services:

``` text
users-service
orders-service
payments-service
```

------------------------------------------------------------------------

# 40. Recommended Implementation Stages

## Stage 1 --- Core

``` text
Dashboard
Management API
PostgreSQL
Auth
Workspace
API CRUD
```

## Stage 2 --- Gateway

``` text
Go Gateway
Routing
Reverse Proxy
API Keys
```

## Stage 3 --- Redis

``` text
Rate Limiting
Configuration Cache
```

## Stage 4 --- Observability

``` text
Request Logs
Metrics
Prometheus
Grafana
```

## Stage 5 --- Async Processing

``` text
Kafka
Analytics Worker
Audit Worker
```

## Stage 6 --- Reliability

``` text
Timeouts
Retries
Circuit Breaker
Health Checks
```

## Stage 7 --- Advanced

``` text
Response Cache
API Versioning
Environments
Idempotency
Advanced Analytics
```

------------------------------------------------------------------------

# 41. MVP Architecture

The MVP should intentionally be smaller:

``` text
                 Dashboard
                     │
                     ▼
              Management API
                     │
                PostgreSQL
                     │
                   Redis


Client
   │
   ▼
Gateway
   │
   ├── API Key Auth
   ├── Rate Limiting
   ├── Routing
   └── Reverse Proxy
            │
            ▼
       Upstream APIs
```

Do not start with Kafka, Kubernetes, or multiple microservices.

------------------------------------------------------------------------

# 42. Final Target Architecture

``` text
                         ┌───────────────────┐
                         │   Next.js UI      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  Management API   │
                         │    TypeScript     │
                         └───────┬─────┬─────┘
                                 │     │
                         ┌───────┘     └────────┐
                         ▼                      ▼
                   PostgreSQL                 Redis
                         │                      │
                         │                      │
                         └──────────┬───────────┘
                                    │
                                    │ Config
                                    ▼
                              Relay Gateway
                                   Go
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
              Auth              Rate Limit          Cache
                                    │
                                    ▼
                              Reverse Proxy
                                    │
                       ┌────────────┼────────────┐
                       ▼            ▼            ▼
                    Users        Orders       Payments


Gateway
   │
   └──────────→ Kafka
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
   Analytics   Audit   Notifications


Gateway
   │
   └──────────→ Prometheus → Grafana
```

------------------------------------------------------------------------

# 43. Key Design Decisions

  -----------------------------------------------------------------------
  Decision                Choice                  Reason
  ----------------------- ----------------------- -----------------------
  Gateway language        Go                      Concurrency and
                                                  I/O-heavy workload

  Management API          Node.js/TypeScript      Fast development and
                                                  clear API layer

  Frontend                Next.js                 Full-stack TypeScript
                                                  ecosystem

  Primary DB              PostgreSQL              Reliable relational
                                                  source of truth

  Fast state              Redis                   Low-latency counters
                                                  and caching

  Events                  Kafka                   Asynchronous decoupling

  Local infrastructure    Docker Compose          Reproducible
                                                  development

  Metrics                 Prometheus              Standard metrics
                                                  collection

  Dashboards              Grafana                 Infrastructure
                                                  observability

  Architecture            Modular + separate      Avoid premature
                          gateway                 microservices
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 44. Main Architectural Tradeoffs

## Go Gateway vs Node Gateway

Go is chosen for the gateway because its role is primarily
high-concurrency HTTP proxying.

Node.js remains appropriate for the management API where development
speed and ecosystem convenience matter more.

## Kafka vs Direct Database Writes

Kafka adds operational complexity but keeps analytics and auditing
outside the critical request path.

For the MVP, direct logging can be acceptable. Kafka should be
introduced after the gateway works.

## Redis vs PostgreSQL Rate Limiting

Redis is better suited to high-frequency counters with TTLs and atomic
operations.

PostgreSQL remains the source of truth for configuration.

## Microservices vs Modular Monolith

A modular monolith is preferred initially.

The gateway is already a separate process because it has a different
runtime and performance profile.

Other services should only be split out when there is a real reason.

------------------------------------------------------------------------

# 45. Final Engineering Goal

Relay should evolve through:

``` text
Simple Proxy
     ↓
API Gateway
     ↓
API Platform
     ↓
Distributed Gateway
```

The project should demonstrate that the architecture was expanded
because of actual requirements rather than because "microservices look
impressive."

The most important engineering properties are:

``` text
Correctness
     ↓
Security
     ↓
Performance
     ↓
Observability
     ↓
Reliability
     ↓
Scalability
```

Build those in that order.
