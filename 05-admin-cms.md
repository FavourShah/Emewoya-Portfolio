# 05 · Admin CMS (`/admin`)

Single-owner editor. Simple, fast, no frills. Use the same design tokens as the site but denser.

## Layout
Left nav (sections below), top bar with "View site ↗", logout. Auto-refresh the access token silently; on failure send to `/admin/login`.

## Screens
| Screen | Fields | Notes |
|---|---|---|
| **Settings** | full name, headline, subheadline, location, timezone (select from `Intl.supportedValuesOf('timeZone')`), statement, bio, photo, email, LinkedIn, X / Twitter, GitHub | Single form, one Save button. Photo uses the image uploader. |
| **Roles** | label, title, evidence, published | Drag to reorder |
| **Map nodes** | label, side (left/right), published | Drag to reorder within each side |
| **Journey** | label, title, body, published | Drag to reorder |
| **Certifications** | Groups: name, subtitle. Items: title, status (passed / in progress / planned), credential URL, published | Items belong to a group; reorder within group |
| **Projects** | title, slug (auto from title, editable), tag line, problem, solves, stack brief, demo URL, repo URL, tech tags, screenshots, status (draft / published / teaser) | See below |
| **Latest post** | post URL, excerpt (max 280 chars), date, optional image, published | Newest published one shows on the site |

## Projects detail
- Status explained inline: *draft* hidden, *published* full card, *teaser* shows only as an unnamed "Next case study" line.
- Screenshots: up to 6, drag to reorder, alt text required per image.
- A live preview pane renders the project card exactly as the site does.

## Image uploader
1. Client calls `POST /api/admin/uploads/sign` with the target folder.
2. Client uploads the file straight to Cloudinary using the signature.
3. On success, send `public_id` to the API to attach it.
Accept JPG, PNG, WebP up to 8 MB. Show progress and a clear error state. Remind the editor to blur names, salaries and personal data in screenshots.

## UX rules
- Every form validates with the same `zod` schemas as the API (share them in a `packages/shared` or copy).
- Unsaved-changes warning on navigation.
- Delete asks for confirmation.
- Success and error toasts; never fail silently.
- Fully keyboard operable.
