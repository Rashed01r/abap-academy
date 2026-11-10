import type { GuidedDefinition } from "./guided-types";
import type { Text } from "./curriculum";
import type { EducationSpec } from "./education-content";
import type { BeginnerLesson } from "./beginner-lessons";
import type { FlowStep } from "./lesson-flows";
import { modernLessons, type ModernLesson } from "./modern-lessons";

// Everything the app registries need for the Modern ABAP lessons, derived from modern-lessons.ts so each lesson is written once.
const t = (en: string): Text => ({ en });
const trunc = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + "…" : s;

/** A new reference group starts at each line that has a note; lines without one belong to the group above. */
function groupsOf(l: ModernLesson) {
  const groups: { id: string; start: number; end: number; title: Text; explanation: Text; detail: Text }[] = [];
  l.compare.right.lines.forEach((x, i) => {
    if (x.note || !groups.length) groups.push({ id: `${l.key}-g${groups.length + 1}`, start: i + 1, end: i + 1, title: t(trunc(x.t.trim(), 48)), explanation: t(x.note || x.t.trim()), detail: t(x.note || x.t.trim()) });
    else groups[groups.length - 1].end = i + 1;
  });
  return groups;
}
const letter = (k: number) => String.fromCharCode(97 + k);
const decisionId = (l: ModernLesson, i: number) => `${l.key}-d${i + 1}`;

export const guidedModernDefinitions: GuidedDefinition[] = modernLessons.map((l, li) => {
  const groups = groupsOf(l), lines = l.compare.right.lines;
  const artifacts = groups.slice(0, 4).map((g, i) => ({ id: `${l.key}-a${i + 1}`, title: g.title, description: g.explanation, example: lines[g.start - 1].t.trim() }));
  return {
    id: l.id, pathId: "modern", prerequisite: li === 0 ? "modern-syntax" : modernLessons[li - 1].id,
    title: t(l.title), subtitle: t(l.subtitle), brief: t(`${l.what} ${l.why}`), objectives: l.objectives.map(t),
    minutes: l.minutes, xp: l.xp, difficulty: "advanced", coveredTopics: [l.topic], references: l.references,
    boundary: t(l.boundary), practice: t(l.explore.intro), code: lines.map(x => x.t).join("\n"), groups, artifacts,
    relations: artifacts.slice(1).map((a, i) => ({ from: artifacts[i].id, to: a.id, label: t("then") })),
    activityTitle: t(l.challenge.title), activityIntro: t(l.challenge.intro),
    decisions: l.challenge.decisions.map((d, i) => ({
      id: decisionId(l, i), prompt: t(d.q), options: d.o.map((p, k) => ({ id: letter(k), text: t(p.t) })), correct: letter(d.o.findIndex(p => p.ok)),
      explanation: t(d.o.find(p => p.ok)!.why), hints: d.hints.map(t),
    })),
    quiz: t(l.check.q), options: l.check.o.map(t), answer: l.check.a, quizExplanation: t(l.check.e),
  };
});

export const modernEducation: Record<string, EducationSpec> = Object.fromEntries(modernLessons.map(l => {
  const groups = groupsOf(l), n = l.challenge.decisions.length;
  const concept = (i: number) => ({
    id: `${l.key}-c${i + 1}`, name: t(l.ideas[i][0]), explanation: t(l.ideas[i][1]), misconception: t(l.mistakes[i].why), objectives: [i],
    learn: [`group:${groups[Math.floor((i * groups.length) / 3)].id}`], demonstrate: "guided",
    assess: i < 2 ? [decisionId(l, i)] : [...Array.from({ length: n - 2 }, (_, k) => decisionId(l, k + 2)), "knowledge-check"],
  });
  return [l.id, { what: t(l.what), why: t(l.why), concepts: [concept(0), concept(1), concept(2)] }];
}));

export const modernBeginner: Record<string, Pick<BeginnerLesson, "ideas" | "mistakes" | "check" | "challenge">> = Object.fromEntries(modernLessons.map(l => [l.id, {
  ideas: l.ideas, mistakes: l.mistakes,
  check: { question: l.check.q, options: l.check.o, answer: l.check.a, explanation: l.check.e },
  challenge: { title: l.challenge.title, must: [...l.objectives], hints: [...l.challenge.decisions[0].hints] },
}]));

export const modernFlows: Record<string, readonly FlowStep[]> = Object.fromEntries(modernLessons.map(l => [l.id, l.flow as readonly FlowStep[]]));
