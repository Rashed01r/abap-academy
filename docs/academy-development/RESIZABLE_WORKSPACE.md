# Smart resizable learning workspace — 2026-11-04

## Scope and safety

This user-requested interface enhancement takes precedence over the next curriculum mission for this session. The existing KnowledgeTree and its one connected lesson are reused. No mission, educational source, assessment, stable ID, XP rule or progress version was changed. The next curriculum task remains `data-read-table`.

Before changes, the panel had a 680–1280 width slider, a CSS horizontal resize grip, fixed two-column learning content and an independently scrolling article. It had no controlled height resizing, persisted geometry or minimization. Graph zoom also scaled editable lesson content. Monaco already had `automaticLayout: true`, but used a fixed 410px height and reapplied highlight/scroll effects on every render.

Safety checkpoint: `checkpoint/before-resizable-workspace-2026-11-04` at `6ba693a`. An isolated Git index captured prior tracked and untracked source without modifying the ordinary index or overwriting existing work. Read the installed Next.js CSS and Server/Client Component guides before changes.

## Implementation

- Added `src/lib/use-resizable-panel.ts`: typed width/height geometry, viewport-derived bounds, Pointer Events/capture, animation-frame updates, pointer cancel/lost-capture rollback, Escape cancellation, arrow-key steps (10px; Shift 50px), selection suppression and cleanup. Pointer release commits preferences; drag frames do not write storage.
- Added `src/components/resizable-lesson-panel.tsx`: the existing lesson node now has right/bottom/corner handles (left/bottom/left-corner in RTL), a subtle grip, current-size information and compact localized icon controls for expand/restore, reset and collapse/reopen. Content stays mounted while collapsed or focused, preserving Monaco and lesson state. Only the content body scrolls; chrome and handles stay anchored.
- KnowledgeTree still positions nodes and measures all connector endpoints through ResizeObserver/rAF. Counter-zoom keeps lesson text and editors at readable size while graph nodes zoom. Margin alignment accounts for that scale. The canvas reserves its current extent before resizing so a shrinking panel does not clamp graph scroll and jump the tree. Reset View clears the reserved extent. Deliberate reframing after resize keeps the lesson reachable.
- Scoped CSS uses semantic light/dark tokens, hover/focus affordances, larger touch targets and reduced-motion support. Panel container queries stack anatomy and code/memory below 740px. Wider panels use side-by-side content. Monaco height responds to the panel height with a 300px floor; focused workspaces provide more usable editor room. Monaco automatic layout remains enabled, and highlighting effects now run only when their actual source/trace/locale inputs change.
- Desktop minimum is 440px wide / 320px high where space permits. Maximum width is viewport minus 48px, capped at 2200px; maximum height is viewport minus 48px. Small workspaces clamp those minima. Mobile still opens a focused lesson, hides direct drag handles and retains Back to Tree plus all three tabs. Tablet touch resizing uses the same pointer system.

## Persistence and preservation

The independent key `abap2-panel-layout:v1` contains `{version:1,width,height,collapsed}`. Values must be finite numbers within validation limits; invalid records are ignored. Rendered dimensions clamp to the current workspace, so a saved desktop size does not overflow mobile. Last custom dimensions survive maximize/restore and reload; Reset Size deliberately commits a comfortable default. Focus itself is not persisted: mobile chooses its readable focused presentation automatically. Storage errors leave the in-memory workspace usable and expose localized feedback.

The existing progress/settings/draft keys are unchanged. Learn, Visualize and Challenge remain the actual existing lesson components. All 14 playable activities, 24 mission assessments and 2,995 available XP remain. No lesson/editor is recreated for size, focus or collapse changes. Topic navigation continues to use the existing source drafts and transient topic-session caches; full transient execution sessions still do not survive page reload.

## Verification

Build, lint and standalone typecheck passed. Unit suite: **62/62 passed**. Curriculum validation: **13 missions / 24 assessments passed**. Resize-specific acceptance: **8/8 passed** before the final strengthened full regression. The retained 24 connected-tree cases also passed on the resizable implementation.

`tests/resizable-panel.spec.ts` verifies actual mouse right/bottom/corner dragging, cursor affordances, graph-scroll stability, connector geometry, keyboard resizing, minimum-size stacking, reset and persisted custom/collapsed layout. It checks Monaco DOM identity, a long source draft, cursor/selection/scroll, undo, feedback and runtime statement retention through resize/maximize/restore/collapse. Additional checks cover a larger editor in focus, RTL direction, resizing under graph zoom, readable lesson scale, smaller viewport clamping, reduced motion, invalid storage, desktop preferences on mobile and real Chromium touch resize/cancel. It also exercises lost pointer capture. Existing tests were retained; the former slider assertion now checks the equivalent keyboard resize handle.

Full final production regression: **118/118 passed in 3.0 minutes**, with no skips or failures. Command: `PLAYWRIGHT_BASE_URL=http://localhost:3016 npm.cmd run test:e2e -- --workers=2`. This includes all 110 retained cases plus eight new resize cases across desktop/mobile. The final strengthened cases additionally passed lost pointer capture, a larger editor when maximized, desktop geometry clamped on mobile, touch cancellation, resizing at graph zoom and collapse-state restoration after reload. The server stayed on the same production build throughout this full run.

Direct visual review inspected English/light desktop Learn, Arabic/dark connected lessons, the tablet touch grip/focus indicator, actual Monaco/execution layout after resize, and Arabic/dark focused mobile content. Chrome/handles stay outside the one lesson-body scrollbar, the selected topic remains connected and the integrated application header stays outside graph movement. Scoped semantic/keyboard review passed; this is not a complete WCAG certification. Screenshots are in ignored `test-results/resizable-panel-*/` and `test-results/tree-en-mobile.png`.

Initial acceptance caught real scroll clamping when a panel shrank; reserving canvas extent corrected it. The remaining initial position assertion sampled before the helper deliberately scrolled a handle into view; it now samples at the actual drag start and still asserts no canvas movement during the gesture. An early accessibility lint warning about aria-valuetext on a button was corrected by describing each handle with the current-size output instead. No educational grading assertion was weakened. Final lint/typecheck/build and diff checks passed; final continuation-link validation passed.

## Inspect and continue

Preview: http://localhost:3016/?mission=orientation. Open ABAP Fundamentals → Syntax Orientation from `/` or use the direct link. Drag the right border, bottom border or dotted bottom-right corner. Arabic mirrors the outward edge/corner. Tab to a handle and use arrows/Shift+arrows; Escape cancels an active drag. Use the panel header icons to expand, restore custom size, reset or collapse; the compact collapsed node reopens immediately. On mobile use the focused lesson and Back to Tree.

No curriculum work was added or marked verified. Advanced SAP paths remain planned previews. Continue `data-read-table` only after reading the canonical continuation notes and actual repository state.

No known blocking issue remains. Preferences are browser-local; focus is chosen for mobile rather than persisted as a desktop preference. Repeated shrink operations can leave intentional empty canvas space to stabilize the graph; Reset View clears that reservation. Full transient learning sessions remain in memory across topic return, while source drafts and layout preferences persist across reload. No general docking system or Fit Content action was added.
