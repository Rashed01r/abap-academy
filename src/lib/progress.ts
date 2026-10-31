export type Progress = {
  labs: string[];
  missions: string[];
  current: string;
  results: Record<string, { attempts: number; passed: boolean }>;
};
import { missions as registry } from "./curriculum";
export const initialProgress: Progress = {
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
  const missions: string[] = [];
  for (const mission of registry) {
    const prerequisiteMet = mission.prerequisite === "orientation" ? labs.includes("orientation") : missions.includes(mission.prerequisite);
    if (prerequisiteMet && labs.includes(mission.id) && completed.includes(mission.id)) missions.push(mission.id);
  }
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
    labs,
    missions,
    current: ids.includes(p.current || "") ? p.current! : "orientation",
    results,
  };
}
export function unlocked(id: string, p: Progress) {
  return (
    id === "orientation" ||
    registry.some(m => m.id === id && (m.prerequisite === "orientation" ? p.labs.includes("orientation") : p.missions.includes(m.prerequisite)))
  );
}
export function earnedXP(p: Progress) {
  return (
    (p.labs.includes("orientation") ? 25 : 0) +
    registry.reduce((xp, m) => xp + (p.missions.includes(m.id) ? m.xp : 0), 0)
  );
}
