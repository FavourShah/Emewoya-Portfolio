# 08 · Task list for the agent

Stop at each **Checkpoint** and wait for approval.

## Phase 1 · Foundations
1. Create the pnpm monorepo per `01`. Add `.env.example` files, `.gitignore`, root scripts.
2. Scaffold `apps/api` (Express, TypeScript, pino) with `/health`.
3. Scaffold `apps/web` (Vite, React, Tailwind, Router, Zustand) with the tokens from `04`.
**Checkpoint 1**: `pnpm dev` starts both apps; `/health` returns ok; the web page renders a blank styled shell.

## Phase 2 · Database
4. Add `db/schema.sql` and `db/migrations/`. Provide the owner with the exact steps to run it in Supabase.
5. Implement `db.ts` (`pg` pool), `seed.ts` from `06` (idempotent).
**Checkpoint 2**: owner has run the schema; `pnpm --filter api seed` fills content; a query script prints row counts.

## Phase 3 · API and auth
6. `create-admin` script, password and token libs, auth routes, refresh rotation, middleware, rate limit.
7. `GET /api/public/site` with the payload from `03` (teasers as count only).
8. Admin CRUD, reorder, project media, upload signing.
9. Tests from `07` for auth and the public payload.
**Checkpoint 3**: owner creates an admin, logs in with curl or a REST client, edits a role, sees it in `/api/public/site`. Tests green.

## Phase 4 · Public site
10. Build every section from `04`, matching `design/portfolio-reference.html` pixel for pixel where practical.
11. Wire `useSiteStore` to the API with the seed fallback.
12. Location panel, reveal cards, network map, teaser rows, Latest section.
**Checkpoint 4**: side-by-side with the reference at 1440, 768 and 390 widths; keyboard test of reveals; Lighthouse results reported.

## Phase 5 · Admin CMS
13. Login screen, auth store, silent refresh, route guard.
14. Screens from `05`, shared validation, drag reorder, unsaved-changes guard.
15. Cloudinary signed upload flow for the profile photo and project screenshots.
**Checkpoint 5**: owner edits every section from the admin and sees each change on the public site.

## Phase 6 · Hardening and launch
16. E2E and accessibility tests from `07`.
17. Deploy per `07`, set env vars, run the launch checklist with the owner.
**Checkpoint 6**: definition of done in `07` is demonstrated live.
