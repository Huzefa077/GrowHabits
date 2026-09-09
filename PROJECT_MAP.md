# GrowHabits: Quick Project Map

> Rule to remember: in Next.js, a file's **folder location** gives it meaning.
> `app/login/page.tsx` and `app/register/page.tsx` have the same filename, but create two different URLs.

## 1. Read the app as a route map

```text
URL                         FILE THAT RUNS                              PURPOSE
──────────────────────────  ──────────────────────────────────────────  ─────────────────────────────
/                           app/page.tsx                                public home / landing page
/login                      app/login/page.tsx                          sign-in form
/register                   app/register/page.tsx                       account-creation form
/about                      app/about/page.tsx                          how and why to use the app
/dashboard                  app/dashboard/page.tsx                      list of saved planners
/dashboard/planners/42      app/dashboard/planners/[id]/page.tsx        one saved planner ([id] is 42)

/planner                    app/planner/page.tsx                        wizard: choose age group
  └─ /sections              app/planner/sections/page.tsx               wizard: choose sections
      └─ /activities        app/planner/activities/page.tsx             wizard: edit activities
          └─ /preview       app/planner/preview/page.tsx                wizard: preview, print, save
```

**Why are there many `page.tsx` files?** `page.tsx` is a special Next.js filename. The folders above it build the URL. Without one of these files, that URL simply has no screen.

---

## 2. Full folder tree

```text
GrowHabits/
│
├─ app/                                  ← screens and API routes
│  ├─ layout.tsx                         ← shared shell: fonts, navbar, planner state
│  ├─ globals.css                        ← shared Tailwind theme and global styles
│  ├─ page.tsx                           ← /
│  ├─ login/page.tsx                     ← /login
│  ├─ register/page.tsx                  ← /register
│  ├─ dashboard/
│  │  ├─ page.tsx                        ← /dashboard
│  │  └─ planners/[id]/page.tsx          ← /dashboard/planners/:id
│  ├─ planner/                           ← planner-creation wizard
│  │  ├─ page.tsx                        ← step 1: age group
│  │  ├─ sections/page.tsx               ← step 2: sections
│  │  ├─ activities/page.tsx             ← step 3: activities
│  │  └─ preview/page.tsx                ← step 4: preview/save
│  └─ api/                               ← server endpoints; browser calls these
│     ├─ auth/login/route.ts              ← POST /api/auth/login
│     ├─ auth/register/route.ts           ← POST /api/auth/register
│     └─ planner/
│        ├─ route.ts                      ← POST /api/planner (save new)
│        └─ [id]/route.ts                 ← PUT /api/planner/:id (update)
│
├─ components/                           ← reusable visual building blocks
│  ├─ common/                            ← shared general-purpose sections
│  │  ├─ Navbar.tsx                      ← nav shown through layout.tsx
│  │  ├─ Hero.tsx                        ← home-page introduction
│  │  └─ Features.tsx                    ← home-page feature cards
│  ├─ planner/
│  │  └─ SavedPlannerActions.tsx          ← Edit and Print browser buttons
│  └─ ui/                                ← shared shadcn/Base UI primitives
│     ├─ button.tsx                      ← consistent Button component
│     └─ input.tsx                       ← consistent Input component
│
├─ context/
│  └─ PlannerContext.tsx                 ← temporary wizard data shared between pages
│
├─ database/entities/                    ← TypeScript descriptions of PostgreSQL tables
│  ├─ User.ts                            ← User table
│  ├─ Planner.ts                         ← Planner table
│  ├─ Section.ts                         ← Section table
│  └─ Activity.ts                        ← Activity table
│
├─ config/
│  └─ database.ts                        ← database connection settings + entity list
│
├─ lib/                                  ← reusable behind-the-scenes helpers
│  ├─ database.ts                        ← opens/reuses PostgreSQL connection
│  ├─ auth.ts                            ← reads cookie and finds logged-in user
│  └─ utils.ts                           ← small Tailwind class-name helper
│
├─ public/                               ← files served directly to the browser
│
├─ .env                                 ← local secrets; never commit
├─ .gitignore                            ← tells Git what not to upload
├─ package.json                          ← scripts and dependency list
├─ package-lock.json                     ← exact installed dependency versions
├─ tsconfig.json                         ← TypeScript rules
├─ next.config.ts                        ← Next.js server build settings
├─ postcss.config.mjs                    ← connects Tailwind to CSS processing
├─ eslint.config.mjs                     ← code-quality rules
├─ components.json                       ← shadcn CLI configuration
├─ README.md                             ← GitHub-facing project introduction
└─ AGENTS.md                             ← instructions for coding assistants
```

---

## 3. The three important flows

### A. Creating a planner

```text
planner/page.tsx
       ↓
sections/page.tsx
       ↓        (temporary choices live in PlannerContext.tsx)
activities/page.tsx
       ↓
preview/page.tsx
       ↓        (sends data to server)
api/planner/route.ts
       ↓
PostgreSQL
```

Without `PlannerContext.tsx`, each wizard page would forget the choices from the previous page unless we passed data through the URL or saved unfinished work in the database.

### B. Sign in

```text
login/page.tsx → api/auth/login/route.ts → bcrypt checks password
                                            ↓
                                     auth_token cookie
                                            ↓
                                      lib/auth.ts
                                            ↓
                              dashboard and protected API routes
```

The page is only the form. The `route.ts` file is the secure server part that is allowed to check passwords and create the cookie.

### C. Saved planner data

```text
User
 └─ Planner
     └─ Section
         └─ Activity
```

Each arrow means “one can contain many.” This is why individual activities and sections have their own database tables.

---

## 4. How to tell files apart quickly

| When you see… | It means… | Example |
|---|---|---|
| `app/.../page.tsx` | a screen at a URL | `app/login/page.tsx` → `/login` |
| `app/api/.../route.ts` | a server endpoint, not a visible page | `route.ts` receives a `POST` request |
| `components/...` | a reusable visual piece used inside a page | `Navbar.tsx` |
| `database/entities/...` | a blueprint for a PostgreSQL table | `Planner.ts` |
| `lib/...` | reusable logic, usually no visible HTML | `auth.ts` |
| `config/...` | central settings | `database.ts` |

---

## 5. Files you normally do **not** hand-edit

- `package-lock.json` — npm generates it; commit it, but do not manually change it.
- `next-env.d.ts` — Next.js generates it.
- `components.json`, `package.json`, `tsconfig.json` — JSON does not allow comments. Change these only when you know which setting you need.
- `.env` — contains secrets. Keep it local and out of Git.

## Is this the only professional structure?

No. It is a good structure for a small Next.js app because it separates **screens** (`app`), **reusable UI** (`components`), **shared logic** (`lib`), and **database models** (`database/entities`). Bigger teams sometimes use feature folders, but this layout is clear and professional for your current project.
