# Continue ABAP Academy development

The canonical checkpoint is [docs/academy-development/NEXT_STEPS.md](docs/academy-development/NEXT_STEPS.md). Read it and [IMPLEMENTATION_PROGRESS.md](docs/academy-development/IMPLEMENTATION_PROGRESS.md) before code changes.

The previous Conditions-only checkpoint is superseded by the full-platform request. Missions 04–09 are implemented in `src/lib/fundamentals.ts`; do not recreate them or reset learner data.

Milestone 1 is verified: all ABAP Fundamentals. Resume **Working with Data / `data-table-model`**, internal tables in more depth. The remaining paths are planned, not completed. Their full sequences and tracking IDs are in [CURRICULUM.md](docs/academy-development/CURRICULUM.md) and [MISSION_REGISTRY.md](docs/academy-development/MISSION_REGISTRY.md).

Preserve `abap2-master-progress`, `abap2-language`, `abap2-appearance`, stable mission IDs, completed labs/missions and historical attempts. The storage shape did not change; registry normalization preserves legacy records. If future work changes the shape, implement a versioned migration.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run validate:curriculum
npm.cmd run build
$env:PLAYWRIGHT_BASE_URL='http://localhost:3000'
npm.cmd run test:e2e
```

Reuse localhost:3000, or start `npm.cmd run dev -- --port 3002` and update the test URL. The pre-expansion checkpoint is branch `checkpoint/full-platform-start-2026-10-31` at `8edc75b`. Do not reset it over newer work.
