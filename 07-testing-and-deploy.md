# 07 · Testing and deployment

## Tests
- **API unit**: password hashing, token creation and verification, refresh rotation and reuse detection.
- **API integration** (Vitest + Supertest against a test schema): login success and failure, rate limit, `requireAuth`, CRUD for each resource, reorder, teaser titles absent from `/api/public/site`, unpublished rows absent.
- **Web**: component tests for the location panel offset maths (including a half-hour zone), reveal cards open on focus, teaser numbering.
- **E2E smoke** (Playwright): public page loads; Lagos panel opens; certification and project reveals work by keyboard; admin login, edit a headline, see it on the public site.
- **Accessibility**: axe on every page, zero serious violations.

## Deployment
| Part | Suggested host | Notes |
|---|---|---|
| Web | Vercel or Netlify | Build `pnpm --filter web build`, output `apps/web/dist`, SPA fallback to `index.html` |
| API | Render, Railway or Fly.io | Start `node dist/index.js`, health check `GET /health` |
| DB | Supabase | Use the pooler `DATABASE_URL` |
Put web and API on the same site if possible (`example.com` and `api.example.com`) so the refresh cookie can be `SameSite=Strict`. Otherwise follow the cross-site cookie rules in `03`.
Set every environment variable from `01` on the hosts. `NODE_ENV=production`, `WEB_ORIGIN` set to the real web origin.

## Launch checklist
- [ ] No placeholders remain (search for `[`) and no `[CONFIRM]`
- [ ] Contact, LinkedIn, X / Twitter and GitHub links verified
- [ ] Real screenshots uploaded with alt text and sensitive data blurred
- [ ] Admin account created; test accounts removed
- [ ] Secrets rotated from any used during development
- [ ] HTTPS everywhere, cookies `Secure`
- [ ] `/api/public/site` contains no teaser titles or drafts
- [ ] Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility
- [ ] Open Graph title, description and image set; favicon set

## Definition of done
Owner can log in, change any text in any section, add a certification, publish a project with screenshots, paste a new LinkedIn post, and see each change on the live site within two minutes, with no code edits.
