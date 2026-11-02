# Prompt for Antigravity

Paste this as the first message after opening the `portfolio-cms` folder.

---
You are building a portfolio website with a built-in CMS. Read every `.md` file in this folder in the order listed in `README.md` before writing code. `design/portfolio-reference.html` is the approved design: open it, and reproduce it faithfully in React and Tailwind.

Rules:
1. Work through `08-tasks.md` one phase at a time. At the end of each phase, stop, summarise what you did, show how to verify it, and wait for my go-ahead.
2. Never invent content. Use only `06-content-seed.md`. Anything marked `[CONFIRM]` or in square brackets stays as a visible placeholder.
3. Never commit secrets. Create `.env.example` files only; I will fill `.env` myself.
4. Do not run destructive database commands. Show me SQL first and let me run it in Supabase.
5. Authentication is hand-written (see `03-api.md`). Do not add Supabase Auth, Clerk, Auth0 or NextAuth.
6. No public sign-up. Admin accounts come only from the `create-admin` script.
7. If a document is ambiguous or conflicts with another, ask me. Do not guess.
8. Keep dependencies minimal. Justify any package not named in the docs.
---
