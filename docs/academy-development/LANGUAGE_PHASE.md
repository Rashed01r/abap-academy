# Current development language: English only

Effective 2026-11-07, `ENABLE_ARABIC` in `src/lib/language-policy.ts` is false. Arabic is temporarily deferred, not removed. This policy supersedes earlier bilingual authoring and verification requirements, including historical continuation checkpoints and gate G.

- Develop complete, accurate English lessons: simple explanations, Visual Code Anatomy, interactive diagrams/flowcharts, actual simulations, practical challenges and helpful feedback.
- Do not require Arabic translations to register or release a lesson. Do not generate Arabic, review Arabic wording, or run Arabic-specific UI/geometry checks during this phase.
- Preserve existing Arabic translations, glossary resources, bilingual records and dormant RTL behavior. Never delete translations to satisfy validation. Do not duplicate English into Arabic fields to simulate translation coverage.
- Use the shared required-language validator. English is always required. Arabic is optional while disabled and required when enabled. Keep all non-language educational, behavioral, anatomy and source-review gates.
- Resolve active language centrally before rendering. Ignore obsolete Arabic preferences and normalize only `abap2-language` to English. Never clear learner progress, achievements, drafts or appearance preferences. Code entered by learners, including Arabic comments or literal output, must remain unchanged.
- The active English browser matrix covers desktop/mobile, both appearance preferences, direct routes, all lesson modes, diagrams, recommendations, diagnostics and accessibility labels. Test an existing Arabic preference as a migration input; it must not enable Arabic presentation.
- Reintroduction is a separate release task: complete missing translations, review retained language quality, then run dedicated Arabic/RTL tests before shipping. Flipping the flag alone is not localization certification.

The implementation batch covers the language switch and `data-conditional-loop`. Next curriculum mission: **data-table-expressions**, followed by **data-table-performance**, then **data-employee-manager**. Preserve stable IDs and the independently earned Employee Management foundation achievement; the complete capstone remains IN_PROGRESS. Do not resume PDF migration or add accounts/paywalls.

Exact verification and outstanding work belong in [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md); continuation instructions are in [NEXT_STEPS.md](NEXT_STEPS.md).
