export type Progress = {
  labs: string[];
  missions: string[];
  current: string;
  results: Record<string, { attempts: number; passed: boolean }>;
};
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
  const ids = ["orientation", "addition", "structures"];
  const labs = Array.isArray(p.labs)
    ? Array.from(new Set(p.labs.filter((v) => ids.includes(v))))
    : [];
  const completed = Array.isArray(p.missions) ? p.missions : [];
  const missions: string[] = [];
  if (
    labs.includes("orientation") &&
    labs.includes("addition") &&
    completed.includes("addition")
  )
    missions.push("addition");
  if (
    missions.includes("addition") &&
    labs.includes("structures") &&
    completed.includes("structures")
  )
    missions.push("structures");
  const results: Progress["results"] = {};
  for (const id of ["addition", "structures"]) {
    const r = p.results?.[id];
    if (r && typeof r.attempts === "number")
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
    (id === "addition"
      ? p.labs.includes("orientation")
      : id === "structures" && p.missions.includes("addition"))
  );
}
export function earnedXP(p: Progress) {
  return (
    (p.labs.includes("orientation") ? 25 : 0) +
    (p.missions.includes("addition") ? 100 : 0) +
    (p.missions.includes("structures") ? 150 : 0)
  );
}
