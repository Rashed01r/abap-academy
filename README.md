# ABAP Academy — SAP ABAP for Everyone

Learn SAP ABAP in the browser through short lessons, guided simulations and hands-on challenges. No SAP system, account or backend is needed: everything runs on the page, and progress is kept in the browser's local storage.

## What's inside

63 lessons in 8 learning paths, laid out on an interactive roadmap:

1. ABAP Fundamentals
2. Working with Data
3. ABAP Dictionary
4. Database Development
5. Object-Oriented ABAP
6. SAP Application Development
7. Modern ABAP
8. ABAP Cloud and RAP

Code lessons run in a built-in **educational ABAP simulator** (`src/lib/engine.ts`): a lexer, a restricted parser, semantic checks and a step-by-step execution trace that shows memory and output after every statement. It covers the subset of ABAP the lessons teach (variables, structures, conditions, loops, internal tables, field symbols, table expressions, ABAP SQL on sample tables, local classes). It is not a real SAP runtime or a full ABAP compiler.

The editor is Monaco, served from the app itself (`predev`/`prebuild` copy it to the ignored `public/monaco/`), so no CDN is needed.

## Run locally

Requires Node.js 20.9+ and npm.

```bash
npm ci
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Deploy

It is a static Next.js App Router app with no environment variables or server code. Deploy it to any Next.js host (for example Vercel) with the defaults: install `npm ci`, build `npm run build`. The build also validates the lesson content and fails if a lesson is incomplete.

## Verify

```bash
npm run lint
npm run typecheck
npm test                     # unit tests
npm run validate:curriculum
npm run build
```

Browser tests (Playwright) need a running app:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

`playwright.config.ts` uses the installed Windows Chrome; change `executablePath` for other machines.

## Project layout

- `src/app/page.tsx` — app shell: header, roadmap / lesson / contact views, settings, saved progress.
- `src/features/roadmap/` — the interactive roadmap and the lesson view.
- `src/components/` — lesson screens, labs, the code editor and the execution workspace.
- `src/lib/curriculum.ts` — paths, missions and quizzes; other `src/lib/*` files hold lesson content.
- `src/lib/engine.ts` — the ABAP simulator and challenge grading.
- `src/lib/progress.ts` — progress, prerequisites and XP.
- `docs/academy-development/` — development records; start with `NEXT_STEPS.md`.

## Saved data

Progress, theme and language live in the browser's local storage (`abap2-*` keys). Clearing site data resets progress. Nothing is sent to a server; the Contact form opens a prefilled email draft in the visitor's own mail app.
