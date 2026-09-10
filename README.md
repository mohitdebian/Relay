# Relay

API Gateway & Developer Platform.

## Quick Start

```bash
docker compose up --build
```

### Services

| Service          | URL                    |
|------------------|------------------------|
| Dashboard        | http://localhost:3000   |
| Management API   | http://localhost:4000   |
| Gateway          | http://localhost:8080   |
| Users Service    | http://localhost:5001   |
| Orders Service   | http://localhost:5002   |

### Health Checks

```bash
curl http://localhost:4000/health
curl http://localhost:8080/health
curl http://localhost:5001/health
curl http://localhost:5002/health
```
