# Shared live teaching trace

> **Current development language: English only (2026-11-07).** Arabic support is temporarily deferred, not removed. Preserve all existing Arabic resources and RTL support; do not create or review Arabic translations or run Arabic-specific UI checks while `ENABLE_ARABIC` is false. New playable content requires complete English teaching only. This policy supersedes bilingual authoring/review requirements in the historical sections below. See [the language-phase policy](LANGUAGE_PHASE.md).


The 2026-11-07 presentation update covers all 24 implemented lessons and all nine visual families in `visual-presentations.ts`. No interpreter, lesson registry, assessment, routing, XP or progress schema changes are involved.

## Presentation contract

`src/lib/teaching-trace.ts` defines `TeachingStep`: stable presentation ID, title, one caption sentence, optional immutable state/output, source line range, source fragment and caption provenance. `executionSteps` adapts the existing interpreter events without changing or dropping events. Operation captions use real values and loop context; nested block endings include their source line so consecutive endings have different captions. Long traces retain their events and offer Skip to end.

`src/components/teaching-trace.tsx` owns the reusable presentation:

- `TraceControls`: normal-flow controls, bounded Previous/Next, explicit Play/Pause, Restart, Skip to end for traces longer than 15 steps; Next alone is filled in this row.
- `StepCaption`: step count, title and caption; `TechnicalText` isolates identifiers and comparisons within Arabic prose.
- `CodeView`: numbered LTR code, current range and previously visited lines; a short context window has gap markers instead of an inner scrollbar.
- `StateChips`: recursive snapshot comparison, scalar chips, nested fields and tables; changed cells/values and removed objects are identified without relying on mutable event hints. Tables show at most six rows, prioritizing changes and explicitly indicating excerpts.
- `TeachingTrace`: composition, keyboard shortcuts, bounded playback and comparison/output layout. It uses existing callbacks and transient session state, never learner progress.

Reference model adapters provide their existing groups, artifacts, source fragments and current model values. Architecture steps inspect definitions, not execution. Category and row-access steps use the existing pure model functions. SQL steps explain source/filter/projection using the existing fixture query; expression steps use the existing found/missing model. Object and report diagrams keep their original storage/scenario controls and conceptual boundaries. The optional `traceDoc` prop adds source context to the existing object/report components; no existing prop was removed or renamed.

`EducationalFlowchart` retains its public props. It renders one current node and at most one incoming active edge, with different dim/bright markers. Node labels wrap at readable sizes. Narrow diagrams reflow vertically; RTL mirrors the diagram. Return/long paths use outside lanes with rounded corners, and labels have panel-colored backgrounds. Architecture links are measured against actual node rectangles and long links enter from an outside lane.

`src/app/teaching-trace.css` provides the dark-green presentation. It keeps controls in flow and makes lesson tabs and suggested-next content static so neither covers a trace. Only the existing lesson body scrolls vertically; code/table content wraps. Reduced-motion mode disables transitions and animations. Playback still advances snapshots only after an explicit request and stops on end, unmount or document hiding.

## Keyboard and review boundaries

Focus a trace and use Left/Right for Previous/Next (mirrored in RTL), Space for Play/Pause. Inputs and editors keep their own keys; Space on a button retains native button activation. SVG nodes retain Enter/Space selection.

All current captions are generated from operation templates, actual model inputs or existing reference prose. They are functional defaults, not independently reviewed per-step teaching. Run `npm.cmd run report:trace-captions` to regenerate [the lesson-by-lesson review ledger](TRACE_CAPTION_REVIEW.md). The live DOM also marks caption provenance. Independent English beginner review remains needed. Arabic wording review is deferred while the feature is disabled.

Existing editor/simulator controls and other exploratory comparisons retain their behavior. No new SAP execution support is claimed. Captures and temporary review helpers are ignored under `build/teaching-trace`; inspect the images, not merely the capture logs. Exact build, unit, browser and geometry results belong in [implementation progress](IMPLEMENTATION_PROGRESS.md).
