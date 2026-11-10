"use client";
// Right-hand Learn panels for the ABAP Dictionary lessons: each stage of the code adds something you can see
// (a spec sheet, a table, a record) plus one small try-it. English only while ENABLE_ARABIC = false.
// Local teaching models: nothing is created, activated or checked in an SAP system.
import { useState, type ReactNode } from "react";
import { domainValueIssues } from "./dictionary-designer";
import { DictionaryIntroPanel } from "./dictionary-intro-panel";
import { ApplicationPanel } from "./application-lessons";
import { CloudPanel } from "./cloud-lessons";
import { cloudLessons } from "@/lib/cloud-content";
import { applicationLessons } from "@/lib/application-labs";
import { sqlEmployees } from "./sql-foundation-lab";
import {
  labelSlots, labelFit, candidateRows, keyCandidates, keyCollisions, keyDesignIssues, departments, foreignKeyCheck, searchHelpRows,
} from "@/lib/dictionary-labs";

type Row = [stage: number, label: string, value: ReactNode];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="dict-panel" aria-label={title}><span className="eyebrow">{title}</span>{children}</section>;
}
const Msg = ({ ok, children }: { ok: boolean; children: ReactNode }) => <span role="status" data-ok={ok}>{children}</span>;
const Empty = () => <p className="dict-empty">Nothing built yet. Press “Next part” to start.</p>;

/** Label/value sheet; each stage adds its rows and the newest ones are outlined. */
function Spec({ rows, part }: { rows: Row[]; part: number }) {
  const shown = rows.filter(r => r[0] <= part);
  if (!shown.length) return <Empty />;
  return <table className="dict-spec"><tbody>{shown.map(([stage, label, value]) =>
    <tr key={label} data-fresh={stage === part || undefined}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>;
}

/** Plain table; `keys` get a key tag, `fresh` columns are outlined, `bad` rows are rejected. */
function Grid({ cols, rows, keys = [], fresh = [], bad = [] }: { cols: string[]; rows: string[][]; keys?: string[]; fresh?: string[]; bad?: number[] }) {
  return <div className="table-scroll"><table><thead><tr>{cols.map(c => <th key={c} data-new={fresh.includes(c) || undefined}>{c.toUpperCase()}{keys.includes(c) && <span className="dict-tag">key</span>}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} data-bad={bad.includes(i) || undefined}>{r.map((v, j) => <td key={j} data-new={fresh.includes(cols[j]) || undefined}>{v}</td>)}</tr>)}</tbody></table></div>;
}

function DomainPanel({ part }: { part: number }) {
  const [value, setValue] = useState("X");
  const v = value.trim().toUpperCase(), issues = domainValueIssues({ type: "CHAR", length: 1, fixed: ["A", "I"] }, v);
  return <>
    <Panel title="The domain · ZACA_STATUS_DOMAIN"><Spec part={part} rows={[
      [0, "Description", "Active or inactive status"],
      [1, "Data type · length", <><code>CHAR</code> · <code>1</code> <span className="dict-slot" aria-label="one character">▢</span> exactly one character</>],
      [2, "Fixed values", "A = Active, I = Inactive"],
      [3, "Reused by", "ZACA_EMPLOYEE_STATUS, ZACA_SUPPLIER_STATUS"],
    ]} /></Panel>
    {part >= 2 && <Panel title="Try a value">
      <label className="dict-try">Value <input dir="ltr" maxLength={3} value={value} onChange={e => setValue(e.target.value)} />
        <Msg ok={!issues.length}>{!v ? "Empty: nothing to check." : !issues.length ? `✓ ${v} is allowed by the domain.` : `✗ “${v}” is not a fixed value (A, I). A classic screen rejects it.`}</Msg></label>
      <p className="muted">An ABAP program can still store X: fixed values guide screens and value lists, they are not a database constraint.</p>
    </Panel>}
  </>;
}

function DataElementPanel({ part }: { part: number }) {
  const [category, setCategory] = useState("domain");
  const [labels, setLabels] = useState<Record<string, string>>({ short: "Status", medium: "Emp. status", long: "Employee status", heading: "Employee status" });
  const [declare, setDeclare] = useState<number | null>(null);
  const declarations = [["DATA lv_status TYPE zaca_employee_status.", "✓ Correct: programs type variables with the data element."], ["DATA lv_status TYPE zaca_status_domain.", "✗ A domain cannot be used after TYPE."], ["DATA lv_status TYPE 'Employee status'.", "✗ A label is text for screens, not a type."]];
  return <>
    <Panel title="The data element · ZACA_EMPLOYEE_STATUS"><Spec part={part} rows={[
      [0, "Meaning", "Employee status (one data element per business meaning)"],
      [1, "Technical type", category === "domain" ? "From domain ZACA_STATUS_DOMAIN: CHAR(1), A / I" : "Typed here directly: CHAR(1), nothing shared, no fixed values"],
      [2, "Labels", "Short · Medium · Long · Heading (see below)"],
      [3, "In ABAP", <code key="abap">DATA lv_status TYPE zaca_employee_status.</code>],
    ]} /></Panel>
    {part === 1 && <Panel title="Try it · where does the type come from?"><div className="dict-try">
      {[["domain", "Domain ZACA_STATUS_DOMAIN"], ["predefined", "Predefined type CHAR(1)"]].map(([id, text]) => <label key={id}><input type="radio" name="dict-dtel-category" checked={category === id} onChange={() => setCategory(id)} /> {text}</label>)}
    </div><p className="muted">{category === "domain" ? "Type, length and fixed values are inherited and shared with other data elements." : "Nothing is shared. Changing CHAR(1) here changes only this data element."}</p></Panel>}
    {part === 2 && <Panel title="Try it · write labels that fit">
      {labelSlots.map(slot => { const fit = labelFit(labels[slot.id] ?? "", slot.max); return <label className="dict-try" key={slot.id}>{slot.name} (max {slot.max})
        <input dir="ltr" value={labels[slot.id] ?? ""} onChange={e => setLabels(l => ({ ...l, [slot.id]: e.target.value }))} />
        <Msg ok={fit.fits}>{fit.missing ? "Empty: screens show no label." : fit.fits ? `✓ Fits (${labels[slot.id].length}/${slot.max})` : `✗ Screens cut it to “${fit.shown}”`}</Msg></label>; })}
    </Panel>}
    {part === 3 && <Panel title="Try it · which declaration works?"><div className="dict-choices">
      {declarations.map(([code], i) => <button type="button" key={code} aria-pressed={declare === i} onClick={() => setDeclare(i)}><code>{code}</code></button>)}</div>
      {declare !== null && <Msg ok={declare === 0}>{declarations[declare][1]}</Msg>}</Panel>}
  </>;
}

function StructurePanel({ part }: { part: number }) {
  const [city, setCity] = useState("Riyadh");
  const fields = [["street", "abap.char(40)", ""], ["city", "abap.char(30)", city], ["country", "land1", ""]];
  return <>
    <Panel title="The structure · ZACA_ADDRESS"><Spec part={part} rows={[
      [0, "Description", "Employee address · cannot be extended by others"],
      [1, "Name", "define structure zaca_address: one reusable type, global to the whole system"],
    ]} />
      {part >= 2 && <Grid cols={["street", "city", "country"]} rows={[["abap.char(40)", "abap.char(30)", "land1"]]} fresh={part === 2 ? ["street", "city", "country"] : []} />}
      {part >= 2 && <p className="muted">Three components, each with a name and a type. The row above shows types, not data.</p>}</Panel>
    {part === 3 && <Panel title="Try it · one record in memory">
      <div className="add-box-row">{fields.map(([name, type, val]) => <div className="add-box" key={name} data-empty={!val || undefined} data-changed={name === "city" && !!val}><code>ls_address-{name}</code><strong dir="ltr">{val || "–"}</strong><small>{type}</small></div>)}</div>
      <label className="dict-try"><code>ls_address-city =</code> <input dir="ltr" value={city} onChange={e => setCity(e.target.value)} /></label>
      <p className="muted">DATA creates one empty record. Rows are stored only in a database table, never by the structure.</p></Panel>}
  </>;
}

function TablePanel({ part }: { part: number }) {
  const [keys, setKeys] = useState<string[]>(["client", "employee_id"]);
  const { rejected } = keyCollisions(candidateRows, keys), issues = keyDesignIssues(keys);
  const toggle = (k: string) => setKeys(list => list.includes(k) ? list.filter(x => x !== k) : [...list, k]);
  return <>
    <Panel title="The table · ZACA_EMPLOYEE">
      {part < 0 ? <Empty /> : part === 0 ? <Spec part={0} rows={[[0, "Kind", "#TRANSPARENT: one real database table"], [0, "Delivery class", "#A: application data"], [0, "Maintenance", "#RESTRICTED: not edited directly"]]} />
        : part === 1 ? <p className="dict-empty">Activation creates an empty table. Columns come next.</p>
        : part === 2 ? <Grid cols={[...keyCandidates]} rows={candidateRows.map(r => keyCandidates.map(k => r[k]))} keys={keys} bad={rejected} />
        : <Grid cols={["client", "employee_id", "name", "status", "street", "city", "country"]} rows={[["100", "1001", "Ahmed", "A", "", "Riyadh", "SA"]]} keys={["client", "employee_id"]} fresh={["name", "status", "street", "city", "country"]} />}
      {part === 3 && <p className="muted">street, city and country arrive through <code>include zaca_address</code>. Status reuses the data element.</p>}
    </Panel>
    {part === 2 && <Panel title="Try it · choose the primary key">
      <div className="dict-try">{keyCandidates.map(k => <label key={k}><input type="checkbox" checked={keys.includes(k)} onChange={() => toggle(k)} /> {k}</label>)}</div>
      <Msg ok={!rejected.length && !issues.length}>{rejected.length ? `✗ ${rejected.length} row${rejected.length === 1 ? " is" : "s are"} rejected as a duplicate key (red).` : "✓ Every row has a unique key."}</Msg>
      {issues.map(i => <p className="muted" key={i}>• {i}</p>)}</Panel>}
  </>;
}

function ForeignKeyPanel({ part }: { part: number }) {
  const [dept, setDept] = useState("FIN");
  const [screen, setScreen] = useState(true);
  const result = foreignKeyCheck(dept, departments, screen);
  return <>
    <Panel title="The check table · ZACA_DEPARTMENT">
      {part < 0 ? <Empty /> : <Grid cols={["client", "department_id", "name"]} rows={departments.map(d => ["100", d.department_id, d.name])} keys={["client", "department_id"]} />}
      {part >= 0 && <p className="muted">These are the valid departments. A check table is just a normal table.</p>}</Panel>
    {part >= 1 && <Panel title="The foreign key table · ZACA_EMPLOYEE">
      <Grid cols={part >= 2 ? ["client", "employee_id", "name", "department"] : ["client", "employee_id", "name"]} rows={[part >= 2 ? ["100", "1001", "Ahmed", "HR"] : ["100", "1001", "Ahmed"]]} keys={["client", "employee_id"]} fresh={part === 2 ? ["department"] : []} />
      {part === 3 && <p className="muted">The link maps client → client and department_id → department.</p>}</Panel>}
    {part >= 2 && <Panel title="Try it · save an employee's department">
      <div className="dict-try"><label><input type="radio" name="dict-fk-via" checked={screen} onChange={() => setScreen(true)} /> Classic screen</label><label><input type="radio" name="dict-fk-via" checked={!screen} onChange={() => setScreen(false)} /> ABAP program</label></div>
      <label className="dict-try">department <input dir="ltr" value={dept} onChange={e => setDept(e.target.value)} /><Msg ok={result.saved && (result.exists || !dept.trim())}>{result.message}</Msg></label>
      <p className="muted">Try HR, then FIN. The screen check only guards classic screens; the database itself does not enforce it.</p></Panel>}
  </>;
}

function SearchHelpPanel({ part }: { part: number }) {
  const [pattern, setPattern] = useState("");
  const [picked, setPicked] = useState("");
  const rows = searchHelpRows(departments, "name", pattern);
  return <>
    <Panel title="The selection method · ZACA_DEPARTMENT">
      {part < 0 ? <Empty /> : <Grid cols={["department_id", "name"]} rows={departments.map(d => [d.department_id, d.name])} />}
      {part === 0 && <p className="muted">The F4 list is read from this table. The table is the source, not the list itself.</p>}</Panel>
    {part >= 1 && <Panel title="Press F4 · the list opens at once">
      {part >= 2 && <label className="dict-try">Filter by name <input dir="ltr" placeholder="e.g. H*" value={pattern} onChange={e => setPattern(e.target.value)} /></label>}
      <div className="dict-choices">{rows.length ? rows.map(d => <button type="button" key={d.department_id} disabled={part < 2} aria-pressed={picked === d.department_id} onClick={() => setPicked(d.department_id)}>
        <code>{d.department_id}</code> {d.name}</button>) : <p className="dict-empty">No department matches.</p>}</div>
      {part === 1 && <p className="muted">Display values immediately: the user sees the list without typing anything first.</p>}
      {part >= 2 && <p className="muted">Both columns are shown (list position 1 and 2). Only DEPARTMENT_ID is exported back. Click a row.</p>}</Panel>}
    {part >= 3 && <Panel title="The screen field · data element ZACA_DEPARTMENT_ID">
      <div className="dict-try">Department <b className="dict-field" dir="ltr">{picked || " "}</b> <span aria-hidden="true">⌄ F4</span></div>
      <p className="muted">{picked ? `${picked} was exported into the field.` : "Pick a row above and its key lands here."} Every field typed with this data element gets the same F4 list.</p></Panel>}
    {part === 4 && <Panel title="In ABAP Cloud"><pre className="dict-code" dir="ltr">{"@Consumption.valueHelpDefinition: [{ entity: {\n  name: 'ZACA_I_DEPARTMENT',\n  element: 'DepartmentId' } }]"}</pre>
      <p className="muted">ABAP Cloud has no search helps. A CDS value help annotation points the field to an entity, and the app builds the list.</p></Panel>}
  </>;
}

/** Database fundamentals: the same four employees travel through FROM, FIELDS, WHERE and INTO TABLE. */
function SqlReadPanel({ part }: { part: number }) {
  const [department, setDepartment] = useState("IT");
  const [ordered, setOrdered] = useState(true);
  const all = ["employee_id", "employee_name", "department", "salary"];
  const kept = sqlEmployees.filter(e => e.department === department);
  const result = [...kept].sort((a, b) => (ordered ? a.employee_id - b.employee_id : b.employee_id - a.employee_id));
  const cell = (e: (typeof sqlEmployees)[number], cols: string[]) => cols.map(c => String(e[c as keyof typeof e]));
  return <>
    {part >= 0 && part < 2 && <Panel title="The ABAP variable · lv_department">
      <div className="add-box-row"><div className="add-box" data-changed={part === 0 || undefined}><code>lv_department</code><strong dir="ltr">IT</strong><small>program memory</small></div></div>
      <p className="muted">{part === 0 ? "A value from the program. WHERE will compare each row with it." : "The table lives in the database, not in the program."}</p></Panel>}
    {part < 0 && <Panel title="The database table · ZACA_EMPLOYEE"><Empty /></Panel>}
    {part === 1 && <Panel title="FROM · the source table · ZACA_EMPLOYEE">
      <Grid cols={all} rows={sqlEmployees.map(e => cell(e, all))} keys={["employee_id"]} fresh={all} />
      <p className="muted">Four persistent rows. Nothing is read yet.</p></Panel>}
    {part === 2 && <Panel title="FIELDS · only two columns">
      <Grid cols={all} rows={sqlEmployees.map(e => cell(e, all))} keys={["employee_id"]} fresh={["employee_id", "employee_name"]} />
      <p className="muted">Outlined columns are requested. The result is narrower, but still has four rows.</p></Panel>}
    {part === 3 && <Panel title="WHERE · only some rows">
      <Grid cols={["employee_id", "employee_name", "department"]} rows={sqlEmployees.map(e => cell(e, ["employee_id", "employee_name", "department"]))} bad={sqlEmployees.flatMap((e, i) => e.department === department ? [] : [i])} />
      <label className="dict-try">department = <select value={department} onChange={e => setDepartment(e.target.value)}>{["IT", "HR", "SALES", "LEGAL"].map(v => <option key={v}>{v}</option>)}</select>
        <Msg ok={kept.length > 0}>{kept.length ? `${kept.length} row${kept.length === 1 ? "" : "s"} kept (the red rows are skipped).` : "No row matches: the result is empty and sy-subrc = 4."}</Msg></label></Panel>}
    {part >= 4 && <Panel title="INTO TABLE · lt_employees (a local copy)">
      {result.length ? <Grid cols={["employee_id", "employee_name"]} rows={result.map(e => cell(e, ["employee_id", "employee_name"]))} fresh={["employee_id", "employee_name"]} /> : <p className="dict-empty">Empty result.</p>}
      <label className="dict-try"><input type="checkbox" checked={ordered} onChange={e => setOrdered(e.target.checked)} /> ORDER BY employee_id
        <Msg ok={ordered}>{ordered ? "✓ The order is guaranteed." : "✗ No ORDER BY: the database may return rows in any order."}</Msg></label>
      <p className="muted">Changing lt_employees never changes the database table.</p></Panel>}
  </>;
}

/** Classes and objects: the contract, the private counter, the method, then two independent objects. */
function CounterPanel({ part }: { part: number }) {
  const [counts, setCounts] = useState([0, 0]);
  const [access, setAccess] = useState("");
  const bump = (i: number) => setCounts(c => c.map((v, j) => j === i ? v + 1 : v));
  const boxes = (names: string[], changed?: number) => <div className="add-box-row">{names.map((n, i) => <div className="add-box" key={n} data-changed={i === changed || undefined}>
    <code>{n}</code><strong dir="ltr">{counts[i]}</strong><small>mv_value (private)</small></div>)}</div>;
  return <>
    <Panel title="The class · LCL_COUNTER"><Spec part={part} rows={[
      [0, "Public methods", <><code>increment</code>, <code>get_value</code> (returns an integer)</>],
      [1, "Private data", <><code>mv_value</code>: only the class can touch it</>],
      [2, "increment does", <code>mv_value = mv_value + 1.</code>],
      [3, "Objects", "lo_first and lo_second, built with NEW"],
    ]} /></Panel>
    {part === 1 && <Panel title="Try it · who may change mv_value?"><div className="dict-choices">
      {[["direct", "lo_first->mv_value = 5."], ["method", "lo_first->increment( )."]].map(([id, code]) => <button type="button" key={id} aria-pressed={access === id} onClick={() => setAccess(id)}><code>{code}</code></button>)}</div>
      {access && <Msg ok={access === "method"}>{access === "method" ? "✓ Allowed: the public method changes the private data." : "✗ Syntax error: mv_value is private."}</Msg>}</Panel>}
    {part === 2 && <Panel title="Try it · call increment( ) once">
      {boxes(["lo_first"])}
      <div className="dict-try"><button type="button" onClick={() => bump(0)}>{"lo_first->increment( )"}</button></div>
      <p className="muted">The method reads and writes the receiving object's own mv_value.</p></Panel>}
    {part === 3 && <Panel title="Try it · two independent objects">
      {boxes(["lo_first", "lo_second"])}
      <div className="dict-try"><button type="button" onClick={() => bump(0)}>{"lo_first->increment( )"}</button> <button type="button" onClick={() => bump(1)}>{"lo_second->increment( )"}</button></div>
      <p className="muted">Same class, separate values. In the lesson code only lo_first is incremented, so WRITE shows 1 and 0.</p></Panel>}
  </>;
}

const panels: Record<string, (p: { part: number }) => ReactNode> = {
  ...Object.fromEntries(Object.keys(applicationLessons).map(id => [id, ({ part }: { part: number }) => <ApplicationPanel id={id} part={part} />])),
  ...Object.fromEntries(Object.keys(cloudLessons).map(id => [id, ({ part }: { part: number }) => <CloudPanel id={id} part={part} />])),
  "oop-introduction": CounterPanel,
  "database-fundamentals": SqlReadPanel,
  "dictionary-introduction": DictionaryIntroPanel, "dictionary-domains": DomainPanel, "dictionary-data-elements": DataElementPanel,
  "dictionary-structures": StructurePanel, "dictionary-database-tables": TablePanel, "dictionary-foreign-keys": ForeignKeyPanel, "dictionary-search-helps": SearchHelpPanel,
};
export const hasDictionaryPanel = (id: string) => id in panels;
/** `part` is the active stage (0-based), or -1 before the learner has pressed Next part. */
export function DictionaryLessonPanel({ id, part }: { id: string; part: number }) {
  const Panel = panels[id];
  return Panel ? <Panel part={part} /> : null;
}
