# Resume development

Read this file, IMPLEMENTATION_PROGRESS.md, MISSION_REGISTRY.md and the actual repository diff first. Do not rebuild completed missions or trust a previous chat report without evidence.

1. Milestone 1 is VERIFIED: orientation and all nine fundamentals missions are playable, behavior-graded, bilingual and covered by the completed milestone checks. Preserve this work and existing progress. Check the actual repository before making changes.
2. Start Milestone 2 at `data-table-model`. All 102 future missions/projects across eight paths remain PLANNED; their IDs and component statuses are recorded in MISSION_REGISTRY.md. Do not repeat the completed Fundamentals implementation.
3. The next curriculum after verified Fundamentals is Working with Data, mission 1, `data-table-model`: internal tables in more depth. Its stable planning ID is recorded in MISSION_REGISTRY.md; establish prerequisites before registration. Reuse table visualization and add deterministic, tested semantics only for the taught operations.
4. Follow the path-2 sequence in CURRICULUM.md. Implement complete learning cycles, meaningful challenges and natural Arabic. Do not create empty lesson cards and count them as playable.
5. Later milestones add Dictionary Designer, SQL Lab, OOP visualization, guided SAP application workflows, modern ABAP/CDS, Cloud/RAP and six real projects. Verify version-dependent SAP material against official documentation.
6. Update all checkpoint documents at the session boundary, including incomplete work and exact next mission.

Commands: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:e2e`. Browser configuration defaults to `http://localhost:3002`; start the app or use `PLAYWRIGHT_BASE_URL` for the actual running port. Browser tests use the configured installed Chrome executable. Do not claim a successful suite if the server was unavailable.
