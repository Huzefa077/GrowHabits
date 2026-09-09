# GrowHabits

GrowHabits is a full-stack web application for helping parents turn positive intentions into clear, printable monthly routines for children. Parents can organise small daily activities around learning, good deeds, movement, prayer, family time, and custom focus areas.

The project is built as a practical Next.js learning project, with a focus on understandable code, reusable components, and a complete user flow rather than only a static interface.

## The problem it solves

Positive habits are easier to follow when they are visible. This app helps a parent turn broad goals—such as reading, kindness, movement, prayer, or family responsibility—into a small daily routine a child can actually see and follow.

The intended experience is physical as well as digital: the parent builds the routine online, then the child tracks it on a printed planner with a pencil, star, sticker, or tick.

## What users can do

- Create a monthly planner by choosing an age group, focus areas, and daily activities.
- Preview and print a planner in A4 or A3 landscape format.
- Register with email and password, verify the email address, sign in, and reset a forgotten password.
- Sign in or register with Google.
- Save, edit, preview, and permanently delete planners from a personal dashboard.
- Use the planner as a guest without an account; guest planners stay only for the current browser session.
- Send feature ideas, recommendations, or bug reports through the feedback page.
- Read product changes and planned work on the Updates page.

## Product flow

```text
Choose age group
    → choose sections
    → add activities
    → preview / print
    → save to dashboard (signed-in users)
```

## Architecture in plain English

Next.js keeps the visible interface and server code in one repository. This does not mean there is no backend: `app/` contains pages the user visits, while `app/api/` contains server-side HTTP endpoints for authentication, planners, feedback, and scheduled cleanup.

```text
Browser UI
  ├─ app/ and components/       Pages and reusable visual pieces
  ├─ context/PlannerContext     Temporary planner state during the wizard
  └─ app/api/...                Server endpoints
                                     ↓
                               lib/ helpers
                                     ↓
                         TypeORM + PostgreSQL
                                     ↓
                         User → Planner → Section → Activity
```

Guest planners use browser `sessionStorage`. They survive refreshes in the same browser session but are never written to PostgreSQL.

## Tech stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS and Base UI components
- PostgreSQL with TypeORM
- JWT authentication in HTTP-only cookies
- bcrypt password hashing
- Google OAuth sign-in
- Nodemailer with Gmail for verification and password-reset email
- Vercel for deployment and Neon PostgreSQL for production data

## Project structure

```text
app/                  Routes, pages, and API endpoints
components/           Reusable visual components
context/              Shared planner state while creating or editing a planner
database/entities/    TypeORM models for PostgreSQL tables
config/               Central configuration and public update content
lib/                  Reusable server-side helpers such as authentication and email
```

For a guided map of the codebase, see [PROJECT_MAP.md](./PROJECT_MAP.md).

## Key engineering decisions

| Decision | Reason |
| --- | --- |
| TypeScript | Catches mismatched data shapes before the application runs. |
| PostgreSQL + TypeORM | Models the natural relationship: one user owns planners; a planner contains sections and activities. |
| HTTP-only JWT cookie | Keeps the sign-in token unavailable to client-side JavaScript. |
| bcrypt | Stores a one-way password hash, never the original password. |
| Google OAuth | Lets Google users sign in without GrowHabits seeing or storing their Google password. |
| Printable-first layout | Uses physical-paper measurements so preview and print stay consistent. |

## Data model

```text
User
 └─ Planner (many per user)
     └─ Section (many per planner)
         └─ Activity (many per section)

FeedbackMessage
 └─ Kept separate because product feedback is not planner data.
```

When a planner is deleted, its sections and activities are deleted with it through database cascades. This avoids leaving orphaned rows in the database.

## Run locally

1. Clone the repository.

   ```bash
   git clone https://github.com/Huzefa077/GrowHabits.git
   cd GrowHabits
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a local `.env` file with your own database, JWT, Google OAuth, and email credentials. Never commit this file.

   ```env
   DATABASE_URL=your-postgresql-connection-string
   DB_SYNC=true
   JWT_SECRET=a-long-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GMAIL_USER=your-gmail-address
   GMAIL_APP_PASSWORD=your-gmail-app-password
   CRON_SECRET=a-long-random-secret
   ```

4. Start the development server.

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Useful commands

```bash
npm run dev     # Start local development
npm run lint    # Check code quality
npm run build   # Create a production build
```

## Deployment notes

Production runs on Vercel with Neon PostgreSQL. Use a pooled Neon `DATABASE_URL`, keep database schema synchronization disabled in production (`DB_SYNC=false`), and configure the Vercel function region close to the Neon database region.

## Current scope and future work

- Age groups are collected during planner creation, but they do not yet alter activity suggestions or layout.
- The planner is intentionally for physical completion after printing; it is not a digital task-completion tracker.
- Guest planners are temporary by design and must be recreated or saved after signing in.

Planned work includes age-specific suggestions, child profiles, and richer progress insights while preserving the printable-first approach.

## Author

Built by **Huzaifa Sheikh**, Full Stack Developer. Portfolio: [huzaifasheikh.dev](https://huzaifasheikh.dev)
