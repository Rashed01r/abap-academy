import { missions, paths } from "@/lib/curriculum";
import { pathSummaries } from "@/lib/path-summaries";
import { pathLevels } from "@/lib/education-quality";
import { treeCopy } from "@/lib/tree-copy";
import { ui } from "@/lib/i18n";
import type { LocalizedText } from "@/lib/language-policy";
import { tcodeGroups, type TCode } from "./tcodes";

export type RoadmapKind = "root" | "path" | "cat" | "lesson" | "tcode";
export type RoadmapBranch = "learn" | "tcodes";

export const MINT = "94,234,177";
export const AMBER = "245,185,74";

export type RoadmapNode = {
  id: string;
  kind: RoadmapKind;
  depth: 0 | 1 | 2 | 3;
  branch: RoadmapBranch;
  /** "R,G,B" used as --c on the card and its connector. */
  color: string;
  label: LocalizedText;
  sub?: LocalizedText;
  /** Chip text; counts are filled in by the renderer from `count`. */
  chip?: LocalizedText;
  count?: number;
  children: RoadmapNode[];
  parent?: RoadmapNode;
  /** Lesson nodes: the mission id that ConnectedLesson opens. */
  missionId?: string;
  /** Lesson nodes for topics that have no lesson yet. */
  planned?: boolean;
  level?: LocalizedText;
  xp?: number;
  minutes?: number;
  tcode?: TCode;
  /** Lower-case text the search box matches against (English, plus Arabic when enabled). */
  search: LocalizedText;
};

const join = (parts: (LocalizedText | string | undefined)[], lang: "en" | "ar") =>
  parts.map(p => (typeof p === "string" ? p : p?.[lang] || "")).join(" ").toLowerCase();

const searchText = (...parts: (LocalizedText | string | undefined)[]): LocalizedText => ({
  en: join(parts, "en"),
  ar: join(parts, "ar"),
});

function node(init: Omit<RoadmapNode, "children" | "search"> & { search?: LocalizedText }): RoadmapNode {
  return { children: [], search: init.search || searchText(init.label, init.sub), ...init };
}

const orientation = {
  id: "orientation",
  pathId: "fundamentals",
  title: { en: ui.en.orientation, ar: ui.ar.orientation },
  subtitle: { en: treeCopy.en.orientationObjective, ar: treeCopy.ar.orientationObjective },
  objectives: [] as LocalizedText[],
  example: "WRITE DATA TYPE statement syntax period",
  coveredTopics: [] as string[],
  xp: 25,
  minutes: 10,
};

/** Builds the two-path roadmap from the live curriculum registry and the T-code data. */
export function buildRoadmapTree(): { root: RoadmapNode; all: RoadmapNode[]; byId: Map<string, RoadmapNode> } {
  const root = node({ id: "abap", kind: "root", depth: 0, branch: "learn", color: MINT, label: { en: "ABAP" } });

  const learn = node({
    id: "learn", kind: "path", depth: 1, branch: "learn", color: MINT,
    label: { en: "Learning" },
    sub: { en: "Step-by-step lessons from your first report to RAP." },
  });
  const activities = [orientation, ...missions];
  for (const path of paths) {
    const topics = activities.filter(m => m.pathId === path.id);
    const cat = node({
      id: `path:${path.id}`, kind: "cat", depth: 2, branch: "learn", color: MINT,
      label: path.title, sub: pathSummaries[path.id], chip: pathLevels[path.id],
      search: searchText(path.title, pathSummaries[path.id], path.concepts),
    });
    for (const m of topics) {
      cat.children.push(node({
        id: `lesson:${m.id}`, kind: "lesson", depth: 3, branch: "learn", color: MINT,
        label: m.title, sub: m.subtitle, missionId: m.id, level: pathLevels[path.id],
        xp: m.xp, minutes: m.minutes,
        search: searchText(m.title, m.subtitle, m.id, m.example, ...m.objectives),
      }));
    }
    // Topics that are listed for the path but have no lesson yet (same rule as the old tree).
    if (path.id !== "fundamentals") {
      const covered = new Set(topics.flatMap(m => m.coveredTopics || []));
      const en = path.concepts.en.split(" · ");
      const ar = path.concepts.ar?.split(" · ");
      en.forEach((topic, i) => {
        if (covered.has(topic)) return;
        const label: LocalizedText = ar?.[i] ? { en: topic, ar: ar[i] } : { en: topic };
        cat.children.push(node({
          id: `planned:${path.id}:${i}`, kind: "lesson", depth: 3, branch: "learn", color: MINT,
          label, sub: { en: ui.en.comingSoon, ar: ui.ar.comingSoon }, planned: true, level: pathLevels[path.id],
        }));
      });
    }
    cat.count = cat.children.filter(c => !c.planned).length;
    learn.children.push(cat);
  }
  learn.count = learn.children.reduce((n, c) => n + (c.count || 0), 0);

  const tcodes = node({
    id: "tcodes", kind: "path", depth: 1, branch: "tcodes", color: AMBER,
    label: { en: "Transaction Codes" },
    sub: { en: "The T-codes every SAP developer needs, with tips." },
  });
  for (const group of tcodeGroups) {
    const cat = node({
      id: `tgroup:${group.id}`, kind: "cat", depth: 2, branch: "tcodes", color: AMBER,
      label: group.title, sub: group.summary, count: group.codes.length,
    });
    for (const t of group.codes) {
      cat.children.push(node({
        id: t.id, kind: "tcode", depth: 3, branch: "tcodes", color: AMBER,
        label: t.title, sub: t.what, tcode: t,
        search: searchText(t.code, t.title, t.what, t.tip, ...(t.keywords || [])),
      }));
    }
    tcodes.children.push(cat);
  }
  tcodes.count = tcodes.children.reduce((n, c) => n + (c.count || 0), 0);

  root.children = [learn, tcodes];
  const all: RoadmapNode[] = [];
  const byId = new Map<string, RoadmapNode>();
  (function walk(n: RoadmapNode, parent?: RoadmapNode) {
    n.parent = parent;
    all.push(n);
    byId.set(n.id, n);
    n.children.forEach(c => walk(c, n));
  })(root);
  return { root, all, byId };
}

/** Root-to-node chain, root first. */
export function ancestry(n: RoadmapNode): RoadmapNode[] {
  const chain: RoadmapNode[] = [];
  for (let p: RoadmapNode | undefined = n; p; p = p.parent) chain.unshift(p);
  return chain;
}
