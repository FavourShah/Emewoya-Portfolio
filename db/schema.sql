-- Portfolio CMS schema for Supabase (Postgres)
-- Run in the Supabase SQL editor. Express talks to the database with the
-- service role / direct connection string, so keep RLS on and add no public
-- policies: nothing is readable from the browser except through your API.

create extension if not exists pgcrypto;

-- ───────── Own auth (you write the auth, so you own these tables) ─────────
create table admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,                 -- argon2id or bcrypt, never plain text
  role          text not null default 'admin', -- 'admin' | 'editor'
  created_at    timestamptz not null default now()
);

create table refresh_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references admin_users(id) on delete cascade,
  token_hash text not null,                    -- store a hash, send the raw token in an httpOnly cookie
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index on refresh_tokens (user_id);

-- ───────── Content: every section of the site is editable ─────────
-- Single-row tables use a fixed id so the API can upsert them.
create table site_settings (               -- hero, location chip, contact links
  id            int primary key default 1 check (id = 1),
  full_name     text not null,
  headline      text not null,
  subheadline   text,
  location      text,                       -- e.g. 'Lagos, Nigeria'
  timezone      text default 'Africa/Lagos',-- drives the live clock panel
  statement     text,                       -- the "I look at what can be built" line
  bio           text,
  photo_public_id text,                     -- Cloudinary public_id for the LinkedIn photo
  email         text,
  linkedin_url  text,
  twitter_url   text,                       -- X / Twitter profile link
  instagram_url text,                       -- Instagram profile link
  github_url    text,
  updated_at    timestamptz not null default now()
);

create table roles (                        -- IT support, Cloud, Web dev, Business analysis
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  title      text not null,
  evidence   text not null,
  sort_order int not null default 0,
  published  boolean not null default true
);

create table map_nodes (                    -- the network map on the hero
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  side       text not null check (side in ('left','right')),
  sort_order int not null default 0,
  published  boolean not null default true
);

create table journey_steps (                -- Foundation / Experience / Building / Growing
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  title      text not null,
  body       text,
  sort_order int not null default 0,
  published  boolean not null default true
);

create table cert_groups (                  -- Microsoft, Google, and any future provider
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  subtitle   text,
  sort_order int not null default 0
);

create table certifications (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references cert_groups(id) on delete cascade,
  title      text not null,
  status     text not null default 'in_progress' check (status in ('passed','in_progress','planned')),
  credential_url text,
  sort_order int not null default 0,
  published  boolean not null default true
);

create table projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  tag_line     text,                        -- e.g. 'MERN · JWT · RBAC'
  problem      text,
  solves       text,
  stack_brief  text,                        -- what was used, and why
  demo_url     text,
  repo_url     text,
  status       text not null default 'draft' check (status in ('draft','published','teaser')),
  -- 'teaser' rows appear as unnamed "Next case study" lines, so upcoming
  -- project names never show publicly until you publish them
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table project_media (                -- screenshots live in Cloudinary
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  public_id  text not null,                 -- Cloudinary public_id
  alt_text   text not null,
  sort_order int not null default 0
);

create table tech_tags (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name       text not null
);

create table linkedin_posts (               -- the "Latest" card; paste a post manually in the CMS
  id              uuid primary key default gen_random_uuid(),
  post_url        text not null,
  excerpt         text not null,
  posted_on       date not null,
  image_public_id text,                     -- optional Cloudinary image
  published       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Keep updated_at honest
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
create trigger projects_touch before update on projects
  for each row execute function touch_updated_at();
create trigger settings_touch before update on site_settings
  for each row execute function touch_updated_at();

-- Lock everything down; only the Express server (service role) reads or writes
alter table admin_users     enable row level security;
alter table refresh_tokens  enable row level security;
alter table site_settings   enable row level security;
alter table roles           enable row level security;
alter table map_nodes       enable row level security;
alter table journey_steps   enable row level security;
alter table cert_groups     enable row level security;
alter table certifications  enable row level security;
alter table projects        enable row level security;
alter table project_media   enable row level security;
alter table tech_tags       enable row level security;
alter table linkedin_posts  enable row level security;
