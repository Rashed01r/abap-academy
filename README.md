# ABAP Academy 2.0 — SAP ABAP for Everyone

A standalone Next.js App Router application. No book PDFs, authentication, backend, telemetry, or paid service is included.

Phase 2 is implemented through Stage C (Conditions). See `docs/PHASE_2_DELIVERY.md` for the delivered scope and `NEXT_STEPS.md` for remaining stages. DO, WHILE, internal tables, loop control, and the employee project remain explicitly labeled previews.

## Start locally

Requires Node.js 20.9+ and npm. Windows PowerShell users can use `npm.cmd` if execution policy blocks `npm.ps1`.

```powershell
npm.cmd ci
npm.cmd run dev -- --port 3002
```

Open http://localhost:3002. If this project already has a development server, Next.js prints its address; reuse that server. Production:

```powershell
npm.cmd run build
npm.cmd start -- --port 3002
```

Monaco is served from this app: `predev` and `prebuild` copy its assets to the ignored `public/monaco/` directory. No editor CDN is required. Dependencies are pinned by `package-lock.json`.

## Playable curriculum

1. **Syntax Orientation** — statements, keywords, periods, whitespace, comments, naming, editing, and simulation; complete each short token check to earn 25 XP and unlock Mission 1.
2. **Add Two Numbers** — Syntax Lab, briefing, synchronized demonstration, editable practice, an arithmetic challenge, and reflection quiz. Completing the challenge and quiz earns 100 XP and unlocks Mission 2.
3. **Create a Structure** — a structure Syntax Lab, employee record demonstration, editable practice, Product record challenge, and reflection quiz. Completion earns 150 XP.
4. **Make a Decision with IF / ELSE** — purchase approval visualization, comparison and ELSEIF Syntax Labs, threshold practice, three separately checked challenges (positive numbers, employee bonuses, score ranges), and a final quiz. Completion earns 200 XP after Create a Structure.

The connected roadmap preserves nine learning paths. Mission 04 through Mission 09 and advanced topics remain inspectable previews. The original foundation has its own 3/3 milestone; current path and available-activity completion use all four playable activities. Preview lessons are excluded from the denominator. Existing completed missions, attempts, and XP survive normalization against the mission registry.

## Connected execution workspace

- The lexer retains offsets and physical source positions; the parser produces a restricted, typed AST.
- Semantic validation checks declarations, names, structure fields, types, and branch bodies before simulation.
- Immutable execution events contain source ranges, operation kind, memory/output snapshots, changed fields, condition results, skipped ranges, and localized explanation keys.
- Monaco decorations highlight the entire active statement, including multi-line TYPES chains. A single `▶` gutter pointer marks its start, distinct from the text cursor; it scrolls into view.
- Previous, Next, Restart, Play/Pause, and clickable timeline events restore snapshots. Editing immediately clears traces and diagnostics. Building a trace starts from its first event.
- Memory highlights use labels and borders as well as color. Structure component expressions are clickable in Monaco to identify their field in memory. Fields can also be selected directly.
- The conditional regression has exactly four events for the provided 1200 example: declare, compare, matching WRITE, and block end. The unselected WRITE is dimmed and labeled as skipped; it is not an executed event.

## Exact simulation scope

This is an **educational simulation, not a real SAP runtime or a full ABAP compiler**. It has no SAP connection.

Supported:

- DATA for integer `i`, `string`, and a previously defined local structure type; optional literal VALUE for scalar variables.
- Local `TYPES: BEGIN OF type_name, field TYPE i/string, ... END OF type_name.` chains with scalar fields.
- Scalar and structure-component assignments, integer addition, and WRITE of scalar expressions.
- IF comparisons (`=`, `<>`, `>`, `<`, `>=`, `<=`) with ordered ELSEIF branches, optional final ELSE, and matching ENDIF, including nested conditions. Only reached comparisons generate execution events.
- Case-insensitive names, statements spanning physical lines, `*` comments in column 1, double-quote line comments, and doubled single quotes within text literals.

Not supported: database access, loops, tables, methods/classes, nested structures, constructor expressions, conversion rules, and other ABAP features. DATA/TYPES declarations inside IF branches are intentionally rejected. This model does not reproduce every SAP formatting or implicit conversion behavior: each WRITE adds one output entry. Integers use the signed 32-bit range; text literals cannot cross physical lines. Programs are limited to 16,000 characters, 2,000 lexical tokens, and 150 statements.

No `eval`, Function constructor, remote execution, or keyword-only grading is used. Arithmetic grading checks the parsed declarations, final output, addition, and a second set of input values to reject hardcoded answers. Structure grading checks the type's component types, record values, and WRITE of the actual name component. Conditions checks run multiple boundary and non-boundary inputs against the parsed program, require conditional control flow (including ELSEIF for range classification), and reject overwriting the designated input. A failed probe reports its input and expected/actual output separately from the editor's current trace. These are exercise checks within the supported model, not claims of arbitrary ABAP correctness.

## Languages, appearance, and device progress

All UI, learning explanations, quizzes, errors, hints, and instructional comments support English and Modern Standard Arabic. Code, names, and technical expressions remain LTR inside RTL layouts. Changing language or appearance preserves the current code, trace, and selected event.

Appearance supports Light, Dark, and System, including live OS preference changes. Tokens cover the full UI, and Monaco switches themes. Motion respects reduced-motion preferences. Native dialogs provide modal focus behavior and restore focus on close.

Local storage keys:

- `abap2-master-progress`: completed Syntax Labs, completed missions, current mission, attempts, and last challenge results.
- `abap2-language`: locale.
- `abap2-appearance`: light/dark/system preference.

XP and milestones derive from completed activities, so replaying a mission cannot duplicate rewards. Opening a mission does not complete it. Storage failures leave the app usable for the current visit and show a notice. Code drafts and in-progress traces are session-only. Clearing browser storage resets progress. The earlier prototype's `abap2-progress` key is retained but is not imported, because that curriculum did not include the new prerequisite Syntax Labs.

## Verify

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

For browser tests, start the app first. The configuration defaults to port 3002 and can target any local preview:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:3002'
npm.cmd run test:e2e
```

The Playwright config uses installed Windows Chrome and defaults to `http://localhost:3002`, matching the start command. Set its `executablePath` for your environment (or install a Playwright browser and remove the override). Use the same localhost hostname as the development server; Next.js dev origin checks may block resources through a different hostname.

Tests cover parser diagnostics, multi-line source ranges, arithmetic, structures, conditions, skipped branches, immutable memory/output, grading, prerequisite progression and XP; browser tests cover the full journey in English/Arabic and light/dark on desktop/mobile, system theme changes, Monaco execution pointers, navigation, trace invalidation, diagnostics, reset confirmation, future previews, local progress, and horizontal overflow.

## Modules

- `src/lib/curriculum.ts` — structured mission, token, quiz, and roadmap content.
- `src/lib/i18n.ts` — UI strings, diagnostic explanations, execution narration.
- `src/lib/engine.ts` — lexer, restricted parser, semantic checks, event generation, challenge grading.
- `src/lib/progress.ts` — versioned progress shape, normalization, prerequisites, XP.
- `src/components/syntax-lab.tsx` — reusable token teaching and comprehension quizzes.
- `src/components/mission-engine.tsx` — mission stages and completion gates.
- `src/components/code-editor.tsx` — Monaco, source decorations, diagnostics, field selection.
- `src/components/learning-workspace.tsx` — execution controls, explanation panel, memory, output, timeline, hints and feedback.
- `src/app/page.tsx` — application shell, appearance/locale settings, roadmap, local persistence.

## Content accuracy references

Original beginner lessons were checked against [SAP syntax guidance](https://learning.sap.com/courses/learn-the-basics-of-abap-programming-on-sap-btp/introducing-abap-syntax_b815682e-9a5e-4372-a021-66ea71208746), [SAP structured data objects](https://learning.sap.com/courses/basic-abap-programming/declaring-a-structured-data-object_cd245e79-eb25-4099-a5b4-9ad46b1659b6), and [SAP component selectors](https://help.sap.com/docs/abap-cloud/abap-keywords-standard-abap/ABENSTRUCTURE_COMPONENT_SELECTOR.html). Advanced reference content remains separate from beginner missions.

This deliverable is a local application; it has not been deployed.
