# Simple Hono App

A minimal web application built with [Hono](https://hono.dev/) running on the Node.js runtime.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development (hot reload)

```bash
npm run dev
```

### Build and run in production

```bash
npm run build
npm start
```

### Typecheck

```bash
npm run typecheck
```

## Endpoints

| Method | Path         | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/`              | Returns a greeting message        |
| GET    | `/health`        | Health check                      |
| GET    | `/users/:id`     | Returns a user by id              |
| GET    | `/kenguroos`     | List all kenguroos                |
| POST   | `/kenguroos`     | Create a kenguroo (`name`, `age`) |
| GET    | `/kenguroos/:id` | Get a kenguroo by id              |
| PUT    | `/kenguroos/:id` | Update a kenguroo                 |
| DELETE | `/kenguroos/:id` | Delete a kenguroo                 |

## Configuration

| Variable                | Default | Purpose                                 |
| ----------------------- | ------- | --------------------------------------- |
| `PORT`                  | `3000`  | HTTP listen port                        |
| `EXTERNAL_API_BASE_URL` | _unset_ | Base URL for external HTTP dependencies |
