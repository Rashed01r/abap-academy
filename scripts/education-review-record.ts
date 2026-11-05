import { missions } from "../src/lib/curriculum";
import { educationContent, educationExampleFragments } from "../src/lib/education-content";
import { educationScenarios } from "../src/lib/education-scenarios";
import { educationSurfaces } from "../src/lib/education-surfaces";
import { sourceFingerprint } from "../src/lib/code-anatomy";
import { orientation } from "../src/lib/curriculum";
import { educationLessonIds } from "../src/lib/education-quality";

/** An authoring drift guard, not a cryptographic certification. */
export function educationReviewFingerprint(id: string) {
  return sourceFingerprint(JSON.stringify({
    content: id === "orientation" ? orientation : missions.find(m => m.id === id),
    education: educationContent[id], alternatives: educationScenarios[id] || [], surfaces: educationSurfaces[id], illustrations: educationContent[id]?.concepts.flatMap(c => c.learn).filter(ref => ref.startsWith("illustration:")).map(ref => educationExampleFragments[ref.split(":")[1]]),
  }));
}

export function educationReviewErrors(record: {lessons?: Record<string, {fingerprint?: string; status?: string}>}): string[] {
  return educationLessonIds.flatMap(id => {
    const review = record.lessons?.[id];
    if (!review || review.fingerprint !== educationReviewFingerprint(id) || review.status !== "SOURCE_REVIEWED_WITH_LIMITATIONS") {
      return [`${id}: source changed or review missing; inspect gates A–H and update the scoped review record explicitly.`];
    }
    return [];
  });
}
