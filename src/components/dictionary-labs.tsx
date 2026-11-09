"use client";
// Guided hands-on labs for the ABAP Dictionary lessons (Explore code): a few steps, one topic per step, and a live
// "design so far" rail. English only while ENABLE_ARABIC = false.
// Local teaching models: nothing is created, activated or checked in an SAP system.
import type { ReactNode } from "react";
import { useTopicSession } from "@/lib/use-topic-session";
import { domainValueIssues, type DomainDraft } from "./dictionary-designer";
import {
  labelSlots, labelFit, structureComponents, candidateRows, keyCandidates, keyCollisions, keyDesignIssues,
  departments, foreignKeyCheck, searchHelpRows,
} from "@/lib/dictionary-labs";

type Step = { name: string; hint: string; title: string; intro: string; valid?: boolean; body: ReactNode };

/** Steps on top, the current step on the left, the live design on the right. Reuses the Dictionary designer styles. */
function StepLab({ label, sessionKey, steps, rail }: { label: string; sessionKey: string; steps: Step[]; rail: ReactNode }) {
  const [step, setStep] = useTopicSession(`${sessionKey}:step`, 0);
  const current = Math.min(Math.max(step, 0), steps.length - 1), s = steps[current];
  return <section className="learn-card guided-explorer guided-assessment dd" aria-label={label}>
    <h2>{label}</h2>
    <ol className="dd-steps" aria-label="Lab steps" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>{steps.map((x, i) => <li key={x.name}>
      <button type="button" className="dd-step" aria-current={i === current ? "step" : undefined} data-state={i === current ? "current" : i < current ? (x.valid === false ? "problem" : "ok") : "todo"} onClick={() => setStep(i)}>
        <b aria-hidden="true">{i === current ? i + 1 : i < current ? (x.valid === false ? "!" : "✓") : i + 1}</b><span>{x.name}<small>{x.hint}</small></span></button></li>)}</ol>
    <div className="dd-grid">
      <div className="dd-main"><h3>{s.title}</h3><p className="muted">{s.intro}</p>{s.body}</div>
      <div className="dd-rail">{rail}</div>
    </div>
    <div className="add-controls"><button type="button" onClick={() => setStep(current - 1)} disabled={!current}><span aria-hidden="true">← </span>Back</button>
      <span className="add-progress">Step {current + 1} of {steps.length}</span>
      <button type="button" className="primary" onClick={() => setStep(current + 1)} disabled={current === steps.length - 1}>{current === steps.length - 1 ? "Last step" : `Next: ${steps[current + 1].name} →`}</button></div>
  </section>;
}
const Box = ({ title, children }: { title: string; children: ReactNode }) => <section className="dd-box" aria-label={title}><span className="eyebrow">{title}</span>{children}</section>;
const Pill = ({ ok, children }: { ok: boolean; children: ReactNode }) => <span className="dd-pill" data-ok={ok}>{children}</span>;

const domainMessages: Record<string, string> = {
  length: "Choose a length between 1 and 40.", overflow: "Too long for the domain's length.", digits: "NUMC accepts digits only.",
  integer: "INT4 accepts whole numbers only.", fixed: "Not one of the fixed values.",
};
function DomainLab() {
  const [type, setType] = useTopicSession<DomainDraft["type"]>("dictionary-domains:lab-type", "CHAR");
  const [length, setLength] = useTopicSession("dictionary-domains:lab-length", 1);
  const [fixed, setFixed] = useTopicSession("dictionary-domains:lab-fixed", "A,I");
  const [value, setValue] = useTopicSession("dictionary-domains:lab-value", "A");
  const domain: DomainDraft = { type, length: type === "INT4" ? 10 : length, fixed: fixed.split(",").map(v => v.trim()).filter(Boolean) };
  const issues = domainValueIssues(domain, value);
  const shape = `${type}${type === "INT4" ? "" : `(${length})`}`;
  const lengthOk = !issues.includes("length");
  return <StepLab label="Domain lab" sessionKey="dictionary-domains:lab" steps={[
    { name: "Define the shape", hint: "type, length, values", title: "Change ZACA_STATUS_DOMAIN", intro: "Set the type, length and fixed values once. Both data elements on the right reuse them, so they change together.", valid: lengthOk,
      body: <div className="explore-actions">
        <label>Data type<select value={type} onChange={e => setType(e.target.value as DomainDraft["type"])}>{["CHAR", "NUMC", "INT4"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label>Length<input type="number" min={1} max={40} value={length} disabled={type === "INT4"} onChange={e => setLength(Number(e.target.value))}/></label>
        <label>Fixed values (comma separated)<input dir="ltr" value={fixed} onChange={e => setFixed(e.target.value)}/></label></div> },
    { name: "Test a value", hint: "see it checked", title: "Test a value against the domain", intro: "Type a value and see whether the domain's rules accept it.", valid: !issues.length,
      body: <><label>Value<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label>
        <div role="status" aria-live="polite">{issues.length ? <ul>{issues.map(i => <li key={i} className="error-text">{domainMessages[i]}</li>)}</ul> : <p className="success-text">Accepted by the domain&apos;s rules.</p>}</div></> },
  ]} rail={<>
    <Box title="Reused by"><pre dir="ltr">{`ZACA_EMPLOYEE_STATUS → ZACA_STATUS_DOMAIN: ${shape}\nZACA_SUPPLIER_STATUS → ZACA_STATUS_DOMAIN: ${shape}`}</pre>
      <p className="muted">Fixed values: {domain.fixed.join(" | ") || "none (unrestricted)"}</p></Box>
    <Box title="Good to know"><p className="muted">Fixed values help classic screens and value lists. They do not stop an ABAP program from storing another value.</p></Box>
  </>} />;
}

function DataElementLab() {
  const [category, setCategory] = useTopicSession("dictionary-data-elements:lab-category", "domain");
  const [labels, setLabels] = useTopicSession<Record<string, string>>("dictionary-data-elements:lab-labels", { short: "Status", medium: "Employee status", long: "Employee status", heading: "Employee status" });
  const fits = labelSlots.map(slot => labelFit(labels[slot.id] || "", slot.max));
  return <StepLab label="Data element lab" sessionKey="dictionary-data-elements:lab" steps={[
    { name: "Type source", hint: "domain or built-in", title: "Where does the technical type come from?", intro: "Choose where ZACA_EMPLOYEE_STATUS gets its technical type.",
      body: <><div className="explore-actions">
        {[["domain", "Domain ZACA_STATUS_DOMAIN"], ["predefined", "Predefined type CHAR(1)"]].map(([id, text]) => <label key={id}><input type="radio" name="dtel-category" checked={category === id} onChange={() => setCategory(id)}/>{text}</label>)}
      </div><p role="status">{category === "domain" ? "Type, length and fixed values are inherited from the domain and shared with other data elements." : "Type and length are typed here directly. Nothing is shared, and there are no fixed values."}</p></> },
    { name: "Field labels", hint: "write labels that fit", title: "Write labels that fit their boxes", intro: "Screens pick the longest label that fits. A label that is too long is cut off.", valid: fits.every(f => f.fits),
      body: <>{labelSlots.map((slot, i) => <div key={slot.id} className="explore-actions">
        <label>{slot.name} (max {slot.max})<input dir="ltr" value={labels[slot.id] || ""} onChange={e => setLabels(v => ({ ...v, [slot.id]: e.target.value }))}/></label>
        <span role="status" className={fits[i].fits ? "success-text" : "error-text"}>{fits[i].missing ? "Empty: screens would show no label." : fits[i].fits ? `Fits (${(labels[slot.id] || "").length}/${slot.max})` : `Too long: screens show “${fits[i].shown}”`}</span></div>)}</> },
    { name: "Use it in ABAP", hint: "type a variable", title: "Use the data element in ABAP", intro: "Programs type variables with the data element, never with the domain.",
      body: <pre dir="ltr">{"DATA lv_status TYPE zaca_employee_status.\n\" Not possible: DATA lv_status TYPE zaca_status_domain."}</pre> },
  ]} rail={<Box title="Current design">
    <pre dir="ltr">{`ELEMENT ZACA_EMPLOYEE_STATUS\nTYPE    ${category === "domain" ? "→ ZACA_STATUS_DOMAIN (CHAR(1), A | I)" : "CHAR(1), typed here"}\n${labelSlots.map((s, i) => `${s.name.padEnd(13)}${fits[i].fits ? "✓" : "✗"} ${(labels[s.id] || "").slice(0, s.max)}`).join("\n")}`}</pre></Box>} />;
}

function StructureLab() {
  const [include, setInclude] = useTopicSession("dictionary-structures:lab-include", true);
  const [suffix, setSuffix] = useTopicSession("dictionary-structures:lab-suffix", false);
  const result = structureComponents(include, suffix ? "_home" : "");
  return <StepLab label="Structure lab" sessionKey="dictionary-structures:lab" steps={[
    { name: "Include a structure", hint: "reuse zaca_address", title: "Include the address structure", intro: "ZACA_EMPLOYEE_INFO already has a city field (where the employee works). Include the address structure and watch the component names.", valid: !include || !result.duplicates.length,
      body: <div className="explore-actions"><label><input type="checkbox" checked={include} onChange={e => setInclude(e.target.checked)}/>include zaca_address</label></div> },
    { name: "Fix name clashes", hint: "add a suffix", title: "Rename the included components", intro: "Two components cannot share a name. A suffix renames every included component.", valid: !result.duplicates.length,
      body: <div className="explore-actions"><label><input type="checkbox" checked={suffix} disabled={!include} onChange={e => setSuffix(e.target.checked)}/>with suffix _home</label></div> },
  ]} rail={<>
    <Box title="Components"><pre dir="ltr">{`define structure zaca_employee_info {\n  employee_id : zaca_employee_id;\n  name        : abap.char(40);\n  city        : abap.char(30);${include ? `\n  include zaca_address${suffix ? " with suffix _home" : ""};` : ""}\n}\n\n" Result: ${result.components.join(", ")}`}</pre></Box>
    <Box title="Result"><div role="status" aria-live="polite">{result.duplicates.length
      ? <p className="error-text">Activation error: the component {result.duplicates.join(", ")} appears twice. Add a suffix to rename the included components.</p>
      : <p className="success-text">All {result.components.length} component names are unique.</p>}</div>
      <p className="muted">A structure is a type. DATA ls_info TYPE zaca_employee_info creates one record in memory; nothing is stored in the database.</p></Box>
  </>} />;
}

function TableKeyLab() {
  const [keys, setKeys] = useTopicSession<string[]>("dictionary-database-tables:lab-keys", ["client", "employee_id"]);
  const issues = keyDesignIssues(keys);
  const { rejected } = keyCollisions(candidateRows, keys);
  return <StepLab label="Table key lab" sessionKey="dictionary-database-tables:lab" steps={[
    { name: "Choose the key", hint: "primary key fields", title: "Choose the primary key of ZACA_EMPLOYEE", intro: "The key must identify one employee for good. Tick the fields that belong in it.", valid: !issues.length,
      body: <><div className="explore-actions">{keyCandidates.map(field => <label key={field}><input type="checkbox" checked={keys.includes(field)} onChange={e => setKeys(previous => e.target.checked ? keyCandidates.filter(f => previous.includes(f) || f === field) : previous.filter(v => v !== field))}/><code>{field}</code></label>)}</div>
        <div role="status" aria-live="polite">{issues.length ? <ul>{issues.map(i => <li key={i} className="error-text">{i}</li>)}</ul> : <p className="success-text">Good key: client + employee_id identifies each employee for good.</p>}</div></> },
    { name: "Insert four rows", hint: "see duplicates refused", title: "Insert four new rows", intro: "The database refuses a row whose key already exists.", valid: !rejected.length,
      body: <><div className="table-scroll"><table className="key-table" aria-label="Rows to insert"><thead><tr><th>Row</th><th>client</th><th>employee_id</th><th>name</th><th>status</th><th>Result</th></tr></thead>
        <tbody>{candidateRows.map((row, i) => <tr key={i}><td>{i + 1}</td><td>{row.client}</td><td>{row.employee_id}</td><td>{row.name}</td><td>{row.status}</td>
          <td className={rejected.includes(i) ? "error-text" : "success-text"}>{!keys.length ? "—" : rejected.includes(i) ? "Rejected: duplicate key" : "Inserted"}</td></tr>)}</tbody></table></div>
        <p className="muted">Row 4 is Sara again with a new status. With the right key it is refused: change her row with an update instead of inserting a second one.</p></> },
  ]} rail={<Box title="Current design">
    <div className="dd-head"><span className="eyebrow">Primary key</span><Pill ok={!issues.length && !rejected.length}>{!keys.length ? "no key" : rejected.length ? `${rejected.length} ${rejected.length === 1 ? "row" : "rows"} refused` : issues.length ? "review the key" : "good key"}</Pill></div>
    <pre dir="ltr">{`KEY: ${keys.join(" + ") || "?"}`}</pre>
    {issues.map(i => <p key={i} className="muted">• {i}</p>)}</Box>} />;
}

function ForeignKeyLab() {
  const [value, setValue] = useTopicSession("dictionary-foreign-keys:lab-value", "IT");
  const [screen, setScreen] = useTopicSession("dictionary-foreign-keys:lab-screen", true);
  const result = foreignKeyCheck(value, departments, screen);
  const ok = result.saved && (result.exists || !value.trim());
  return <StepLab label="Foreign key lab" sessionKey="dictionary-foreign-keys:lab" steps={[
    { name: "The link", hint: "field → check table", title: "Link a field to a check table", intro: "The department field of ZACA_EMPLOYEE has a foreign key to the check table ZACA_DEPARTMENT.",
      body: <pre dir="ltr">{"department : zaca_department_id\n  with foreign key zaca_department\n  screenCheck : true"}</pre> },
    { name: "Save a department", hint: "screen or program", title: "Save a department", intro: "Enter a department and choose how it is saved.", valid: ok,
      body: <><div className="explore-actions">
        <label>Department<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label>
        {[[true, "Typed on a classic screen"], [false, "Saved by an ABAP program"]].map(([id, text]) => <label key={String(id)}><input type="radio" name="fk-path" checked={screen === id} onChange={() => setScreen(id as boolean)}/>{text as string}</label>)}
      </div><p role="status" aria-live="polite" className={ok ? "success-text" : "error-text"}>{result.message}</p></> },
  ]} rail={<>
    <Box title="Check table ZACA_DEPARTMENT"><pre dir="ltr">{departments.map(d => `${d.department_id.padEnd(6)} ${d.name}`).join("\n")}</pre></Box>
    <Box title="Good to know"><p className="muted">The foreign key lives in the ABAP Dictionary, not in the database. Programs must check the department themselves, for example with SELECT SINGLE on the check table.</p></Box>
  </>} />;
}

function SearchHelpLab() {
  const [pattern, setPattern] = useTopicSession("dictionary-search-helps:lab-pattern", "");
  const [field, setField] = useTopicSession("dictionary-search-helps:lab-field", "");
  const [open, setOpen] = useTopicSession("dictionary-search-helps:lab-open", false);
  const rows = searchHelpRows(departments, "name", pattern);
  return <StepLab label="Search help lab" sessionKey="dictionary-search-helps:lab" steps={[
    { name: "Press F4", hint: "open the list", title: "Press F4 on the department field", intro: "The department field uses the elementary search help ZACA_SH_DEPARTMENT.",
      body: <div className="explore-actions"><label>Department<input dir="ltr" value={field} onChange={e => setField(e.target.value)}/></label>
        <button className="secondary" onClick={() => setOpen(true)}>F4</button></div> },
    { name: "Restrict and choose", hint: "filter, pick a row", title: "Restrict the list and pick a row", intro: "Use * as a wildcard, for example S*. Only the EXPORT parameter, department_id, is copied back into the field.",
      body: open ? <><label>Restrict by name<input dir="ltr" value={pattern} placeholder="e.g. S*" onChange={e => setPattern(e.target.value)}/></label>
        <p role="status">{rows.length} of {departments.length} departments</p>
        <div className="table-scroll"><table className="key-table" aria-label="Value list"><thead><tr><th>department_id (export)</th><th>name</th><th></th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.department_id}><td>{row.department_id}</td><td>{row.name}</td><td><button className="text-button" onClick={() => { setField(row.department_id); setOpen(false); }}>Choose {row.department_id}</button></td></tr>)}</tbody></table></div></>
        : <p className="muted">The value list is closed. Go back and press F4 to open it{field ? `; the field already holds ${field}` : ""}.</p> },
  ]} rail={<>
    <Box title="The screen field"><div className="dd-head"><span>Department</span><b className="dict-field" dir="ltr">{field || " "}</b></div>
      <p className="muted">{open ? "The value list is open." : "The value list is closed."}</p></Box>
    <Box title="Good to know"><p className="muted">Name is shown to help you choose. Search helps belong to classic screens. In ABAP Cloud, a CDS value help plays this role.</p></Box>
  </>} />;
}

export const dictionaryLabs: Record<string, () => React.JSX.Element> = {
  "dictionary-domains": DomainLab,
  "dictionary-data-elements": DataElementLab,
  "dictionary-structures": StructureLab,
  "dictionary-database-tables": TableKeyLab,
  "dictionary-foreign-keys": ForeignKeyLab,
  "dictionary-search-helps": SearchHelpLab,
};
export function DictionaryLab({ id }: { id: string }) {
  const Lab = dictionaryLabs[id];
  return Lab ? <Lab/> : null;
}
