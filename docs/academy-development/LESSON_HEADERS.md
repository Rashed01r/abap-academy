# Shared lesson header and content audit

Current development language: English only. Arabic resources and RTL styles remain preserved; no Arabic content was added or reactivated.

All 25 implemented lessons use LessonHeader through ConnectedLesson. Existing title, subtitle, difficulty, minutes, XP, objectives, module title and prerequisite fields are mapped without editing curriculum data or progress semantics. Orientation retains its existing title, introduction, objective, Beginner level, 4 minutes and 25 XP. Lesson numbers are absent and hidden. Status is derived from the existing completion/started records.

Objectives open on the first visit, then start collapsed on subsequent visits/reloads. Only an independent abap2-lesson-header:<id>:objectives-seen UI preference is written; unavailable storage leaves the toggle usable. Prerequisite navigation uses the existing onNavigate callback and is independent of the objectives toggle.

No implemented lesson is missing its displayed subtitle or objectives. Orientation has no standalone mission subtitle/objectives fields and uses its existing UI fallback strings. All 25 lack an explicit icon field and use the module defaults listed below. LessonHeaderData.icon accepts a lesson-specific Lucide icon when supplied; there are no per-lesson icon branches. Optional fields are omitted cleanly.

| Lesson ID | Subtitle | Objectives | Explicit icon / fallback |
| --- | --- | --- | --- |
| orientation | Existing UI fallback | Existing UI fallback | Missing; BookOpen module default |
| addition | Present | Present | Missing; BookOpen module default |
| structures | Present | Present | Missing; BookOpen module default |
| conditions | Present | Present | Missing; BookOpen module default |
| do | Present | Present | Missing; BookOpen module default |
| while | Present | Present | Missing; BookOpen module default |
| tables | Present | Present | Missing; BookOpen module default |
| loop-at | Present | Present | Missing; BookOpen module default |
| loop-control | Present | Present | Missing; BookOpen module default |
| employees | Present | Present | Missing; BookOpen module default |
| data-table-model | Present | Present | Missing; Table2 module default |
| data-table-categories | Present | Present | Missing; Table2 module default |
| data-keys | Present | Present | Missing; Table2 module default |
| data-work-areas-field-symbols | Present | Present | Missing; Table2 module default |
| data-read-table | Present | Present | Missing; Table2 module default |
| data-table-mutations | Present | Present | Missing; Table2 module default |
| data-sorting-filtering | Present | Present | Missing; Table2 module default |
| data-conditional-loop | Present | Present | Missing; Table2 module default |
| dictionary-introduction | Present | Present | Missing; Database module default |
| database-fundamentals | Present | Present | Missing; Database module default |
| oop-introduction | Present | Present | Missing; Boxes module default |
| applications-reports | Present | Present | Missing; Workflow module default |
| modern-syntax | Present | Present | Missing; Braces module default |
| cloud-introduction | Present | Present | Missing; Cloud module default |
| projects-employee-management | Present | Present | Missing; FolderKanban module default |

The component uses logical RTL layout and LTR isolation for technical text/numbers, visible translated status text, a real aria-expanded objectives button and reduced-motion styles. Stat labels use 11px to satisfy the minimum-text-size rule.

Verification (2026-11-07): production build, standalone lint/typecheck, curriculum/education validation and 111/111 unit tests passed. The all-header/illustration/exploration targeted run passed 18/18. Full production browser regression passed 144/146 in 4.9m with three workers; a Chrome page crash on home navigation and one unavailable Monaco instance coincided with Windows process-launch failures during concurrent checks. Both unchanged cases passed on the same build with one worker (2/2 in 3.6s). All 146 scenarios therefore passed across the full run and scoped retry; no tests were edited, disabled or skipped after the full run, and no application source changed. Sparse optional fields, valid zero metadata and a supplied custom icon were also checked through server rendering. Final desktop/light and mobile/dark captures are in ignored build/lesson-header. The header remains in normal flow and all existing learner data, routes, lesson content and assessments are preserved.
