"use client";
import { TeachingTrace, useTraceIndex } from "./teaching-trace";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";
export const sqlEmployees = [
  { employee_id: 101, employee_name: "Ahmed", department: "IT", salary: 8000 },
  { employee_id: 102, employee_name: "Sara", department: "HR", salary: 7200 },
  { employee_id: 103, employee_name: "Omar", department: "IT", salary: 9500 },
  { employee_id: 104, employee_name: "Huda", department: "SALES", salary: 6800 },
] as const;
export const sqlDepartments = [
  { department: "IT", department_name: "Technology" }, { department: "HR", department_name: "Human resources" }, { department: "SALES", department_name: "Sales" },
] as const;
export type SqlSource = "employees" | "departments";
export type SqlProjection = { source: SqlSource; fields: string[]; department: string; minimumSalary: number };
export function projectSqlFixture(model: SqlProjection): Record<string, string | number>[] {
  const source: readonly Record<string, string | number>[] = model.source === "employees" ? sqlEmployees : sqlDepartments;
  const allowed: readonly string[] = model.source === "employees" ? ["employee_id", "employee_name", "department", "salary"] : ["department", "department_name"];
  if (!model.fields.length || model.fields.some(field => !allowed.includes(field)) || !Number.isFinite(model.minimumSalary)) return [];
  return source.filter(row => (!model.department || row.department === model.department) && (model.source !== "employees" || Number(row.salary) >= model.minimumSalary))
    .map(row => Object.fromEntries(model.fields.map(field => [field, row[field]])));
}
const copy = {
  en: { title: "SQL foundation lab", limit: "Typed local projection/filter model over fixed records. No SQL text is parsed or sent to SAP. Changing a result never writes to a database.", source: "Source", employees: "Employees", departments: "Departments", columns: "Projected columns (FIELDS)", filter: "Row filter (WHERE)", department: "Department", all: "All departments", none: "LEGAL — no matching source row", salary: "Minimum salary (employees only)", sourceRows: "Complete source records", resultRows: "Derived result", count: "Result rows", choose: "Select at least one column to define a result.", invalid: "Enter a finite minimum salary.", empty: "No matching rows", model: "Read plan — explanatory notation, not executable SQL", order: "This fixture keeps the displayed source order. A real database requires ORDER BY when a particular order matters.", explanation: "Projection changes columns; filtering changes rows. A filter column need not appear in the projected result. Departments and employees are separate sources; this introduction does not execute joins.", record: "Record" },
  ar: { title: "مختبر أساسيات SQL", limit: "نموذج محلي محدد الأنواع لاختيار الأعمدة وتصفية سجلات ثابتة. لا يُحلل نص SQL ولا يُرسل إلى SAP. لا يؤدي تعديل النتيجة إلى الكتابة في قاعدة بيانات.", source: "المصدر", employees: "الموظفون", departments: "الأقسام", columns: "الأعمدة المختارة (FIELDS)", filter: "تصفية الصفوف (WHERE)", department: "القسم", all: "جميع الأقسام", none: "LEGAL — لا يوجد صف مطابق في المصدر", salary: "الحد الأدنى للراتب (للموظفين فقط)", sourceRows: "سجلات المصدر الكاملة", resultRows: "النتيجة المشتقة", count: "عدد صفوف النتيجة", choose: "اختر عمودًا واحدًا على الأقل لتعريف النتيجة.", invalid: "أدخل حدًا أدنى محدودًا للراتب.", empty: "لا توجد صفوف مطابقة", model: "خطة القراءة — وصف توضيحي وليس SQL قابلًا للتنفيذ", order: "تحتفظ بيانات التدريب بترتيب المصدر المعروض. تتطلب قاعدة البيانات الحقيقية ORDER BY عندما يكون الترتيب مهمًا.", explanation: "يغيّر اختيار الأعمدة أعمدة النتيجة وتغيّر التصفية صفوفها. لا يلزم ظهور عمود التصفية في النتيجة المختارة. الأقسام والموظفون مصدران منفصلان؛ ولا تنفذ هذه المقدمة عمليات ربط.", record: "السجل" },
};
export function SqlFoundationLab({ lang,onSourceGroup }: { lang: Locale;onSourceGroup?:(id:string)=>void }) {
  const t = copy[lang];
  const [source, setSource] = useTopicSession<SqlSource>("sql-foundation:source", "employees");
  const [fields, setFields] = useTopicSession("sql-foundation:fields", ["employee_id", "employee_name"]);
  const [department, setDepartment] = useTopicSession("sql-foundation:department", "IT");
  const [salary, setSalary] = useTopicSession("sql-foundation:salary", "0");
  const columns = source === "employees" ? ["employee_id", "employee_name", "department", "salary"] : ["department", "department_name"];
  const rows = projectSqlFixture({ source, fields, department, minimumSalary: Number(salary) });
  const original = source === "employees" ? sqlEmployees : sqlDepartments;
  const [traceIndex,setTraceIndex]=useTraceIndex("sql-foundation:trace",3,2);
  const filtered=projectSqlFixture({source,fields:columns,department,minimumSalary:Number(salary)});
  const query=`FROM ${source}
FIELDS ${fields.join(", ") || "?"}
WHERE ${department ? "department = "+department : "all departments"}${source==="employees" ? " AND salary >= "+(salary || "0") : ""}`;
  const traceSteps=[
    {id:"source",title:t.sourceRows,sentence:lang==="en" ? `The ${source} source supplies ${original.length} rows before any filtering or column selection.` : `يوفر المصدر ${source} عدد ${original.length} من الصفوف قبل التصفية أو اختيار الأعمدة.`,line:1,state:{rows:original.length}},
    {id:"filter",title:t.filter,sentence:lang==="en" ? `The department filter ${department || "all"}${source==="employees" ? " and minimum salary "+(salary || "0") : ""} keeps ${filtered.length} of ${original.length} rows because only matching records are included.` : `يبقي مرشح القسم ${department || "الكل"}${source==="employees" ? " والحد الأدنى للراتب "+(salary || "0") : ""} عدد ${filtered.length} من أصل ${original.length} صفوف مطابقة.`,line:3,state:{rows:filtered.length}},
    {id:"projection",title:t.resultRows,sentence:lang==="en" ? `Choosing ${fields.join(", ") || "no columns"} leaves ${rows.length} result rows with only the requested fields.` : `يؤدي اختيار ${fields.join("، ") || "بلا أعمدة"} إلى ${rows.length} صفوف نتيجة بالحقول المطلوبة فقط.`,line:2,state:{rows:rows.length,fields:fields.join(", ") || "—"}},
  ];
  function table(data: readonly Record<string, string | number>[], selected: string[], caption: string) {
    return <div className="table-scroll"><table className="key-table"><caption>{caption}</caption><thead><tr><th scope="col">{t.record}</th>{selected.map(field => <th scope="col" key={field}><code>{field}</code></th>)}</tr></thead><tbody>{data.map((row, index) => <tr key={index}><th scope="row">{index + 1}</th>{selected.map(field => <td key={field}><bdi dir="ltr">{row[field]}</bdi></td>)}</tr>)}{!data.length && <tr><td colSpan={selected.length + 1}>{t.empty}</td></tr>}</tbody></table></div>;
  }
  return <section className="learn-card guided-explorer guided-assessment" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.limit}</p>
    <TeachingTrace steps={traceSteps} index={traceIndex} onChoose={index=>{setTraceIndex(index);onSourceGroup?.(["sql-source","sql-filter","sql-projection"][index]);}} lang={lang} source={query} reference>
    <div className="sql-visual-stage" data-primary-diagram="projection-filter">
      {table(original, columns, t.sourceRows)}<div className="sql-transform-arrow"><strong>WHERE</strong><span aria-hidden="true">→</span><strong>FIELDS</strong></div>{table(traceIndex===0 ? original : traceIndex===1 ? filtered : rows,traceIndex<2 ? columns : fields,t.resultRows)}
    </div>
    </TeachingTrace>
    <label>{t.source}<select value={source} onChange={event => { const next = event.target.value as SqlSource; setSource(next); setTraceIndex(2);onSourceGroup?.("sql-source"); setFields(next === "employees" ? ["employee_id", "employee_name"] : ["department", "department_name"]); }}><option value="employees">{t.employees}</option><option value="departments">{t.departments}</option></select></label>
    <fieldset><legend>{t.columns}</legend><div className="explore-actions">{columns.map(field => <label key={field}><input type="checkbox" checked={fields.includes(field)} onChange={event => {setFields(previous => columns.filter(column => column === field ? event.target.checked : previous.includes(column)));setTraceIndex(2);onSourceGroup?.("sql-projection");}}/><code>{field}</code></label>)}</div></fieldset>
    <fieldset><legend>{t.filter}</legend><div className="explore-actions"><label>{t.department}<select value={department} onChange={e => {setDepartment(e.target.value);setTraceIndex(2);onSourceGroup?.("sql-filter");}}><option value="">{t.all}</option>{sqlDepartments.map(row => <option key={row.department}>{row.department}</option>)}<option value="LEGAL">{t.none}</option></select></label><label>{t.salary}<input type="number" value={salary} disabled={source !== "employees"} onChange={e => {setSalary(e.target.value);setTraceIndex(2);onSourceGroup?.("sql-filter");}}/></label></div></fieldset>
    <div className="key-reference"><h3>{t.model}</h3><pre dir="ltr">{`FROM ${source}\nFIELDS ${fields.join(", ") || "?"}\nWHERE ${department ? `department = ${department}` : "all departments"}${source === "employees" ? ` AND salary >= ${salary || "0"}` : ""}`}</pre></div>
    <div role="status" aria-live="polite"><p>{!fields.length ? t.choose : !Number.isFinite(Number(salary)) ? t.invalid : `${t.count}: ${rows.length}`}</p></div>
    <p>{t.explanation}</p><p>{t.order}</p>
  </section>;
}
