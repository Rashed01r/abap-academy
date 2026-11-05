import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { missions, paths, orientation } from "../src/lib/curriculum";
import { evaluate, simulate } from "../src/lib/engine";
import { getAnatomy, orientationExamples } from "../src/lib/anatomy-content";
import { validateAnatomy } from "../src/lib/code-anatomy";
import { gradeGuided, validateGuided } from "../src/lib/guided-curriculum";
import { validateEducation } from "../src/lib/education-quality";

const failures: string[] = validateEducation();
const check = (condition: unknown, message: string) => { if (!condition) failures.push(message); };
const seen = new Set(["orientation"]);
const challenges = new Set<string>();
for (const mission of missions) {
  check(!seen.has(mission.id), `Duplicate mission ID: ${mission.id}`);
  check(seen.has(mission.prerequisite), `${mission.id}: prerequisite must exist earlier in the registry`);
  check(paths.some(path => path.id === mission.pathId), `${mission.id}: unknown learning path`);
  seen.add(mission.id);
  check(mission.objectives.length > 0 && (mission.guided || mission.tokens.length > 0), `${mission.id}: missing objectives or Syntax Lab`);
  check(mission.difficulty && mission.environment && mission.assessment, `${mission.id}: missing lesson metadata`);
  check(mission.references?.every(url => /^https:\/\//.test(url)) && mission.references.length, `${mission.id}: missing source references`);
  const bilingual = (value: unknown, location: string) => {
    if (!value || typeof value !== "object") return;
    if ("en" in value || "ar" in value) {
      const text = value as { en?: unknown; ar?: unknown };
      check(typeof text.en === "string" && text.en.trim() && typeof text.ar === "string" && text.ar.trim(), `${location}: missing bilingual content`);
    } else for (const [key, child] of Object.entries(value)) bilingual(child, `${location}.${key}`);
  };
  bilingual(mission, mission.id);
  check(mission.options.length > mission.answer && mission.answer >= 0, `${mission.id}: invalid quiz answer`);
  const tokens = new Set<string>();
  for (const token of mission.tokens) {
    check(!tokens.has(token.id), `${mission.id}: duplicate syntax topic ${token.id}`);
    tokens.add(token.id);
    check(token.correct && token.mistake && token.options[token.answer], `${mission.id}/${token.id}: incomplete syntax exercise`);
  }
  if (mission.guided) {
    failures.push(...validateGuided(mission.guided));
    check(gradeGuided(mission.guided, Object.fromEntries(mission.guided.decisions.map(d => [d.id, d.correct]))).passed, `${mission.id}: reference decisions fail`);
    check(!gradeGuided(mission.guided, {}).passed, `${mission.id}: empty decisions pass`);
  } else try { simulate(mission.example); } catch (error) { failures.push(`${mission.id}: unsupported demonstration (${String(error)})`); }
  try {
    const anatomy=getAnatomy(mission.id,mission.example);
    validateAnatomy(anatomy,mission.example);
    for(const group of anatomy.groups) for(const ref of group.syntaxRefs || []) check(tokens.has(ref), `${mission.id}/${group.id}: missing optional syntax reference ${ref}`);
  } catch(error) { failures.push(String(error)); }
  for (const id of mission.requiredActivities || []) {
    check(!challenges.has(id), `Duplicate activity ID ${id}`);
    check(mission.guided && id === `${mission.id}-assessment` || mission.activity === "table-categories" && id === "data-category-choice" || mission.activity === "table-keys" && id === "data-key-design", `${mission.id}: unknown guided assessment`);
    challenges.add(id);
  }
  for (const challenge of mission.challenges || [mission]) {
    check(!challenges.has(challenge.id), `Duplicate assessment ID ${challenge.id}`);
    challenges.add(challenge.id);
    check(challenge.starter.trim() && challenge.solution.trim(), `${challenge.id}: missing exercise code`);
    try { check(evaluate(challenge.solution, challenge.id).correct, `${challenge.id}: reference solution fails semantic grading`); }
    catch (error) { failures.push(`${challenge.id}: invalid assessment (${String(error)})`); }
  }
}
for(const source of Object.values(orientationExamples)) {
  const anatomy=getAnatomy("orientation",source);
  validateAnatomy(anatomy,source);
  for(const group of anatomy.groups) for(const ref of group.syntaxRefs || []) check(orientation.some(token=>token.id === ref), `orientation/${group.id}: missing syntax reference ${ref}`);
}

// Check local Markdown links in the maintained continuation records, not external URLs.
const docRoot = "docs/academy-development";
if (existsSync(docRoot)) for (const name of readdirSync(docRoot).filter(file => file.endsWith(".md"))) {
  const file = resolve(docRoot, name);
  for (const match of readFileSync(file, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (target && !/^[a-z]+:|^\//i.test(target)) check(existsSync(resolve(dirname(file), target)), `${name}: broken local link ${target}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`Validated ${missions.length} missions and ${challenges.size} assessments: prerequisites, bilingual fields, Syntax Labs, references, examples, solutions, and local documentation links.`);
