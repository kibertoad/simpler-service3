# simple-hono-app

> Generated service blueprint. Read this overview first for the
> high-level structure; open `modules/<name>.md` only for a module
> directly relevant to your task.

A minimal Hono-based web service on Node.js exposing a greeting endpoint, a health check, user lookup, and an in-memory CRUD for kenguroos.

## Modules

### [greeting](modules/greeting.md)

Root greeting capability that returns a welcome message.

### [kenguroos](modules/kenguroos.md)

In-memory CRUD capability for kenguroos (a domain entity with id, name, and age), including list, get, create, update, and delete with input validation. Data is not persisted across restarts.

### [health](modules/health.md)

Liveness/readiness health check capability.

### [users](modules/users.md)

User identity lookup capability returning a user representation by id.

### [infrastructure](modules/infrastructure.md)

Cross-cutting technical plumbing: HTTP server bootstrapping, port configuration, route wiring, TypeScript tooling, and dependency management.
