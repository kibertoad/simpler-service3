# WireMock mocks for external dependencies

This directory holds the WireMock stubs that stand in for **external services**
the application talks to, so the whole stack runs locally and in CI with
`docker-compose up` — no real third party is ever contacted.

## Current coverage

This service currently has **no external service dependencies**. Every endpoint
is self-contained:

| Endpoint            | Backing                          |
| ------------------- | -------------------------------- |
| `GET /`             | static greeting                  |
| `GET /health`       | static                           |
| `GET /users/:id`    | echoes the id (no upstream call) |
| `/kenguroos*` CRUD  | in-memory `Map` (no DB, no API)  |

So there are **no per-operation stubs to write yet**. The only mapping present
is the fail-loud catch-all.

## `zzz-catch-all-unmocked.json`

A lowest-priority (`priority: 99`) catch-all that matches any request and
returns `501` with an `UNMOCKED_EXTERNAL_CALL` body. It exists so that the first
time an external call is added without a matching stub, the request fails loudly
here instead of silently escaping to the real internet.

## Adding a stub for a new external operation

1. Create `wiremock/mappings/<service>-<operation>.json` matching on method +
   URL path (add header/query/body matchers only where needed to disambiguate).
2. Put large response bodies in `wiremock/__files/` and reference them with
   `"bodyFileName"`.
3. Cover the success path plus the error/edge responses the block must handle
   (4xx, 5xx, rate limits).
4. Point the client's base URL at `EXTERNAL_API_BASE_URL`
   (`http://wiremock:8080` in compose / CI).

Never hard-code real secrets — assert on the presence/shape of auth headers, not
their real values.
