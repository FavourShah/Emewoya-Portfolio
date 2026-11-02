# 04 · Frontend (React + Tailwind + Zustand)

Match `design/portfolio-reference.html`. Open it first. This document explains the structure and behaviour; the HTML is the source of truth for look.

## Tokens (Tailwind config)
| Token | Value |
|---|---|
| `bg` | `#EDEFF1` |
| `surface` | `#FFFFFF` |
| `cell` | `#F7F8F9` |
| `ink` | `#0B0D10` |
| `muted` | `#4B525B` |
| `accent` | `#2B50FF` |
| `accent-soft` (on dark) | `#8FA6FF` |
| `line` | `#C3C9CF` |
Fonts: Bricolage Grotesque (400, 600, 800) for display and body, DM Mono (400) for labels. Load from Google Fonts with `font-display: swap`. Light theme only (`color-scheme: light`).

## Routes
`/` public site. `/admin/login`, `/admin/*` the CMS (see `05`). Lazy-load the admin bundle.

## State (Zustand)
- `useSiteStore`: `{ data, status, load() }`. `load()` fetches `/api/public/site`; if it fails, falls back to the bundled `content.seed.json` and shows no error to visitors.
- `useAuthStore`: `{ accessToken, user, login(), refresh(), logout() }`. Access token in memory only. On app start, call refresh once to restore a session.

## Section components (in page order)
1. **Nav**: floating pill, links: Journey, Certifications, Built, Contact.
2. **Hero**: location chip button, headline, subline, `NetworkMap`.
   - Location chip toggles a panel (`aria-expanded`, `aria-controls`). Panel shows a live clock for `settings.timezone` (tick every second only while open), "Daytime/Night in <city>" (06:00–17:59 is daytime), the visitor's local time and zone, and "Lagos is Nh ahead of / behind you" or "We are on the same clock." Compute the offset with `Intl`; handle half-hour zones.
   - `NetworkMap`: SVG, centre node "FE", left nodes dashed ink, right nodes solid accent, labels from `map_nodes`. Centre ring pulses unless `prefers-reduced-motion`.
3. **Roles**: statement line (from `settings.statement`), then four cells from `roles`.
4. **Journey**: photo (Cloudinary, `photoPublicId`; show dashed placeholder if null) beside `settings.bio`, then four hairline cells from `journey_steps`.
5. **Certifications**: one large card per `cert_groups`. Front: hint, group name, subtitle. Reveal (hover, focus, or tap): list of items with `PASSED` (filled accent chip) or `IN PROGRESS` / `PLANNED` (outlined).
6. **Built**: one card per published project. Front: tag line, title, "hover or tap for the case". Reveal: up to three screenshots, then PROBLEM, WHAT IT SOLVES, BUILT WITH AND WHY. If a project has no media, show labelled placeholder frames. Below, `teaserCount` dashed rows reading "NN · Next case study" with a "CASE STUDY SOON" tag, numbered after the published projects. Header note: "Showing N of M · more case studies landing soon" where M = published + teasers.
7. **Latest**: left card = latest LinkedIn post (date, excerpt, link out). Right card = dark "Follow along" card with X / Twitter and LinkedIn links. Hide the post card gracefully if none exists.
8. **Contact**: accent block, "Open a ticket with me.", email, LinkedIn, X / Twitter, GitHub.

## Reveal behaviour (shared `RevealCard`)
`tabIndex=0`; reveal on `:hover`, `:focus-within`, and tap. Reveal layer is absolutely positioned over the card, fades and rises 10px over 250ms, no transition under reduced motion. Visible focus ring in accent. Reveal text must meet 4.5:1 contrast.

## Images
`<CloudinaryImage publicId width alt>` builds `https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_<w>/<publicId>` with `srcSet` for 1x/2x and `loading="lazy"`. Alt text is required.

## Responsive
Four-column grids go to two columns under 860px and one under 520px. Hero splits to stacked rows. No horizontal scroll at 360px.

## Quality bar
Lighthouse mobile: performance ≥ 90, accessibility ≥ 95. No layout shift from fonts or images (reserve aspect ratios).
