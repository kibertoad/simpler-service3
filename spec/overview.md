# simple-hono-app — Specification

> Prescriptive spec for this service (what MUST be true). This index lists the
> modules and their features; open `modules/<module>/<feature>.md` for detail
> and `features/<module>/*.feature` for the acceptance scenarios to satisfy.

A minimal Hono-based web service exposing greeting, health, and user lookup endpoints with OpenTelemetry trace export to Datadog.

## infrastructure

Cross-cutting technical plumbing including HTTP server bootstrapping, port configuration, TypeScript tooling, dependency management, and observability instrumentation.

- [Observability](modules/infrastructure/observability.md) — OpenTelemetry tracing instrumentation for HTTP requests and export to Datadog.
