import { hasRequiredTranslations } from "./language-policy";
import { missions, orientation, type Text } from "./curriculum";
import { getAnatomy, orientationExamples } from "./anatomy-content";
import { educationContent, educationExampleFragments, type EducationSpec } from "./education-content";
import { educationScenarios } from "./education-scenarios";
import { educationSurfaces } from "./education-surfaces";
import { visualPresentations } from "./visual-presentations";

export const educationLessonIds = ["orientation", ...missions.map(m => m.id)];
export function conceptRecords(lessonId: string, spec = educationContent[lessonId]) {
  const mission = missions.find(m => m.id === lessonId);
  return spec.concepts.map(concept => ({
    ...concept, id: `${lessonId}/${concept.id}`, lessonId,
    difficulty: mission?.difficulty || "beginner", priority: "essential" as const,
    priorKnowledge: mission?.prerequisite ? [mission.prerequisite] : [],
    learningObjectives: concept.objectives.map(index => mission?.objectives[index] || {
      en: "Read, edit and trace a small ABAP program.", ar: "قراءة برنامج ABAP صغير وتعديله وتتبع تنفيذه.",
    }),
  }));
}

/** Structural evidence, never an automatic claim of instructional correctness. */
export function validateEducation(content: Record<string, EducationSpec> = educationContent): string[] {
  const errors: string[] = [];
  const check = (ok: unknown, message: string) => { if (!ok) errors.push(message); };
  const bilingual = hasRequiredTranslations;
  for (const id of Object.keys(content)) check(educationLessonIds.includes(id), `${id}: unknown lesson`);
  for (const id of educationLessonIds) {
    check(!!visualPresentations[id], `${id}: missing primary visual presentation`);
    const spec = content[id];
    if (!spec) { errors.push(`${id}: missing educational coverage`); continue; }
    const m = missions.find(m => m.id === id);
    const anatomy = getAnatomy(id, m?.example || orientationExamples.en);
    const locations = new Set([
      ...Object.keys(educationExampleFragments).map(id => `illustration:${id}`),
      ...anatomy.groups.map(g => `group:${g.id}`),
      ...(m?.tokens || orientation).map(t => `token:${t.id}`),
      ...(m?.guided?.artifacts || []).map(a => `artifact:${a.id}`),
    ]);
    const demonstrations = new Set([
      ...(m?.guided ? ["guided"] : ["trace"]),
      ...(id === "conditions" ? ["decision-flow"] : []),
      ...(id === "loop-control" ? ["loop-flow"] : []),
      ...(id === "oop-introduction" ? ["object-storage"] : []),
      ...(id === "applications-reports" ? ["report-flow"] : []),
      ...(m?.activity ? [m.activity] : []),
      ...(educationScenarios[id] || []).map(s => `scenario:${s.id}`),
    ]);
    const assessments = new Set([
      "concept-check", "knowledge-check",
      ...(m ? (m.challenges || [m]).map(ch => ch.id) : ["orientation-code", "orientation-quiz"]),
      ...(m?.requiredActivities || []), ...(m?.guided?.decisions || []).map(d => d.id),
    ]);
    const required = m?.guided ? m.guided.decisions.map(d => d.id) : m ? [...(m.challenges || [m]).map(ch => ch.id), ...(m.requiredActivities || [])] : ["orientation-code", "orientation-quiz"];
    check(bilingual(spec.what) && bilingual(spec.why), `${id}: missing required-language introduction`);
    check(spec.concepts.length > 0, `${id}: no essential concepts`);
    const ids = new Set<string>(), objectives = new Set<number>(), assessed = new Set<string>();
    for (const concept of spec.concepts) {
      const at = `${id}/${concept.id}`;
      check(!!concept.id && !ids.has(concept.id), `${at}: missing or duplicate concept ID`); ids.add(concept.id);
      check(bilingual(concept.name) && bilingual(concept.explanation) && bilingual(concept.misconception), `${at}: missing required-language concept teaching or feedback`);
      check(concept.objectives.length > 0, `${at}: no learning objective`);
      for (const index of concept.objectives) {
        check(Number.isInteger(index) && index >= 0 && index < (m?.objectives.length || 1), `${at}: unknown objective ${index}`);
        objectives.add(index);
      }
      check(concept.learn.length > 0, `${at}: absent from Learn/example`);
      for (const ref of concept.learn) check(locations.has(ref), `${at}: unknown teaching/example location ${ref}`);
      check(demonstrations.has(concept.demonstrate), `${at}: absent or unknown demonstration ${concept.demonstrate}`);
      check(concept.assess.length > 0, `${at}: unassessed learning objective`);
      for (const ref of concept.assess) {check(assessments.has(ref), `${at}: unknown assessment ${ref}`); assessed.add(ref);}
    }
    const surfaces = educationSurfaces[id];
    check(!!surfaces?.visualize.length && !!surfaces?.knowledge.length, `${id}: missing tab requirements`);
    for (const [surface, requirements] of Object.entries(surfaces || {})) for (const required of requirements) {
      check(ids.has(required), `${id}: ${surface} requires unexplained concept ${required}`);
    }
    for (let i = 0; i < (m?.objectives.length || 1); i++) check(objectives.has(i), `${id}: objective ${i} has no concept`);
    for (const ref of required) check(assessed.has(ref), `${id}: assessment ${ref} has no taught concept binding`);
  }
  return errors;
}

export const pathLevels: Record<string, Text> = Object.fromEntries([
  ...["fundamentals", "data", "dictionary"].map(id => [id, {en: "Beginner", ar: "مبتدئ"}]),
  ...["database", "oop", "applications"].map(id => [id, {en: "Intermediate", ar: "متوسط"}]),
  ...["modern", "cloud"].map(id => [id, {en: "Advanced", ar: "متقدم"}]),
]);

/** Prefer unfinished follow-ons; never changes access or learner records. */
export function recommendedLesson(id: string, completed: string[], labs: string[]) {
  const done = new Set([...completed, ...(labs.includes("orientation") ? ["orientation"] : [])]);
  const direct = missions.find(m => m.prerequisite === id && !done.has(m.id));
  if (direct) return direct;
  const current = missions.find(m => m.id === id);
  return missions.find(m => m.pathId === (current?.pathId || "fundamentals") && m.id !== id && !done.has(m.id));
}
