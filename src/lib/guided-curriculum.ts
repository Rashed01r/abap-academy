import { hasRequiredTranslations } from "./language-policy";
import type { Mission } from "./curriculum";
import type { GuidedDefinition } from "./guided-types";
import { guidedDataDefinitions } from "./guided-data-definitions";
import { guidedDictionaryDefinitions } from "./guided-dictionary-definitions";
import { guidedDevelopmentDefinitions } from "./guided-development-definitions";
import { guidedApplicationDefinitions } from "./guided-application-definitions";
import { guidedModernDefinitions } from "./modern-content";
import { guidedCloudProjectDefinitions } from "./guided-cloud-project-definitions";
import { guidedCloudDefinitions } from "./guided-cloud-definitions";

export const guidedDefinitions: GuidedDefinition[] = [
  ...guidedDataDefinitions, ...guidedDictionaryDefinitions, ...guidedDevelopmentDefinitions, ...guidedApplicationDefinitions, ...guidedModernDefinitions, ...guidedCloudProjectDefinitions, ...guidedCloudDefinitions,
];

/** One registration pipeline; guided reference code never enters the interpreter. */
export function registerGuided(definition: GuidedDefinition): Mission {
  return {
    ...definition, guided: definition, visualization: "project", environment: "browser",
    assessment: "guided", example: definition.code, tokens: [],
    visual: definition.activityIntro, goal: definition.activityIntro,
    hint: definition.decisions[0].hints[0],
    starter: "", solution: "", expected: "", challenges: [],
    requiredActivities: [`${definition.id}-assessment`],
  };
}
export const guidedMissions = guidedDefinitions.map(registerGuided);

export function gradeGuided(definition: GuidedDefinition, choices: Record<string, string>) {
  const decisions = definition.decisions.map(d => ({id: d.id, correct: choices[d.id] === d.correct}));
  return { passed: decisions.length > 0 && decisions.every(d => d.correct), decisions };
}

/** Validate declarative content before it can be presented as a lesson. */
export function validateGuided(d: GuidedDefinition): string[] {
  const errors: string[] = [];
  const check = (condition: unknown, reason: string) => {if (!condition) errors.push(`${d.id}: ${reason}`);};
  const bilingual = (value: unknown, at: string) => {
    if (!value || typeof value !== "object") return;
    if ("en" in value || "ar" in value) {
      const t = value as {en?: unknown; ar?: unknown};
      check(hasRequiredTranslations(t), `${at} needs enabled-language translations`);
    } else Object.entries(value).forEach(([key, child]) => bilingual(child, `${at}.${key}`));
  };
  bilingual(d, "content");
  check(d.objectives.length >= 2 && d.boundary.en && d.practice.en, "missing objectives/environment/practice");
  check(d.references.length > 0 && d.references.every(url => /^https:\/\//.test(url)), "missing sources");
  const artifacts = new Set(d.artifacts.map(a => a.id));
  check(artifacts.size === d.artifacts.length && artifacts.size >= 3, "artifact IDs must be unique");
  check(d.relations.length > 0 && d.relations.every(r => artifacts.has(r.from) && artifacts.has(r.to) && r.from !== r.to), "invalid artifact relation");
  const decisions = new Set(d.decisions.map(a => a.id));
  check(decisions.size >= 3 && decisions.size === d.decisions.length, "at least three unique scenario decisions required");
  d.decisions.forEach(item => {
    check(item.options.length >= 2 && new Set(item.options.map(o => o.id)).size === item.options.length, `${item.id} needs distinct options`);
    check(item.options.some(o => o.id === item.correct) && item.hints.length >= 2, `${item.id} needs valid answer and progressive hints`);
  });
  check(d.options.length >= 2 && d.options[d.answer], "invalid knowledge check");
  return errors;
}
