import type { Text } from "./curriculum";

/** Reference code is explained, never passed to the restricted ABAP interpreter. */
export type GuidedDefinition = {
  id: string;
  pathId: string;
  prerequisite: string;
  title: Text;
  subtitle: Text;
  brief: Text;
  objectives: Text[];
  minutes: number;
  xp: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  coveredTopics: string[];
  references: string[];
  /** Explicit SAP/environment boundary, in both languages. */
  boundary: Text;
  practice: Text;
  code: string;
  groups: { id: string; start: number; end: number; title: Text; explanation: Text; detail: Text }[];
  artifacts: { id: string; title: Text; description: Text; example: string }[];
  relations: { from: string; to: string; label: Text }[];
  activityTitle: Text;
  activityIntro: Text;
  /** Each decision forms part of a single stable guided assessment. */
  decisions: { id: string; prompt: Text; options: { id: string; text: Text }[]; correct: string; explanation: Text; hints: Text[] }[];
  quiz: Text;
  options: Text[];
  answer: number;
  quizExplanation: Text;
};
