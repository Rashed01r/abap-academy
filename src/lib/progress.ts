export type Progress = {
  labs: string[];
  version?: 2;
  viewed?: string[];
  started?: string[];
  passedChallenges?: string[];
  recent?: string[];
  missions: string[];
  current: string;
  results: Record<string, { attempts: number; passed: boolean }>;
};
import { missions as registry, type Mission } from "./curriculum";
const assessmentIds = (m: Mission) => [...(m.challenges || [m]).map(c => c.id), ...(m.requiredActivities || [])];
export const initialProgress: Progress = {
  version: 2, viewed: [], started: [], passedChallenges: [], recent: [],
  labs: [],
  missions: [],
  current: "orientation",
  results: {},
};
export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== "object")
    return structuredClone(initialProgress);
  const p = value as Partial<Progress>;
  const ids = ["orientation", ...registry.map(m => m.id)];
  const labs = Array.isArray(p.labs)
    ? Array.from(new Set(p.labs.filter((v) => ids.includes(v))))
    : [];
  const completed = Array.isArray(p.missions) ? p.missions : [];
  // Legacy completions are achievements, independent of navigation sequence or lab attendance.
  const missions = registry.filter(m => completed.includes(m.id)).map(m => m.id);
  const known = (value: unknown, allowed = ids): string[] => Array.isArray(value)
    ? Array.from(new Set(value.filter((id): id is string => typeof id === "string" && allowed.includes(id)))) : [];
  const completedChallenges = registry.filter(m => missions.includes(m.id)).flatMap(assessmentIds);
  const challengeIds = registry.flatMap(assessmentIds);
  const results: Progress["results"] = {};
  for (const id of registry.map(m => m.id)) {
    const r = p.results?.[id];
    if (r && typeof r.attempts === "number" && Number.isFinite(r.attempts))
      results[id] = {
        attempts: Math.max(0, Math.floor(r.attempts)),
        passed: r.passed === true,
      };
  }
  return {
    version: 2,
    viewed: known([...known(p.viewed), ...labs, ...missions]),
    started: known([...known(p.started), ...labs, ...missions, ...Object.keys(results)]),
    passedChallenges: known([...known(p.passedChallenges, challengeIds), ...completedChallenges], challengeIds),
    recent: known(p.recent).slice(0, 6),
    labs,
    missions,
    current: ids.includes(p.current || "") ? p.current! : "orientation",
    results,
  };
}
export function unlocked(id: string, _progress?: Progress) {
  void _progress; // Retain the previous call signature for existing consumers.
  return id === "orientation" || registry.some(m => m.id === id);
}
export function visitMission(p: Progress, id: string): Progress {
  if (!unlocked(id)) return p;
  return { ...p, version: 2, current: id, viewed: Array.from(new Set([...(p.viewed || []), id])), recent: [id, ...(p.recent || []).filter(v => v !== id)].slice(0, 6) };
}
export function startMission(p: Progress, id: string): Progress {
  if (!unlocked(id) || p.started?.includes(id)) return p;
  return { ...p, started: [...(p.started || []), id] };
}
export function allChallengesPassed(p: Progress, id: string) {
  const mission = registry.find(m => m.id === id);
  return !!mission && assessmentIds(mission).every(id => p.passedChallenges?.includes(id));
}
export function completeMission(p: Progress, id: string, knowledgeChecked: boolean): Progress {
  if (!knowledgeChecked || !allChallengesPassed(p, id)) return p;
  return { ...p, missions: Array.from(new Set([...p.missions, id])) };
}
export function earnedXP(p: Progress) {
  return (
    (p.labs.includes("orientation") ? 25 : 0) +
    registry.reduce((xp, m) => xp + (p.missions.includes(m.id) ? m.xp : 0), 0)
  );
}
