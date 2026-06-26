# infrastructure — Observability

OpenTelemetry tracing instrumentation for HTTP requests and export to Datadog.

## Requirements

- **Automatic request trace spans** _(must, functional)_ — The system SHALL automatically create an OpenTelemetry trace span for every incoming HTTP request handled by the Hono service.
  - _Given_ the Hono service is running with OpenTelemetry enabled _When_ an HTTP request is received _Then_ a root span is created for that request
  - _Given_ a request span exists _When_ the request completes _Then_ the span is ended and exported
- **Export trace data to Datadog** _(must, functional)_ — The system SHALL export generated trace data to Datadog.
  - _Given_ the service is configured with a valid Datadog endpoint or Datadog Agent _When_ trace spans are produced _Then_ the spans are delivered to Datadog
  - _Given_ the Datadog exporter is unreachable _When_ an export attempt fails _Then_ the service continues to handle requests without crashing
- **HTTP semantic attributes on request spans** _(should, functional)_ — The system SHALL include standard HTTP semantic attributes on each request span, such as HTTP method, route, and status code.
  - _Given_ a request span is created _When_ the request is processed _Then_ the span contains the attributes `http.method`, `http.route`, and `http.status_code`
- **Trace context propagation** _(should, functional)_ — The system SHALL propagate OpenTelemetry trace context across inbound and outbound HTTP calls.
  - _Given_ an inbound request contains a valid `traceparent` header _When_ the Hono service processes the request _Then_ the existing trace context is continued rather than a new trace being started
  - _Given_ the service makes an outbound HTTP call _When_ the call is initiated _Then_ OpenTelemetry propagation headers are included
- **Environment-variable configuration for OpenTelemetry and Datadog** _(should, functional)_ — The system SHALL allow OpenTelemetry and Datadog export settings to be configured via environment variables.
  - _Given_ the service is starting and environment variables for OpenTelemetry and Datadog export are set _When_ the service initialises its telemetry stack _Then_ the service applies those values without requiring code changes
  - _Given_ the service is starting and no deployment-specific environment variables are set _When_ the service initialises its telemetry stack _Then_ the service starts using sensible defaults
- **Negligible request latency from instrumentation** _(must, functional)_ — The system SHALL add negligible latency to request processing under normal load.
  - _Given_ the service is running under normal load with OpenTelemetry enabled _When_ requests are processed _Then_ the additional latency per request remains negligible compared to the baseline without instrumentation
- **No sensitive data in telemetry** _(must, functional)_ — The system SHALL not include sensitive data such as passwords, tokens, or PII in span attributes or logs.
  - _Given_ a request contains an `Authorization` header, password field, or token _When_ the corresponding span is created and exported _Then_ the span attributes and logs do not contain the sensitive value
  - _Given_ a request contains PII in its path, query, or body _When_ the corresponding span is created and exported _Then_ the span attributes and logs do not contain the PII

## Domain rules

- **Instrumentation must integrate with Hono's request lifecycle and middleware model.**
  - _Why:_ The service is built on the Hono framework; OpenTelemetry instrumentation must participate naturally in Hono middleware and request handling.
- **Trace export must target Datadog through a Datadog-compatible exporter or the Datadog Agent's OTLP intake.**
  - _Why:_ Datadog is the required telemetry backend, so the exporter or intake path must be compatible with Datadog.
- **Trace context propagation must follow the W3C Trace Context standard.**
  - _Why:_ Standardised propagation ensures interoperability with other OpenTelemetry-instrumented callers and downstream services.
