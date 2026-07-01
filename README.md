# Simple Hono App

A minimal web application built with [Hono](https://hono.dev/) running on the Node.js runtime.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development (hot reload)

```bash
npm run dev
```

### Build and run in production

```bash
npm run build
npm start
```

### Typecheck

```bash
npm run typecheck
```

## Endpoints

| Method | Path         | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/`              | Returns a greeting message        |
| GET    | `/health`        | Health check                      |
| GET    | `/users/:id`     | Returns a user by id              |
| GET    | `/kenguroos`     | List all kenguroos                |
| POST   | `/kenguroos`     | Create a kenguroo (`name`, `age`) |
| GET    | `/kenguroos/:id` | Get a kenguroo by id              |
| PUT    | `/kenguroos/:id` | Update a kenguroo                 |
| DELETE | `/kenguroos/:id` | Delete a kenguroo                 |
| GET    | `/grass`         | List all grass                    |
| POST   | `/grass`         | Create grass (`name`, `height`)   |
| GET    | `/grass/:id`     | Get grass by id                   |
| PUT    | `/grass/:id`     | Update grass                      |
| DELETE | `/grass/:id`     | Delete grass                      |

## Run the full stack with Docker Compose

`docker-compose up` builds the service and starts it alongside a
[WireMock](https://wiremock.org/) mock server, so the app runs end to end
locally and in CI **without reaching any real third party**:

```bash
docker compose up --build
```

- Service: <http://localhost:3000>
- WireMock admin / health: <http://localhost:8080/__admin/health>

Compose waits on WireMock's health check before starting the service. The same
configuration runs in CI via `.github/workflows/e2e.yml`, which waits on both
health checks and then smoke-tests the endpoints.

### External dependencies & mocks

This service currently makes **no external service calls** — every endpoint is
self-contained (static greeting/health, id-echoing user lookup, in-memory
kenguroo and grass CRUD). WireMock is wired in as the designated mock host with
a fail-loud catch-all (`501 UNMOCKED_EXTERNAL_CALL`) so that the first external
call added without a stub is caught instead of escaping to the real internet.
Point new external base URLs at `EXTERNAL_API_BASE_URL`
(`http://wiremock:8080` in compose) and add a mapping under `wiremock/mappings/`.
See [`wiremock/README.md`](./wiremock/README.md).

## Configuration

| Variable                | Default                 | Purpose                                  |
| ----------------------- | ----------------------- | ---------------------------------------- |
| `PORT`                  | `3000`                  | HTTP listen port                         |
| `EXTERNAL_API_BASE_URL` | `http://wiremock:8080`* | Base URL for external HTTP dependencies  |

\* Set in `docker-compose.yml` for local/CI; override with the real upstream in production.
