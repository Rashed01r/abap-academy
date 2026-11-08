# Files to touch for a new lesson

Derived from how `data-conditional-loop` is wired (grep `conditional-loop` / `conditionalLoop`
across `src`, `scripts` and `tests` to re-check before you start). `<id>` is the mission ID, for example
`data-table-expressions`; `<name>` is the camelCase stem, for example `tableExpressions`.

## New files

| File | Exports | Notes |
|---|---|---|
| `src/lib/<topic>-mission.ts` | `<name>Setup`, `<name>Example`, `<name>Mission: Mission`, `<name>Groups: AnatomyGroupSpec[]`, `<name>Education: EducationSpec` | Use `const t = (en: string): Text => ({ en });` only. See `conditional-loop-mission.ts`. |
| `tests/<topic>.test.ts` | node:test unit tests | Engine semantics, rejected forms, grader accepts solution and rejects canned/destructive variants. Add the file to the `test` script in `package.json`. |
| `tests/<topic>.spec.ts` (or extend `tests/english-only.spec.ts`) | Playwright | Route `/?mission=<id>`, title, anatomy match, `gradeAll`, `answerQuiz`. |

## Mission object (`Mission` in `src/lib/curriculum.ts`)

```
id, pathId: "data", prerequisite: "<previous mission id>",
title, subtitle, minutes, xp, difficulty, environment: "browser",
assessment: "simulated", visualization: "scalar"|"structure"|"condition"|"loop"|"table"|"project",
coveredTopics: [...], brief, objectives: [2 items], references: [SAP URLs],
tokens: [token1, token2], example, visual, practice,
goal, hint: hints[0], hints: [3], starter, solution: example, expected,
challenges: [{ id: "<challenge-id>", title, goal, hint, starter, solution, expected }],
quiz, options: [3], answer, quizExplanation
```
XP has so far grown with difficulty (280–300 for intermediate data lessons). Update inventory totals in the docs.

## Registry / wiring edits

| File | Add |
|---|---|
| `src/lib/data-missions.ts` | import and append `<name>Mission` to the end of the `dataMissions` array (order = path order). |
| `src/lib/anatomy-content.ts` | `"<id>": { fingerprint: "<hash>", groups: <name>Groups, checks: [group ids to quiz] }`. Get the fingerprint by running the tests or validator once. The error message tells you the value, and `sourceFingerprint` is in `src/lib/code-anatomy.ts`. |
| `src/lib/education-content.ts` | import and add `"<id>": <name>Education`. |
| `src/lib/education-surfaces.ts` | `["<id>", "<concept ids used by visualizer>", "<concept ids used by knowledge check>"]`. |
| `src/lib/education-scenarios.ts` | Optional extra exploration scenarios (`scenario(...)`); add English only. |
| `src/lib/visual-presentations.ts` | `"<id>": "trace" | "flow" | "categories" | "row-access" | ...`. Required, or `validate:education` fails. |
| `src/lib/lesson-flows.ts` | Flowchart steps `[label, caption, isDecision?]`. |
| `src/lib/beginner-lessons.ts` | `beginnerLessons["<id>"]`: `goal`, 3 `ideas`, 3 `mistakes` (wrong/right/why), `check`, 3 `experiments` (from/to must match the example exactly), `challenge` (must/hints). And `challengeBriefs["<id>"]`: `intro`, `boxes`, `start`. |
| `src/components/trace-classroom.tsx` | `preferredOperation` entry if the trace should focus a specific operation. |
| `src/lib/engine.ts` | Challenge grader branch in `evaluate()` (`if (id === "<challenge-id>")`), plus any parser/executor support. |
| `scripts/education-review-notes.ts` | `reviewNotes["<id>"]`: priority, found, correction, remaining. |
| `tests/visual-classroom.spec.ts` | Update expected arrow counts if the lesson uses the `flow` family. |
| `src/lib/curriculum.ts` | Only if the planned-topic record or path-summary needs its `coveredTopics` linked (check `path-summaries.ts` and the planned records so the "Coming Soon" card disappears). |

## Education spec (`EducationSpec`)

```
what, why,
concepts: [{ id, name, explanation, misconception, objectives: [index],
             learn: ["group:<groupId>", "token:<tokenId>"], demonstrate: "trace",
             assess: ["<challenge-id>", "knowledge-check" | "concept-check"] }]
```
Each objective must bind to at least one concept. Every `learn` target must exist.

## Anatomy groups

`group(id, [startLine, endLine], title, explanation, syntaxRefs?)` cover the example **line by line
with no gaps**, in source order. Explanations use the actual values ("finds row 2 and copies Sara").
