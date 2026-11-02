# Portfolio + CMS: build pack

Everything needed to build Favour Ezechi-Oriaku's portfolio site and the CMS behind it. Hand this folder to Antigravity (or any coding agent) and start with `ANTIGRAVITY_PROMPT.md`.

## Read in this order
| File | What it covers |
|---|---|
| `ANTIGRAVITY_PROMPT.md` | The prompt to paste into the agent, plus its working rules |
| `00-overview.md` | Goals, audience, architecture, stack and why |
| `01-setup.md` | Accounts, tools, repo layout, environment variables |
| `02-database.md` | Supabase Postgres setup, content model, seeding |
| `03-api.md` | Express API, own auth, endpoints, security |
| `04-frontend.md` | React + Tailwind + Zustand public site, section by section |
| `05-admin-cms.md` | The `/admin` editor: screens, forms, Cloudinary uploads |
| `06-content-seed.md` | The actual copy and facts to seed, with placeholders flagged |
| `07-testing-and-deploy.md` | Tests, deployment, launch checklist, definition of done |
| `08-tasks.md` | Ordered task list with acceptance criteria and checkpoints |
| `db/schema.sql` | Full Postgres schema |
| `design/portfolio-reference.html` | The approved visual design as a single working page. Match it. |

## Assumptions (change here if wrong)
- Language: TypeScript on both web and API.
- Package manager: pnpm workspaces monorepo.
- Supabase is used as hosted Postgres only. Auth is written by hand in Express.
- Database access from Express uses `pg` with plain SQL and `zod` validation.
- Frontend: Vite + React + React Router + Tailwind + Zustand.

## Placeholders that need real values before launch
Search the repo for `[CONFIRM]`, `[EMAIL]`, `[LINKEDIN]`, `[X / TWITTER]`, `[GITHUB]`, `[PHOTO FROM LINKEDIN]`, `[SCREENSHOT`, `[LATEST POST`. None may reach production.
