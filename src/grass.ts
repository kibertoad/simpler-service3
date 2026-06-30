import { Hono } from "hono";

export interface Grass {
  id: string;
  name: string;
  height: number;
}

/**
 * Simple in-memory store for grass. Not persisted across restarts.
 */
class GrassStore {
  private readonly items = new Map<string, Grass>();
  private nextId = 1;

  list(): Grass[] {
    return [...this.items.values()];
  }

  get(id: string): Grass | undefined {
    return this.items.get(id);
  }

  create(data: { name: string; height: number }): Grass {
    const id = String(this.nextId++);
    const grass: Grass = { id, name: data.name, height: data.height };
    this.items.set(id, grass);
    return grass;
  }

  update(
    id: string,
    data: Partial<{ name: string; height: number }>,
  ): Grass | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: Grass = {
      ...existing,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.height !== undefined ? { height: data.height } : {}),
    };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

const store = new GrassStore();

/** Validate and coerce an incoming name field. Returns null when invalid. */
function parseName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Largest accepted height in cm. A sane upper bound for an in-memory demo entity. */
const MAX_HEIGHT = 500;

/** Validate an incoming height field. Returns null when invalid. */
function parseHeight(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_HEIGHT
  ) {
    return null;
  }
  return value;
}

export const grass = new Hono();

grass.get("/", (c) => c.json({ grass: store.list() }));

grass.get("/:id", (c) => {
  const blade = store.get(c.req.param("id"));
  if (!blade) return c.json({ error: "Grass not found" }, 404);
  return c.json({ grass: blade });
});

grass.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const name = parseName((body as Record<string, unknown>).name);
  const height = parseHeight((body as Record<string, unknown>).height);
  if (name === null) {
    return c.json({ error: "name is required and must be a non-empty string" }, 400);
  }
  if (height === null) {
    return c.json(
      { error: `height is required and must be an integer between 0 and ${MAX_HEIGHT}` },
      400,
    );
  }

  const blade = store.create({ name, height });
  return c.json({ grass: blade }, 201);
});

grass.put("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const raw = body as Record<string, unknown>;
  const data: { name?: string; height?: number } = {};

  if (raw.name !== undefined) {
    const name = parseName(raw.name);
    if (name === null) {
      return c.json({ error: "name must be a non-empty string" }, 400);
    }
    data.name = name;
  }

  if (raw.height !== undefined) {
    const height = parseHeight(raw.height);
    if (height === null) {
      return c.json(
        { error: `height must be an integer between 0 and ${MAX_HEIGHT}` },
        400,
      );
    }
    data.height = height;
  }

  const updated = store.update(c.req.param("id"), data);
  if (!updated) return c.json({ error: "Grass not found" }, 404);
  return c.json({ grass: updated });
});

grass.delete("/:id", (c) => {
  const deleted = store.delete(c.req.param("id"));
  if (!deleted) return c.json({ error: "Grass not found" }, 404);
  return c.body(null, 204);
});

/** Reject unsupported methods with 405 + Allow, rather than a misleading 404. */
function methodNotAllowed(allow: string) {
  return (c: import("hono").Context) => {
    c.header("Allow", allow);
    return c.json({ error: "Method Not Allowed" }, 405);
  };
}

grass.all("/", methodNotAllowed("GET, POST"));
grass.all("/:id", methodNotAllowed("GET, PUT, DELETE"));
