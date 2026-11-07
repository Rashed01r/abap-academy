import { writeFileSync } from "node:fs";
import { visualPresentations } from "../src/lib/visual-presentations";

// All current captions use shared operation templates or existing model/group prose.
// These are useful defaults, not independently reviewed, hand-written per-step captions.
const rows=Object.entries(visualPresentations).map(([id,family])=>`| ${id} | ${family} | Generated/derived; hand-written step review needed |`);
const report=`# Teaching trace caption review\n\nAll ${rows.length} implemented lessons use the shared teaching-trace presentation. Current development language: English only; Arabic resources are preserved and deferred. Active captions are generated from actual execution events, reference groups or current model values. Each rendered caption exposes data-caption-source=generated. No lesson is certified as having independently reviewed, hand-written per-step captions.\n\n| Lesson ID | Visual family | Caption authoring status |\n| --- | --- | --- |\n${rows.join("\n")}\n\nRegenerate with npm run report:trace-captions. Review generated wording with an English-speaking beginner before promoting its authoring status. Reference walkthroughs remain conceptual; they do not extend interpreter support or award progress.\n`;
writeFileSync("docs/academy-development/TRACE_CAPTION_REVIEW.md",report);
console.log(`Flagged ${rows.length} lessons for hand-written step-caption review; no lesson/progress records changed.`);
