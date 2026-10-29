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
export type Memory = Record<string, Primitive | Record<string, Primitive>>;
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
export type Expr =
  | { kind: "literal"; value: Primitive }
  | { kind: "ref"; name: string }
  | { kind: "add"; left: Expr; right: Expr };
export type Node =
  | { kind: "data"; name: string; type: string; initial?: Expr; range: Range }
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
    };
export type ExecutionEvent = {
  id: number;
  operation: "define" | "declare" | "assign" | "write" | "condition" | "end";
  range: Range;
  statement: string;
  memory: Memory;
  output: string[];
  changed: string[];
  skippedRanges: Range[];
  explanation: { key: string; name?: string; value?: Primitive; type?: string };
  condition?: { expression: string; result: boolean };
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
    } else if (".,:+-=<>".includes(c)) {
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
  const ref = () => {
    let n = name();
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
    return { kind: "ref", name: ref() };
  };
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
        ["data", "types", "write", "if", "else", "endif"].includes(peek()?.text)
      )
        throw new SimulationError("period", range(start), ".");
      fail("period", ".", Math.max(start, p - 1));
    }
    p++;
  };
  function nodes(nested = false): Node[] {
    const list: Node[] = [];
    while (peek() && !at("else") && !at("endif")) {
      const start = p;
      let node!: Node;
      if (at("data")) {
        p++;
        const n = name();
        take("type");
        const type = name();
        let initial: Expr | undefined;
        if (at("value")) {
          p++;
          initial = atom();
          if (initial.kind !== "literal") fail("declaration");
        }
        period(start);
        node = { kind: "data", name: n, type, initial, range: range(start) };
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
        const value = expr();
        period(start);
        node = { kind: "write", value, range: range(start) };
      } else if (at("if")) {
        p++;
        const left = atom();
        const op = peek()?.text;
        if (!["=", "<>", ">=", "<=", ">", "<"].includes(op)) fail("assignment");
        p++;
        const right = atom();
        period(start);
        const ifRange = range(start),
          yesStart = p,
          yes = nodes(true);
        const yesRange = yes.length ? range(yesStart) : undefined;
        let no: Node[] = [],
          noRange: Range | undefined;
        if (at("else")) {
          const elseStart = p++;
          period(elseStart);
          no = nodes(true);
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
        };
      } else if (peek().kind === "word") {
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
        if (at(".") && tokens[p + 1]?.kind === "word") fail("access");
        take("=", "assignment");
        const value = expr();
        period(start);
        node = { kind: "assign", target, value, range: range(start) };
      } else fail("unsupported");
      if (nested && (node.kind === "data" || node.kind === "define"))
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
export function execute(nodes: Node[], source: string): ExecutionEvent[] {
  const definitions: Record<
      string,
      Record<string, "i" | "string">
    > = Object.create(null),
    types: Record<string, string> = Object.create(null),
    memory: Memory = Object.create(null),
    output: string[] = [],
    events: ExecutionEvent[] = [];
  const error = (code: ErrorCode, n: Node, detail = ""): never => {
    throw new SimulationError(code, n.range, detail);
  };
  function refType(name: string, n: Node): string {
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
    if (exprType(e.left, n) !== "i" || exprType(e.right, n) !== "i")
      return error("type", n);
    return "i";
  }
  function validate(list: Node[]) {
    for (const n of list) {
      if (n.kind === "define") {
        if (n.name in definitions || ["i", "string"].includes(n.name))
          error("declaration", n, n.name);
        definitions[n.name] = n.fields;
      } else if (n.kind === "data") {
        if (n.name in types) error("declaration", n, n.name);
        if (!["i", "string"].includes(n.type) && !(n.type in definitions))
          error("type", n, n.type);
        types[n.name] = n.type;
        if (n.initial && exprType(n.initial, n) !== n.type) error("type", n);
      } else if (n.kind === "assign") {
        if (
          exprType(n.value, n) !== refType(n.target, n) ||
          !["i", "string"].includes(refType(n.target, n))
        )
          error("type", n);
      } else if (n.kind === "write") {
        if (!["i", "string"].includes(exprType(n.value, n))) error("type", n);
      } else {
        if (exprType(n.left, n) !== exprType(n.right, n)) error("type", n);
        validate(n.yes);
        validate(n.no);
      }
    }
  }
  validate(nodes);
  function get(e: Expr, n: Node): Primitive {
    if (e.kind === "literal") return e.value;
    if (e.kind === "add") {
      const a = get(e.left, n),
        b = get(e.right, n);
      if (typeof a !== "number" || typeof b !== "number")
        return error("type", n);
      return a + b;
    }
    const [base, field] = e.name.split("-"),
      v = memory[base];
    if (v === undefined) return error("unknown", n, base);
    if (field) {
      if (typeof v !== "object" || !(field in v))
        return error("component", n, field);
      return v[field];
    }
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
  ) {
    events.push({
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
    });
  }
  function run(list: Node[]) {
    for (const n of list) {
      if (n.kind === "define") {
        emit(n, "define", { key: "define", name: n.name });
      } else if (n.kind === "data") {
        const v = definitions[n.type]
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
            key: typeof v === "object" ? "structure" : "declare",
            name: n.name,
            type: n.type,
            value: typeof v === "object" ? undefined : v,
          },
          [n.name],
        );
      } else if (n.kind === "assign") {
        const v = checked(get(n.value, n), n),
          [base, field] = n.target.split("-");
        if (field) (memory[base] as Record<string, Primitive>)[field] = v;
        else memory[base] = v;
        emit(
          n,
          "assign",
          {
            key: n.value.kind === "add" ? "add" : "assign",
            name: n.target,
            value: v,
          },
          [n.target],
        );
      } else if (n.kind === "write") {
        const v = get(n.value, n);
        output.push(String(v));
        emit(n, "write", { key: "write", value: v }, ["output"]);
      } else {
        const a = get(n.left, n),
          b = get(n.right, n);
        const result =
          n.op === "="
            ? a === b
            : n.op === "<>"
              ? a !== b
              : n.op === ">="
                ? a >= b
                : n.op === "<="
                  ? a <= b
                  : n.op === ">"
                    ? a > b
                    : a < b;
        const skipped = [result ? n.noRange : n.yesRange].filter(
          (r): r is Range => !!r,
        );
        emit(n, "condition", { key: "condition" }, [], skipped, {
          expression: `${a} ${n.op} ${b}`,
          result,
        });
        run(result ? n.yes : n.no);
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
  run(nodes);
  return events;
}
export function simulate(source: string) {
  return execute(parse(source), source);
}
export function evaluate(
  source: string,
  id: string,
): { correct: boolean; events: ExecutionEvent[] } {
  const nodes = parse(source),
    events = execute(nodes, source),
    last = events.at(-1)!;
  let correct = false;
  if (id === "addition") {
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
  return { correct, events };
}
