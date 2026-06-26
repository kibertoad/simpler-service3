Feature: infrastructure — Observability
  OpenTelemetry tracing instrumentation for HTTP requests and export to Datadog.

  @must
  Scenario: Automatic request trace spans (#1)
    Given the Hono service is running with OpenTelemetry enabled
    When an HTTP request is received
    Then a root span is created for that request

  @must
  Scenario: Automatic request trace spans (#2)
    Given a request span exists
    When the request completes
    Then the span is ended and exported

  @must
  Scenario: Export trace data to Datadog (#1)
    Given the service is configured with a valid Datadog endpoint or Datadog Agent
    When trace spans are produced
    Then the spans are delivered to Datadog

  @must
  Scenario: Export trace data to Datadog (#2)
    Given the Datadog exporter is unreachable
    When an export attempt fails
    Then the service continues to handle requests without crashing

  Scenario: HTTP semantic attributes on request spans
    Given a request span is created
    When the request is processed
    Then the span contains the attributes `http.method`, `http.route`, and `http.status_code`

  Scenario: Trace context propagation (#1)
    Given an inbound request contains a valid `traceparent` header
    When the Hono service processes the request
    Then the existing trace context is continued rather than a new trace being started

  Scenario: Trace context propagation (#2)
    Given the service makes an outbound HTTP call
    When the call is initiated
    Then OpenTelemetry propagation headers are included

  Scenario: Environment-variable configuration for OpenTelemetry and Datadog (#1)
    Given the service is starting and environment variables for OpenTelemetry and Datadog export are set
    When the service initialises its telemetry stack
    Then the service applies those values without requiring code changes

  Scenario: Environment-variable configuration for OpenTelemetry and Datadog (#2)
    Given the service is starting and no deployment-specific environment variables are set
    When the service initialises its telemetry stack
    Then the service starts using sensible defaults

  @must
  Scenario: Negligible request latency from instrumentation
    Given the service is running under normal load with OpenTelemetry enabled
    When requests are processed
    Then the additional latency per request remains negligible compared to the baseline without instrumentation

  @must
  Scenario: No sensitive data in telemetry (#1)
    Given a request contains an `Authorization` header, password field, or token
    When the corresponding span is created and exported
    Then the span attributes and logs do not contain the sensitive value

  @must
  Scenario: No sensitive data in telemetry (#2)
    Given a request contains PII in its path, query, or body
    When the corresponding span is created and exported
    Then the span attributes and logs do not contain the PII
