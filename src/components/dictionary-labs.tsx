"use client";
// Small hands-on labs for the ABAP Dictionary lessons. English only while ENABLE_ARABIC = false.
// Local teaching models: nothing is created, activated or checked in an SAP system.
import { useTopicSession } from "@/lib/use-topic-session";
import { domainValueIssues, type DomainDraft } from "./dictionary-designer";
import {
  labelSlots, labelFit, structureComponents, candidateRows, keyCandidates, keyCollisions, keyDesignIssues,
  departments, foreignKeyCheck, searchHelpRows,
} from "@/lib/dictionary-labs";

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
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Domain lab">
    <h2>Domain lab</h2>
    <p>Change ZACA_STATUS_DOMAIN, then test a value. Both data elements below reuse it, so they change together.</p>
    <fieldset><legend>1. The domain</legend><div className="explore-actions">
      <label>Data type<select value={type} onChange={e => setType(e.target.value as DomainDraft["type"])}>{["CHAR", "NUMC", "INT4"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Length<input type="number" min={1} max={40} value={length} disabled={type === "INT4"} onChange={e => setLength(Number(e.target.value))}/></label>
      <label>Fixed values (comma separated)<input dir="ltr" value={fixed} onChange={e => setFixed(e.target.value)}/></label>
    </div></fieldset>
    <fieldset><legend>2. Test a value</legend>
      <label>Value<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label>
      <div role="status" aria-live="polite">{issues.length ? <ul>{issues.map(i => <li key={i} className="error-text">{domainMessages[i]}</li>)}</ul> : <p className="success-text">Accepted by the domain&apos;s rules.</p>}</div>
    </fieldset>
    <div className="key-reference"><h3>Reused by</h3><pre dir="ltr">{`ZACA_EMPLOYEE_STATUS → ZACA_STATUS_DOMAIN: ${shape}\nZACA_SUPPLIER_STATUS → ZACA_STATUS_DOMAIN: ${shape}`}</pre></div>
    <p className="muted">Fixed values help classic screens and value lists. They do not stop an ABAP program from storing another value.</p>
  </section>;
}

function DataElementLab() {
  const [category, setCategory] = useTopicSession("dictionary-data-elements:lab-category", "domain");
  const [labels, setLabels] = useTopicSession<Record<string, string>>("dictionary-data-elements:lab-labels", { short: "Status", medium: "Employee status", long: "Employee status", heading: "Employee status" });
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Data element lab">
    <h2>Data element lab</h2>
    <p>Choose where ZACA_EMPLOYEE_STATUS gets its technical type, then write labels that fit their boxes.</p>
    <fieldset><legend>1. Technical type comes from</legend><div className="explore-actions">
      {[["domain", "Domain ZACA_STATUS_DOMAIN"], ["predefined", "Predefined type CHAR(1)"]].map(([id, text]) => <label key={id}><input type="radio" name="dtel-category" checked={category === id} onChange={() => setCategory(id)}/>{text}</label>)}
    </div><p role="status">{category === "domain" ? "Type, length and fixed values are inherited from the domain and shared with other data elements." : "Type and length are typed here directly. Nothing is shared, and there are no fixed values."}</p></fieldset>
    <fieldset><legend>2. Field labels</legend>
      {labelSlots.map(slot => {
        const fit = labelFit(labels[slot.id] || "", slot.max);
        return <div key={slot.id} className="explore-actions">
          <label>{slot.name} (max {slot.max})<input dir="ltr" value={labels[slot.id] || ""} onChange={e => setLabels(v => ({ ...v, [slot.id]: e.target.value }))}/></label>
          <span role="status" className={fit.fits ? "success-text" : "error-text"}>{fit.missing ? "Empty: screens would show no label." : fit.fits ? `Fits (${(labels[slot.id] || "").length}/${slot.max})` : `Too long: screens show “${fit.shown}”`}</span>
        </div>;
      })}
    </fieldset>
    <div className="key-reference"><h3>Use it in ABAP</h3><pre dir="ltr">{"DATA lv_status TYPE zaca_employee_status.\n\" Not possible: DATA lv_status TYPE zaca_status_domain."}</pre></div>
  </section>;
}

function StructureLab() {
  const [include, setInclude] = useTopicSession("dictionary-structures:lab-include", true);
  const [suffix, setSuffix] = useTopicSession("dictionary-structures:lab-suffix", false);
  const result = structureComponents(include, suffix ? "_home" : "");
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Structure lab">
    <h2>Structure lab</h2>
    <p>ZACA_EMPLOYEE_INFO already has a city field (where the employee works). Include the address structure and watch the component names.</p>
    <div className="explore-actions">
      <label><input type="checkbox" checked={include} onChange={e => setInclude(e.target.checked)}/>include zaca_address</label>
      <label><input type="checkbox" checked={suffix} disabled={!include} onChange={e => setSuffix(e.target.checked)}/>with suffix _home</label>
    </div>
    <div role="status" aria-live="polite">{result.duplicates.length
      ? <p className="error-text">Activation error: the component {result.duplicates.join(", ")} appears twice. Add a suffix to rename the included components.</p>
      : <p className="success-text">All {result.components.length} component names are unique.</p>}</div>
    <div className="key-reference"><h3>Components</h3><pre dir="ltr">{`define structure zaca_employee_info {\n  employee_id : zaca_employee_id;\n  name        : abap.char(40);\n  city        : abap.char(30);${include ? `\n  include zaca_address${suffix ? " with suffix _home" : ""};` : ""}\n}\n\n" Result: ${result.components.join(", ")}`}</pre></div>
    <p className="muted">A structure is a type. DATA ls_info TYPE zaca_employee_info creates one record in memory; nothing is stored in the database.</p>
  </section>;
}

function TableKeyLab() {
  const [keys, setKeys] = useTopicSession<string[]>("dictionary-database-tables:lab-keys", ["client", "employee_id"]);
  const issues = keyDesignIssues(keys);
  const { rejected } = keyCollisions(candidateRows, keys);
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Table key lab">
    <h2>Table key lab</h2>
    <p>Choose the primary key of ZACA_EMPLOYEE, then see which of four new rows the database would refuse as duplicates.</p>
    <fieldset><legend>Key fields</legend><div className="explore-actions">{keyCandidates.map(field => <label key={field}><input type="checkbox" checked={keys.includes(field)} onChange={e => setKeys(previous => e.target.checked ? keyCandidates.filter(f => previous.includes(f) || f === field) : previous.filter(v => v !== field))}/><code>{field}</code></label>)}</div></fieldset>
    <div role="status" aria-live="polite">{issues.length ? <ul>{issues.map(i => <li key={i} className="error-text">{i}</li>)}</ul> : <p className="success-text">Good key: client + employee_id identifies each employee for good.</p>}</div>
    <div className="table-scroll"><table className="key-table" aria-label="Rows to insert"><thead><tr><th>Row</th><th>client</th><th>employee_id</th><th>name</th><th>status</th><th>Result</th></tr></thead>
      <tbody>{candidateRows.map((row, i) => <tr key={i}><td>{i + 1}</td><td>{row.client}</td><td>{row.employee_id}</td><td>{row.name}</td><td>{row.status}</td>
        <td className={rejected.includes(i) ? "error-text" : "success-text"}>{!keys.length ? "—" : rejected.includes(i) ? "Rejected: duplicate key" : "Inserted"}</td></tr>)}</tbody></table></div>
    <p className="muted">Row 4 is Sara again with a new status. With the right key it is refused: change her row with an update instead of inserting a second one.</p>
  </section>;
}

function ForeignKeyLab() {
  const [value, setValue] = useTopicSession("dictionary-foreign-keys:lab-value", "IT");
  const [screen, setScreen] = useTopicSession("dictionary-foreign-keys:lab-screen", true);
  const result = foreignKeyCheck(value, departments, screen);
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Foreign key lab">
    <h2>Foreign key lab</h2>
    <p>The department field of ZACA_EMPLOYEE has a foreign key to the check table ZACA_DEPARTMENT. Enter a department and choose how it is saved.</p>
    <div className="key-reference"><h3>Check table ZACA_DEPARTMENT</h3><pre dir="ltr">{departments.map(d => `${d.department_id.padEnd(6)} ${d.name}`).join("\n")}</pre></div>
    <div className="explore-actions">
      <label>Department<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label>
      {[[true, "Typed on a classic screen"], [false, "Saved by an ABAP program"]].map(([id, text]) => <label key={String(id)}><input type="radio" name="fk-path" checked={screen === id} onChange={() => setScreen(id as boolean)}/>{text as string}</label>)}
    </div>
    <p role="status" aria-live="polite" className={result.saved && (result.exists || !value.trim()) ? "success-text" : "error-text"}>{result.message}</p>
    <p className="muted">The foreign key lives in the ABAP Dictionary, not in the database. Programs must check the department themselves, for example with SELECT SINGLE on the check table.</p>
  </section>;
}

function SearchHelpLab() {
  const [pattern, setPattern] = useTopicSession("dictionary-search-helps:lab-pattern", "");
  const [field, setField] = useTopicSession("dictionary-search-helps:lab-field", "");
  const [open, setOpen] = useTopicSession("dictionary-search-helps:lab-open", false);
  const rows = searchHelpRows(departments, "name", pattern);
  return <section className="learn-card guided-explorer guided-assessment" aria-label="Search help lab">
    <h2>Search help lab</h2>
    <p>The department field uses the elementary search help ZACA_SH_DEPARTMENT. Press F4, optionally restrict the list by name (use * as a wildcard), and pick a row.</p>
    <div className="explore-actions">
      <label>Department<input dir="ltr" value={field} onChange={e => setField(e.target.value)}/></label>
      <button className="secondary" onClick={() => setOpen(true)}>F4</button>
    </div>
    {open && <fieldset><legend>Value list (selection method ZACA_DEPARTMENT)</legend>
      <label>Restrict by name<input dir="ltr" value={pattern} placeholder="e.g. S*" onChange={e => setPattern(e.target.value)}/></label>
      <p role="status">{rows.length} of {departments.length} departments</p>
      <div className="table-scroll"><table className="key-table" aria-label="Value list"><thead><tr><th>department_id (export)</th><th>name</th><th></th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.department_id}><td>{row.department_id}</td><td>{row.name}</td><td><button className="text-button" onClick={() => { setField(row.department_id); setOpen(false); }}>Choose {row.department_id}</button></td></tr>)}</tbody></table></div>
    </fieldset>}
    <p className="muted">Only the EXPORT parameter, department_id, is copied back into the field; name is shown to help you choose. Search helps belong to classic screens. In ABAP Cloud, a CDS value help plays this role.</p>
  </section>;
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
