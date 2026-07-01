# simple-hono-app

> Generated service blueprint. Read this overview first for the
> high-level structure; open `modules/<name>.md` only for a module
> directly relevant to your task.

A minimal Hono-based web service on Node.js exposing a root greeting, a health check, user lookup, and in-memory CRUD for kenguroos and grass. Ships with a container image and Kubernetes/Envoy Gateway deployment manifests.

## Modules

### [greeting](modules/greeting.md)

Root greeting capability that returns a welcome message at the service root.

### [kenguroos](modules/kenguroos.md)

In-memory CRUD capability for kenguroos (a domain entity with id, name, and age), with list, get, create, update, and delete plus input validation (non-empty name, integer age 0-100) and 405 handling. Data is not persisted across restarts.

### [grass](modules/grass.md)

In-memory CRUD capability for grass (a domain entity with id, name, and height in cm), with list, get, create, update, and delete plus input validation (non-empty name, integer height 0-500) and 405 handling. Data is not persisted across restarts.

### [health](modules/health.md)

Liveness/readiness health check capability returning a simple status payload.

### [users](modules/users.md)

User identity lookup capability returning a user representation by id.

### [infrastructure](modules/infrastructure.md)

Cross-cutting technical plumbing: HTTP server bootstrapping and route wiring, port configuration, TypeScript tooling and build scripts, dependency management, container image, and Kubernetes/Envoy Gateway deployment manifests (gateway routing, rate limiting, Valkey, app/dozzle services) with Kargo-driven deploy automation and CI rendering.
