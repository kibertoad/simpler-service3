import "./tracing.js";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import type { Context, Next } from "hono";
import {
  ATTR_HTTP_ROUTE,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_PATH,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_ROUTE,
} from "@opentelemetry/semantic-conventions";

const app = new Hono();

function getActiveSpan() {
  return trace.getSpan(context.active());
}

function sanitizePath(path: string): string {
  // Avoid including query strings in span attributes.
  const queryIndex = path.indexOf("?");
  return queryIndex === -1 ? path : path.slice(0, queryIndex);
}

app.use(async (c: Context, next: Next) => {
  const span = getActiveSpan();

  if (span) {
    const route = c.req.routePath;
    const path = sanitizePath(c.req.path);
    // Set both stable semantic-convention attributes and legacy equivalents for compatibility.
    span.setAttribute(ATTR_HTTP_ROUTE, route);
    span.setAttribute(SEMATTRS_HTTP_ROUTE, route);
    span.setAttribute(ATTR_URL_PATH, path);
    span.setAttribute(ATTR_HTTP_REQUEST_METHOD, c.req.method);
    span.setAttribute(SEMATTRS_HTTP_METHOD, c.req.method);
  }

  try {
    await next();
  } catch (error) {
    if (span) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
    throw error;
  } finally {
    if (span) {
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, c.res.status);
      span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, c.res.status);
    }
  }
});

app.get("/", (c) => c.json({ message: "Hello from Hono!" }));

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ user: { id } });
});

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 Hono server running at http://localhost:${info.port}`);
});

export default app;
