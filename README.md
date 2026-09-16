<div align="center">
  <br />
  <img src="./docs/logo.svg" alt="RELAY_" height="64" />
  <p>
    <strong>A high-performance, open-source API management platform and gateway.</strong>
  </p>
  <br />

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![CI Pipeline](https://github.com/mohitdebian/Relay/actions/workflows/ci.yml/badge.svg)](https://github.com/mohitdebian/Relay/actions/workflows/ci.yml)
  
  [![PRD](https://img.shields.io/badge/PRD-Product_Requirements-555555.svg)](./docs/PRD.md)
  [![HLD](https://img.shields.io/badge/HLD-High_Level_Design-555555.svg)](./docs/HLD.md)
  [![LLD](https://img.shields.io/badge/LLD-Low_Level_Design-555555.svg)](./docs/LLD.md)
  [![Design](https://img.shields.io/badge/Design-UI_&_UX-555555.svg)](./docs/design.md)
</div>

<br />

Relay is a self-hosted, lightweight alternative to enterprise API gateways. It provides a Go-based reverse proxy coupled with a Next.js dashboard for managing API keys, rate limits, analytics, and webhooks.

## <img src="./docs/headers/documentation.svg" alt="Documentation" height="24" />

- **[Product Requirements Document (PRD)](./docs/PRD.md)** - Feature specifications and product goals.
- **[High-Level Design (HLD)](./docs/HLD.md)** - System component architecture.
- **[Low-Level Design (LLD)](./docs/LLD.md)** - Database schema (ER diagram), rate-limiting algorithms, and queue architecture.
- **[Design System & UI](./docs/design.md)** - Frontend architecture and design guidelines.

## <img src="./docs/headers/features.svg" alt="Features" height="24" />

- **Go Gateway Proxy**: Fast reverse proxy with zero-downtime routing, retry transports, and connection pooling.
- **API Key Management**: Secure SHA-256 hashed API keys with prefixes, expiration dates, and one-click revocation.
- **Configurable Rate Limiting**: Per-API sliding-window rate limiting backed by Redis.
- **Real-time Analytics**: Monitor request volumes, latencies, and status code distributions directly from the dashboard.
- **Asynchronous Webhooks**: Event-driven webhook dispatch with HMAC-SHA256 signatures, exponential backoff, and BullMQ queues.
- **Multi-Workspace & RBAC**: Isolate environments and invite team members with Owner, Admin, or Viewer roles.
- **Audit Logging**: Complete trail of all actions performed within a workspace.

## <img src="./docs/headers/architecture.svg" alt="Architecture" height="24" />

```mermaid
graph LR
    Client([Client Apps]) --> Gateway["Relay Gateway<br>(Go)"]
    Gateway --> Redis[(Redis)]
    Gateway --> DB[(PostgreSQL)]
    Gateway --> Upstream([Upstream APIs])
    
    Admin([Developers]) --> Dashboard["Dashboard<br>(Next.js)"]
    Dashboard --> Auth[Neon Auth]
    Dashboard --> API["Management API<br>(Node.js)"]
    API --> DB
    API --> Redis
    API --> BullMQ[BullMQ Worker]
    BullMQ -.-> Webhooks([Customer Webhooks])
```

## <img src="./docs/headers/getting-started.svg" alt="Getting Started" height="24" />

### Prerequisites
- Node.js 20+
- Go 1.21+
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohitdebian/Relay.git
   cd Relay
   ```

2. **Setup Management API**
   ```bash
   cd apps/api
   npm install
   cp .env.example .env
   # Configure your DATABASE_URL and REDIS_URL in .env
   npm run dev
   ```

3. **Setup Dashboard**
   ```bash
   cd apps/dashboard
   npm install
   cp .env.example .env.local
   # Configure NEXT_PUBLIC_API_URL and auth settings
   npm run dev
   ```

4. **Setup Gateway Proxy**
   ```bash
   cd gateway
   go mod download
   # Set DATABASE_URL and REDIS_URL environment variables
   go run .
   ```

## <img src="./docs/headers/tech-stack.svg" alt="Tech Stack" height="24" />

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Gateway** | Go, `net/http` | High-performance edge proxy |
| **Management API** | Node.js, Express, TypeScript | RESTful control plane |
| **Dashboard** | Next.js 16, React 19, Vanilla CSS | Server-side rendered admin UI |
| **Database** | PostgreSQL (Neon Serverless) | Primary data store |
| **Cache & Queues**| Redis, BullMQ | Rate limiting and async job processing |
| **Authentication**| Neon Auth | Secure OpenID Connect user management |

## <img src="./docs/headers/project-structure.svg" alt="Project Structure" height="24" />

```text
relay/
├── apps/
│   ├── api/          # Management API (Node.js/Express)
│   └── dashboard/    # Web UI (Next.js 16)
├── gateway/          # API Gateway Proxy (Go)
├── .github/          # CI/CD Workflows
└── docker-compose.yml
```

## <img src="./docs/headers/contributing.svg" alt="Contributing" height="24" />

We love contributions! Whether it's bug reports, feature requests, or pull requests, all contributions are welcome. Please read our contributing guidelines before submitting a PR.

## <img src="./docs/headers/license.svg" alt="License" height="24" />

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
