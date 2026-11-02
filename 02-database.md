# 02 · Database

## Run the schema
Open Supabase → SQL Editor, paste `db/schema.sql`, run. Row-level security is enabled on every table with no public policies on purpose: only the Express server reads or writes.

## Section → table map
| Site section | Table(s) |
|---|---|
| Hero, location chip, bio, photo, contact and social links | `site_settings` (single row, id = 1) |
| Roles I fit | `roles` |
| Hero network map nodes | `map_nodes` |
| Journey | `journey_steps` |
| Certifications | `cert_groups`, `certifications` |
| Built (projects) | `projects`, `project_media`, `tech_tags` |
| Latest (LinkedIn card) | `linkedin_posts` |
| Admin login | `admin_users`, `refresh_tokens` |

## Rules baked into the model
- `projects.status`: `draft` (hidden), `published` (full case card), `teaser` (shows as an unnamed "Next case study" line; title is never sent to the public API).
- Every list table has `sort_order` and `published`; the public API returns only published rows ordered by `sort_order`.
- Images are stored as Cloudinary `public_id` only. URLs are built in the frontend.
- `site_settings.timezone` drives the Lagos clock panel.

## Seeding
After the schema, run the seed script from `06-content-seed.md` (`pnpm --filter api seed`). It must be idempotent (safe to run twice) and must never touch `admin_users`.

## Later changes
Put every schema change in `db/migrations/NNNN_description.sql`. Never edit `schema.sql` after first deploy without a matching migration.
