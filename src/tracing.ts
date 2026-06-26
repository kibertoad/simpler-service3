import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";

const serviceName = process.env.OTEL_SERVICE_NAME ?? "simple-hono-app";
const environment = process.env.OTEL_ENVIRONMENT ?? "development";
const DEFAULT_OTLP_ENDPOINT = "http://localhost:4318/v1/traces";
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? DEFAULT_OTLP_ENDPOINT;

function parseHeaders(headerString?: string): Record<string, string> | undefined {
  if (!headerString) return undefined;

  const headers: Record<string, string> = {};
  for (const pair of headerString.split(",")) {
    const index = pair.indexOf("=");
    if (index === -1) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (key) headers[key] = value;
  }
  return Object.keys(headers).length > 0 ? headers : undefined;
}

const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
  headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
});

export const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.0.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: environment,
  }),
  traceExporter,
  textMapPropagator: new W3CTraceContextPropagator(),
  instrumentations: [
    new HttpInstrumentation({
      // Do not capture sensitive request/response headers or bodies as span attributes.
      headersToSpanAttributes: {
        client: { requestHeaders: [], responseHeaders: [] },
        server: { requestHeaders: [], responseHeaders: [] },
      },
    }),
    new UndiciInstrumentation(),
  ],
});

sdk.start();

function shutdown(signal: string) {
  return () => {
    console.log(`Received ${signal}, shutting down OpenTelemetry SDK...`);
    sdk
      .shutdown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  };
}

process.on("SIGTERM", shutdown("SIGTERM"));
process.on("SIGINT", shutdown("SIGINT"));
