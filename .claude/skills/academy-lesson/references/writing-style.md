# Writing style for lessons

The shipped lessons share one voice. Match it, and reread `conditional-loop-mission.ts` and the
matching `beginner-lessons.ts` entry before writing.

## Keep the learning path easy (standing instruction from the user)
- One or two new ideas per lesson. Everything else must already have been taught earlier in the path.
- Short example programs (aim for ≤ 30 lines; a capstone may be longer if split into clearly named steps).
- Show the idea with numbers the learner can see change (rows checked, positions, totals) before naming the theory.
- Prefer a clearly labelled teaching model over adding heavy new syntax to the simulator.
- Split a big task into small graded challenges, each with step-by-step hints.

## Audience and voice
- A beginner who has done the earlier lessons in the path. Assume only what earlier lessons taught.
- Plain, concrete, present tense. Use real values, not abstractions: "Sara at 8000 enters the
  body", not "matching rows are processed".
- Short sentences. One idea per sentence. No marketing words ("powerful", "seamless", "simply").
- Say what happens to memory: which variable changes, which row stays, what `sy-subrc` becomes.
- Name the misconception directly and correct it ("Skipping processing does not delete a row").

## Fixed cast and data
- Type `ty_employee` (`id TYPE i`, `name TYPE string`, `salary TYPE i`), table `lt_employees`
  (`STANDARD TABLE OF ty_employee WITH EMPTY KEY` unless the lesson is about keys/categories),
  work area `ls_employee`, inputs `lv_id`, `lv_min_salary`, counters `lv_count`, `lv_total`.
- Rows: Ahmed 101 / 5000, Sara 102 / 8000, Omar 103 / 6000. Use ID 999 for the missing case.
- Graders use other names (Ava, Ben, Chen, Eli, Faye, Gus, Hana, Ivo, Jin) and values to defeat
  canned output.

## Field-by-field
| Field | Shape |
|---|---|
| `title` | Verb phrase, 3–6 words ("Process only matching rows"). |
| `subtitle` | What the learner does, with the business object ("Select employees with WHERE and build an accurate report"). |
| `brief` | 4–7 sentences: the concrete data, what the code does to it, the result, and one contrast with the previous technique plus the main trap. |
| `objectives` | Exactly 2, starting with a verb, testable. |
| token `meaning` / `why` / `write` | What it is / the business reason / exact placement and punctuation. |
| token `correct` / `mistake` | Minimal snippets; the mistake is the realistic one beginners make. |
| token `question` | One concrete prediction, 2 options, explanation says *why*. |
| `visual` | What to step through and watch change, including a "change X to Y to see Z" experiment. |
| `practice` | Values to try, then the exact simulator subset and what is **outside** it. End with any SAP-vs-model caveat. |
| `goal` | Imperative; keep supplied identifiers; exact output order; states the checker changes data, including the empty/missing case. |
| `hints` | 3, from conceptual to near-solution. |
| `quiz` | A changed-input scenario; 3 options; explanation covers why the distractors are wrong. |

## Beginner layer (`beginner-lessons.ts`)
Even shorter: `ideas` are `[headline, one line]`; `mistakes` show wrong → right with a one-line why;
experiments edit one line of the example and say what changes.

## Honesty rules
- Never claim SAP compilation, activation, persistence or measured performance from the browser.
- When the model differs from SAP (for example `sy-tabix` after a failed read), say so and say which is the model convention.
- Cite help.sap.com keyword pages in `references`.
