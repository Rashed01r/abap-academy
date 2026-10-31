# Phase 2 continuation checkpoint

Updated 2026-10-31. This is a partial Phase 2 delivery through Stage C, not completion of the full Phase 2 request.

## Preserve before continuing

- Pre-expansion safe Git checkpoint: `e866806` (includes the hydration fix). Do not reset to it; current code contains the delivered Stage A–C work.
- Keep local storage key `abap2-master-progress` and the existing `Progress` shape. Never clear learner storage to migrate. Registry-driven normalization retains completed foundation lessons, attempt records, and 275 XP; Conditions increases earned XP to 475 only on mission completion.
- Read `AGENTS.md` and relevant installed Next.js docs before code changes. Read `docs/ARABIC_EDITORIAL.md` and reuse `src/lib/glossary.ts`.
- An existing server may already be on http://localhost:3000. Otherwise use `npm.cmd run dev -- --port 3002`. Reuse the running server; do not start competing Next processes in the same directory.

## Delivered stages

A: Repository, mission registry, prerequisites, persistence, editor, evaluator, shared lessons, themes, and Arabic content inspected. Baseline: 15 unit tests, 18 browser cases, typecheck, lint, production build all passed.

B: Revised all 23 original syntax-topic Arabic arrays, Addition and Structure narratives, shared interface/diagnostics, execution explanations, and roadmap terminology. Added glossary, editorial rules, error-specific hints/examples, and isolated inline technical expressions in RTL. Performed a separate editorial reread and actual RTL browser review; this is an assistant editorial review, not external human language certification.

C: Mission `conditions` is playable after `structures`: purchase-approval example, syntax checks, synchronized visualization, guided threshold practice, three ordered coding challenges, knowledge check, and 200 XP. Evaluator supports ordered ELSEIF with one ENDIF event per decision. Prerequisites, XP, numbering, and normalization derive from the registry. Foundation completion is separate from available-content completion.

## Resume at Stage D — implement DO and WHILE as separate complete missions

1. Extend the existing AST/parser/validator/executor in `src/lib/engine.ts`; do not use keyword matching or arbitrary JavaScript evaluation. First add deterministic shared limits for iterations, executed steps, trace entries, nesting, and later collection sizes, with localized diagnostics. Current static limits are 16,000 source characters, 2,000 tokens, 150 statements, signed 32-bit integers. Runtime loop limits do not exist because loops are currently rejected.
2. Add `DO <integer-expression> TIMES. … ENDDO.` and `WHILE <comparison>. … ENDWHILE.`. Support `WRITE: / expression.` for the requested examples, with explicit documented output formatting. Define and test `sy-index` behavior, including nested counted loops and restoration of the enclosing loop counter. Reject unsupported forms explicitly.
3. Extend execution snapshots with loop context (kind, source range, iteration/count/condition), and add an accessible reusable counter visualizer in LearningWorkspace. Previous/Next/Restart must restore that context from the snapshot. Repeated source ranges must produce distinct events. Editing invalidates all context.
4. Register complete bilingual `do` and `while` missions, with prerequisites `conditions` then `do`. Reuse MissionEngine, SyntaxLab, Challenge, `practice`, `objectives`, and `visualization` metadata. Teach every introduced keyword and symbol, explain why it is used, demonstrate execution, show mistakes, then assess. Add counter/loop visualization variants to the typed model.
5. DO: show 1 through 5, grade output 1 through 10 with actual loop behavior, add optional accumulator practice. WHILE: show 1 through 5, assess 1 through 8, and provide a missing-increment debugging exercise that stops safely with an educational diagnostic. Perturb inputs/targets in assessments to reject hardcoded output.
6. Remove only the corresponding preview cards after the complete lessons, evaluator support, and tests exist. Refactor roadmap preview definitions into structured data as lessons grow. Do not simply remove all future previews.

## Then continue in order

E: `tables` after `while`: STANDARD TABLE OF scalar/local-structure WITH EMPTY KEY, APPEND copy semantics, maximum row counts, interactive row visualization and row count. Explain memory versus permanent database storage and introduce table categories gently. Then `loop-at`: LOOP AT … INTO predeclared work area and INTO DATA(...), ENDLOOP; show selected row, copied work-area value, and output. Include total-of-numbers assessment and employee-record follow-up. Add lexer parentheses for inline DATA only when implemented reliably.

F: `loop-control` after `loop-at`: EXIT and CONTINUE scoped to the nearest loop, accessible labels, skipped remainder ranges, correct exit targets, nested-loop boundary tests, and independent skip/stop exercises before combining them.

G: `employees` after `loop-control`: a staged Employee Records Processor that combines previously taught variables, structures, conditions, a counted/conditional loop, internal tables, LOOP AT, and output. Manageable steps with separate feedback; no unfamiliar SAP/database APIs.

H: Complete full-curriculum QA and Arabic editorial reread. Extend migration tests across every newly registered mission. Update README, delivery report, progress scopes, and this file. Do not claim all Phase 2 acceptance criteria until stages D–H pass.

## Files and architectural cautions

- `src/lib/curriculum.ts`: ordered registry, bilingual SyntaxToken content, mission metadata, three Conditions Challenge definitions. Keep IDs stable.
- `src/lib/engine.ts`: source-aware restricted grammar, validation of all branches, immutable memory/output snapshots. Conditions hidden probes execute cloned ASTs and report a failed case without replacing the editor trace.
- `src/lib/progress.ts`: imports the registry. Keep curriculum independent of progress to avoid cycles. Only registered, prerequisite-consistent completions count toward XP.
- `src/components/mission-engine.tsx`: sequential multi-challenge gate before final quiz. All checks must pass; reviewing a completed Syntax Lab may skip its checks without completing a challenge.
- `src/components/learning-workspace.tsx`: shared editor/trace/feedback; `diagnostics.ts` supplies per-error repair advice and examples. `TechnicalText` keeps inline code expressions LTR within Arabic prose.
- `tests/flows.spec.ts`: existing foundation journeys now correctly expect 25% after Orientation and 75% after the three original foundation activities (four activities are available). Update denominators when adding playable activities; keep the 3/3 foundation milestone intact.
- `tests/conditions.spec.ts`: full three-challenge journey, persisted legacy progress, both languages/themes and screen sizes, and diagnostic correction. Do not disable these tests.
- Playwright uses installed Windows Chrome. Default test URL is localhost:3002. Use localhost consistently: the installed Next.js development server blocks dev resources through a mismatching 127.0.0.1 origin.

## Verification commands

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
# Start/reuse the development server before browser tests.
$env:PLAYWRIGHT_BASE_URL='http://localhost:3000' # or localhost:3002 if started there
npm.cmd run test:e2e
```

If `tsx` fails with `uv_os_get_passwd` in the restricted runner, rerun tests in the normal permitted local environment; this is a Windows execution-environment issue, not an application test failure. Do not replace tests to hide it.

Current unsupported constructs: DO/WHILE/LOOP AT, standard tables/APPEND, EXIT/CONTINUE, inline DATA, WRITE chains/slash formatting, AND/OR/NOT, methods/classes, database access, nested structures, implicit conversions, and a full SAP runtime. Keep the in-app supported-syntax disclosure accurate as each construct is added.
