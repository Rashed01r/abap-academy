import { sqlChallengeSpecs } from "./sql-missions";
export type Locale = "en" | "ar";
export type Range = {
  start: number;
  end: number;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};
export type Primitive = number | string;
export type StructureValue = Record<string, Primitive>;
export type TableValue = (Primitive | StructureValue)[];
export type MemoryValue = Primitive | StructureValue | TableValue;
export type Memory = Record<string, MemoryValue>;
export const RUNTIME_LIMITS = { iterations: 100, steps: 1000, trace: 1000, rows: 100, nesting: 12, memoryBytes: 65536, traceBytes: 4_000_000 } as const;
export type ErrorCode =
  | "period"
  | "unknown"
  | "declaration"
  | "assignment"
  | "unsupported"
  | "component"
  | "access"
  | "type"
  | "block"
  | "range"
  | "string"
  | "unassigned"
  | "notfound"
  | "limit";
export class SimulationError extends Error {
  constructor(
    public code: ErrorCode,
    public range: Range,
    public detail = "",
  ) {
    super(code);
    this.name = "SimulationError";
  }
}
export type Token = {
  text: string;
  kind: "word" | "number" | "string" | "symbol";
  start: number;
  end: number;
};
/** Table expression subset: itab[ index ] or itab[ comp = value ... ], optional -component chaining,
 * and VALUE #( itab[ ... ] OPTIONAL | DEFAULT value ). Reads never change sy-subrc or sy-tabix. */
export type TableExpr = { kind: "tableExpr"; table: string; index?: Expr; keys?: { field: string; value: Expr }[]; component?: string; fallback?: "optional" | { default: Expr } };
/** ABAP SQL subset (modern syntax): SELECT [SINGLE] FROM … [INNER|LEFT OUTER JOIN … ON …] FIELDS … [WHERE …]
 * [GROUP BY …] [ORDER BY …] INTO [TABLE] @target, plus single-row INSERT/UPDATE/MODIFY/DELETE and
 * UPDATE … SET / DELETE FROM … WHERE on a small in-memory demo database that is reset on every run. */
export type SqlCol = { alias?: string; field: string };
export type SqlOperand = { kind: "col"; col: SqlCol } | { kind: "host"; name: string } | { kind: "lit"; value: Primitive };
export type SqlCond =
  | { kind: "and"; left: SqlCond; right: SqlCond }
  | { kind: "or"; left: SqlCond; right: SqlCond }
  | { kind: "cmp"; col: SqlCol; op: string; right: SqlOperand }
  | { kind: "between"; col: SqlCol; low: SqlOperand; high: SqlOperand }
  | { kind: "like"; col: SqlCol; pattern: SqlOperand };
export type SqlField = { kind: "col"; col: SqlCol; alias?: string } | { kind: "agg"; fn: "count" | "sum" | "min" | "max"; col?: SqlCol; alias: string };
export type SqlSource = { table: string; alias: string };
export type Database = Record<string, StructureValue[]>;
type DbChange<K extends string> = { kind: K; table: string; from?: string; set?: { field: string; value: SqlOperand[] }[]; where?: SqlCond; range: Range };
/** Demo database tables: Dictionary-style field types and primary keys (client handling is implicit in SAP). */
export const sqlCatalog: Record<string, { fields: Record<string, "i" | "string">; key: string[] }> = {
  zaca_employee: { fields: { employee_id: "i", employee_name: "string", department: "string", salary: "i" }, key: ["employee_id"] },
  zaca_department: { fields: { department: "string", department_name: "string" }, key: ["department"] },
};
export const demoDatabase: Database = {
  zaca_employee: [
    { employee_id: 101, employee_name: "Ahmed", department: "IT", salary: 8000 },
    { employee_id: 102, employee_name: "Sara", department: "HR", salary: 7200 },
    { employee_id: 103, employee_name: "Omar", department: "IT", salary: 9500 },
    { employee_id: 104, employee_name: "Huda", department: "SALES", salary: 6800 },
  ],
  zaca_department: [
    { department: "IT", department_name: "Technology" },
    { department: "HR", department_name: "Human resources" },
    { department: "SALES", department_name: "Sales" },
    { department: "LEGAL", department_name: "Legal" },
  ],
};
const isDbTable = (name: string | undefined) => !!name && Object.prototype.hasOwnProperty.call(sqlCatalog, name);
export type Expr =
  | { kind: "literal"; value: Primitive }
  | { kind: "ref"; name: string }
  | { kind: "add"; left: Expr; right: Expr }
  | TableExpr
  | { kind: "lineIndex"; target: TableExpr }
  | { kind: "lineExists"; target: TableExpr };
export type Node =
  | { kind: "do"; count: Expr; body: Node[]; range: Range; endRange: Range }
  | { kind: "while"; left: Expr; op: string; right: Expr; body: Node[]; range: Range; endRange: Range }
  | { kind: "loop"; table: string; into: string; inline: boolean; where?: { field: string; op: string; value: Expr }; body: Node[]; range: Range; endRange: Range }
  | { kind: "append"; value: Expr; table: string; range: Range }
  | { kind: "read"; table: string; into: string; index?: Expr; keys?: { field: string; value: Expr }[]; binary?: boolean; range: Range }
  | { kind: "insert"; table: string; value: Expr; index: Expr; range: Range }
  | { kind: "modify"; table: string; value: Expr; index: Expr; range: Range }
  | { kind: "delete"; table: string; index: Expr; range: Range }
  | { kind: "sort"; table: string; fields: { field: string; direction: "ascending" | "descending" }[]; range: Range }
  | { kind: "control"; action: "exit" | "continue"; range: Range }
  | { kind: "try"; body: Node[]; handler: Node[]; range: Range; catchRange: Range; endRange: Range; bodyRange?: Range; handlerRange?: Range }
  | { kind: "select"; single: boolean; source: SqlSource; join?: { type: "inner" | "left"; source: SqlSource; on: { left: SqlCol; right: SqlCol }[] }; fields: SqlField[] | "*"; where?: SqlCond; groupBy?: SqlCol[]; orderBy?: { col: SqlCol; direction: "ascending" | "descending" }[]; into: { table: boolean; target: string; inline: boolean }; range: Range }
  | DbChange<"dbinsert"> | DbChange<"dbupdate"> | DbChange<"dbmodify"> | DbChange<"dbdelete">
  | { kind: "data"; name: string; type: string; initial?: Expr; range: Range }
  | { kind: "fieldSymbol"; name: string; type: string; range: Range }
  | { kind: "bind"; source: string; target: string; range: Range }
  | { kind: "unbind"; target: string; range: Range }
  | {
      kind: "define";
      name: string;
      fields: Record<string, "i" | "string">;
      range: Range;
    }
  | { kind: "assign"; target: string; value: Expr; range: Range }
  | { kind: "write"; value: Expr; range: Range }
  | {
      kind: "if";
      left: Expr;
      op: string;
      right: Expr;
      yes: Node[];
      no: Node[];
      range: Range;
      endRange: Range;
      yesRange?: Range;
      noRange?: Range;
      elseifs?: { left: Expr; op: string; right: Expr; body: Node[]; range: Range; bodyRange?: Range }[];
    };
export type ExecutionEvent = {
  id: number;
  operation: "define" | "declare" | "assign" | "write" | "condition" | "end" | "loop" | "append" | "read" | "insert" | "modify" | "delete" | "sort" | "control" | "bind" | "unbind" | "try" | "catch" | "sql";
  range: Range;
  statement: string;
  memory: Memory;
  output: string[];
  changed: string[];
  skippedRanges: Range[];
  explanation: { key: string; name?: string; value?: Primitive; type?: string };
  condition?: { expression: string; result: boolean };
  loop?: { kind: "do" | "while" | "loop"; iteration: number; count?: number; range: Range; table?: string; index?: number; row?: Primitive | StructureValue };
  tableSelection?: { name: string; index: number; row: Primitive | StructureValue };
  /** Lookup index is one-based (0 on a miss); tableSelection indexes are zero-based. */
  lookup?: { table: string; target: string; found: boolean; index: number; keys?: Record<string, Primitive>; requestedIndex?: number; via?: "expression"; fallback?: "optional" | "default"; raised?: boolean;
    /** One-based row positions examined, in order (a teaching count, not a runtime measurement). */
    checked?: number[]; binary?: boolean; subrc?: number };
  /** Mutation index is one-based; before/after are independent snapshots, including misses. */
  mutation?: { table: string; kind: "insert" | "modify" | "delete" | "sort"; index?: number; applied: boolean; before: TableValue; after: TableValue; fields?: { field: string; direction: "ascending" | "descending" }[] };
  filter?: { table: string; index: number; field: string; value: Primitive; operand: Primitive; matched: boolean };
  aliases?: Record<string, string | null>;
  /** ABAP SQL statement outcome; matched are one-based positions in the (first) database table. */
  sql?: { kind: "select" | "insert" | "update" | "modify" | "delete"; table: string; joined?: string; matched: number[]; result?: (Primitive | StructureValue)[]; before?: StructureValue[]; subrc: number; dbcnt: number; inserted?: boolean; single?: boolean };
  /** Snapshot of the demo database after this step (present when the program uses ABAP SQL). */
  database?: Database;
};
export function sourceRange(source: string, start: number, end: number): Range {
  const a = source.slice(0, start).split("\n"),
    b = source.slice(0, end).split("\n");
  return {
    start,
    end,
    startLine: a.length,
    startColumn: a.at(-1)!.length + 1,
    endLine: b.length,
    endColumn: b.at(-1)!.length + 1,
  };
}
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const fail = (code: ErrorCode, start: number) => {
    throw new SimulationError(
      code,
      sourceRange(source, start, Math.min(source.length, start + 1)),
    );
  };
  if (source.length > 16000) fail("limit", 0);
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '"' || (c === "*" && (i === 0 || source[i - 1] === "\n"))) {
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    const start = i;
    if (c === "'") {
      i++;
      let text = "";
      let closed = false;
      while (i < source.length) {
        if (source[i] === "\n" || source[i] === "\r") fail("string", start);
        if (source[i] === "'") {
          if (source[i + 1] === "'") {
            text += "'";
            i += 2;
          } else {
            i++;
            closed = true;
            break;
          }
        } else {
          text += source[i++];
        }
      }
      if (!closed) fail("string", start);
      tokens.push({ text, kind: "string", start, end: i });
    } else if (/[a-z_]/i.test(c)) {
      while (i < source.length && /[a-z0-9_]/i.test(source[i])) i++;
      tokens.push({
        text: source.slice(start, i).toLowerCase(),
        kind: "word",
        start,
        end: i,
      });
    } else if (/\d/.test(c)) {
      while (i < source.length && /\d/.test(source[i])) i++;
      tokens.push({
        text: source.slice(start, i),
        kind: "number",
        start,
        end: i,
      });
    } else if (".,:+-=<>/()[]#~@*".includes(c)) {
      i++;
      if ([">=", "<=", "<>"].includes(c + source[i])) i++;
      tokens.push({
        text: source.slice(start, i),
        kind: "symbol",
        start,
        end: i,
      });
    } else fail(c === ">" ? "access" : "unsupported", start);
    if (tokens.length > 2000) fail("limit", start);
  }
  return tokens;
}
export function parse(source: string): Node[] {
  const tokens = tokenize(source);
  let p = 0;
  let count = 0;
  const peek = () => tokens[p];
  const at = (s: string) => peek()?.text === s;
  const range = (a: number, b = p) =>
    sourceRange(
      source,
      tokens[a]?.start ?? source.length,
      tokens[Math.max(a, b - 1)]?.end ?? source.length,
    );
  const fail = (code: ErrorCode, detail = "", a = p): never => {
    throw new SimulationError(code, range(a, a + 1), detail);
  };
  const take = (s: string, code: ErrorCode = "declaration") => {
    if (!at(s)) fail(code, s);
    return tokens[p++];
  };
  const name = () => {
    const t = peek();
    if (!t || t.kind !== "word" || !/^[a-z_][a-z0-9_]{0,29}$/.test(t.text))
      return fail("declaration");
    p++;
    return t.text;
  };
  const symbolName = () => {
    take("<"); const n = name(); take(">"); return `<${n}>`;
  };
  const ref = () => {
    let n = at("<") ? symbolName() : name();
    if (at("-")) {
      p++;
      n += "-" + name();
      if (at("-")) fail("access");
    }
    return n;
  };
  const atom = (): Expr => {
    const t = peek();
    if (!t) return fail("assignment");
    if (t.kind === "string") {
      p++;
      return { kind: "literal", value: t.text };
    }
    let sign = 1;
    if (at("-")) {
      p++;
      sign = -1;
    }
    if (peek()?.kind === "number")
      return { kind: "literal", value: sign * Number(tokens[p++].text) };
    if (sign === -1) fail("assignment");
    const next = tokens[p + 1]?.text;
    if (t.kind === "word" && (t.text === "line_exists" || t.text === "line_index") && next === "(") {
      p += 2;
      const target = tableExpr(name(), false);
      take(")", "unsupported");
      return { kind: t.text === "line_exists" ? "lineExists" : "lineIndex", target };
    }
    if (t.kind === "word" && t.text === "value" && next === "#") {
      p += 2; take("(", "unsupported");
      if (peek()?.kind !== "word" || tokens[p + 1]?.text !== "[") fail("unsupported", "VALUE #( ) supports only a table expression here");
      const target = tableExpr(name(), false);
      if (at("optional")) { p++; target.fallback = "optional"; }
      else if (at("default")) { p++; target.fallback = { default: atom() }; }
      take(")", "unsupported");
      return target;
    }
    if (t.kind === "word" && next === "[") return tableExpr(name(), true);
    return { kind: "ref", name: ref() };
  };
  function tableExpr(table: string, chain: boolean): TableExpr {
    take("[", "unsupported");
    if (at("table") || at("key") || at("index")) fail("unsupported", "KEY / TABLE KEY / INDEX additions");
    const e: TableExpr = { kind: "tableExpr", table };
    if (peek()?.kind === "word" && tokens[p + 1]?.text === "=") {
      const keys: { field: string; value: Expr }[] = [];
      while (peek() && !at("]")) {
        const field = name();
        if (keys.some(key => key.field === field)) fail("component", field);
        take("=", "assignment"); keys.push({ field, value: expr() });
      }
      e.keys = keys;
    } else e.index = expr();
    take("]", "unsupported");
    if (chain && at("-") && tokens[p + 1]?.kind === "word") {
      p++; e.component = name();
      if (at("-")) fail("access");
    }
    if (at("[") || (at("-") && tokens[p + 1]?.kind !== "number")) fail("unsupported", "chained table expressions");
    return e;
  }
  const expr = (): Expr => {
    let e = atom();
    while (at("+")) {
      p++;
      e = { kind: "add", left: e, right: atom() };
    }
    return e;
  };
  const period = (start: number) => {
    if (!at(".")) {
      if (
        ["data", "types", "write", "if", "elseif", "else", "endif"].includes(peek()?.text)
      )
        throw new SimulationError("period", range(start), ".");
      fail("period", ".", Math.max(start, p - 1));
    }
    p++;
  };
  const colRef = (): SqlCol => {
    const first = name();
    if (at("~")) { p++; return { alias: first, field: name() }; }
    return { field: first };
  };
  const sqlOperand = (): SqlOperand => {
    if (at("@")) {
      p++;
      if (at("(")) fail("unsupported", "host expressions @( … )");
      return { kind: "host", name: ref() };
    }
    const t = peek();
    if (t?.kind === "string") { p++; return { kind: "lit", value: t.text }; }
    if (at("-") && tokens[p + 1]?.kind === "number") { p += 2; return { kind: "lit", value: -Number(tokens[p - 1].text) }; }
    if (t?.kind === "number") { p++; return { kind: "lit", value: Number(t.text) }; }
    return { kind: "col", col: colRef() };
  };
  const sqlPrimary = (): SqlCond => {
    if (at("(")) { p++; const inner = sqlCondition(); take(")", "unsupported"); return inner; }
    if (at("not")) fail("unsupported", "NOT in a WHERE condition");
    const col = colRef();
    if (at("between")) { p++; const low = sqlOperand(); take("and", "unsupported"); return { kind: "between", col, low, high: sqlOperand() }; }
    if (at("like")) { p++; return { kind: "like", col, pattern: sqlOperand() }; }
    const op = peek()?.text;
    if (!["=", "<>", ">=", "<=", ">", "<"].includes(op)) fail("unsupported", "Use =, <>, <, >, <=, >=, BETWEEN or LIKE");
    p++;
    return { kind: "cmp", col, op, right: sqlOperand() };
  };
  const sqlAnd = (): SqlCond => { let left = sqlPrimary(); while (at("and")) { p++; left = { kind: "and", left, right: sqlPrimary() }; } return left; };
  function sqlCondition(): SqlCond { let left = sqlAnd(); while (at("or")) { p++; left = { kind: "or", left, right: sqlAnd() }; } return left; }
  const sqlSource = (): SqlSource => { const table = name(); let alias = table; if (at("as")) { p++; alias = name(); } return { table, alias }; };
  const sqlField = (): SqlField => {
    const fn = peek()?.text;
    if (["count", "sum", "min", "max", "avg"].includes(fn) && tokens[p + 1]?.text === "(") {
      if (fn === "avg") fail("unsupported", "AVG returns decimals; use SUM and COUNT in this subset");
      p += 2;
      let col: SqlCol | undefined;
      if (at("*")) { if (fn !== "count") fail("unsupported", "Only COUNT accepts *"); p++; }
      else col = colRef();
      take(")", "unsupported");
      if (!at("as")) fail("unsupported", "Name an aggregate column with AS, for example COUNT(*) AS headcount");
      p++;
      return { kind: "agg", fn: fn as "count" | "sum" | "min" | "max", col, alias: name() };
    }
    const col = colRef();
    if (at("as")) { p++; return { kind: "col", col, alias: name() }; }
    return { kind: "col", col };
  };
  function parseSelect(start: number): Node {
    p++;
    const single = at("single");
    if (single) p++;
    if (!at("from")) fail("unsupported", "Write SELECT [SINGLE] FROM … FIELDS … INTO … in this simulator");
    p++;
    const source = sqlSource();
    let join: Extract<Node, { kind: "select" }>["join"];
    if (at("inner") || at("left")) {
      const type = tokens[p++].text === "inner" ? "inner" : "left";
      if (type === "left") take("outer", "unsupported");
      take("join", "unsupported");
      const right = sqlSource();
      take("on", "unsupported");
      const on: { left: SqlCol; right: SqlCol }[] = [];
      do { if (on.length) p++; const left = colRef(); take("=", "unsupported"); on.push({ left, right: colRef() }); } while (at("and"));
      join = { type, source: right, on };
    }
    if (at("inner") || at("left") || at("right") || at("cross")) fail("unsupported", "one INNER JOIN or LEFT OUTER JOIN");
    if (!at("fields")) fail("unsupported", "List the columns after FIELDS");
    p++;
    let fields: SqlField[] | "*";
    if (at("*")) { p++; fields = "*"; }
    else { const list: SqlField[] = []; do { if (list.length) p++; list.push(sqlField()); } while (at(",")); fields = list; }
    let where: SqlCond | undefined;
    if (at("where")) { p++; where = sqlCondition(); }
    let groupBy: SqlCol[] | undefined;
    if (at("group")) { p++; take("by", "unsupported"); const list: SqlCol[] = []; do { if (list.length) p++; list.push(colRef()); } while (at(",")); groupBy = list; }
    if (at("having")) fail("unsupported", "HAVING");
    let orderBy: Extract<Node, { kind: "select" }>["orderBy"];
    if (at("order")) {
      p++; take("by", "unsupported");
      const list: NonNullable<typeof orderBy> = [];
      do {
        if (list.length) p++;
        const col = colRef();
        let direction: "ascending" | "descending" = "ascending";
        if (at("ascending") || at("descending")) direction = tokens[p++].text as typeof direction;
        list.push({ col, direction });
      } while (at(","));
      orderBy = list;
    }
    if (!at("into")) fail("unsupported", "End the SELECT with INTO @target or INTO TABLE @target");
    p++;
    const table = at("table");
    if (table) p++;
    if (!at("@")) fail("unsupported", "Prefix the INTO target with @");
    p++;
    let target: string, inline = false;
    if (at("data") && tokens[p + 1]?.text === "(") { p += 2; target = name(); take(")", "unsupported"); inline = true; }
    else target = ref();
    period(start);
    return { kind: "select", single, source, join, fields, where, groupBy, orderBy, into: { table, target, inline }, range: range(start) };
  }
  function parseDbChange(start: number): Node {
    const verb = tokens[p++].text as "insert" | "update" | "modify" | "delete";
    if (verb === "delete" && at("from")) {
      p++;
      const table = name();
      let where: SqlCond | undefined;
      if (at("where")) { p++; where = sqlCondition(); }
      period(start);
      return { kind: "dbdelete", table, where, range: range(start) };
    }
    const table = name();
    if (verb === "update" && at("set")) {
      p++;
      const set: { field: string; value: SqlOperand[] }[] = [];
      do {
        if (set.length) p++;
        const field = name(); take("=", "assignment");
        const value = [sqlOperand()];
        while (at("+")) { p++; value.push(sqlOperand()); }
        set.push({ field, value });
      } while (at(","));
      let where: SqlCond | undefined;
      if (at("where")) { p++; where = sqlCondition(); }
      period(start);
      return { kind: "dbupdate", table, set, where, range: range(start) };
    }
    if (!at("from")) fail("unsupported", "Write INSERT/UPDATE/MODIFY/DELETE table FROM @work_area");
    p++;
    if (at("table")) fail("unsupported", "FROM TABLE: change one row at a time in this subset");
    if (!at("@")) fail("unsupported", "Prefix the work area with @");
    p++;
    if (at("(")) fail("unsupported", "host expressions @( … )");
    const from = ref();
    period(start);
    return { kind: verb === "insert" ? "dbinsert" : verb === "update" ? "dbupdate" : verb === "modify" ? "dbmodify" : "dbdelete", table, from, range: range(start) };
  }
  /** A comparison, or the predicate line_exists( ... ) optionally preceded by NOT (op "pred" / "!pred"). */
  const condition = (): { left: Expr; op: string; right: Expr } => {
    const negate = at("not") && tokens[p + 1]?.text === "line_exists";
    if (negate) p++;
    const left = atom();
    if (left.kind === "lineExists" && !["=", "<>", ">=", "<=", ">", "<"].includes(peek()?.text))
      return { left, op: negate ? "!pred" : "pred", right: left };
    if (negate || left.kind === "lineExists") fail("unsupported", "line_exists( ) is a predicate; do not compare it");
    const op = peek()?.text;
    if (!["=", "<>", ">=", "<=", ">", "<"].includes(op)) fail("assignment");
    p++;
    return { left, op, right: atom() };
  };
  function nodes(nested = false, depth = 0): Node[] {
    if (depth > RUNTIME_LIMITS.nesting) fail("limit");
    const list: Node[] = [];
    while (peek() && !["else", "elseif", "endif", "enddo", "endwhile", "endloop", "catch", "endtry"].includes(peek().text)) {
      const start = p;
      let node!: Node;
      if (at("data")) {
        p++;
        const n = name();
        take("type");
        let type = name();
        if (type === "standard") {
          take("table"); take("of"); type = "table:" + name();
          take("with"); take("empty"); take("key");
        }
        let initial: Expr | undefined;
        if (at("value")) {
          p++;
          initial = atom();
          if (initial.kind !== "literal") fail("declaration");
        }
        period(start);
        node = { kind: "data", name: n, type, initial, range: range(start) };
      } else if (at("field") && tokens[p + 1]?.text === "-" && tokens[p + 2]?.text === "symbols") {
        p += 3; const n = symbolName(); take("type"); const type = name(); period(start);
        node = { kind: "fieldSymbol", name: n, type, range: range(start) };
      } else if (at("assign")) {
        p++; const source = ref(); take("to"); const target = symbolName(); period(start);
        node = { kind: "bind", source, target, range: range(start) };
      } else if (at("unassign")) {
        p++; const target = symbolName(); period(start);
        node = { kind: "unbind", target, range: range(start) };
      } else if (at("types")) {
        p++;
        take(":");
        take("begin");
        take("of");
        const n = name();
        take(",");
        const fields: Record<string, "i" | "string"> = Object.create(null);
        while (!at("end")) {
          if (!peek()) fail("declaration");
          const f = name();
          if (f in fields) fail("declaration", f);
          take("type");
          const ty = name();
          if (ty !== "i" && ty !== "string") fail("type", ty);
          fields[f] = ty as "i" | "string";
          take(",");
        }
        take("end");
        take("of");
        if (name() !== n) fail("declaration", n);
        if (!Object.keys(fields).length) fail("declaration");
        period(start);
        node = { kind: "define", name: n, fields, range: range(start) };
      } else if (at("write")) {
        p++;
        if (at(":")) p++;
        if (at("/")) p++;
        const value = expr();
        period(start);
        node = { kind: "write", value, range: range(start) };
      } else if (at("if")) {
        p++;
        const { left, op, right } = condition();
        period(start);
        const ifRange = range(start),
          yesStart = p,
          yes = nodes(true, depth + 1);
        const yesRange = yes.length ? range(yesStart) : undefined;
        const elseifs: NonNullable<Extract<Node, { kind: "if" }>["elseifs"]> = [];
        while (at("elseif")) {
          const branchStart = p++;
          const { left, op, right } = condition();
          period(branchStart);
          const branchRange = range(branchStart), bodyStart = p;
          const body = nodes(true, depth + 1);
          elseifs.push({ left, op, right, body, range: branchRange, bodyRange: body.length ? range(bodyStart) : undefined });
        }
        let no: Node[] = [],
          noRange: Range | undefined;
        if (at("else")) {
          const elseStart = p++;
          period(elseStart);
          no = nodes(true, depth + 1);
          noRange = range(elseStart);
        }
        if (!at("endif")) fail("block");
        const endStart = p++;
        period(endStart);
        node = {
          kind: "if",
          left,
          op,
          right,
          yes,
          no,
          range: ifRange,
          endRange: range(endStart),
          yesRange,
          noRange,
          elseifs,
        };
      } else if (at("do") || at("while") || at("loop")) {
        const kind = tokens[p++].text;
        let count: Expr | undefined, left: Expr | undefined, right: Expr | undefined, op = "", table = "", into = "", inline = false;
        let where: Extract<Node,{kind:"loop"}>["where"];
        if (kind === "do") { count = expr(); take("times", "block"); }
        else if (kind === "while") {
          left = expr(); op = peek()?.text;
          if (!["=", "<>", ">=", "<=", ">", "<"].includes(op)) fail("assignment");
          p++; right = expr();
        } else {
          take("at"); table = name(); take("into");
          if (at("data")) { p++; take("("); into = name(); take(")"); inline = true; }
          else into = name();
          if (at("where")) {
            p++; const field = name(), op = peek()?.text;
            if (!["=", "<>", ">=", "<=", ">", "<"].includes(op)) fail("unsupported");
            p++; const value = expr();
            if (value.kind === "add" || at("and") || at("or")) fail("unsupported");
            where = {field, op, value};
          }
        }
        period(start); const opening = range(start), body = nodes(true, depth + 1);
        take(kind === "do" ? "enddo" : kind === "while" ? "endwhile" : "endloop", "block");
        const ending = p - 1; period(ending);
        node = kind === "do" ? { kind, count: count!, body, range: opening, endRange: range(ending) }
          : kind === "while" ? { kind, left: left!, op, right: right!, body, range: opening, endRange: range(ending) }
          : { kind: "loop", table, into, inline, ...(where ? {where} : {}), body, range: opening, endRange: range(ending) };
      } else if (at("select")) {
        node = parseSelect(start);
      } else if (((at("insert") || at("modify")) && isDbTable(tokens[p + 1]?.text) && tokens[p + 2]?.text === "from") || at("update") || (at("delete") && (tokens[p + 1]?.text === "from" || isDbTable(tokens[p + 1]?.text)))) {
        node = parseDbChange(start);
      } else if (at("insert") || at("modify") || at("delete")) {
        const kind = tokens[p++].text as "insert" | "modify" | "delete";
        let value: Expr | undefined;
        let table: string;
        if (kind === "insert") { value = expr(); take("into"); table = name(); }
        else {
          table = name();
          if (kind === "modify") { take("from"); value = expr(); }
        }
        take("index"); const index = expr(); period(start);
        node = kind === "delete" ? {kind, table, index, range:range(start)} : {kind, table, value:value!, index, range:range(start)};
      } else if (at("sort")) {
        p++; const table = name(); take("by");
        const fields: Extract<Node,{kind:"sort"}>["fields"] = [];
        while (peek() && !at(".")) {
          const field = name();
          if (fields.some(item => item.field === field)) fail("component", field);
          let direction: "ascending" | "descending" = "ascending";
          if (at("ascending") || at("descending")) direction = tokens[p++].text as typeof direction;
          fields.push({field,direction});
        }
        if (!fields.length) fail("declaration");
        period(start); node = {kind:"sort", table, fields, range:range(start)};
      } else if (at("read")) {
        p++; take("table"); const table = name(); take("into"); const into = name();
        let index: Expr | undefined;
        let keys: { field: string; value: Expr }[] | undefined;
        if (at("index")) { p++; index = expr(); }
        else {
          take("with"); take("key"); keys = [];
          while (peek() && !at(".") && !at("binary")) {
            const field = name();
            if (keys.some(key => key.field === field)) fail("component", field);
            take("=", "assignment"); keys.push({field, value: expr()});
          }
          if (!keys.length) fail("declaration");
        }
        let binary = false;
        if (at("binary")) {
          if (index) fail("unsupported", "BINARY SEARCH needs WITH KEY");
          p++; take("search", "unsupported"); binary = true;
        }
        period(start);
        node = {kind:"read", table, into, index, keys, ...(binary ? {binary} : {}), range:range(start)};
      } else if (at("append")) {
        p++; const value = expr(); take("to"); const table = name(); period(start);
        node = { kind: "append", value, table, range: range(start) };
      } else if (at("try")) {
        p++; period(start);
        const opening = range(start), bodyStart = p;
        const body = nodes(true, depth + 1);
        const bodyRange = body.length ? range(bodyStart) : undefined;
        if (!at("catch")) fail("block");
        const catchStart = p++;
        if (name() !== "cx_sy_itab_line_not_found") fail("unsupported", "Only CATCH cx_sy_itab_line_not_found is supported", catchStart + 1);
        period(catchStart);
        const catchRange = range(catchStart), handlerStart = p;
        const handler = nodes(true, depth + 1);
        const handlerRange = handler.length ? range(handlerStart) : undefined;
        if (at("catch")) fail("unsupported", "one CATCH per TRY");
        if (!at("endtry")) fail("block");
        const endStart = p++; period(endStart);
        node = { kind: "try", body, handler, range: opening, catchRange, endRange: range(endStart), bodyRange, handlerRange };
      } else if (at("exit") || at("continue")) {
        const action = tokens[p++].text as "exit" | "continue"; period(start);
        node = { kind: "control", action, range: range(start) };
      } else if (peek().kind === "word" || at("<")) {
        if (
          [
            "select",
            "loop",
            "append",
            "delete",
            "method",
            "call",
            "do",
            "while",
          ].includes(peek().text)
        )
          fail("unsupported");
        const target = ref();
        if (at("[")) fail("unsupported", "write access through a table expression");
        if (at(".") && tokens[p + 1]?.kind === "word") fail("access");
        take("=", "assignment");
        const value = expr();
        period(start);
        node = { kind: "assign", target, value, range: range(start) };
      } else fail("unsupported");
      if (nested && (node.kind === "data" || node.kind === "define" || node.kind === "fieldSymbol"))
        fail("unsupported", "conditional declaration", start);
      list.push(node);
      if (++count > 150) fail("limit");
    }
    return list;
  }
  const result = nodes();
  if (peek()) fail("block");
  if (!result.length) fail("declaration");
  return result;
}
export function execute(nodes: Node[], source: string, options: { database?: Database } = {}): ExecutionEvent[] {
  const definitions: Record<
      string,
      Record<string, "i" | "string">
    > = Object.create(null),
    types: Record<string, string> = Object.create(null),
    memory: Memory = Object.create(null),
    aliases: Record<string, string | null> = Object.create(null),
    output: string[] = [],
    events: ExecutionEvent[] = [];
  const error = (code: ErrorCode, n: Node, detail = ""): never => {
    throw new SimulationError(code, n.range, detail);
  };
  function refType(name: string, n: Node): string {
    if (["sy-index", "sy-subrc", "sy-tabix", "sy-dbcnt"].includes(name)) return "i";
    const [base, field, ...rest] = name.split("-");
    if (!(base in types)) return error("unknown", n, base);
    const type = types[base];
    if (rest.length) return error("access", n, name);
    if (field) {
      if (!definitions[type]) return error("access", n, base);
      if (!(field in definitions[type])) return error("component", n, field);
      return definitions[type][field];
    }
    return type;
  }
  function exprType(e: Expr, n: Node): string {
    if (e.kind === "literal") {
      if (
        typeof e.value === "number" &&
        (!Number.isInteger(e.value) ||
          e.value < -2147483648 ||
          e.value > 2147483647)
      )
        error("range", n);
      return typeof e.value === "number" ? "i" : "string";
    }
    if (e.kind === "ref") return refType(e.name, n);
    if (e.kind === "lineIndex") { exprType(e.target, n); return "i"; }
    if (e.kind === "lineExists") { exprType(e.target, n); return "bool"; }
    if (e.kind === "tableExpr") {
      const tableType = refType(e.table, n);
      if (!tableType.startsWith("table:")) return error("type", n, e.table);
      const rowType = tableType.slice(6);
      if (e.index && exprType(e.index, n) !== "i") error("type", n);
      for (const key of e.keys || []) {
        const keyType = key.field === "table_line" && !definitions[rowType] ? rowType : definitions[rowType]?.[key.field];
        if (!keyType) error("component", n, key.field);
        if (exprType(key.value, n) !== keyType) error("type", n);
      }
      if (e.fallback && e.fallback !== "optional" && exprType(e.fallback.default, n) !== rowType) error("type", n);
      if (!e.component) return rowType;
      if (!definitions[rowType]) return error("access", n, e.table);
      if (!(e.component in definitions[rowType])) return error("component", n, e.component);
      return definitions[rowType][e.component];
    }
    if (exprType(e.left, n) !== "i" || exprType(e.right, n) !== "i")
      return error("type", n);
    return "i";
  }
  const isPredicate = (op: string) => op === "pred" || op === "!pred";
  // Database tables are also structured types (DATA ls TYPE zaca_employee).
  for (const [table, spec] of Object.entries(sqlCatalog)) definitions[table] = { ...spec.fields };
  let resultTypes = 0;
  type SqlColumn = { name: string; type: string; key?: string; agg?: "count" | "sum" | "min" | "max" };
  function sqlSources(n: Extract<Node, { kind: "select" }>) {
    const sources = [n.source, ...(n.join ? [n.join.source] : [])];
    for (const s of sources) if (!isDbTable(s.table)) error("unknown", n, `${s.table} is not a table of the demo database`);
    if (sources.length === 2 && sources[0].alias === sources[1].alias) error("declaration", n, sources[0].alias);
    return sources;
  }
  function sqlColumn(col: SqlCol, sources: SqlSource[], n: Node): { type: string; key: string } {
    let source: SqlSource | undefined;
    if (col.alias) { source = sources.find(s => s.alias === col.alias); if (!source) error("unknown", n, col.alias); }
    else { if (sources.length > 1) error("unsupported", n, `Write alias~${col.field} in a join`); source = sources[0]; }
    const type = sqlCatalog[source!.table].fields[col.field];
    if (!type) error("component", n, col.field in types ? `${col.field}: prefix ABAP variables with @` : col.field);
    return { type, key: `${source!.alias}~${col.field}` };
  }
  function sqlOperandType(o: SqlOperand, sources: SqlSource[], n: Node) {
    if (o.kind === "lit") return exprType({ kind: "literal", value: o.value }, n);
    if (o.kind === "host") return refType(o.name, n);
    return sqlColumn(o.col, sources, n).type;
  }
  function validateCondition(c: SqlCond, sources: SqlSource[], n: Node) {
    if (c.kind === "and" || c.kind === "or") { validateCondition(c.left, sources, n); validateCondition(c.right, sources, n); return; }
    const type = sqlColumn(c.col, sources, n).type;
    const operands = c.kind === "cmp" ? [c.right] : c.kind === "between" ? [c.low, c.high] : [c.pattern];
    if (operands.some(o => sqlOperandType(o, sources, n) !== type)) error("type", n);
    if (c.kind === "like" && type !== "string") error("type", n, "LIKE compares text columns");
  }
  function selectColumns(n: Extract<Node, { kind: "select" }>) {
    const sources = sqlSources(n);
    for (const pair of n.join?.on || []) if (sqlColumn(pair.left, sources, n).type !== sqlColumn(pair.right, sources, n).type) error("type", n);
    if (n.where) validateCondition(n.where, sources, n);
    let columns: SqlColumn[];
    if (n.fields === "*") {
      if (n.join) error("unsupported", n, "List the joined columns instead of *");
      columns = Object.entries(sqlCatalog[n.source.table].fields).map(([field, type]) => ({ name: field, type, key: `${n.source.alias}~${field}` }));
    } else columns = n.fields.map(f => {
      if (f.kind === "agg") {
        const column = f.col ? sqlColumn(f.col, sources, n) : undefined;
        if (f.fn === "sum" && column?.type !== "i") error("type", n, "SUM needs a number column");
        return { name: f.alias, type: f.fn === "count" ? "i" : column!.type, key: column?.key, agg: f.fn };
      }
      const column = sqlColumn(f.col, sources, n);
      return { name: f.alias || f.col.field, type: column.type, key: column.key };
    });
    if (new Set(columns.map(c => c.name)).size !== columns.length) error("declaration", n, "Each result column needs a unique name; use AS");
    const aggregate = columns.some(c => c.agg) || !!n.groupBy;
    const groupKeys = (n.groupBy || []).map(col => sqlColumn(col, sources, n).key);
    if (aggregate) for (const c of columns) if (!c.agg && !groupKeys.includes(c.key!)) error("unsupported", n, `${c.name} must be listed in GROUP BY`);
    for (const item of n.orderBy || []) {
      if (aggregate) { if (!columns.some(c => c.name === item.col.field || (c.key && c.key === `${item.col.alias ?? n.source.alias}~${item.col.field}`))) error("unsupported", n, "With GROUP BY, ORDER BY a result column"); }
      else sqlColumn(item.col, sources, n);
    }
    return { sources, columns, aggregate, aggregateOnly: columns.every(c => c.agg) && !n.groupBy };
  }
  function fitsColumns(rowType: string, columns: SqlColumn[]) {
    const fields = definitions[rowType] ? Object.values(definitions[rowType]) : [rowType];
    return fields.length === columns.length && fields.every((type, i) => type === columns[i].type);
  }
  function validate(list: Node[], loops = 0, tries = 0) {
    for (const n of list) {
      if (n.kind === "define") {
        if (n.name in definitions || ["i", "string"].includes(n.name))
          error("declaration", n, n.name);
        definitions[n.name] = n.fields;
      } else if (n.kind === "data" || n.kind === "fieldSymbol") {
        if (n.name in types) error("declaration", n, n.name);
        const rowType = n.type.replace(/^table:/, "");
        if (!["i", "string"].includes(rowType) && !(rowType in definitions))
          error("type", n, n.type);
        types[n.name] = n.type;
        if (n.kind === "data" && n.initial && exprType(n.initial, n) !== n.type) error("type", n);
      } else if (n.kind === "bind") {
        if (!(n.target in types)) error("unknown", n, n.target);
        if (n.source.startsWith("<") || n.source.startsWith("sy-")) error("unsupported", n, "ASSIGN requires a direct data object in this subset");
        if (refType(n.source, n) !== refType(n.target, n)) error("type", n);
      } else if (n.kind === "unbind") {
        refType(n.target, n);
      } else if (n.kind === "assign") {
        if (n.target.startsWith("sy-")) error("assignment", n);
        const targetType = refType(n.target, n);
        // Whole structures are assignable only from a table expression row in this subset.
        if (
          exprType(n.value, n) !== targetType ||
          (!["i", "string"].includes(targetType) && !(n.value.kind === "tableExpr" && definitions[targetType]))
        )
          error("type", n);
      } else if (n.kind === "write") {
        if (!["i", "string"].includes(exprType(n.value, n))) error("type", n);
      } else if (n.kind === "control") {
        if (!loops) error("block", n);
      } else if (n.kind === "append") {
        if (refType(n.table, n) !== "table:" + exprType(n.value, n)) error("type", n);
      } else if (n.kind === "insert" || n.kind === "modify" || n.kind === "delete" || n.kind === "sort") {
        const tableType = refType(n.table,n);
        if (!tableType.startsWith("table:")) error("type",n);
        const rowType = tableType.slice(6);
        if (n.kind === "sort") {
          for (const item of n.fields) {
            if (item.field === "table_line" && !definitions[rowType]) continue;
            if (!definitions[rowType]?.[item.field]) error("component",n,item.field);
          }
        } else {
          if (exprType(n.index,n) !== "i") error("type",n);
          if (n.kind !== "delete" && exprType(n.value,n) !== rowType) error("type",n);
        }
      } else if (n.kind === "read") {
        const tableType = refType(n.table, n);
        if (!tableType.startsWith("table:")) error("type", n);
        const rowType = tableType.slice(6);
        if (refType(n.into, n) !== rowType) error("type", n);
        if (n.index && exprType(n.index, n) !== "i") error("type", n);
        for (const key of n.keys || []) {
          const keyType = key.field === "table_line" && !definitions[rowType] ? rowType : definitions[rowType]?.[key.field];
          if (!keyType) error("component", n, key.field);
          if (exprType(key.value, n) !== keyType) error("type", n);
        }
      } else if (n.kind === "select") {
        const { columns, aggregateOnly } = selectColumns(n);
        if (!n.into.table && !n.single && !aggregateOnly) error("unsupported", n, "Use SELECT SINGLE or INTO TABLE (SELECT … ENDSELECT loops are outside this subset)");
        if (n.into.inline) {
          if (n.into.target in types) error("declaration", n, n.into.target);
          let rowType = columns[0].type;
          if (columns.length > 1 || n.fields === "*") {
            rowType = n.fields === "*" && !n.join ? n.source.table : `%result${++resultTypes}`;
            if (!definitions[rowType]) definitions[rowType] = Object.fromEntries(columns.map(c => [c.name, c.type as "i" | "string"]));
          }
          types[n.into.target] = n.into.table ? `table:${rowType}` : rowType;
        } else {
          const targetType = refType(n.into.target, n);
          if (n.into.table !== targetType.startsWith("table:")) error("type", n, n.into.table ? "INTO TABLE needs an internal table" : "Use INTO TABLE for an internal table");
          if (!fitsColumns(n.into.table ? targetType.slice(6) : targetType, columns)) error("type", n, "The FIELDS columns do not match the target's components");
        }
      } else if (n.kind === "dbinsert" || n.kind === "dbupdate" || n.kind === "dbmodify" || n.kind === "dbdelete") {
        if (!isDbTable(n.table)) error("unknown", n, `${n.table} is not a table of the demo database`);
        const spec = sqlCatalog[n.table], sources = [{ table: n.table, alias: n.table }];
        if (n.from) {
          const fromType = refType(n.from, n);
          if (JSON.stringify(definitions[fromType] || null) !== JSON.stringify(spec.fields)) error("type", n, `The work area must have the type ${n.table}`);
        }
        for (const item of n.set || []) {
          const type = spec.fields[item.field];
          if (!type) error("component", n, item.field);
          if (spec.key.includes(item.field)) error("unsupported", n, "Key fields cannot be changed with SET");
          if (item.value.some(o => sqlOperandType(o, sources, n) !== type) || (item.value.length > 1 && type !== "i")) error("type", n);
        }
        if (n.where) validateCondition(n.where, sources, n);
      } else if (n.kind === "try") {
        validate(n.body, loops, tries + 1);
        validate(n.handler, loops, tries + 1);
      } else if (n.kind === "do" || n.kind === "while" || n.kind === "loop") {
        if (tries) error("unsupported", n, "Loops inside TRY are outside this subset");
        if (n.kind === "do" && exprType(n.count, n) !== "i") error("type", n);
        if (n.kind === "while" && (exprType(n.left, n) !== exprType(n.right, n) || !["i", "string"].includes(exprType(n.left,n)))) error("type", n);
        if (n.kind === "loop") {
          const tableType = refType(n.table, n);
          if (!tableType.startsWith("table:")) error("type", n);
          if (n.where) {
            const rowType = tableType.slice(6);
            const fieldType = n.where.field === "table_line" && !definitions[rowType] ? rowType : definitions[rowType]?.[n.where.field];
            if (!fieldType) error("component", n, n.where.field);
            if (exprType(n.where.value, n) !== fieldType) error("type", n);
          }
          if (n.inline) {
            if (n.into in types) error("declaration", n, n.into);
            types[n.into] = tableType.slice(6);
          } else if (refType(n.into,n) !== tableType.slice(6)) error("type",n);
        }
        validate(n.body, loops + 1, tries);
      } else {
        if (isPredicate(n.op)) exprType(n.left, n);
        else {
          if (exprType(n.left, n) !== exprType(n.right, n)) error("type", n);
          if (!["i", "string"].includes(exprType(n.left, n))) error("type", n);
        }
        validate(n.yes, loops, tries);
        for (const branch of n.elseifs || []) {
          const branchNode = { ...n, range: branch.range };
          if (isPredicate(branch.op)) exprType(branch.left, branchNode);
          else if (exprType(branch.left, branchNode) !== exprType(branch.right, branchNode) || !["i", "string"].includes(exprType(branch.left, branchNode))) error("type", branchNode);
          validate(branch.body, loops, tries);
        }
        validate(n.no, loops, tries);
      }
    }
  }
  validate(nodes);
  const loopStack: NonNullable<ExecutionEvent["loop"]>[] = [];
  let steps = 0;
  let traceBytes = 0;
  let subrc = 0, tabix = 0, dbcnt = 0;
  const database: Database = structuredClone(options.database ?? demoDatabase);
  const flat = (list: Node[]): Node[] => list.flatMap(n => [n, ...("body" in n ? flat(n.body) : []), ...(n.kind === "try" ? flat(n.handler) : []), ...(n.kind === "if" ? [...flat(n.yes), ...flat(n.no), ...(n.elseifs || []).flatMap(b => flat(b.body))] : [])]);
  const usesSql = flat(nodes).some(n => n.kind === "select" || n.kind.startsWith("db"));
  let pendingSql: ExecutionEvent["sql"];
  function resolve(name: string, n: Node) {
    const [base, field] = name.split("-");
    if (!base.startsWith("<")) return name;
    const target = aliases[base];
    if (!target) return error("unassigned", n, base);
    return target + (field ? `-${field}` : "");
  }
  function readRef(name: string, n: Node): MemoryValue {
    const [base, field] = resolve(name, n).split("-");
    const value = memory[base];
    if (value === undefined) return error("unknown", n, base);
    if (!field) return value;
    if (typeof value !== "object" || Array.isArray(value) || !(field in value)) return error("component", n, field);
    return value[field];
  }
  type Lookup = NonNullable<ExecutionEvent["lookup"]>;
  let pendingLookup: Lookup | undefined;
  const initialOf = (type: string): Primitive | StructureValue => definitions[type] ? Object.fromEntries(Object.entries(definitions[type]).map(([key,t])=>[key,t === "i" ? 0 : ""])) : type === "i" ? 0 : "";
  /** Finds a key in a standard table. Linear search checks rows from the top; BINARY SEARCH assumes the
   * rows are sorted ascending by the key fields and halves the remaining range (leftmost match).
   * On a binary miss, insertAt is the one-based position where the key would belong. */
  function locate(rows: TableValue, keys: Record<string, Primitive>, binary = false) {
    const fields = Object.keys(keys);
    const value = (row: Primitive | StructureValue, field: string) => typeof row === "object" ? row[field] : row;
    if (!binary) {
      const index = rows.findIndex(row => fields.every(field => value(row, field) === keys[field]));
      const checked = Array.from({ length: index >= 0 ? index + 1 : rows.length }, (_, i) => i + 1);
      return { index, checked, insertAt: 0 };
    }
    const compare = (row: Primitive | StructureValue) => {
      for (const field of fields) { const a = value(row, field), b = keys[field]; if (a < b) return -1; if (a > b) return 1; }
      return 0;
    };
    const checked: number[] = [];
    let lo = 0, hi = rows.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      checked.push(mid + 1);
      if (compare(rows[mid]) < 0) lo = mid + 1; else hi = mid;
    }
    const found = lo < rows.length && compare(rows[lo]) === 0;
    if (found && !checked.includes(lo + 1)) checked.push(lo + 1);
    return { index: found ? lo : -1, checked, insertAt: lo + 1 };
  }
  /** Locate a table-expression row without copying it; records lookup metadata for the trace. */
  function search(e: TableExpr, n: Node): { rows: TableValue; index: number } {
    const rows = memory[e.table];
    if (!Array.isArray(rows)) return error("type", n, e.table);
    const keys = e.keys ? Object.fromEntries(e.keys.map(key => [key.field, get(key.value, n)])) : undefined;
    const requestedIndex = e.index ? get(e.index, n) as number : undefined;
    const located = keys ? locate(rows, keys) : undefined;
    const index = requestedIndex !== undefined ? (requestedIndex > 0 && requestedIndex <= rows.length ? requestedIndex - 1 : -1) : located!.index;
    pendingLookup = { table: e.table, target: "", found: index >= 0, index: index + 1, via: "expression", ...(located ? { checked: located.checked } : {}),
      ...(keys ? { keys } : {}), ...(requestedIndex !== undefined ? { requestedIndex } : {}),
      ...(e.fallback ? { fallback: e.fallback === "optional" ? "optional" : "default" } : {}) };
    return { rows, index };
  }
  /** Evaluates any expression, including whole table rows (always copied). */
  function value(e: Expr, n: Node): Primitive | StructureValue {
    if (e.kind === "lineIndex") return search(e.target, n).index + 1;
    if (e.kind === "lineExists") return search(e.target, n).index >= 0 ? 1 : 0;
    if (e.kind === "tableExpr") {
      const { rows, index } = search(e, n);
      if (index < 0) {
        if (e.fallback === "optional") return initialOf(types[e.table].slice(6));
        if (e.fallback) {
          const own = pendingLookup, fallback = value(e.fallback.default, n);
          pendingLookup = own;
          return structuredClone(fallback);
        }
        pendingLookup!.raised = true;
        throw new LineNotFound(n, pendingLookup!);
      }
      const row = structuredClone(rows[index]);
      return e.component ? (row as StructureValue)[e.component] : row;
    }
    if (e.kind === "ref" && !e.name.startsWith("sy-")) {
      const v = readRef(e.name, n);
      if (Array.isArray(v)) return error("type", n);
      return structuredClone(v);
    }
    return get(e, n);
  }
  function describe(e: TableExpr) {
    const spec = pendingLookup?.keys ? Object.entries(pendingLookup.keys).map(([field, v]) => `${field} = ${typeof v === "string" ? `'${v}'` : v}`).join(" ") : String(pendingLookup?.requestedIndex);
    return `${e.table}[ ${spec} ]`;
  }
  function get(e: Expr, n: Node): Primitive {
    if (e.kind === "literal") return e.value;
    if (e.kind === "tableExpr" || e.kind === "lineIndex" || e.kind === "lineExists") {
      const v = value(e, n);
      if (typeof v === "object") return error("type", n);
      return v;
    }
    if (e.kind === "add") {
      const a = get(e.left, n),
        b = get(e.right, n);
      if (typeof a !== "number" || typeof b !== "number")
        return error("type", n);
      return checked(a + b, n);
    }
    if (e.name === "sy-index") return [...loopStack].reverse().find(l => l.kind !== "loop")?.iteration ?? 0;
    if (e.name === "sy-subrc") return subrc;
    if (e.name === "sy-tabix") return tabix;
    if (e.name === "sy-dbcnt") return dbcnt;
    const v = readRef(e.name, n);
    if (typeof v === "object") return error("type", n);
    return v;
  }
  function checked(v: Primitive, n: Node) {
    if (
      typeof v === "number" &&
      (!Number.isInteger(v) || v < -2147483648 || v > 2147483647)
    )
      error("range", n);
    return v;
  }
  function emit(
    n: Node,
    operation: ExecutionEvent["operation"],
    explanation: ExecutionEvent["explanation"],
    changed: string[] = [],
    skippedRanges: Range[] = [],
    condition?: ExecutionEvent["condition"],
    r = n.range,
    lookup?: ExecutionEvent["lookup"],
    mutation?: ExecutionEvent["mutation"],
    filter?: ExecutionEvent["filter"],
  ) {
    if (events.length >= RUNTIME_LIMITS.trace) error("limit", n, "trace");
    if (!lookup && pendingLookup) lookup = { ...pendingLookup, target: n.kind === "assign" ? n.target : "" };
    pendingLookup = undefined;
    if ((JSON.stringify(memory).length + JSON.stringify(output).length) * 2 > RUNTIME_LIMITS.memoryBytes) error("limit", n, "memory");
    const loop = loopStack.at(-1);
    const tableContext = [...loopStack].reverse().find(context => context.kind === "loop" && context.row !== undefined);
    const event: ExecutionEvent = {
      id: events.length,
      operation,
      range: r,
      statement: source.slice(r.start, r.end),
      memory: structuredClone(memory),
      output: [...output],
      changed,
      skippedRanges,
      explanation,
      condition,
      ...(filter ? {filter:structuredClone(filter)} : {}),
      loop: loop ? structuredClone(loop) : undefined,
      tableSelection: filter ? { name:filter.table, index:filter.index-1, row:structuredClone((memory[filter.table] as TableValue)[filter.index-1]) } : mutation ? (mutation.applied && mutation.index && ["insert","modify"].includes(mutation.kind) ? {name:mutation.table,index:mutation.index-1,row:structuredClone(mutation.after[mutation.index-1])} : undefined) : lookup ? (lookup.found ? {name:lookup.table, index:lookup.index - 1, row:structuredClone((memory[lookup.table] as TableValue)[lookup.index - 1])} : undefined) : tableContext?.table && tableContext.row !== undefined ? { name: tableContext.table, index: tableContext.index!, row: structuredClone(tableContext.row) } : undefined,
      ...(lookup ? {lookup:structuredClone(lookup)} : {}),
      ...(mutation ? {mutation:structuredClone(mutation)} : {}),
      ...(Object.keys(aliases).length ? {aliases: {...aliases}} : {}),
      ...(pendingSql ? { sql: pendingSql } : {}),
      ...(usesSql ? { database: structuredClone(database) } : {}),
    };
    pendingSql = undefined;
    traceBytes += JSON.stringify(event).length * 2;
    if (traceBytes > RUNTIME_LIMITS.traceBytes) error("limit", n, "trace memory");
    events.push(event);
  }
  type JoinedRow = Record<string, Primitive>;
  const prefixed = (alias: string, row: StructureValue): JoinedRow => Object.fromEntries(Object.entries(row).map(([k, v]) => [`${alias}~${k}`, v]));
  const blankRow = (table: string): StructureValue => Object.fromEntries(Object.entries(sqlCatalog[table].fields).map(([k, t]) => [k, t === "i" ? 0 : ""]));
  function sqlValue(o: SqlOperand, row: JoinedRow, defaultAlias: string, n: Node): Primitive {
    if (o.kind === "lit") return o.value;
    if (o.kind === "host") return get({ kind: "ref", name: o.name }, n);
    return row[`${o.col.alias ?? defaultAlias}~${o.col.field}`];
  }
  function sqlTest(c: SqlCond, row: JoinedRow, defaultAlias: string, n: Node): boolean {
    if (c.kind === "and") return sqlTest(c.left, row, defaultAlias, n) && sqlTest(c.right, row, defaultAlias, n);
    if (c.kind === "or") return sqlTest(c.left, row, defaultAlias, n) || sqlTest(c.right, row, defaultAlias, n);
    const value = row[`${c.col.alias ?? defaultAlias}~${c.col.field}`];
    if (c.kind === "between") return value >= sqlValue(c.low, row, defaultAlias, n) && value <= sqlValue(c.high, row, defaultAlias, n);
    if (c.kind === "like") {
      const pattern = String(sqlValue(c.pattern, row, defaultAlias, n)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
      return new RegExp(`^${pattern}$`).test(String(value));
    }
    const right = sqlValue(c.right, row, defaultAlias, n);
    return c.op === "=" ? value === right : c.op === "<>" ? value !== right : c.op === ">=" ? value >= right : c.op === "<=" ? value <= right : c.op === ">" ? value > right : value < right;
  }
  function runSelect(n: Extract<Node, { kind: "select" }>) {
    const { columns, aggregate } = selectColumns(n);
    const main = n.source, joined = n.join;
    let rows: { row: JoinedRow; index: number }[] = database[main.table].map((r, i) => ({ row: prefixed(main.alias, r), index: i + 1 }));
    if (joined) rows = rows.flatMap(left => {
      const matches = database[joined.source.table].map(r => ({ ...left.row, ...prefixed(joined.source.alias, r) }))
        .filter(row => joined.on.every(pair => row[`${pair.left.alias ?? main.alias}~${pair.left.field}`] === row[`${pair.right.alias ?? main.alias}~${pair.right.field}`]));
      if (matches.length) return matches.map(row => ({ row, index: left.index }));
      return joined.type === "left" ? [{ row: { ...left.row, ...prefixed(joined.source.alias, blankRow(joined.source.table)) }, index: left.index }] : [];
    });
    if (n.where) rows = rows.filter(r => sqlTest(n.where!, r.row, main.alias, n));
    const matched = [...new Set(rows.map(r => r.index))];
    const order = (a: Primitive, b: Primitive, direction: string) => (a < b ? -1 : a > b ? 1 : 0) * (direction === "descending" ? -1 : 1);
    let values: Primitive[][];
    if (aggregate) {
      const groups = new Map<string, JoinedRow[]>();
      const groupKeys = (n.groupBy || []).map(col => `${col.alias ?? main.alias}~${col.field}`);
      for (const r of rows) { const k = JSON.stringify(groupKeys.map(key => r.row[key])); groups.set(k, [...(groups.get(k) || []), r.row]); }
      if (!n.groupBy && !groups.size) groups.set("[]", []);
      values = [...groups.values()].map(group => columns.map(c => {
        if (!c.agg) return group[0][c.key!];
        if (c.agg === "count") return group.length;
        const list = group.map(r => r[c.key!]);
        if (!list.length) return c.type === "i" ? 0 : "";
        if (c.agg === "sum") return checked((list as number[]).reduce((s, v) => s + v, 0), n);
        return list.reduce((best, v) => (c.agg === "min" ? v < best : v > best) ? v : best);
      }));
      for (const item of [...(n.orderBy || [])].reverse()) {
        const at = columns.findIndex(c => c.name === item.col.field || c.key === `${item.col.alias ?? main.alias}~${item.col.field}`);
        values.sort((a, b) => order(a[at], b[at], item.direction));
      }
    } else {
      for (const item of [...(n.orderBy || [])].reverse()) {
        const key = `${item.col.alias ?? main.alias}~${item.col.field}`;
        rows.sort((a, b) => order(a.row[key], b.row[key], item.direction));
      }
      values = rows.map(r => columns.map(c => r.row[c.key!]));
    }
    if (n.single) values = values.slice(0, 1);
    if (values.length > RUNTIME_LIMITS.rows) error("limit", n, "rows");
    const targetType = types[n.into.target] ?? refType(n.into.target, n);
    const rowType = n.into.table ? targetType.slice(6) : targetType;
    const toRow = (vals: Primitive[]): Primitive | StructureValue => definitions[rowType] ? Object.fromEntries(Object.keys(definitions[rowType]).map((field, i) => [field, vals[i]])) : vals[0];
    const result = values.map(toRow);
    const target = resolve(n.into.target, n), [base, field] = target.split("-");
    const store = (v: MemoryValue) => { if (field) (memory[base] as StructureValue)[field] = v as Primitive; else memory[base] = v; };
    if (n.into.table) store(result);
    else if (result.length) store(result[0]);
    else if (n.into.inline) store(initialOf(rowType));
    subrc = result.length ? 0 : 4;
    dbcnt = n.into.table ? result.length : result.length ? 1 : 0;
    memory["sy-subrc"] = subrc; memory["sy-dbcnt"] = dbcnt;
    pendingSql = { kind: "select", table: main.table, ...(joined ? { joined: joined.source.table } : {}), matched, result: structuredClone(result), subrc, dbcnt, single: !n.into.table };
    emit(n, "sql", { key: subrc ? "sqlSelectEmpty" : "sqlSelect", name: n.into.target }, [n.into.target, "sy-subrc", "sy-dbcnt"]);
  }
  function runDbChange(n: Extract<Node, { kind: "dbinsert" | "dbupdate" | "dbmodify" | "dbdelete" }>) {
    const rows = database[n.table], before = structuredClone(rows), spec = sqlCatalog[n.table];
    const sameKey = (a: StructureValue, b: StructureValue) => spec.key.every(k => a[k] === b[k]);
    let matched: number[] = [], inserted = false;
    if (n.from) {
      const work = structuredClone(readRef(n.from, n) as StructureValue);
      const at = rows.findIndex(r => sameKey(r, work));
      if (n.kind === "dbinsert") { if (at < 0) { if (rows.length >= RUNTIME_LIMITS.rows) error("limit", n, "rows"); rows.push(work); matched = [rows.length]; inserted = true; } }
      else if (n.kind === "dbupdate") { if (at >= 0) { rows[at] = work; matched = [at + 1]; } }
      else if (n.kind === "dbmodify") { if (at >= 0) { rows[at] = work; matched = [at + 1]; } else { rows.push(work); matched = [rows.length]; inserted = true; } }
      else if (at >= 0) { rows.splice(at, 1); matched = [at + 1]; }
    } else {
      matched = rows.map((r, i) => (!n.where || sqlTest(n.where, prefixed(n.table, r), n.table, n)) ? i + 1 : 0).filter(Boolean);
      if (n.kind === "dbupdate") for (const position of matched) {
        const row = rows[position - 1], joinedRow = prefixed(n.table, row);
        for (const item of n.set!) {
          const parts = item.value.map(o => sqlValue(o, joinedRow, n.table, n));
          row[item.field] = parts.length > 1 ? checked((parts as number[]).reduce((s, v) => s + v, 0), n) : parts[0];
        }
      } else for (const position of [...matched].reverse()) rows.splice(position - 1, 1);
    }
    dbcnt = matched.length; subrc = dbcnt ? 0 : 4;
    memory["sy-subrc"] = subrc; memory["sy-dbcnt"] = dbcnt;
    const kind = n.kind === "dbinsert" ? "insert" : n.kind === "dbupdate" ? "update" : n.kind === "dbmodify" ? "modify" : "delete";
    pendingSql = { kind, table: n.table, matched, before, subrc, dbcnt, ...(n.kind === "dbmodify" ? { inserted } : {}) };
    const key = n.kind === "dbinsert" ? (subrc ? "sqlInsertDuplicate" : "sqlInsert") : n.kind === "dbmodify" ? "sqlModify" : n.kind === "dbupdate" ? (subrc ? "sqlUpdateNone" : "sqlUpdate") : (subrc ? "sqlDeleteNone" : "sqlDelete");
    emit(n, "sql", { key, name: n.table }, ["sy-subrc", "sy-dbcnt"]);
  }
  function compare(n: {left: Expr; op: string; right: Expr} & Node) {
    const a = get(n.left,n), b = get(n.right,n);
    return n.op === "=" ? a === b : n.op === "<>" ? a !== b : n.op === ">=" ? a >= b : n.op === "<=" ? a <= b : n.op === ">" ? a > b : a < b;
  }
  function run(list: Node[]): "exit" | "continue" | undefined {
    const skippedRange = (item: Node): Range => "endRange" in item ? sourceRange(source, item.range.start, item.endRange.end) : item.range;
    const propagate = (n: Node, control: "exit" | "continue") => {
      const event = events.findLast(e=>e.operation === "control");
      if (event) event.skippedRanges.push(...list.slice(list.indexOf(n)+1).map(skippedRange));
      return control;
    };
    for (const n of list) {
      if (++steps > RUNTIME_LIMITS.steps) error("limit", n, "steps");
      pendingLookup = undefined;
      if (n.kind === "define") {
        emit(n, "define", { key: "define", name: n.name });
      } else if (n.kind === "fieldSymbol") {
        aliases[n.name] = null;
        emit(n, "declare", {key:"fieldSymbol", name:n.name, type:n.type}, [n.name]);
      } else if (n.kind === "bind") {
        readRef(n.source, n);
        aliases[n.target] = n.source;
        emit(n, "bind", {key:"bind", name:n.target, value:n.source}, [n.target]);
      } else if (n.kind === "unbind") {
        aliases[n.target] = null;
        emit(n, "unbind", {key:"unbind", name:n.target}, [n.target]);
      } else if (n.kind === "data") {
        const v = n.type.startsWith("table:") ? [] : definitions[n.type]
          ? Object.fromEntries(
              Object.entries(definitions[n.type]).map(([k, t]) => [
                k,
                t === "i" ? 0 : "",
              ]),
            )
          : n.initial
            ? checked(get(n.initial, n), n)
            : n.type === "i"
              ? 0
              : "";
        memory[n.name] = v;
        emit(
          n,
          "declare",
          {
            key: Array.isArray(v) ? "table" : typeof v === "object" ? "structure" : "declare",
            name: n.name,
            type: n.type,
            value: typeof v === "object" ? undefined : v,
          },
          [n.name],
        );
      } else if (n.kind === "assign") {
        const raw = value(n.value, n);
        const v = typeof raw === "object" ? raw : checked(raw, n),
          target = resolve(n.target, n),
          [base, field] = target.split("-");
        if (field) (memory[base] as Record<string, Primitive>)[field] = v as Primitive;
        else memory[base] = v;
        emit(
          n,
          "assign",
          {
            key: n.value.kind === "add" ? "add" : typeof v === "object" ? "assignRow" : "assign",
            name: n.target,
            value: typeof v === "object" ? undefined : v,
          },
          Array.from(new Set([n.target, target])),
        );
      } else if (n.kind === "write") {
        const v = get(n.value, n);
        // This teaching simulator records each supported WRITE as one output line.
        // WRITE expression, WRITE / expression, and WRITE: / expression are equivalent.
        // ABAP list cursor positioning and comma-separated WRITE chains are unsupported.
        output.push(String(v));
        emit(n, "write", { key: "write", value: v }, ["output"]);
      } else if (n.kind === "append") {
        if (loopStack.some(context => context.table === n.table)) error("unsupported",n,"Changing an actively looped table is outside this subset");
        if (!Array.isArray(memory[n.table])) error("type", n);
        const rows = memory[n.table] as TableValue;
        if (rows.length >= RUNTIME_LIMITS.rows) error("limit", n, "rows");
        const appended = value(n.value, n);
        rows.push(structuredClone(appended));
        emit(n,"append",{ key:"append",name:n.table },[n.table]);
      } else if (n.kind === "insert" || n.kind === "modify" || n.kind === "delete" || n.kind === "sort") {
        if (loopStack.some(context => context.table === n.table)) error("unsupported",n,"Changing an actively looped table is outside this subset");
        const rows = memory[n.table] as TableValue;
        const before = structuredClone(rows);
        let index: number | undefined, applied = true;
        if (n.kind === "sort") {
          // Deterministic binary comparisons, without SAP locale-aware AS TEXT support.
          rows.sort((a,b) => {
            for (const item of n.fields) {
              const left = typeof a === "object" ? a[item.field] : a;
              const right = typeof b === "object" ? b[item.field] : b;
              const order = left < right ? -1 : left > right ? 1 : 0;
              if (order) return item.direction === "descending" ? -order : order;
            }
            return 0;
          });
        } else {
          index = get(n.index,n) as number;
          if (index <= 0) error("range",n,"Mutation INDEX must be positive");
          // Read the source before changing the table, even for an out-of-range index.
          const source = n.kind === "delete" ? undefined : value(n.value, n);
          applied = index <= rows.length + (n.kind === "insert" ? 1 : 0);
          if (applied) {
            if (n.kind === "insert") {
              if (rows.length >= RUNTIME_LIMITS.rows) error("limit",n,"rows");
              rows.splice(index-1,0,structuredClone(source as Primitive | StructureValue));
            } else if (n.kind === "modify") rows[index-1] = structuredClone(source as Primitive | StructureValue);
            else rows.splice(index-1,1);
          }
          subrc = applied ? 0 : 4;
          memory["sy-subrc"] = subrc;
        }
        const mutation: NonNullable<ExecutionEvent["mutation"]> = {table:n.table,kind:n.kind,applied,before,after:structuredClone(rows),...(index !== undefined ? {index} : {}),...(n.kind === "sort" ? {fields:n.fields} : {})};
        emit(n,n.kind,{key:n.kind === "sort" ? "sort" : applied ? `${n.kind}Found` : `${n.kind}Missing`,name:n.table},
          [...(applied ? [n.table] : []),...(n.kind === "sort" ? [] : ["sy-subrc"])],[],undefined,n.range,undefined,mutation);
      } else if (n.kind === "read") {
        const rows = memory[n.table] as TableValue;
        const keys = n.keys ? Object.fromEntries(n.keys.map(key => [key.field, get(key.value, n)])) : undefined;
        const requestedIndex = n.index ? get(n.index, n) as number : undefined;
        const located = keys ? locate(rows, keys, n.binary) : undefined;
        const index = requestedIndex !== undefined ? (requestedIndex > 0 && requestedIndex <= rows.length ? requestedIndex - 1 : -1) : located!.index;
        const found = index >= 0;
        // SAP: a failed BINARY SEARCH sets sy-subrc 4 and sy-tabix to the insert position, or 8 and lines + 1
        // when the key is beyond the last row. A failed linear read shows sy-tabix 0 here (model convention).
        subrc = found ? 0 : n.binary && located!.insertAt > rows.length ? 8 : 4;
        tabix = found ? index + 1 : n.binary ? located!.insertAt : 0;
        // INTO copies a row; misses intentionally preserve the prior work-area value.
        if (found) memory[n.into] = structuredClone(rows[index]);
        memory["sy-subrc"] = subrc;
        memory["sy-tabix"] = tabix;
        emit(n, "read", {key:found ? "readFound" : n.binary ? "readMissingBinary" : "readMissing", name:n.into},
          [...(found ? [n.into] : []), "sy-subrc", "sy-tabix"], [], undefined, n.range,
          {table:n.table, target:n.into, found, index:found ? tabix : 0, ...(keys ? {keys} : {}), ...(requestedIndex !== undefined ? {requestedIndex} : {}),
            ...(located ? {checked: located.checked} : {}), ...(n.binary ? {binary: true} : {}), subrc});
      } else if (n.kind === "select") {
        runSelect(n);
      } else if (n.kind === "dbinsert" || n.kind === "dbupdate" || n.kind === "dbmodify" || n.kind === "dbdelete") {
        runDbChange(n);
      } else if (n.kind === "try") {
        emit(n, "try", { key: "try" });
        let control: "exit" | "continue" | undefined;
        try {
          control = run(n.body);
        } catch (raised) {
          if (!(raised instanceof LineNotFound)) throw raised;
          // The statement that raised and every later statement in the TRY block are abandoned.
          const skipped = n.body.filter(item => item.range.start >= raised.node.range.start).map(skippedRange);
          emit(n, "catch", { key: "catch", name: raised.lookup.table }, [], skipped, undefined, n.catchRange, raised.lookup);
          const handled = run(n.handler);
          emit(n, "end", { key: "tryCaught" }, [], [], undefined, n.endRange);
          if (handled) return propagate(n, handled);
          continue;
        }
        if (control) return propagate(n, control);
        emit(n, "end", { key: "trySkipped" }, [], [n.catchRange, ...(n.handlerRange ? [n.handlerRange] : [])], undefined, n.endRange);
      } else if (n.kind === "control") {
        const rest = list.slice(list.indexOf(n) + 1);
        emit(n,"control",{key:n.action},[],rest.map(skippedRange));
        return n.action;
      } else if (n.kind === "do" || n.kind === "while" || n.kind === "loop") {
        const count = n.kind === "do" ? get(n.count,n) as number : undefined;
        const rows = n.kind === "loop" ? memory[n.table] : undefined;
        if (n.kind === "loop" && !Array.isArray(rows)) error("type",n);
        const initial = (type: string): Primitive | StructureValue => definitions[type] ? Object.fromEntries(Object.entries(definitions[type]).map(([key,t])=>[key,t === "i" ? 0 : ""])) : type === "i" ? 0 : "";
        if (n.kind === "loop" && n.inline) memory[n.into] = initial(types[n.into]);
        const savedTabix = tabix;
        let iteration = 0, candidate = 0, matched = 0;
        const context: NonNullable<ExecutionEvent["loop"]> = { kind:n.kind, iteration:0, count, range:n.range, ...(n.kind === "loop" ? {table:n.table} : {}) };
        loopStack.push(context);
        while (true) {
          const result = n.kind === "do" ? iteration < Math.max(0,count!) : n.kind === "while" ? compare(n) : candidate < (rows as TableValue).length;
          const expression = n.kind === "while" ? `${get(n.left,n)} ${n.op} ${get(n.right,n)}` : n.kind === "do" ? `${iteration+1} <= ${count}` : `${candidate+1} <= ${(rows as TableValue).length}`;
          if (!result) {
            delete context.row;
            delete context.index;
            emit(n,"loop",{key:"loopEnd"},[],[],{expression,result:false});
            break;
          }
          if (n.kind === "loop") {
            candidate++;
            const row = (rows as TableValue)[candidate-1];
            if (n.where) {
              const value = typeof row === "object" ? row[n.where.field] : row;
              const operand = get(n.where.value,n), op = n.where.op;
              const accepted = op === "=" ? value === operand : op === "<>" ? value !== operand : op === ">=" ? value >= operand : op === "<=" ? value <= operand : op === ">" ? value > operand : value < operand;
              delete context.row; delete context.index;
              emit(n,"condition",{key:"condition"},[],accepted ? [] : n.body.map(skippedRange),{expression:String(value)+" "+op+" "+String(operand),result:accepted},n.range,undefined,undefined,{table:n.table,index:candidate,field:n.where.field,value,operand,matched:accepted});
              if (!accepted) continue;
            }
            matched++; tabix = candidate;
          }
          if (iteration >= RUNTIME_LIMITS.iterations) error("limit",n,"iterations");
          context.iteration = ++iteration;
          if (n.kind === "loop") { context.index = candidate - 1; context.row = structuredClone((rows as TableValue)[candidate-1]); memory[n.into] = structuredClone(context.row); }
          emit(n,"loop",{key:"loop",name:n.kind === "loop" ? n.into : undefined},n.kind === "loop" ? [n.into] : [],[],{expression,result:true});
          const control = run(n.body);
          emit(n,"end",{key:"loopIteration"},[],[],undefined,n.endRange);
          if (control === "exit") break;
        }
        loopStack.pop();
        if (n.kind === "loop") {
          tabix = savedTabix; subrc = matched ? 0 : 4;
          emit(n,"end",{key:"end"},[],[],undefined,n.endRange);
        }
      } else {
        const branches = [{ left: n.left, op: n.op, right: n.right, body: n.yes, range: n.range, bodyRange: n.yesRange }, ...(n.elseifs || [])];
        let selected = -1;
        const skipped: Range[] = [];
        for (let index = 0; index < branches.length; index++) {
          const branch = branches[index];
          if (isPredicate(branch.op)) {
            const target = (branch.left as Extract<Expr, { kind: "lineExists" }>).target;
            const result = (get(branch.left, n) === 1) !== (branch.op === "!pred");
            if (!result && branch.bodyRange) skipped.push(branch.bodyRange);
            if (result) {
              selected = index;
              for (const later of branches.slice(index + 1)) { skipped.push(later.range); if (later.bodyRange) skipped.push(later.bodyRange); }
              if (n.noRange) skipped.push(n.noRange);
            }
            emit(n, "condition", { key: "condition" }, [], [...skipped], { expression: `${branch.op === "!pred" ? "NOT " : ""}line_exists( ${describe(target)} )`, result }, branch.range);
            if (result) { const control = run(branch.body); if (control) return propagate(n, control); break; }
            continue;
          }
          const a = get(branch.left, n),
            b = get(branch.right, n);
          const result =
            branch.op === "="
              ? a === b
              : branch.op === "<>"
                ? a !== b
                : branch.op === ">="
                  ? a >= b
                  : branch.op === "<="
                    ? a <= b
                    : branch.op === ">"
                      ? a > b
                      : a < b;
          if (!result && branch.bodyRange) skipped.push(branch.bodyRange);
          if (result) {
            selected = index;
            for (const later of branches.slice(index + 1)) {
              skipped.push(later.range);
              if (later.bodyRange) skipped.push(later.bodyRange);
            }
            if (n.noRange) skipped.push(n.noRange);
          }
          emit(n, "condition", { key: "condition" }, [], [...skipped], {
            expression: `${a} ${branch.op} ${b}`,
            result,
          }, branch.range);
          if (result) {
            const control = run(branch.body);
            if (control) return propagate(n,control);
            break;
          }
        }
        if (selected === -1) { const control = run(n.no); if (control) return propagate(n,control); }
        emit(
          n,
          "end",
          { key: skipped.length ? "endSkipped" : "end" },
          [],
          skipped,
          undefined,
          n.endRange,
        );
      }
    }
  }
  try {
    run(nodes);
  } catch (raised) {
    if (raised instanceof LineNotFound) throw new SimulationError("notfound", raised.node.range, raised.lookup.table);
    throw raised;
  }
  return events;
}
/** CX_SY_ITAB_LINE_NOT_FOUND raised by a table expression; caught by TRY or reported as a runtime error. */
class LineNotFound {
  constructor(public node: Node, public lookup: NonNullable<ExecutionEvent["lookup"]>) {}
}
export function simulate(source: string) {
  return execute(parse(source), source);
}
export type ChallengeFailure = { name: string; input: number; expected: string; actual: string };
export function evaluate(
  source: string,
  id: string,
): { correct: boolean; events: ExecutionEvent[]; failure?: ChallengeFailure } {
  const nodes = parse(source),
    events = execute(nodes, source),
    last = events.at(-1)!;
  let correct = false;
  let failure: ChallengeFailure | undefined;
  const sqlSpec = sqlChallengeSpecs[id];
  if (sqlSpec) {
    // ABAP SQL challenges: the learner's program and the reference solution run against the same changed
    // database contents and inputs; output and final database state must agree on every probe.
    const flatten = (list: Node[]): Node[] => list.flatMap(n => [n, ...("body" in n ? flatten(n.body) : []), ...(n.kind === "try" ? flatten(n.handler) : []), ...(n.kind === "if" ? [...flatten(n.yes), ...flatten(n.no), ...(n.elseifs || []).flatMap(b => flatten(b.body))] : [])]);
    const all = flatten(nodes);
    const shape = sqlSpec.requires(all) && !all.some(n => n.kind === "assign" && sqlSpec.inputs.includes(n.target));
    const runProbe = (code: string, probe: (typeof sqlSpec.probes)[number]) => {
      const tree = parse(code);
      for (const n of flatten(tree)) if (n.kind === "data" && probe.inputs && n.name in probe.inputs) n.initial = { kind: "literal", value: probe.inputs[n.name] };
      return execute(tree, code, { database: probe.database }).at(-1)!;
    };
    correct = shape && sqlSpec.probes.every((probe, index) => {
      const expected = runProbe(sqlSpec.solution, probe);
      try {
        const actual = runProbe(source, probe);
        const ok = actual.output.join("\n") === expected.output.join("\n") && JSON.stringify(actual.database) === JSON.stringify(expected.database);
        if (!ok) failure = { name: sqlSpec.inputs[0] ?? "database", input: index + 1, expected: expected.output.join("\n"), actual: actual.output.join("\n") };
        return ok;
      } catch (error) { if (!(error instanceof SimulationError)) throw error; return false; }
    });
  } else if (id === "data-manager-raise" || id === "data-manager-report") {
    // Behavioral capstone grading: every probe replaces the supplied employees, lv_id and lv_raise.
    const walk = (list:Node[]):Node[] => list.flatMap(n=>[n,...("body" in n ? walk(n.body) : []),...(n.kind === "try" ? walk(n.handler) : []),...(n.kind === "if" ? [...walk(n.yes),...walk(n.no),...(n.elseifs || []).flatMap(b=>walk(b.body))] : [])]);
    const all = walk(nodes), raise = id === "data-manager-raise";
    const shape = !all.some(n=>n.kind === "assign" && ["lv_id","lv_raise"].includes(n.target) || n.kind === "sort" || n.kind === "insert") &&
      all.filter(n=>n.kind === "append").length === 3 &&
      (raise ? all.some(n=>n.kind === "modify") && !all.some(n=>n.kind === "delete") : all.some(n=>n.kind === "delete") && all.some(n=>n.kind === "loop") && !all.some(n=>n.kind === "modify"));
    const probes: [number,number,number[],string[],number[]][] = [
      [102,500,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [101,1000,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [103,0,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [999,500,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [7,25,[5,6,7],["Ava","Ben","Chen"],[100,200,300]],
      [41,10,[40,41,41],["Eli","Faye","Gus"],[700,800,900]],
      [0,3,[9,8,0],["Hana","Ivo","Jin"],[1,2,3]],
    ];
    correct = shape && probes.every(([lookup,amount,ids,names,salaries])=>{
      const tree = structuredClone(nodes); const seen = {id:0,name:0,salary:0};
      for (const n of walk(tree)) {
        if(n.kind === "data" && n.name === "lv_id") n.initial={kind:"literal",value:lookup};
        if(n.kind === "data" && n.name === "lv_raise") n.initial={kind:"literal",value:amount};
        for (const [field,values] of [["id",ids],["name",names],["salary",salaries]] as const)
          if(n.kind === "assign" && n.target === `ls_employee-${field}` && n.value.kind === "literal" && seen[field]<3) n.value.value=values[seen[field]++];
      }
      if(seen.id!==3 || seen.name!==3 || seen.salary!==3) return false;
      try {
        const trace=execute(tree,source), final=trace.at(-1)!;
        const rows=ids.map((rowId,i)=>({id:rowId,name:names[i],salary:salaries[i]}));
        const position=rows.findIndex(r=>r.id===lookup); // first match, as line_index( ) returns
        let expected: string[]; const after = structuredClone(rows);
        if (raise) {
          if (position >= 0) { after[position].salary += amount; expected=[String(after[position].salary)]; } else expected=["Not found"];
        } else {
          if (position >= 0) after.splice(position,1);
          const total=after.reduce((sum,r)=>sum+r.salary,0);
          expected=[...(position >= 0 ? [] : ["Not found"]),...after.map(r=>r.name),String(after.length),String(total)];
          if (final.memory.lv_count !== after.length || final.memory.lv_total !== total) { failure={name:"lv_id",input:lookup,expected:expected.join("\n"),actual:final.output.join("\n")}; return false; }
        }
        const actual=final.output.join("\n");
        const ok=actual===expected.join("\n") && JSON.stringify(final.memory.lt_employees)===JSON.stringify(after);
        if(!ok) failure={name:"lv_id",input:lookup,expected:expected.join("\n"),actual};
        return ok;
      } catch(error) { if(!(error instanceof SimulationError)) throw error; return false; }
    });
  } else if (id === "data-performance-lookup") {
    // Probes change the number of stored IDs (DO count) and the searched ID; IDs are stored newest first.
    const walk = (list:Node[]):Node[] => list.flatMap(n=>[n,...("body" in n ? walk(n.body) : []),...(n.kind === "try" ? walk(n.handler) : []),...(n.kind === "if" ? [...walk(n.yes),...walk(n.no),...(n.elseifs || []).flatMap(b=>walk(b.body))] : [])]);
    const all = walk(nodes);
    const sorts = all.filter((n):n is Extract<Node,{kind:"sort"}>=>n.kind === "sort");
    const reads = all.filter((n):n is Extract<Node,{kind:"read"}>=>n.kind === "read");
    const shape = sorts.length === 1 && sorts[0].table === "lt_ids" && sorts[0].fields.length === 1 && sorts[0].fields[0].field === "table_line" && sorts[0].fields[0].direction === "ascending" &&
      reads.length === 1 && reads[0].binary === true && reads[0].table === "lt_ids" && reads[0].keys?.length === 1 && reads[0].keys[0].field === "table_line" && reads[0].keys[0].value.kind === "ref" && reads[0].keys[0].value.name === "lv_search" &&
      sorts[0].range.start < reads[0].range.start && all.filter(n=>n.kind === "do").length === 1 &&
      !all.some(n=>["delete","modify","loop","while","append"].includes(n.kind) || n.kind === "insert" && n.range.start > sorts[0].range.start || n.kind === "assign" && n.target === "lv_search");
    const probes: [number,number][] = [[16,101],[16,116],[16,108],[16,200],[16,50],[5,103],[1,101],[1,102],[32,117],[32,132],[0,101]];
    correct = shape && probes.every(([count,search])=>{
      const tree = structuredClone(nodes);
      for (const n of walk(tree)) {
        if(n.kind === "do" && n.count.kind === "literal") n.count={kind:"literal",value:count};
        if(n.kind === "data" && n.name === "lv_search") n.initial={kind:"literal",value:search};
      }
      try {
        const trace=execute(tree,source), final=trace.at(-1)!;
        const position = search > 100 && search <= 100 + count ? search - 100 : 0;
        const expected = position ? String(position) : "Not found", actual = final.output.join("\n");
        const read = trace.find(e=>e.operation === "read");
        const ok = actual === expected && JSON.stringify(final.memory.lt_ids) === JSON.stringify(Array.from({length:count},(_,i)=>101+i)) &&
          !!read?.lookup?.binary && read.lookup.checked!.length <= Math.ceil(Math.log2(count + 1)) + 1;
        if(!ok) failure={name:"lv_search",input:search,expected,actual};
        return ok;
      } catch(error) { if(!(error instanceof SimulationError)) throw error; return false; }
    });
  } else if (id === "data-expression-lookup") {
    // Walk statements (including TRY bodies/handlers) and every expression they contain.
    const walk = (list:Node[]):Node[] => list.flatMap(n=>[n,...("body" in n ? walk(n.body) : []),...(n.kind === "try" ? walk(n.handler) : []),...(n.kind === "if" ? [...walk(n.yes),...walk(n.no),...(n.elseifs || []).flatMap(b=>walk(b.body))] : [])]);
    const exprs = (e:Expr):Expr[] => [e,...(e.kind === "add" ? [...exprs(e.left),...exprs(e.right)] : e.kind === "lineIndex" || e.kind === "lineExists" ? exprs(e.target) : e.kind === "tableExpr" ? [...(e.index ? exprs(e.index) : []),...(e.keys || []).flatMap(k=>exprs(k.value)),...(e.fallback && e.fallback !== "optional" ? exprs(e.fallback.default) : [])] : [])];
    const nodeExprs = (n:Node):Expr[] => n.kind === "assign" || n.kind === "write" || n.kind === "append" ? exprs(n.value) : n.kind === "if" ? [n.left,n.right,...(n.elseifs || []).flatMap(b=>[b.left,b.right])].flatMap(exprs) : [];
    const byId = (e:Expr) => e.kind === "tableExpr" && e.table === "lt_employees" && !e.index && e.keys?.length === 1 && e.keys[0].field === "id" && e.keys[0].value.kind === "ref" && e.keys[0].value.name === "lv_id";
    const all = walk(nodes), tries = all.filter((n):n is Extract<Node,{kind:"try"}>=>n.kind === "try");
    const shape = tries.length >= 1 && tries.some(tr=>walk(tr.body).some(n=>nodeExprs(n).some(e=>byId(e) && e.kind === "tableExpr" && !e.fallback))) &&
      all.some(n=>n.kind === "assign" && n.target === "lv_position" && n.value.kind === "lineIndex" && byId(n.value.target)) &&
      !all.some(n=>["read","loop","do","while","insert","modify","delete","sort"].includes(n.kind) || n.kind === "assign" && ["lv_id","lv_position"].includes(n.target) && !(n.target === "lv_position" && n.value.kind === "lineIndex"));
    const probes: [number,number[],string[],number[]][] = [
      [102,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [101,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [999,[101,102,103],["Ahmed","Sara","Omar"],[5000,8000,6000]],
      [7,[5,6,7],["Ava","Ben","Chen"],[1,2,3]],
      [42,[40,41,43],["Eli","Faye","Gus"],[700,800,900]],
      [0,[0,9,8],["Hana","Ivo","Jin"],[10,0,30]],
    ];
    correct = !!shape && probes.every(([lookup,ids,names,salaries])=>{
      const tree = structuredClone(nodes); const seen = {id:0,name:0,salary:0};
      for (const n of walk(tree)) {
        if(n.kind === "data" && n.name === "lv_id") n.initial={kind:"literal",value:lookup};
        for (const [field,values] of [["id",ids],["name",names],["salary",salaries]] as const)
          if(n.kind === "assign" && n.target === `ls_employee-${field}` && n.value.kind === "literal" && seen[field]<3) n.value.value=values[seen[field]++];
      }
      if(seen.id!==3 || seen.name!==3 || seen.salary!==3) return false;
      try {
        const trace=execute(tree,source), final=trace.at(-1)!;
        const rows=ids.map((rowId,i)=>({id:rowId,name:names[i],salary:salaries[i]})), position=rows.findIndex(r=>r.id===lookup)+1;
        const expected=(position ? [names[position-1],String(salaries[position-1])] : ["Not found"]).concat(String(position)).join("\n"), actual=final.output.join("\n");
        const ok=actual===expected && JSON.stringify(final.memory.lt_employees)===JSON.stringify(rows) && final.memory.lv_position===position &&
          trace.some(e=>e.lookup?.via === "expression" && !e.lookup.fallback && e.lookup.keys?.id === lookup && e.lookup.found === !!position) &&
          (position > 0 || trace.some(e=>e.operation === "catch"));
        if(!ok) failure={name:"lv_id",input:lookup,expected,actual};
        return ok;
      } catch(error) { if(!(error instanceof SimulationError)) throw error; return false; }
    });
  } else if (id === "data-conditional-report") {
    const walk = (list:Node[]):Node[] => list.flatMap(n=>[n,...("body" in n ? walk(n.body) : n.kind === "if" ? [...walk(n.yes),...walk(n.no),...(n.elseifs || []).flatMap(b=>walk(b.body))] : [])]);
    const all = walk(nodes), loops = all.filter((n):n is Extract<Node,{kind:"loop"}>=>n.kind === "loop");
    const loop = loops[0];
    const shape = loops.length === 1 && loop.table === "lt_employees" && loop.into === "ls_employee" && loop.where?.field === "salary" && loop.where.op === ">=" && loop.where.value.kind === "ref" && loop.where.value.name === "lv_min_salary" &&
      !all.some(n=>["delete","modify","insert","sort"].includes(n.kind) || n.kind === "assign" && n.target === "lv_min_salary");
    const probes: [number,number[],string[]][] = [[6000,[5000,8000,6000],["Ahmed","Sara","Omar"]],[8000,[5000,8000,6000],["Ahmed","Sara","Omar"]],[9000,[5000,8000,6000],["Ahmed","Sara","Omar"]],[0,[0,1,0],["Ava","Ben","Chen"]],[7500,[9000,7000,7500],["Eli","Faye","Gus"]],[10000,[2,3,4],["Hana","Ivo","Jin"]]];
    correct = !!shape && probes.every(([minimum,salaries,names])=>{
      const tree = structuredClone(nodes); let salaryIndex = 0, nameIndex = 0;
      for (const n of walk(tree)) {
        if(n.kind === "data" && n.name === "lv_min_salary") n.initial={kind:"literal",value:minimum};
        if(n.kind === "assign" && n.target === "ls_employee-salary" && n.value.kind === "literal" && salaryIndex<3) n.value.value=salaries[salaryIndex++];
        if(n.kind === "assign" && n.target === "ls_employee-name" && n.value.kind === "literal" && nameIndex<3) n.value.value=names[nameIndex++];
      }
      if(salaryIndex!==3 || nameIndex!==3) return false;
      try {
        const trace=execute(tree,source), final=trace.at(-1)!;
        const rows=salaries.map((salary,i)=>({id:101+i,name:names[i],salary})), selected=rows.filter(r=>r.salary>=minimum);
        const total=selected.reduce((sum,r)=>sum+r.salary,0);
        const writes=trace.filter(e=>e.operation === "write");
        const actual=final.output.join("\n"), expected=[...selected.map(r=>r.name),String(selected.length),String(total)].join("\n");
        const ok=actual===expected && JSON.stringify(final.memory.lt_employees)===JSON.stringify(rows) && final.memory.lv_count===selected.length && final.memory.lv_total===total &&
          trace.filter(e=>e.filter?.matched).length===selected.length && writes.length===selected.length+2 &&
          writes.slice(0,selected.length).every(e=>e.statement.includes("ls_employee-name"));
        if(!ok) failure={name:"lv_min_salary",input:minimum,expected,actual};
        return ok;
      } catch(error) { if(!(error instanceof SimulationError)) throw error; return false; }
    });
  } else if (id === "addition") {
    const data = nodes.filter(
      (n): n is Extract<Node, { kind: "data" }> => n.kind === "data",
    );
    const numbers = data.filter(
      (n) =>
        n.type === "i" &&
        n.initial?.kind === "literal" &&
        typeof n.initial.value === "number",
    );
    if (
      numbers.length === 2 &&
      numbers.some(
        (n) => n.initial?.kind === "literal" && n.initial.value === 10,
      ) &&
      numbers.some(
        (n) => n.initial?.kind === "literal" && n.initial.value === 20,
      ) &&
      data.length >= 3 &&
      last.output.join("\n") === "30"
    ) {
      const probe = structuredClone(nodes);
      let k = 0;
      for (const n of probe)
        if (n.kind === "data" && numbers.some((d) => d.name === n.name))
          n.initial = { kind: "literal", value: [7, 16][k++] };
      correct =
        execute(probe, source).at(-1)?.output.join("\n") === "23" &&
        nodes.some((n) => n.kind === "assign" && n.value.kind === "add");
    }
  } else if (id === "data-mutation-workflow" || id === "data-sort-report") {
    const walk = (list: Node[]): Node[] => list.flatMap(n => n.kind === "if" ? [n, ...walk(n.yes), ...walk(n.no), ...(n.elseifs || []).flatMap(branch => walk(branch.body))] : "body" in n ? [n, ...walk(n.body)] : [n]);
    const all = walk(nodes);
    const rowsEqual = (value: MemoryValue | undefined, expected: StructureValue[]) => Array.isArray(value) && value.length === expected.length && value.every((row,index) => typeof row === "object" && Object.keys(row).length === Object.keys(expected[index]).length && Object.entries(expected[index]).every(([key,item]) => row[key] === item));
    const writesFromRows = all.some(n => n.kind === "loop" && n.table === "lt_employees" && n.into === "ls_employee" && walk(n.body).some(item => item.kind === "write" && item.value.kind === "ref" && item.value.name === "ls_employee-name"));
    const runProbe = (tree: Node[], grade: (trace: ExecutionEvent[]) => boolean) => {
      try { return grade(execute(tree,source)); }
      catch (error) { if (!(error instanceof SimulationError)) throw error; return false; }
    };
    if (id === "data-mutation-workflow") {
      const inputs: Record<string,Primitive> = {lv_insert_id:102,lv_insert_name:"Sara",lv_new_name:"Sarah"};
      const inputDeclarations = Object.entries(inputs).every(([name,value]) => nodes.some(n => n.kind === "data" && n.name === name && n.initial?.kind === "literal" && n.initial.value === value));
      const untouchedInputs = !all.some(n => n.kind === "assign" && n.target in inputs);
      const probe = (insertId:number, insertName:string, replacement:string, seedIds:number[], seedNames:string[]) => {
        const tree = structuredClone(nodes);
        for (const n of walk(tree)) {
          if (n.kind === "data" && n.name in inputs) n.initial = {kind:"literal",value:n.name === "lv_insert_id" ? insertId : n.name === "lv_insert_name" ? insertName : replacement};
          if (n.kind === "assign" && n.value.kind === "literal") {
            if (n.target === "ls_employee-id" && [101,103].includes(Number(n.value.value))) n.value.value = seedIds[Number(n.value.value) === 101 ? 0 : 1];
            if (n.target === "ls_employee-name" && ["Ahmed","Omar"].includes(String(n.value.value))) n.value.value = seedNames[n.value.value === "Ahmed" ? 0 : 1];
          }
        }
        return runProbe(tree,trace => {
          const mutations = trace.filter(event => event.mutation).map(event => event.mutation!);
          const initial = [{id:seedIds[0],name:seedNames[0]},{id:seedIds[1],name:seedNames[1]}];
          const inserted = [initial[0],{id:insertId,name:insertName},initial[1]];
          const modified = [initial[0],{id:insertId,name:replacement},initial[1]];
          const final = modified.slice(1);
          const writes = trace.filter(event => event.operation === "write");
          return mutations.length === 3 && mutations.every(item => item.table === "lt_employees" && item.applied) &&
            mutations[0].kind === "insert" && mutations[0].index === 2 && rowsEqual(mutations[0].before,initial) && rowsEqual(mutations[0].after,inserted) &&
            mutations[1].kind === "modify" && mutations[1].index === 2 && rowsEqual(mutations[1].before,inserted) && rowsEqual(mutations[1].after,modified) &&
            mutations[2].kind === "delete" && mutations[2].index === 1 && rowsEqual(mutations[2].before,modified) && rowsEqual(mutations[2].after,final) &&
            trace.filter(event => event.operation === "append").length === 2 && rowsEqual(trace.at(-1)!.memory.lt_employees,final) &&
            trace.at(-1)!.output.join("\n") === `${replacement}\n${seedNames[1]}` && writes.length === 2 && writes.every(event => event.tableSelection?.name === "lt_employees");
        });
      };
      correct = inputDeclarations && untouchedInputs && writesFromRows &&
        probe(102,"Sara","Sarah",[101,103],["Ahmed","Omar"]) &&
        probe(212,"Lina","Lina revised",[211,213],["Ali","Huda"]) &&
        probe(302,"Reem","Reem corrected",[301,303],["Noura","Maha"]);
    } else {
      const input = nodes.find(n => n.kind === "data" && n.name === "lv_min_salary" && n.initial?.kind === "literal" && n.initial.value === 6000);
      const sort = all.find(n => n.kind === "sort" && n.table === "lt_employees" && n.fields.length === 1 && n.fields[0].field === "salary" && n.fields[0].direction === "descending");
      const probe = (salaries:number[], minimum:number, names:string[], ids:number[]) => {
        const tree = structuredClone(nodes);
        let salaryIndex = 0;
        for (const n of walk(tree)) {
          if (n.kind === "data" && n.name === "lv_min_salary") n.initial = {kind:"literal",value:minimum};
          if (n.kind === "assign" && n.value.kind === "literal") {
            if (n.target === "ls_employee-salary") n.value.value = salaries[salaryIndex++ % salaries.length];
            if (n.target === "ls_employee-name" && ["Ahmed","Sara","Omar"].includes(String(n.value.value))) n.value.value = names[["Ahmed","Sara","Omar"].indexOf(String(n.value.value))];
            if (n.target === "ls_employee-id" && [101,102,103].includes(Number(n.value.value))) n.value.value = ids[Number(n.value.value)-101];
          }
        }
        const sorted = salaries.map((salary,index) => ({id:ids[index],name:names[index],salary})).sort((a,b) => b.salary-a.salary);
        return runProbe(tree,trace => {
          const sorts = trace.filter(event => event.operation === "sort");
          const expected = sorted.filter(row => row.salary >= minimum).map(row => row.name).join("\n");
          const writes = trace.filter(event => event.operation === "write");
          return sorts.length === 1 && rowsEqual(sorts[0].mutation!.after,sorted) &&
            trace.filter(event => event.operation === "append").length === 3 && trace.filter(event => event.mutation).length === 1 &&
            trace.slice(sorts[0].id).every(event => rowsEqual(event.memory.lt_employees,sorted)) &&
            trace.at(-1)!.output.join("\n") === expected && writes.every(event => event.tableSelection?.name === "lt_employees");
        });
      };
      correct = !!input && !!sort && writesFromRows && !all.some(n => n.kind === "assign" && n.target === "lv_min_salary") &&
        [0,5000,6000,8000,9000].every(minimum => probe([5000,8000,6000],minimum,["Ahmed","Sara","Omar"],[101,102,103])) &&
        probe([9500,2500,7000],7000,["Lina","Reem","Huda"],[211,212,213]) &&
        probe([4000,10000,2000],4000,["Maha","Ali","Noura"],[301,302,303]);
    }
  } else if (id === "data-read-lookup") {
    const walk = (list: Node[]): Node[] => list.flatMap(n => n.kind === "if" ? [n, ...walk(n.yes), ...walk(n.no), ...(n.elseifs || []).flatMap(b => walk(b.body))] : "body" in n ? [n, ...walk(n.body)] : [n]);
    const all = walk(nodes);
    const query = nodes.find(n => n.kind === "data" && n.name === "lv_id" && n.type === "i" && n.initial?.kind === "literal" && n.initial.value === 102);
    const read = all.find(n => n.kind === "read" && n.table === "lt_employees" && n.into === "ls_employee" && n.keys?.length === 1 && n.keys[0].field === "id" && n.keys[0].value.kind === "ref" && n.keys[0].value.name === "lv_id");
    const grade = (tree: Node[], imported: StructureValue[], key: number) => {
      try {
        const trace = execute(tree, source), end = trace.at(-1)!;
        const foundIndex = imported.findIndex(row => row.id === key);
        const expected = foundIndex >= 0 ? String(imported[foundIndex].name) : "Not found";
        const actual = end.output.join("\n");
        if (actual !== expected) failure = {name:"lv_id", input:key, expected, actual};
        const reads = trace.filter(event => event.operation === "read");
        const lookup = reads[0]?.lookup;
        const sameRows = (value: MemoryValue | undefined) => Array.isArray(value) && value.length === imported.length && value.every((row,index) => typeof row === "object" && row.id === imported[index].id && row.name === imported[index].name);
        return actual === expected && reads.length === 1 && lookup?.table === "lt_employees" && lookup.target === "ls_employee" && lookup.found === (foundIndex >= 0) && lookup.index === foundIndex + 1 &&
          trace.filter(event => event.operation === "append").length === 2 &&
          trace.slice(reads[0].id).every(event => sameRows(event.memory.lt_employees)) &&
          end.memory["sy-subrc"] === (foundIndex >= 0 ? 0 : 4);
      } catch (error) {
        if (!(error instanceof SimulationError)) throw error;
        failure = {name:"lv_id", input:key, expected:"safe lookup", actual:error.code};
        return false;
      }
    };
    const imported = [{id:101,name:"Ahmed"}, {id:102,name:"Sara"}];
    if (query && read && !all.some(n => n.kind === "assign" && n.target === "lv_id") && grade(nodes, imported, 102)) {
      correct = [101,102,999,0].every(key => {
        const tree = structuredClone(nodes);
        const input = tree.find(n => n.kind === "data" && n.name === "lv_id") as Extract<Node,{kind:"data"}>;
        input.initial = {kind:"literal",value:key};
        return grade(tree, imported, key);
      });
      // Vary identities and names together to reject key constants and memorized outputs.
      for (const key of [211,212,999]) {
        const tree = structuredClone(nodes);
        for (const node of walk(tree)) {
          if (node.kind === "data" && node.name === "lv_id") node.initial = {kind:"literal",value:key};
          if (node.kind === "assign" && node.value.kind === "literal") {
            if (node.target === "ls_employee-id" && [101,102].includes(Number(node.value.value))) node.value.value = Number(node.value.value) + 110;
            if (node.target === "ls_employee-name" && ["Ahmed","Sara"].includes(String(node.value.value))) node.value.value = node.value.value === "Ahmed" ? "Omar" : "Lina";
          }
        }
        correct = grade(tree, [{id:211,name:"Omar"},{id:212,name:"Lina"}], key) && correct;
      }
    }
  } else if (id === "data-work-area-record") {
    const grade = (tree: Node[], employeeId:number, name:string, salary:number) => {
      const end = execute(tree,source).at(-1)!;
      const record = end.memory.ls_employee;
      return record && typeof record === "object" && !Array.isArray(record) && record.id === employeeId && record.name === name && record.salary === salary && end.output.join("\n") === name;
    };
    if (grade(nodes,202,"Maha",6000)) {
      const tree = structuredClone(nodes);
      for (const node of tree) if (node.kind === "assign" && node.value.kind === "literal") {
        if (node.target === "ls_employee-id") node.value.value = 303;
        if (node.target === "ls_employee-name") node.value.value = "Reem";
        if (node.target === "ls_employee-salary") node.value.value = 7200;
      }
      correct = !!grade(tree,303,"Reem",7200);
    }
  } else if (id === "data-field-symbol-alias") {
    const grade = (tree:Node[], replacement:string, original:string) => {
      const trace = execute(tree,source), end = trace.at(-1)!;
      const rows = end.memory.lt_employees;
      const writes = trace.filter(event => event.operation === "write");
      const live = writes[0]?.memory.ls_employee;
      return Array.isArray(rows) && rows.length === 1 && typeof rows[0] === "object" && rows[0].id === 101 && rows[0].name === original &&
        live && typeof live === "object" && !Array.isArray(live) && live.id === 101 && live.name === replacement &&
        end.output.join("\n") === `${replacement}\n${original}` &&
        trace.some(event => event.operation === "bind" && event.aliases?.["<employee>"] === "ls_employee") &&
        trace.some(event => event.operation === "assign" && event.changed.includes("<employee>-name") && event.changed.includes("ls_employee-name")) &&
        writes[1]?.tableSelection?.name === "lt_employees";
    };
    if (grade(nodes,"Sara","Ahmed")) {
      correct = [["Lina","Omar"],["Huda","Ali"]].every(([replacement,original]) => {
        const tree = structuredClone(nodes);
        for (const node of tree) {
          if (node.kind === "data" && node.name === "lv_new_name") node.initial = {kind:"literal",value:replacement};
          if (node.kind === "assign" && node.target === "ls_employee-name" && node.value.kind === "literal" && node.value.value === "Ahmed") node.value.value = original;
        }
        return !!grade(tree,replacement,original);
      });
    }
  } else if (id === "data-key-matches") {
    const rows: StructureValue[] = [
      { department: "IT", id: 101, name: "Ahmed" },
      { department: "HR", id: 101, name: "Sara" },
      { department: "IT", id: 102, name: "Omar" },
      { department: "IT", id: 101, name: "Noura" },
    ];
    const grade = (tree: Node[], imported: StructureValue[], department: string, key: number) => {
      const trace = execute(tree, source);
      const end = trace.at(-1)!;
      const matches = imported.filter(row => row.department === department && row.id === key);
      return JSON.stringify(end.memory.lt_employees) === JSON.stringify(imported) &&
        end.memory.lv_matches === matches.length &&
        end.output.join("\n") === [...matches.map(row => row.name), matches.length].join("\n") &&
        trace.filter(event => event.operation === "write" && event.tableSelection?.name === "lt_employees").length === matches.length;
    };
    const query = nodes.filter((n): n is Extract<Node, { kind: "data" }> => n.kind === "data" && ["lv_department", "lv_id"].includes(n.name));
    if (query.length === 2 && query.every(n => n.initial?.kind === "literal") &&
        nodes.some(n => n.kind === "loop" && n.table === "lt_employees") && grade(nodes, rows, "IT", 101)) {
      correct = [["IT", 101], ["HR", 101], ["IT", 102], ["HR", 102], ["IT", 999]].every(([department, key]) => {
        const tree = structuredClone(nodes);
        for (const node of tree) if (node.kind === "data") {
          if (node.name === "lv_department") node.initial = { kind: "literal", value: department };
          if (node.name === "lv_id") node.initial = { kind: "literal", value: key };
        }
        return grade(tree, rows, String(department), Number(key));
      });
      // Change both input identities and names, so fixed conditions/output cannot satisfy the exercise.
      const tree = structuredClone(nodes);
      const changed = rows.map(row => ({ department: row.department === "IT" ? "Ops" : "Finance", id: Number(row.id) + 10, name: `${row.name} revised` }));
      for (const node of tree) {
        if (node.kind === "data" && node.name === "lv_department") node.initial = { kind: "literal", value: "Ops" };
        if (node.kind === "data" && node.name === "lv_id") node.initial = { kind: "literal", value: 111 };
        if (node.kind === "assign" && node.value.kind === "literal") {
          if (node.target === "ls_employee-department") node.value.value = node.value.value === "IT" ? "Ops" : "Finance";
          if (node.target === "ls_employee-id") node.value.value = Number(node.value.value) + 10;
          if (node.target === "ls_employee-name") node.value.value = `${node.value.value} revised`;
        }
      }
      correct = correct && grade(tree, changed, "Ops", 111);
    }
  } else if (id === "data-category-sequence") {
    const entries = nodes.filter((n): n is Extract<Node,{kind:"append"}> => n.kind === "append" && n.table === "lt_ids");
    const grade = (tree: Node[], values: number[]) => {
      const trace = execute(tree, source);
      const end = trace.at(-1)!;
      return JSON.stringify(end.memory.lt_ids) === JSON.stringify(values) && end.output.join("\n") === values.join("\n") && trace.filter(e => e.operation === "append").length === 3;
    };
    if (entries.length === 3 && entries.every(n => n.value.kind === "literal") && nodes.some(n => n.kind === "loop" && n.table === "lt_ids" && n.body.some(s => s.kind === "write" && s.value.kind === "ref")) && grade(nodes,[30,10,30])) {
      correct = [[7,-2,7],[12,4,9]].every(values => {
        const tree = structuredClone(nodes);
        tree.filter((n): n is Extract<Node,{kind:"append"}> => n.kind === "append" && n.table === "lt_ids").forEach((n,i) => n.value = {kind:"literal",value:values[i]});
        return grade(tree,values);
      });
    }
  } else if (id === "data-table-copies") {
    // Check actual row copies and their use, then vary the source name so literal output cannot pass.
    const grade = (tree: Node[], name: string) => {
      const trace = execute(tree, source);
      const end = trace.at(-1)!;
      const rows = end.memory.lt_products;
      const appends = trace.filter(e => e.operation === "append");
      return Array.isArray(rows) && rows.length === 2 && rows.every(row => typeof row === "object" && row.id === 501 && row.name === name) &&
        appends.length === 2 && end.output.join("\n") === `${name}\n${name}` &&
        trace.some(e => {
          const area = e.memory.ls_product;
          return area && typeof area === "object" && !Array.isArray(area) && area.name === "Mouse" && Array.isArray(e.memory.lt_products) && e.memory.lt_products.length === 2;
        });
    };
    const assignments = nodes.filter((n): n is Extract<Node, {kind:"assign"}> => n.kind === "assign" && n.target === "ls_product-name");
    if (assignments.length === 2 && assignments[0].value.kind === "literal" && assignments[0].value.value === "Keyboard" &&
        assignments[1].value.kind === "literal" && assignments[1].value.value === "Mouse" &&
        nodes.some(n => n.kind === "loop" && n.table === "lt_products" && n.body.some(s => s.kind === "write" && s.value.kind === "ref")) && grade(nodes, "Keyboard")) {
      correct = ["Screen", "Cable"].every(name => {
        const tree = structuredClone(nodes);
        const input = tree.find((n): n is Extract<Node, {kind:"assign"}> => n.kind === "assign" && n.target === "ls_product-name")!;
        input.value = {kind:"literal", value:name};
        return grade(tree, name);
      });
    }
  } else if (id.startsWith("conditions-")) {
    const specs: Record<string, { input: string; initial: number; probes: number[]; expected: (value: number) => string; elseif?: boolean }> = {
      "conditions-positive": { input: "lv_number", initial: 4, probes: [-8, -1, 0, 1, 4, 19], expected: v => v > 0 ? "Positive" : "Not positive" },
      "conditions-bonus": { input: "lv_sales", initial: 6000, probes: [0, 4999, 5000, 5001, 6000, 9000], expected: v => v >= 5000 ? "Bonus" : "No bonus" },
      "conditions-ranges": { input: "lv_score", initial: 75, probes: [-1, 0, 49, 50, 75, 79, 80, 100], expected: v => v >= 80 ? "High" : v >= 50 ? "Medium" : "Low", elseif: true },
    };
    const spec = specs[id];
    const walk = (list: Node[]): Node[] => list.flatMap(n => n.kind === "if" ? [n, ...walk(n.yes), ...walk(n.no), ...(n.elseifs || []).flatMap(b => walk(b.body))] : [n]);
    const all = walk(nodes);
    const declaration = spec && nodes.find(n => n.kind === "data" && n.name === spec.input && n.type === "i" && n.initial?.kind === "literal" && n.initial.value === spec.initial);
    if (spec && declaration && all.some(n => n.kind === "if" && (!spec.elseif || n.elseifs?.length)) && !all.some(n => n.kind === "assign" && n.target === spec.input)) {
      correct = spec.probes.every(value => {
        const probe = structuredClone(nodes);
        const input = probe.find(n => n.kind === "data" && n.name === spec.input)! as Extract<Node, { kind: "data" }>;
        input.initial = { kind: "literal", value };
        const actual = execute(probe, source).at(-1)?.output.join("\n") || "";
        const expected = spec.expected(value);
        if (actual !== expected) failure = { name: spec.input, input: value, expected, actual };
        return actual === expected;
      });
    }
  } else if (["do-sequence", "do-total", "while-sequence", "while-debug", "tables-append", "tables", "tables-structured", "loop-at-total", "loop-at", "loop-at-employees", "loop-control-skip", "loop-control-exit", "employees", "employees-build", "employees-report"].includes(id)) {
    const walk = (list: Node[]): Node[] => list.flatMap(n => n.kind === "if" ? [n, ...walk(n.yes), ...walk(n.no), ...(n.elseifs || []).flatMap(b => walk(b.body))] : "body" in n ? [n, ...walk(n.body)] : [n]);
    const all = walk(nodes);
    const output = (tree: Node[]) => execute(tree, source).at(-1)?.output.join("\n") || "";
    const sequence = (count: number) => Array.from({length:count}, (_,i)=>String(i+1)).join("\n");
    const probe = (tree: Node[], expected: string, input: number, name: string) => {
      try {
        const actual = output(tree);
        if (actual !== expected) failure = {name,input,expected,actual};
        return actual === expected;
      } catch (error) {
        if (!(error instanceof SimulationError)) throw error;
        failure = {name,input,expected,actual:error.code}; return false;
      }
    };
    const kind = id.startsWith("do-") ? "do" : id.startsWith("while-") ? "while" : undefined;
    if (kind) {
      const loop = all.find(n => n.kind === kind);
      const target = id === "do-sequence" ? 10 : id === "while-sequence" ? 8 : 5;
      const total = id === "do-total";
      const expected = total ? "15" : sequence(target);
      // Require one actual loop whose iterations produce the values; then vary its bound.
      if (loop && (loop.kind === "do" || loop.kind === "while") && output(nodes) === expected &&
          events.filter(e => e.operation === "loop" && e.condition?.result).length === target &&
          all.some(n => n.kind === "write" && n.value.kind !== "literal")) {
        correct = [2, 4, 7].every(bound => {
          const tree = structuredClone(nodes), candidate = walk(tree).find(n => n.kind === kind)!;
          if (candidate.kind === "do") {
            if (candidate.count.kind === "literal") candidate.count.value = bound;
            else if (candidate.count.kind === "ref") {
              const name = candidate.count.name;
              const declaration = tree.find(n => n.kind === "data" && n.name === name);
              if (!declaration || declaration.kind !== "data") return false;
              declaration.initial = {kind:"literal",value:bound};
            } else return false;
          } else if (candidate.kind === "while") {
            if (candidate.right.kind !== "literal" || typeof candidate.right.value !== "number" || !["<", "<="].includes(candidate.op)) return false;
            candidate.right.value = candidate.op === "<=" ? bound : bound + 1;
          }
          return probe(tree,total ? String(bound*(bound+1)/2) : sequence(bound),bound,"loop bound");
        });
      }
    } else if (id === "loop-control-skip" || id === "loop-control-exit") {
      const action = id.endsWith("skip") ? "continue" : "exit";
      const expected = action === "continue" ? "1\n2\n4\n5" : "1\n2\n3";
      const control = all.find(n => n.kind === "control" && n.action === action);
      const condition = all.find(n => n.kind === "if" && walk(n.yes).some(s => s.kind === "control" && s.action === action));
      const loop = all.find(n => n.kind === "do" || n.kind === "while");
      if (control && condition?.kind === "if" && loop && output(nodes) === expected) {
        correct = [2,4].every(stop => {
          const tree = structuredClone(nodes);
          const branch = walk(tree).find(n => n.kind === "if" && walk(n.yes).some(s=>s.kind === "control" && s.action === action));
          if (!branch || branch.kind !== "if" || branch.right.kind !== "literal" || typeof branch.right.value !== "number") return false;
          branch.right.value = stop;
          const values = action === "continue" ? [1,2,3,4,5].filter(v=>v!==stop) : Array.from({length:stop-1},(_,i)=>i+1);
          return probe(tree,values.join("\n"),stop,action === "continue" ? "skipped value" : "stop value");
        });
      }
    } else {
      const structured = ["tables-structured", "loop-at-employees", "employees", "employees-build", "employees-report"].includes(id);
      const table = nodes.find(n => n.kind === "data" && n.type.startsWith("table:") && (structured ? n.type !== "table:i" && n.type !== "table:string" : n.type === "table:i"));
      if (table?.kind === "data") {
        const tableName = table.name;
        const rows = last.memory[tableName];
        const appends = all.filter((n): n is Extract<Node,{kind:"append"}> => n.kind === "append" && n.table === tableName);
        const loops = all.filter((n): n is Extract<Node,{kind:"loop"}> => n.kind === "loop" && n.table === tableName);
        if (!structured && Array.isArray(rows) && JSON.stringify(rows) === "[10,20,30]" && appends.length === 3) {
          if (id === "tables-append" || id === "tables") {
            if (output(nodes) === "Ready") {
              const tree=structuredClone(nodes);
              const entries=walk(tree).filter((n): n is Extract<Node,{kind:"append"}>=>n.kind === "append" && n.table === tableName);
              entries[2].value={kind:"literal",value:47};
              const changed = execute(tree,source).at(-1)!.memory[tableName];
              correct=JSON.stringify(changed) === "[10,20,47]";
            }
          }
          else if (loops.length && output(nodes) === "60") {
            correct = [[7,11,23],[-3,4,9]].every(values => {
              const tree = structuredClone(nodes);
              const entries = walk(tree).filter((n): n is Extract<Node,{kind:"append"}> => n.kind === "append" && n.table === tableName);
              if (!entries.every(n=>n.value.kind === "literal")) return false;
              entries.forEach((n,i)=>n.value={kind:"literal",value:values[i]});
              return probe(tree,String(values.reduce((a,b)=>a+b,0)),values[0],tableName);
            });
          }
        } else if (structured && Array.isArray(rows) && appends.length >= 2 && (loops.length || id === "tables-structured" || id === "employees-build")) {
          if (id === "employees-build") {
            correct = output(nodes) === "Ready" && rows.length === 3 && appends.length === 3 && rows.every((row,i)=>typeof row === "object" && row.id === [101,102,103][i] && row.name === ["Ahmed","Sara","Omar"][i] && row.salary === [5000,7000,4000][i]);
          } else if (id === "employees" || id === "employees-report") {
            const eligible = rows.filter((row): row is StructureValue => typeof row === "object" && typeof row.salary === "number" && row.salary >= 5000);
            const expected = [...eligible.map(row=>String(row.name)),String(eligible.reduce((sum,row)=>sum+Number(row.salary),0))].join("\n");
            const base = rows.length === 3 && rows.every((row,i)=> typeof row === "object" && row.id === [101,102,103][i] && row.name === ["Ahmed","Sara","Omar"][i] && row.salary === [5000,7000,4000][i]) && eligible.length === 2;
            if (base && output(nodes) === expected && all.some(n=>n.kind === "if") && all.some(n=>n.kind === "assign" && n.value.kind === "add")) {
              correct = [[3000,8000,6000],[5500,1000,5100]].every(salaries=> {
                const tree=structuredClone(nodes);
                const assignments = walk(tree).filter((n): n is Extract<Node,{kind:"assign"}> => n.kind === "assign" && n.target.endsWith("-salary") && n.value.kind === "literal");
                if(assignments.length !== 3) return false;
                assignments.forEach((n,i)=>n.value={kind:"literal",value:salaries[i]});
                const selected = salaries.map((salary,i)=>({salary,row:rows[i] as StructureValue})).filter(v=>v.salary>=5000);
                return probe(tree,[...selected.map(v=>String(v.row.name)),String(selected.reduce((sum,v)=>sum+v.salary,0))].join("\n"),salaries[0],"salary");
              });
              if (correct) {
                const tree=structuredClone(nodes);
                const names=walk(tree).filter((n): n is Extract<Node,{kind:"assign"}>=>n.kind === "assign" && n.target.endsWith("-name") && n.value.kind === "literal");
                if(names.length !== 3) correct=false;
                else {
                  names.forEach((n,i)=>n.value={kind:"literal",value:["Lina","Yousef","Noor"][i]});
                  correct=probe(tree,"Lina\nYousef\n12000",3,"employee names");
                }
              }
            }
          } else {
            const records = rows.filter((row): row is StructureValue => typeof row === "object");
            const expected = id === "tables-structured" ? "Sara" : "Ahmed\nSara";
            if (records.length === 2 && records[0].id === 101 && records[0].name === "Ahmed" && records[1].id === 102 && records[1].name === "Sara" && output(nodes) === expected) {
              const tree=structuredClone(nodes);
              const assignments = walk(tree).filter((n): n is Extract<Node,{kind:"assign"}>=>n.kind === "assign" && n.target.endsWith("-name") && n.value.kind === "literal");
              if (assignments.length === 2) {
                assignments.forEach((n,i)=>n.value={kind:"literal",value:["Lina","Yousef"][i]});
                correct = probe(tree,id === "tables-structured" ? "Yousef" : "Lina\nYousef",2,"employee names");
              }
            }
          }
        }
      }
    }
  } else if (id === "structures") {
    const d = nodes.find(
      (n): n is Extract<Node, { kind: "define" }> =>
        n.kind === "define" &&
        n.fields.id === "i" &&
        n.fields.name === "string" &&
        n.fields.quantity === "i",
    );
    if (d) {
      const variable = nodes.find(
        (n): n is Extract<Node, { kind: "data" }> =>
          n.kind === "data" && n.type === d.name,
      );
      if (variable) {
        const v = last.memory[variable.name];
        correct =
          typeof v === "object" &&
          !Array.isArray(v) &&
          v.id === 501 &&
          v.name === "Keyboard" &&
          v.quantity === 12 &&
          last.output.join("\n") === "Keyboard" &&
          nodes.some(
            (n) =>
              n.kind === "write" &&
              n.value.kind === "ref" &&
              n.value.name === variable.name + "-name",
          );
      }
    }
  }
  return { correct, events, failure };
}
