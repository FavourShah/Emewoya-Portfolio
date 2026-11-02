# 01 · Setup

## Tools
Node 20+, pnpm 9+, Git. A GitHub repo (private until launch).

## Accounts the owner creates (the agent cannot)
1. **Supabase**: create a project. Settings → Database → copy the **connection pooler** string (transaction mode) as `DATABASE_URL`. Do not use the anon or service keys; the API connects with `pg`.
2. **Cloudinary**: note `CLOUD_NAME`, `API_KEY`, `API_SECRET`. Create folders `portfolio/projects` and `portfolio/profile`.
3. **Hosting** (see `07`): one for the web app, one for the API.

## Repo layout
```
portfolio-cms/
  apps/
    web/            React site + /admin
    api/            Express API
  db/
    schema.sql
    migrations/     numbered .sql files for later changes
  docs/             these .md files
  package.json      pnpm workspace root
  pnpm-workspace.yaml
```

## Environment variables
`apps/api/.env.example`
```
NODE_ENV=development
PORT=4000
DATABASE_URL=
JWT_ACCESS_SECRET=          # 32+ random bytes
REFRESH_TOKEN_PEPPER=       # 32+ random bytes, used when hashing refresh tokens
WEB_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
`apps/web/.env.example`
```
VITE_API_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=
```
Generate secrets with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

## Git hygiene
`.gitignore` must include `.env`, `.env.*` (except `.example`), `node_modules`, `dist`.

## Scripts (root)
`pnpm dev` runs web and api together. `pnpm build`, `pnpm test`, `pnpm lint`, and `pnpm --filter api create-admin`.
