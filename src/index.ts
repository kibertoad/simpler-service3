import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { kenguroos } from "./kenguroos.js";
import { grass } from "./grass.js";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello from Hono!" }));

app.route("/kenguroos", kenguroos);

app.route("/grass", grass);

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
