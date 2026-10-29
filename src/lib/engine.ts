// Deliberately bounded teaching interpreter, not an SAP runtime.
export type Frame = { statement: string; variables: Record<string, number | string | (number | string)[]>; output: string[] };
export function simulate(source: string): Frame[] {
  if (source.length > 12000) throw new Error('size');
  const clean = source.split('\n').filter(l => !l.trim().startsWith('*')).join('\n');
  const statements: string[] = [];
  let current = '', quoted = false;
  for (const c of clean) { if (c === "'") quoted = !quoted; if (c === '.' && !quoted) { if (current.trim()) statements.push(current.trim()); current = ''; } else current += c; }
  if (quoted || current.trim()) throw new Error('syntax');
  if (statements.length > 100) throw new Error('size');
  const vars: Frame['variables'] = {}, types: Record<string,string> = {}, output: string[] = [], frames: Frame[] = [];
  const blocks: { parent: boolean; condition: boolean; alternate: boolean }[] = [];
  let active = true;
  function value(token: string): number | string {
    token = token.trim();
    if (/^-?\d+$/.test(token)) return Number(token);
    if (/^'[^']*'$/.test(token)) return token.slice(1,-1);
    const v = vars[token.toLowerCase()];
    if (v === undefined || Array.isArray(v)) throw new Error('name');
    return v;
  }
  function assign(name:string, v:number|string) { if (!(name in types) || types[name] === 'table' || typeof v !== (types[name] === 'i' ? 'number' : 'string')) throw new Error('type'); vars[name] = v; }
  for (const s of statements) {
    let m: RegExpMatchArray | null;
    if ((m = s.match(/^IF\s+([\w]+)\s*(>=|<=|<>|=|>|<)\s*(-?\d+|'[^']*'|\w+)$/i))) {
      const a = value(m[1]), b = value(m[3]); if (typeof a !== typeof b) throw new Error('type');
      const c = m[2] === '=' ? a === b : m[2] === '<>' ? a !== b : m[2] === '>' ? a > b : m[2] === '<' ? a < b : m[2] === '>=' ? a >= b : a <= b;
      blocks.push({parent:active,condition:c,alternate:false}); active = active && c;
    } else if (/^ELSE$/i.test(s)) { const b = blocks.at(-1); if (!b || b.alternate) throw new Error('block'); b.alternate = true; active = b.parent && !b.condition;
    } else if (/^ENDIF$/i.test(s)) { const b = blocks.pop(); if (!b) throw new Error('block'); active = b.parent;
    } else if ((m = s.match(/^DATA\s+(\w+)\s+TYPE\s+(i|string)(?:\s+VALUE\s+(-?\d+|'[^']*'))?$/i))) {
      const name = m[1].toLowerCase(); if (name in types) throw new Error('duplicate');
      if (active) { types[name] = m[2].toLowerCase(); vars[name] = types[name] === 'i' ? 0 : ''; if (m[3]) assign(name,value(m[3])); }
    } else if ((m = s.match(/^DATA\s+(\w+)\s+TYPE\s+STANDARD\s+TABLE\s+OF\s+string\s+WITH\s+EMPTY\s+KEY$/i))) {
      const name = m[1].toLowerCase(); if (name in types) throw new Error('duplicate'); if (active) { types[name] = 'table'; vars[name] = []; }
    } else if ((m = s.match(/^APPEND\s+('[^']*'|\w+)\s+TO\s+(\w+)$/i))) {
      if (active) { const t = vars[m[2].toLowerCase()], v = value(m[1]); if (!Array.isArray(t) || typeof v !== 'string') throw new Error('type'); t.push(v); }
    } else if ((m = s.match(/^DELETE\s+(\w+)\s+INDEX\s+(\d+)$/i))) {
      if (active) { const t = vars[m[1].toLowerCase()]; if (!Array.isArray(t) || +m[2] < 1 || +m[2] > t.length) throw new Error('index'); t.splice(+m[2]-1,1); }
    } else if ((m = s.match(/^WRITE\s+(-?\d+|'[^']*'|\w+)$/i))) { if (active) output.push(String(value(m[1])));
    } else if ((m = s.match(/^(\w+)\s*=\s*(-?\d+|'[^']*'|\w+)(?:\s*\+\s*(-?\d+|\w+))?$/i))) {
      if (active) { let v = value(m[2]); if (m[3]) { const b = value(m[3]); if (typeof v !== 'number' || typeof b !== 'number') throw new Error('type'); v += b; } assign(m[1].toLowerCase(),v); }
    } else throw new Error('unsupported');
    frames.push({statement:s,variables:structuredClone(vars),output:[...output]});
  }
  if (blocks.length || !frames.length) throw new Error('block');
  return frames;
}
export function evaluate(code:string, lesson:number): 'correct'|'incorrect'|'invalid' {
  try { const f = simulate(code).at(-1)!; return (lesson === 0 ? f.variables.quantity === 12 && f.output.at(-1) === '12' : lesson === 1 ? f.variables.total === 1200 && f.output.at(-1) === 'Approved' && /\bIF\b/i.test(code) && /\bELSE\b/i.test(code) : JSON.stringify(f.variables.orders) === JSON.stringify(['SO-102','SO-103'])) ? 'correct' : 'incorrect'; } catch { return 'invalid'; }
}
