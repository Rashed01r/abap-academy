---
name: academy-lesson
description: Create or extend an ABAP Academy lesson (mission) so it matches the existing lessons in content, style, structure, simulator support and verification. Use whenever the user asks for new lesson content, a new mission, to fill a "Coming Soon" tree card, or to research SAP material for a lesson (e.g. table expressions, internal table performance, Employee Data Manager, Dictionary, SQL, OOP).
---

# ABAP Academy lesson authoring

Follow this workflow for every new or expanded lesson. It keeps new content consistent with the
24 shipped missions, uses SAP sources, and respects the repo's continuity rules in `AGENTS.md`.

## 0. Orient (always)

1. Read `AGENTS.md`, `NEXT_STEPS.md` (top checkpoint), `docs/academy-development/LANGUAGE_PHASE.md`
   and the top of `docs/academy-development/IMPLEMENTATION_PROGRESS.md`.
2. Confirm which mission is next. The planned order is recorded in `NEXT_STEPS.md`
   (currently `data-table-expressions` → `data-table-performance` → `data-employee-manager`).
   If the user asks for a different one, say it is out of sequence and ask before proceeding.
3. Check the active language: while `ENABLE_ARABIC = false` in `src/lib/language-policy.ts`,
   write **English only** (`{ en }` text). Never delete existing Arabic, and never copy English into `ar`.
4. Read the closest shipped lesson as the reference template. For data-path lessons that is
   `src/lib/conditional-loop-mission.ts` (newest) and `src/lib/read-table-mission.ts`.

## 1. Research SAP sources (before writing any teaching text)

Use `references/sap-sources.md` for the trusted source list and fetch procedure.
- help.sap.com pages render with JavaScript; WebFetch returns them empty. Use the raw GitHub
  SAP-samples cheat sheets and the SAP Clean ABAP guide instead, and cite the help.sap.com
  keyword URL in `references` (those URLs are stable and learner-friendly).
- Check `references/sap-notes/` first; a topic may already be researched. Add a new notes file
  when you research a new topic, with source URLs and the date.
- Every behavioral claim in a lesson (exceptions, sy-subrc/sy-tabix, costs) must trace to a
  source note. If the browser simulator models something differently from SAP, say so
  explicitly in `practice` / Go Deeper, as earlier lessons do.

## 2. Decide the simulator boundary

Read `docs/academy-development/SIMULATOR_SUPPORT.md` and grep `src/lib/engine.ts` for the
syntax you need. Then choose one:
- **Supported already** → write the lesson against it.
- **Needs interpreter work** → extend `parse`/`execute` in `engine.ts` for a *documented
  subset only*, reject everything outside it with `SimulationError` at the source line, and add
  unit tests (pattern: `tests/conditional-loop.test.ts`). Document the subset as a new dated
  section at the top of `SIMULATOR_SUPPORT.md`.
- **Not executable in a browser** (real performance timings, DB persistence, activation) →
  teach with a controlled model labelled as a model. Never fabricate SAP runtime numbers.

## 3. Write the lesson

Follow `references/writing-style.md` (voice, data set, structure) and
`references/file-checklist.md` (every file to touch, with the exact shape of each entry).
Core rules:
- Same cast and data: employees Ahmed 101, Sara 102, Omar 103 (salaries 5000 / 8000 / 6000),
  `ty_employee`, `lt_employees`, `ls_employee`, `lv_` / `ls_` / `lt_` prefixes.
- Mission ID: keep the reserved stable ID (`data-…`). Never rename existing IDs, challenge IDs,
  token IDs or concept IDs; learner progress depends on them.
- Two syntax tokens (meaning / why / write / correct / mistake / question), an `example` that
  runs in the simulator, a `starter` that is the setup plus one `*` comment line, at least one
  graded challenge, and a three-option quiz with an explanation of why the answer is right.
- The challenge grader in `engine.ts` must run the learner's code against **changed data**
  (names, values, thresholds, an empty or missing case) and reject canned `WRITE` output,
  hard-coded inputs, and destructive shortcuts. Pattern: `data-conditional-report`.

## 4. Verify (targeted while working, full at the end)

Targeted, during work (Windows: use `npm.cmd`):
`npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run validate:education`,
`npm.cmd run validate:curriculum`, and the new lesson's Playwright spec.

Milestone, before calling the mission verified:
`npm.cmd run build`, `npm.cmd run lint`, `npm.cmd test`, both validators, and
`npm.cmd run test:e2e` (full regression). Look at real screenshots for desktop/light and
mobile/dark. Report exact pass counts and any failures as they were. Do not skip or weaken
existing assertions.

Never run `npm.cmd run report:education -- --record-review` to make a failing gate pass. Run it
only after you have reviewed the lesson yourself.

## 5. Record

Update `NEXT_STEPS.md`, `docs/academy-development/NEXT_STEPS.md`,
`IMPLEMENTATION_PROGRESS.md`, `MISSION_REGISTRY.md`, `CURRICULUM.md` and
`SIMULATOR_SUPPORT.md` with a new dated checkpoint at the top: what was added, exact
verification numbers, inventory (missions, assessments, XP), and the next mission. Do not mark
anything verified that was not actually run and passed.
