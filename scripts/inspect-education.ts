import { writeFileSync, mkdirSync } from "node:fs";
import { missions, orientation } from "../src/lib/curriculum";
import { getAnatomy, orientationExamples } from "../src/lib/anatomy-content";

const records = missions.map(m => ({
  id: m.id, path: m.pathId, title: m.title, subtitle: m.subtitle, brief: m.brief,
  objectives: m.objectives, visual: m.visual, goal: m.goal, example: m.example,
  quiz: m.quiz, quizExplanation: m.quizExplanation, prerequisite: m.prerequisite,
  tokens: m.tokens.map(t => ({ id: t.id, label: t.label, meaning: t.meaning, why: t.why })),
  groups: getAnatomy(m.id, m.example).groups.map(g => ({ id: g.id, title: g.title, explanation: g.explanation })),
  challenges: m.challenges?.map(c => ({ id: c.id, title: c.title, goal: c.goal })),
  requiredActivities: m.requiredActivities,
  artifacts: m.guided?.artifacts, decisions: m.guided?.decisions,
}));
mkdirSync("build", {recursive: true});
writeFileSync("build/education-inventory.json", JSON.stringify({ orientation, orientationAnatomy: getAnatomy("orientation", orientationExamples.en), records }, null, 2));
console.log(records.map(m => `${m.id}: ${m.title.en}\nObjectives: ${m.objectives.map(o => o.en).join(" | ")}\nGroups: ${m.groups.map(g => `${g.id}=${g.title.en}`).join(" | ")}\nAssess: ${m.challenges?.map(c => `${c.id}=${c.goal.en}`).join(" | ") || m.decisions?.map(d => `${d.id}=${d.prompt.en}`).join(" | ") || m.goal.en}`).join("\n\n"));
