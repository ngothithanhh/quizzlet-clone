# AGENTS Guide

AI agents should internalize these patterns before making changes to this codebase. This monorepo uses Turborepo + PNPM with a Turbo-driven TypeScript + React stack across web (Next.js), mobile (Expo), and shared backend packages.

## Monorepo Structure

### Workspace Layout (Turborepo + PNPM)
```
apps/             → User-facing applications
  nextjs/         → Web frontend (Next.js 14, React 18)
  expo/           → Mobile frontend (React Native)
  auth-proxy/     → OAuth redirect handler for preview/Expo
packages/         → Shared domain packages (internal @acme/* namespace)
  api/            → tRPC routers & RPC definitions
  auth/           → NextAuth config, session/token helpers
  db/             → Drizzle ORM client, schema, queries, mutations
  ui/             → Shared React components
  validators/     → Zod schemas for API validation
tooling/          → Shared dev config
  eslint/         → Linting rules (enforces env module access)
  prettier/       → Code formatting config
  tailwind/       → Tailwind presets (web + native)
  typescript/     → TypeScript base config
```

**Key constraint:** `apps/nextjs/next.config.js` transpiles `@acme/*` packages directly—do NOT assume prebuilt package output during dev.

## Critical Data Flow

### Request Path: Web + Mobile → Single tRPC API Surface

1. **Endpoint:** `apps/nextjs/src/app/api/trpc/[trpc]/route.ts`
2. **Router:** `packages/api/src/root.ts` exports `appRouter` with 7 sub-routers:
   - `auth`, `studySet`, `user`, `folder`, `flashcard`, `starredFlashcard`, `activity`
3. **Context:** `packages/api/src/trpc.ts` - **isomorphic auth logic**:
   - **Next.js:** Reads cookie session via `auth()` (NextAuth)
   - **Expo:** Reads `Authorization: Bearer <token>` header + validates via `validateToken()`
4. **Database:** All queries/mutations centralized in `@acme/db/src/{queries,mutations}/index.ts`; routers compose these.

### Example Flow: Creating a StudySet
1. Client calls `api.studySet.create()` with Zod-validated `StudySetSchema`
2. tRPC routes to `protectedProcedure` in `packages/api/src/router/studySet.ts`
3. Creates transaction via `ctx.db.transaction()`
4. Calls `createStudySet()` from `@acme/db/mutations`
5. Calls `upsertFlashcards()` from same mutations module
6. Returns new entity; client reactively updates via React Query

### Auth Roundtrips (Platform-Specific)
- **Next.js:** Cookie-based session (standard NextAuth flow)
- **Expo:** 
  - Custom redirect state cookie: `__acme-expo-redirect-state`
  - Deep link contains `session_token` param
  - Handled in `apps/expo/src/utils/auth.ts` + `apps/nextjs/src/app/api/auth/[...nextauth]/route.ts`

## Critical Workflows

### Dev Toolchain
- **Node:** ≥22.10.0 (check `.nvmrc`)
- **PNPM:** 9.15.4+
- **Commands:**
  ```bash
  pnpm install              # Install deps + lint workspace (postinstall hook runs)
  pnpm dev                  # All dev servers (turbo watch)
  pnpm dev:next             # Only Next.js graph (faster loop)
  pnpm db:push              # Drizzle schema migration
  pnpm db:studio            # Web UI for local DB
  pnpm lint                 # ESLint (enforces env access rules)
  pnpm typecheck            # TypeScript check
  pnpm build                # Turborepo build (topo order)
  pnpm format:fix           # Prettier fix
  pnpm lint:ws              # Workspace linting (dependency rules)
  ```
- **No test scripts:** Safety relies on lint + typecheck + build (no Jest/Vitest configured).

### Database Infrastructure
- **Local DB:** Docker (PostgreSQL) + local Neon HTTP proxy in `packages/db/docker-compose.yml`
- **Migrations:** Drizzle—edit schema in `packages/db/src/schema/*.ts`, then `pnpm db:push`
- **Client:** `@acme/db/src/client.ts` initializes Drizzle pool; uses `snake_case` casing for DB columns

### Build Task Parallelization (Turbo)
- Tasks in `turbo.json` define dependencies: `dev` depends on `^dev` (packages first)
- `lint` depends on `^topo` + `^build` (ensures types resolve)
- UI mode shows task progress; logs auto-filter to new output

## Project-Specific Conventions

### Environment Variables (Strict Access Rules)
**Never call `process.env` directly.** ESLint enforces this via `no-restricted-properties` in `tooling/eslint/base.js`:
- **Next.js:** Import `env` from `apps/nextjs/src/env.ts` (extends auth env)
- **Auth:** Env contract lives in `packages/auth/env.ts` (Google OAuth, GitHub OAuth, email, JWT secret)
- **Next.js extends auth:** Adds `POSTGRES_URL` (server) + S3 client vars
- Skip validation for linting: `skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint'`

**Required env vars for dev:**
```
AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET          # OAuth providers
AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
AUTH_EMAIL_FROM                              # Email sender (OTP)
AUTH_SECRET                                  # NextAuth secret (auto-gen in dev, required in prod)
POSTGRES_URL                                 # DB connection (local Docker or Neon.tech)
NEXT_PUBLIC_S3_*                             # S3 client credentials (Expo file uploads)
```

### tRPC Procedures: Auth Split
- `publicProcedure`: Unauthenticated access (optional `ctx.session`)
- `protectedProcedure`: Requires session; throws `UNAUTHORIZED` if missing
- Both include `timingMiddleware` (artificial 100-500ms delay in dev to simulate network latency)

**Example (from `studySet.ts`):**
```typescript
export const studySetRouter = {
  popular: publicProcedure.query(async ({ ctx }) => 
    await getPopularStudySetsQuery(ctx.db)
  ),
  create: protectedProcedure
    .input(StudySetSchema)
    .mutation(async ({ input, ctx }) => {
      // Uses ctx.session.user.id for ownership
    }),
}
```

### Validation: Shared Zod Schemas
- All API input validation uses schemas from `@acme/validators`
- Example: `StudySetSchema` in `packages/api/src/router/studySet.ts`
- Error handling via `zodError` in tRPC's `errorFormatter` (flattens nested errors for client)

### Code Organization: Separation of Concerns
- **DB queries:** `packages/db/src/queries/index.ts` (read-only, no side effects)
- **DB mutations:** `packages/db/src/mutations/index.ts` (writes + transactions)
- **Routers:** Compose queries/mutations; do NOT embed SQL blocks
- **DTOs:** Located in each app (Next.js/Expo); mapper pattern reduces boilerplate

### TypeScript Paths
- Next.js uses `~/*` → `apps/nextjs/src/*` (configured in `tsconfig.json`)
- Packages use relative imports or absolute `@acme/*` namespace

### Formatting & Linting
- **Prettier:** Centralized config at `tooling/prettier/index.js`
- **Import order:** Enforced by `importPlugin` in ESLint
- Run via `pnpm format:fix` and `pnpm lint:fix` (not per-editor custom formatters)

## Integration Guardrails

### When Modifying Auth/Sessions
1. Test both **Next.js cookie flow** (sign in via web) and **Expo bearer-token flow** (via auth util)
2. Verify `packages/api/src/trpc.ts` isomorphic getter handles both `Authorization` header + cookies
3. Check Expo redirect state cookie handling in `apps/expo/src/utils/auth.ts`

### When Adding API Routers
1. Create router in `packages/api/src/router/{feature}.ts` using `publicProcedure` or `protectedProcedure`
2. Export as object satisfying `TRPCRouterRecord`
3. Wire into `appRouter` in `packages/api/src/root.ts`
4. Client consumption:
   - **Next.js:** Via `apps/nextjs/src/trpc/react.tsx` hooks (e.g., `api.studySet.create.useMutation()`)
   - **Expo:** Via `apps/expo/src/utils/api.tsx` (same API)

### When Modifying DB Schema
1. Edit schema files in `packages/db/src/schema/` (e.g., `studySet.ts`)
2. Run `pnpm db:push` (Drizzle automatic migration)
3. Update or create query/mutation helpers in `packages/db/src/{queries,mutations}/index.ts`
4. Update affected tRPC routers to use new helpers
5. Test via `pnpm typecheck` + `pnpm lint`

### When Adding Shared UI Components
1. Build in `packages/ui/src/` (e.g., `button.tsx`)
2. Use shadcn/ui CLI for UI components: `pnpm ui-add` (runs `packages/ui` script)
3. Export from `packages/ui` barrel file
4. Import in apps via `@acme/ui`
5. Avoid app-local duplication

### Common Pitfalls to Avoid
- ❌ Direct `process.env` access → Use `env` module imports
- ❌ SQL blocks in routers → Extract to `@acme/db/mutations` or `queries`
- ❌ Missing Zod validation → All API inputs must have `.input(ZodSchema)`
- ❌ DB N+1 queries → Use Drizzle `leftJoin` or relation query helpers
- ❌ Hardcoded string IDs → Use `crypto.randomUUID()` or Drizzle-generated defaults
- ❌ Forgetting transactions → Wrap multi-step DB ops in `ctx.db.transaction()`

## Example: Adding a New Feature

**Scenario:** Add a "quiz results" tracker.

1. **Add DB schema:**
   ```typescript
   // packages/db/src/schema/quizResult.ts
   export const QuizResult = pgTable("quiz_result", {
     id: uuid().default(sql`gen_random_uuid()`).notNull().primaryKey(),
     userId: uuid().notNull(),
     studySetId: uuid().notNull(),
     score: integer().notNull(),
     // ... timestamps, relations
   });
   ```

2. **Create mutations & queries:**
   ```typescript
   // packages/db/src/mutations/index.ts
   export const createQuizResult = async (db: Database, input: NewQuizResult) => {
     return await db.insert(QuizResult).values(input).returning();
   };

   // packages/db/src/queries/index.ts
   export const getUserQuizResults = async (db: Database, userId: string) => {
     return await db.query.QuizResult.findMany({ where: eq(QuizResult.userId, userId) });
   };
   ```

3. **Wire tRPC router:**
   ```typescript
   // packages/api/src/router/quizResult.ts
   import { createQuizResult, getUserQuizResults } from "@acme/db/mutations";
   import { getUserQuizResultsQuery } from "@acme/db/queries";

   export const quizResultRouter = {
     create: protectedProcedure
       .input(z.object({ studySetId: z.string(), score: z.number() }))
       .mutation(async ({ input, ctx }) => {
         return await createQuizResult(ctx.db, {
           userId: ctx.session.user.id,
           studySetId: input.studySetId,
           score: input.score,
         });
       }),
     userResults: protectedProcedure.query(async ({ ctx }) => {
       return await getUserQuizResults(ctx.db, ctx.session.user.id);
     }),
   } satisfies TRPCRouterRecord;
   ```

4. **Register in root router:**
   ```typescript
   // packages/api/src/root.ts
   export const appRouter = createTRPCRouter({
     // ... existing
     quizResult: quizResultRouter,
   });
   ```

5. **Use in frontend:**
   ```typescript
   // apps/nextjs/src/components/QuizResults.tsx
   import { api } from "~/trpc/react";

   export function QuizResults() {
     const { data: results } = api.quizResult.userResults.useQuery();
     const createResult = api.quizResult.create.useMutation();
     // ...
   }
   ```

6. **Test locally:**
   ```bash
   pnpm db:push           # Apply schema
   pnpm typecheck         # Verify types
   pnpm lint              # Check imports
   pnpm dev:next          # Test in browser
   ```
