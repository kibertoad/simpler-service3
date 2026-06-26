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
| GET    | `/`          | Returns a greeting message |
| GET    | `/health`    | Health check               |
| GET    | `/users/:id` | Returns a user by id       |

## Configuration

The server port can be set via the `PORT` environment variable (defaults to `3000`).

### Observability

The service is instrumented with OpenTelemetry. Traces are exported via OTLP to a Datadog Agent or any OTLP-compatible collector.

| Environment variable | Description | Default |
| --- | --- | --- |
| `OTEL_SERVICE_NAME` | Service name attached to every span. | `simple-hono-app` |
| `OTEL_ENVIRONMENT` | Deployment environment attached to every span. | `development` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | URL of the OTLP trace intake. | `http://localhost:4318/v1/traces` |
| `OTEL_EXPORTER_OTLP_HEADERS` | Optional comma-separated `key=value` headers for OTLP requests (e.g. `DD-API-KEY=...`). | — |

#### Datadog setup examples

- **Datadog Agent (recommended):**
  ```bash
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces npm start
  ```
- **Direct Datadog OTLP intake:**
  ```bash
  OTEL_EXPORTER_OTLP_ENDPOINT=https://trace.agent.datadoghq.com:443/v1/traces \
  OTEL_EXPORTER_OTLP_HEADERS="DD-API-KEY=$DD_API_KEY" \
    npm start
  ```

Trace context follows the W3C Trace Context standard (`traceparent` header). Sensitive request data such as `Authorization` headers, cookies, query strings, and bodies are intentionally excluded from span attributes.
