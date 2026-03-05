---
name: fe
description: Project-specific architecture rule for Next.js App Router using FSD + Service Layer + TanStack Query Hook Layer. Use this when adding or refactoring API integrations, auth flows, or server-state handling in this repository.
---

# FSD + Service + Query Hook Layer

Use this skill for all API integration work in this repository.

## Scope

- Framework: Next.js App Router (`src/app`)
- Architecture: FSD (`src/shared`, `src/entities`, `src/features`)
- Data flow: HTTP layer -> Service layer -> Query/Mutation hook layer -> UI

## Layer Responsibilities

### 1) Shared HTTP Layer (`src/shared/api/http/*`)

- Owns transport concerns only (fetch, headers, credentials, retry policy, ApiError).
- Must not contain domain business logic.
- `clientFetch` rules in this project:
  - `credentials: "include"`
  - refresh token retry only on `401`
  - one refresh lock for concurrent failures
  - retry original request only once
- Auth refresh endpoint is `/v1/api/auth/refresh`.

### 2) Entity Service Layer (`src/entities/<domain>/api/*`)

- Owns endpoint contracts and schema validation.
- Define request/response schemas with `zod`.
- Service function pattern:
  1. validate request payload (if exists)
  2. call `clientFetch<unknown>(...)`
  3. validate response schema
  4. return typed data
- If schema validation fails, throw `ApiError` with context (`status`, `path`, `method`, `message`, `details`).

### 3) Query Hook Layer (`src/features/<domain>/<use-case>/model/*`)

- Wrap service functions with TanStack Query hooks.
- Query hooks (`useQuery`) handle server-state caching.
- Mutation hooks (`useMutation`) handle side effects:
  - invalidate or remove related query keys
  - sync auth state when needed
- Do not place raw fetch logic here.

### 4) UI Layer (`src/features/*/ui/*`, `src/app/*`)

- Consume hooks only.
- Keep UI focused on rendering and interaction.
- Route composition belongs in `src/app`.

## Auth and Redirect Contract

- Global QueryClient error handlers call `syncAuthStateFromError`.
- `401` should set auth store to `unauthenticated`.
- `src/app/providers.tsx` subscribes auth status and redirects to `/login?next=...`.
- Therefore, prefer auth-store state transition over ad-hoc window redirect logic.

## Query Key Rules

- Define query keys per domain in `src/entities/<domain>/model/*query-keys.ts`.
- Mutation success should target these keys (`invalidateQueries`, `removeQueries`, etc.).

## Standard Implementation Workflow (New Endpoint)

1. Add zod schema/types in `src/entities/<domain>/api/<domain>.schema.ts`.
2. Add service function in `src/entities/<domain>/api/<domain>.service.ts`.
3. Add or extend query keys in `src/entities/<domain>/model/*query-keys.ts`.
4. Add hook in `src/features/<domain>/<use-case>/model/*`.
5. Consume hook in `src/features/<domain>/<use-case>/ui/*`.
6. If auth-related, ensure auth store transition and query cleanup are handled.

## Project-Specific Do/Don't

- Do: validate both request and response with zod.
- Do: keep `clientFetch` generic and domain-agnostic.
- Do: keep side effects inside mutation `onSuccess`/`onError`.
- Don't: call backend APIs directly from UI components.
- Don't: duplicate fetch/retry/auth logic in feature hooks.
- Don't: retry indefinitely on auth failures.

## Done Checklist

- Endpoint path/method matches backend spec.
- Response schema exactly matches backend contract.
- Service returns typed, validated data only.
- Query keys are consistent and invalidation is explicit.
- Auth failure path (`401`) updates auth store correctly.
- No duplicated transport logic outside `shared/api/http`.
