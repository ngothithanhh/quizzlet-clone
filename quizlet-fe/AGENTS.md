# AGENTS Guide

## Monorepo map (Turborepo + PNPM)
- Workspace roots: `apps/*`, `packages/*`, `tooling/*` (`pnpm-workspace.yaml`).
- User-facing apps: `apps/nextjs` (web), `apps/expo` (mobile), `apps/auth-proxy` (OAuth proxy for preview/Expo).
- Shared domain packages: `@acme/api` (tRPC routers), `@acme/auth` (NextAuth config + token helpers), `@acme/db` (Drizzle client/schema/queries/mutations), `@acme/ui`, `@acme/validators`.
- `apps/nextjs/next.config.js` transpiles `@acme/*` packages directly; do not assume prebuilt local package output during dev.

## Request/data flow you must preserve
- Web + mobile both hit one tRPC surface: `apps/nextjs/src/app/api/trpc/[trpc]/route.ts` -> `packages/api/src/root.ts`.
- Context/auth is isomorphic in `packages/api/src/trpc.ts`:
  - Next.js path uses cookie session via `auth()`.
  - Expo path uses `Authorization: Bearer <token>` and `validateToken()`.
- Expo sign-in roundtrip is custom: `apps/expo/src/utils/auth.ts` + `apps/nextjs/src/app/api/auth/[...nextauth]/route.ts` (cookie `__acme-expo-redirect-state`, then `session_token` deep link param).
- DB writes/reads are intentionally centralized in `packages/db/src/mutations/index.ts` and `packages/db/src/queries/index.ts`; routers compose these rather than embedding large SQL blocks.

## Critical workflows
- Required toolchain: Node `22.12` (`.nvmrc`), pnpm `9.15.4+` (`package.json`).
- Install + run all dev tasks:
  - `pnpm install`
  - `pnpm dev`
- Common targeted loops:
  - `pnpm dev:next` (only Next.js graph)
  - `pnpm db:push` / `pnpm db:studio` (delegates to `@acme/db` drizzle scripts)
  - `pnpm lint`; `pnpm typecheck`; `pnpm build`
- DB local infra lives in `packages/db/docker-compose.yml` (Postgres + local Neon HTTP proxy).
- There are currently no `test` scripts in workspace `package.json` files; rely on lint/typecheck/build for safety checks.

## Conventions specific to this repo
- Do not access `process.env` directly in app/package code; ESLint enforces env modules (`tooling/eslint/base.js`, rule `no-restricted-properties`).
- Next.js env schema extends auth env in `apps/nextjs/src/env.ts`; auth env contract is in `packages/auth/env.ts`.
- tRPC procedure split is meaningful: use `publicProcedure` vs `protectedProcedure` from `packages/api/src/trpc.ts`.
- Validate API inputs with shared Zod schemas from `@acme/validators` (example: `StudySetSchema` used in `packages/api/src/router/studySet.ts`).
- Import order/formatting is standardized by shared Prettier config (`tooling/prettier/index.js`); run repo scripts rather than per-editor custom formatting.

## Integration guardrails for changes
- If you change auth/session behavior, verify both Next.js cookie flow and Expo bearer-token flow still work.
- If you add API routes, wire them into `appRouter` (`packages/api/src/root.ts`) and consume via existing typed clients in `apps/nextjs/src/trpc/*` or `apps/expo/src/utils/api.tsx`.
- If you add DB tables/columns, update `packages/db/src/schema/*`, then adjust query/mutation helpers and affected tRPC routers.
- If a feature needs shared UI, prefer `packages/ui` exports over app-local duplication.
