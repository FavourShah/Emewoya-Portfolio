# 03 · API (Express + own auth)

## Structure
```
apps/api/src/
  index.ts  app.ts  config.ts  db.ts
  middleware/ auth.ts  error.ts  rateLimit.ts  validate.ts
  routes/ public.ts  auth.ts  admin/*.ts
  lib/ password.ts  tokens.ts  cloudinary.ts
  scripts/ create-admin.ts  seed.ts
```
Packages: `express`, `pg`, `zod`, `jsonwebtoken` (or `jose`), `argon2` (fallback `bcryptjs`, cost 12), `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `cloudinary`, `pino`.

## Public endpoint
`GET /api/public/site` returns everything the site needs in one payload, with `Cache-Control: public, max-age=60, stale-while-revalidate=300` and an ETag.
```json
{
  "settings": { "fullName": "", "headline": "", "location": "", "timezone": "", "statement": "", "bio": "", "photoPublicId": null, "email": "", "linkedinUrl": "", "twitterUrl": "", "githubUrl": "" },
  "roles": [], "mapNodes": [], "journey": [],
  "certGroups": [ { "name": "", "subtitle": "", "items": [ { "title": "", "status": "passed|in_progress|planned" } ] } ],
  "projects": [ { "slug": "", "title": "", "tagLine": "", "problem": "", "solves": "", "stackBrief": "", "media": [ { "publicId": "", "alt": "" } ], "tags": [] } ],
  "teaserCount": 3,
  "latestPost": { "url": "", "excerpt": "", "postedOn": "" }
}
```
Teaser projects contribute only to `teaserCount`. Their titles, slugs and any other field are never returned.

## Auth design
- No sign-up route. `pnpm --filter api create-admin` prompts for email and password and inserts an `admin_users` row.
- Password: argon2id (or bcrypt cost 12). Enforce min length 12 on creation.
- `POST /api/auth/login` {email, password} → 200 with `{ accessToken, user }` and sets the refresh cookie. Same error and similar timing for unknown email vs wrong password.
- Access token: JWT HS256, 15 min, claims `sub`, `role`. Kept in memory (Zustand) on the client, never localStorage.
- Refresh token: random 48 bytes. Store only `sha256(token + REFRESH_TOKEN_PEPPER)` in `refresh_tokens`. Cookie: `httpOnly; Secure; Path=/api/auth; SameSite=Strict` when web and api share a site, otherwise `SameSite=None; Secure` and require header `X-Requested-With: portfolio-admin` plus an `Origin` check.
- `POST /api/auth/refresh` rotates: revoke the old row, issue a new one. If a revoked token is presented, revoke all of that user's tokens.
- `POST /api/auth/logout` revokes the current token and clears the cookie.
- `requireAuth` middleware verifies the access token; `requireRole('admin')` guards destructive routes.
- Rate limit login: 5 attempts per 15 minutes per IP + email.

## Admin endpoints (all behind `requireAuth`)
| Method + path | Purpose |
|---|---|
| `GET/PUT /api/admin/settings` | Read, update the single settings row |
| `GET/POST /api/admin/{roles,map-nodes,journey,cert-groups,certifications,projects,linkedin-posts}` | List, create |
| `PUT/DELETE /api/admin/<resource>/:id` | Update, delete |
| `POST /api/admin/<resource>/reorder` | Body `{ ids: [] }` sets `sort_order` |
| `POST/DELETE /api/admin/projects/:id/media` | Attach, remove a screenshot by `public_id` |
| `POST /api/admin/uploads/sign` | Returns `{ timestamp, signature, apiKey, cloudName, folder }` for a signed browser upload |

## Cross-cutting
- Validate every body with `zod`; return `400` with field errors.
- Parameterised SQL only. No string-built queries.
- `helmet`, CORS allowlist from `WEB_ORIGIN`, JSON body limit 100kb.
- Central error handler: log with `pino`, return `{ error: "message" }`, never stack traces.
- After any admin write, bust the public payload cache (in-memory version counter feeding the ETag).
