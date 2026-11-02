import { sourceRange, type Range, type ExecutionEvent } from "./engine";
import type { Text } from "./curriculum";

export type AnatomyGroup = {
  id: string;
  title: Text;
  explanation: Text;
  range: Range;
  detail?: Text;
  glossaryRefs?: string[];
  syntaxRefs?: string[];
  visualizer?: { kind: "type" | "snapshot"; line: number };
  fields?: { name: string; explanation: Text; line: number }[];
  practice?: Text;
};
export type CodeAnatomy = { id: string; source: string; fingerprint: string; groups: AnatomyGroup[]; checks: string[] };
export type AnatomyGroupSpec = Omit<AnatomyGroup,"range"> & { lines: [number,number] };

// A content-review guard, not a security hash. Source edits require reviewing ranges and prose.
export function sourceFingerprint(source: string) {
  let hash = 2166136261;
  for (let i=0;i<source.length;i++) hash = Math.imul(hash ^ source.charCodeAt(i),16777619);
  return (hash >>> 0).toString(16).padStart(8,"0");
}
export function lineRange(source: string, first: number, last: number): Range {
  const lines = source.split("\n");
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > lines.length) throw new Error("Invalid anatomy source lines");
  const start = lines.slice(0,first-1).reduce((n,l)=>n+l.length+1,0);
  const end = lines.slice(0,last-1).reduce((n,l)=>n+l.length+1,0)+lines[last-1].length;
  return sourceRange(source,start,end);
}
export function defineAnatomy(id: string, source: string, fingerprint: string, specs: AnatomyGroupSpec[], checks: string[]): CodeAnatomy {
  const doc = { id, source, fingerprint, groups: specs.map(({lines,...spec})=>({...spec,range:lineRange(source,...lines)})), checks };
  validateAnatomy(doc,source);
  return doc;
}
export function validateAnatomy(doc: CodeAnatomy, displayedSource: string) {
  if (displayedSource !== doc.source || sourceFingerprint(displayedSource) !== doc.fingerprint) throw new Error(`${doc.id}: anatomy source changed; review groups and explanations`);
  const ids = new Set<string>(), covered = new Set<number>();
  let previousEnd = 0;
  const bilingual = (value: Text | undefined) => !!value?.en.trim() && !!value?.ar.trim();
  for (const group of doc.groups) {
    const r = group.range;
    if (!group.id || ids.has(group.id) || r.startLine <= previousEnd) throw new Error(`${doc.id}: duplicate, overlapping or unordered anatomy group`);
    ids.add(group.id);
    if (!bilingual(group.title) || !bilingual(group.explanation) || group.detail && !bilingual(group.detail) || group.practice && !bilingual(group.practice)) throw new Error(`${doc.id}/${group.id}: missing bilingual anatomy content`);
    if (JSON.stringify(r) !== JSON.stringify(lineRange(doc.source,r.startLine,r.endLine))) throw new Error(`${doc.id}/${group.id}: invalid source range`);
    for(let line=r.startLine;line<=r.endLine;line++) covered.add(line);
    for(const field of group.fields || []) if(field.line<r.startLine || field.line>r.endLine || !bilingual(field.explanation)) throw new Error(`${doc.id}: invalid anatomy field`);
    if(group.visualizer && (group.visualizer.line<1 || group.visualizer.line>doc.source.split("\n").length)) throw new Error(`${doc.id}: invalid visualizer line`);
    previousEnd = r.endLine;
  }
  if (!doc.groups.length || doc.source.split("\n").some((line,i)=>line.trim() && !covered.has(i+1))) throw new Error(`${doc.id}: uncovered anatomy source`);
  if (!doc.checks.length || new Set(doc.checks).size !== doc.checks.length || doc.checks.some(id=>!ids.has(id) || !doc.groups.find(g=>g.id===id)?.practice)) throw new Error(`${doc.id}: invalid matching exercise`);
}
export function groupAtLine(doc: CodeAnatomy, line: number) {
  return doc.groups.find(g=>line>=g.range.startLine && line<=g.range.endLine);
}
export function eventsForGroup(group: AnatomyGroup, events: ExecutionEvent[]) {
  return events.filter(event=>event.range.startLine>=group.range.startLine && event.range.endLine<=group.range.endLine);
}
