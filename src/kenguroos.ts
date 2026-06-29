import { Hono } from "hono";

export interface Kenguroo {
  id: string;
  name: string;
  age: number;
}

/**
 * Simple in-memory store for kenguroos. Not persisted across restarts.
 */
class KenguarooStore {
  private readonly items = new Map<string, Kenguroo>();
  private nextId = 1;

  list(): Kenguroo[] {
    return [...this.items.values()];
  }

  get(id: string): Kenguroo | undefined {
    return this.items.get(id);
  }

  create(data: { name: string; age: number }): Kenguroo {
    const id = String(this.nextId++);
    const kenguroo: Kenguroo = { id, name: data.name, age: data.age };
    this.items.set(id, kenguroo);
    return kenguroo;
  }

  update(
    id: string,
    data: Partial<{ name: string; age: number }>,
  ): Kenguroo | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated: Kenguroo = {
      ...existing,
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.age !== undefined ? { age: data.age } : {}),
    };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

const store = new KenguarooStore();

/** Validate and coerce an incoming name field. Returns null when invalid. */
function parseName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Largest accepted age. A sane upper bound for an in-memory demo entity. */
const MAX_AGE = 100;

/** Validate an incoming age field. Returns null when invalid. */
function parseAge(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_AGE
  ) {
    return null;
  }
  return value;
}

export const kenguroos = new Hono();

kenguroos.get("/", (c) => c.json({ kenguroos: store.list() }));

kenguroos.get("/:id", (c) => {
  const kenguroo = store.get(c.req.param("id"));
  if (!kenguroo) return c.json({ error: "Kenguroo not found" }, 404);
  return c.json({ kenguroo });
});

kenguroos.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const name = parseName((body as Record<string, unknown>).name);
  const age = parseAge((body as Record<string, unknown>).age);
  if (name === null) {
    return c.json({ error: "name is required and must be a non-empty string" }, 400);
  }
  if (age === null) {
    return c.json(
      { error: `age is required and must be an integer between 0 and ${MAX_AGE}` },
      400,
    );
  }

  const kenguroo = store.create({ name, age });
  return c.json({ kenguroo }, 201);
});

kenguroos.put("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const raw = body as Record<string, unknown>;
  const data: { name?: string; age?: number } = {};

  if (raw.name !== undefined) {
    const name = parseName(raw.name);
    if (name === null) {
      return c.json({ error: "name must be a non-empty string" }, 400);
    }
    data.name = name;
  }

  if (raw.age !== undefined) {
    const age = parseAge(raw.age);
    if (age === null) {
      return c.json(
        { error: `age must be an integer between 0 and ${MAX_AGE}` },
        400,
      );
    }
    data.age = age;
  }

  const updated = store.update(c.req.param("id"), data);
  if (!updated) return c.json({ error: "Kenguroo not found" }, 404);
  return c.json({ kenguroo: updated });
});

kenguroos.delete("/:id", (c) => {
  const deleted = store.delete(c.req.param("id"));
  if (!deleted) return c.json({ error: "Kenguroo not found" }, 404);
  return c.body(null, 204);
});

/** Reject unsupported methods with 405 + Allow, rather than a misleading 404. */
function methodNotAllowed(allow: string) {
  return (c: import("hono").Context) => {
    c.header("Allow", allow);
    return c.json({ error: "Method Not Allowed" }, 405);
  };
}

kenguroos.all("/", methodNotAllowed("GET, POST"));
kenguroos.all("/:id", methodNotAllowed("GET, PUT, DELETE"));
