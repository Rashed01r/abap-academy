# Educational authoring and review gates

> **Current development language: English only (2026-11-07).** Arabic support is temporarily deferred, not removed. Preserve all existing Arabic resources and RTL support; do not create or review Arabic translations or run Arabic-specific UI checks while `ENABLE_ARABIC` is false. New playable content requires complete English teaching only. This policy supersedes bilingual authoring/review requirements in the historical sections below. See [the language-phase policy](LANGUAGE_PHASE.md).


The current teaching sequence is **SEE → UNDERSTAND → EXPLORE → READ THE CODE → PRACTICE**. Keep the approved tree, tabs, anatomy, editor, progress v2 and once-only XP. Recommendations never lock implemented lessons. The earlier concept-coverage pass remains useful, but more text/selectors alone do not satisfy visual design quality.

## Required primary visual presentation

Addition-only presentation pilot (2026-11-08): `addition` in English uses Learn / Explore code / Challenge. Learn keeps the primary input-to-result illustration, all essential concept explanations/examples/checks and an explicit approach visible. Its header objectives remain visible on repeat visits. Explore code owns the selectable anatomy and real section snapshots, matching exercise, optional syntax detail and independently editable sandbox. Existing tab/session/draft keys remain unchanged. Other lessons retain the prior layout; extending the pilot requires the user's review. See IMPLEMENTATION_PROGRESS.md for verification.

Every implemented lesson must have an explicit family in `src/lib/visual-presentations.ts` and a real rendered primary illustration in Learn, before concept-reference prose. A missing family fails `validate:education`. Reuse actual trace snapshots for supported execution and label controlled/reference models separately. A colored prose card, a selector with no changing visual, an optional hidden image or a Visualize tab label is insufficient.

On desktop, inspect the first visible lesson area for the actual diagram. In narrow panels, stack/reflow without shrinking labels or losing arrows. Verify source/visual selection where supported, meaningful outcome feedback, English, both themes, focus/resize stability, and unchanged progress/XP. Keep essential code/examples visible. Use `tests/visual-classroom.spec.ts` for the all-topic rendering/interaction gate and the retained full regression for existing lesson behavior. Inspect PNGs from `scripts/review-visual-classroom.mjs`; use `scripts/check-classroom-geometry.mjs` for actual SVG endpoint checks. These checks supplement direct visual review, not replace it. Details and scope are in [VISUAL_CLASSROOM.md](VISUAL_CLASSROOM.md).

## Authoring workflow

1. Inspect the implemented lesson, every stated objective, primary and alternative anatomy, syntax details, visualizer controls, all code/guided assessments and the knowledge check. Planned previews are not implemented lessons.
2. Add stable lesson-qualified concepts in `src/lib/education-content.ts`. Split distinct alternatives and responsibilities: e.g. CONTINUE/EXIT, projection/filter, class/object/attribute/method. Add English names (Arabic deferred), concise teaching, a plausible misconception, objective references, real Learn/example locations, a real demonstration and appropriate assessment references. Do not label an unrelated code block as evidence.
3. Independently declare the concepts required by visualization and the knowledge check in `education-surfaces.ts`. Update these requirements when controls or questions change. Structural reference checking cannot infer what a control actually teaches; the author must inspect it.
4. Keep essential concepts available in Simple Mode. Use Go Deeper for optional depth, target-release requirements and official references. Keep code and values LTR. Preserve dormant Arabic/RTL resources; Arabic authoring and editorial work are deferred.
5. Use the current interpreter for executable diagrams. Add meaningful, source-aligned alternative anatomy when an objective needs another operation. Use `referenceOnly` and explicit SAP boundaries for unsupported syntax. Do not fabricate backend activation, database persistence, hashing performance or RAP deployment.
6. Run targeted checks while implementing. At a milestone run build, standalone typecheck/lint, unit/integration tests, curriculum/education validation and full production browser regression. Inspect actual images for English, desktop/mobile, light/dark, and resized/focused panels. Generating screenshots is not visual verification.
7. Record per-topic findings and exact evidence in the audit ledger. Only after direct review, explicitly refresh the source review record using `npm.cmd run report:education -- --record-review`. Then run `npm.cmd run validate:education`, `npm.cmd run validate:curriculum` and `npm.cmd run report:education`. The fingerprint is a source-drift reminder, not proof of quality. Never run the review-record command as an automatic repair for a failing gate.
8. Update both NEXT_STEPS files and IMPLEMENTATION_PROGRESS with exact remaining work. A planned or untested topic must not become verified.

## Gates A–H

| Gate | Required direct review | Automated assistance |
|---|---|---|
| A Concept completeness | Title, each objective and each alternative have adequate teaching | Every objective binds to concepts; teaching/example targets exist |
| B Beginner clarity | Explain what/why without an abrupt jargon increase | Bilingual introduction and essential teaching fields are required |
| C Visual communication | Diagram fits the actual concept and its interactions explain outcomes | Demonstration IDs resolve; independent visualizer requirements resolve to taught concepts |
| D Code explanation | Groups reflect significant operations and exact highlighted source | Existing anatomy ranges/fingerprints; alternative source/range validation and simulations |
| E Tab consistency | Every assessment/control uses taught or clearly signposted knowledge | Real assessment IDs bind to concepts; independent knowledge-check/visualizer requirements detect absent concepts |
| F Accuracy | Check syntax, behavior, release/environment claims and official SAP sources | Behavioral graders, interpreter probes and fixture tests; these do not compile SAP artifacts |
| G Active language | Complete English teaching and LTR code; Arabic preserved and deferred | Required English fields; English browser journeys and geometry checks |
| H Functionality | Actual interaction, source selection, state, resizing, progress and XP behavior | Production browser regression and direct image inspection |

`SOURCE_REVIEWED_WITH_LIMITATIONS` is an audit status. It does not award XP, replace the mission registry or mean all eight gates have independent certification. A structural pass must never automatically write `EDUCATIONALLY_VERIFIED`. If that status is introduced later, require explicit per-gate evidence and scope before promotion. A project foundation achievement is never completion of later implementation stages.

## Commands and evidence

`npm.cmd run validate:education` checks all implemented activities, structured references, active-language additions, independent tab requirements, alternative anatomy and review drift. It runs before production builds. `npm.cmd run validate:curriculum` includes structural educational coverage alongside existing grading/reference validation. `npm.cmd test` includes mutation tests that deliberately remove teaching, objectives, English or graph edges.

`npm.cmd run report:education` regenerates [coverage](CONCEPT_COVERAGE.md), [topic findings](EDUCATIONAL_AUDIT_TOPICS.md) and [the structured audit](educational-audit.json). It does not refresh source-review fingerprints unless the explicit record flag is supplied. Keep manual verification results in [EDUCATIONAL_AUDIT.md](EDUCATIONAL_AUDIT.md).
