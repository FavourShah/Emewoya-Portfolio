# 00 · Overview

## Goal
A sleek, minimal, distinctive portfolio that shows one person's whole range, with a CMS so every section can be edited or extended without touching code.

## Audience and the four roles the site must appeal to
IT support, cloud, web development (full-stack), IT business analysis. Each role has one card near the top with a line of real evidence.

## Principles
- Truthful: no invented numbers, clients or "in production" claims. Neither the payroll nor the leave project is in production.
- Upcoming projects are never named publicly. They appear only as unnamed "Next case study" lines (`projects.status = 'teaser'`).
- Everything on the page that is content comes from the database. Layout and interactions live in code.
- Works with a keyboard and on touch. Hover reveals must also open on focus or tap.

## Architecture
```
Browser (React + Tailwind + Zustand)
   |  GET /api/public/site            (visitors)
   |  /api/admin/*  + Bearer JWT      (editor)
Express API  --pg-->  Supabase Postgres
   |
   +-- signs Cloudinary uploads; browser uploads images straight to Cloudinary
```

## Stack and why
| Piece | Choice | Reason |
|---|---|---|
| Web | React, Vite, React Router | Matches existing skills |
| Styling | Tailwind | Tokens from the design map directly to config |
| State | Zustand | Two small stores: site content, auth |
| API | Express | Matches existing skills |
| DB | Supabase Postgres via `pg` | Hosted Postgres, no lock-in to Supabase client |
| Auth | Hand-written JWT + rotating refresh cookie | Owner wants to write their own auth |
| Images | Cloudinary, signed uploads | Server keeps the secret, browser uploads directly |

## Non-goals (for now)
Blog, comments, analytics dashboards, multi-language, public sign-up, server-side rendering.
