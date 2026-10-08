# Flavorly — Cooking Recipe App

A full-stack recipe web app: register, log in, share recipes with photos, browse and search,
rate and review, save favourites, plan meals for the week, and build a shopping list.

Built with **Next.js 16** (App Router, Server Actions), **React 19**, **Tailwind CSS 4** and
**SQLite** (via `node-sqlite3-wasm`, so there is nothing native to compile).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first run the database is created at `data/flavorly.db` and filled
with demo categories, recipes, reviews and these accounts:

| Role  | Email                 | Password    |
| ----- | --------------------- | ----------- |
| Admin | `admin@flavorly.com`  | `Admin@123` |
| User  | `nimali@flavorly.com` | `Demo@123`  |
| User  | `kasun@flavorly.com`  | `Demo@123`  |

To start over with fresh demo data, stop the server and delete the `data/` folder.

### Environment

Sessions are signed with `SESSION_SECRET`. Locally a development fallback is used if it isn't set; to set
your own, create `.env.local` with `SESSION_SECRET=...`. In production it is **required** — use a long random
value, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Features

**Accounts**
- Register / log in / log out with hashed passwords (bcrypt) and signed, http-only session cookies
- Protected pages redirect to login and come back afterwards
- Settings: edit name, email, bio and profile photo; change password; delete account

**Recipes**
- Create, edit and delete recipes with photo upload, category, cuisine, difficulty, prep/cook time,
  servings, calories, tags, tips, ingredients (fractions like `1 1/2` supported) and steps with optional timers
- Browse with search (title, description, tags, cuisine, ingredients), filters (category, difficulty,
  cuisine, total time), sorting (newest, top rated, most viewed, most saved, quickest) and pagination
- Recipe page: servings scaler, ingredient checklist, step checklist with countdown timers, print, share,
  related recipes, view counter
- **Cook mode**: full-screen, step-by-step view with large timers, keyboard navigation and screen wake lock

**Community**
- 1–5 star ratings and reviews with rating breakdown
- Favourites, public profiles with stats, follow other cooks
- Notifications for new reviews, saves, followers and new recipes from cooks you follow

**Planning**
- Weekly meal planner (breakfast, lunch, dinner, snack) with week navigation
- Shopping list: add from a recipe (scaled, skipping ingredients you ticked), from a whole planned week,
  or by hand; tick off, group by recipe or combine duplicates, copy, print, clear

**Admin panel** (`/admin`)
- Site stats, recipes per category, newest members, recent reviews
- Manage users (promote/demote admin, delete), recipes (feature on home page, edit, delete) and categories

**Other**
- Light/dark theme toggle, responsive layout, custom 404 and error pages

## Project structure

```
src/
  actions/      Server Actions (auth, recipes, planner, shopping, account, admin)
  app/          Routes (pages, layouts, route handlers)
  components/   Shared UI
  lib/          Database, schema & seed, session/auth, queries, helpers
  proxy.ts      Optimistic auth redirects (every action/page re-checks on the server)
data/           SQLite database and uploaded images (created at runtime, git-ignored)
```
