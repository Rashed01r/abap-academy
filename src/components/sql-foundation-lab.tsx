"use client";
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
export function SqlFoundationLab({ lang }: { lang: Locale }) {
  const t = copy[lang];
  const [source, setSource] = useTopicSession<SqlSource>("sql-foundation:source", "employees");
  const [fields, setFields] = useTopicSession("sql-foundation:fields", ["employee_id", "employee_name"]);
  const [department, setDepartment] = useTopicSession("sql-foundation:department", "IT");
  const [salary, setSalary] = useTopicSession("sql-foundation:salary", "0");
  const columns = source === "employees" ? ["employee_id", "employee_name", "department", "salary"] : ["department", "department_name"];
  const rows = projectSqlFixture({ source, fields, department, minimumSalary: Number(salary) });
  const original = source === "employees" ? sqlEmployees : sqlDepartments;
  function table(data: readonly Record<string, string | number>[], selected: string[], caption: string) {
    return <div className="table-scroll"><table className="key-table"><caption>{caption}</caption><thead><tr><th scope="col">{t.record}</th>{selected.map(field => <th scope="col" key={field}><code>{field}</code></th>)}</tr></thead><tbody>{data.map((row, index) => <tr key={index}><th scope="row">{index + 1}</th>{selected.map(field => <td key={field}><bdi dir="ltr">{row[field]}</bdi></td>)}</tr>)}{!data.length && <tr><td colSpan={selected.length + 1}>{t.empty}</td></tr>}</tbody></table></div>;
  }
  return <section className="learn-card guided-explorer guided-assessment" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.limit}</p>
    <label>{t.source}<select value={source} onChange={event => { const next = event.target.value as SqlSource; setSource(next); setFields(next === "employees" ? ["employee_id", "employee_name"] : ["department", "department_name"]); }}><option value="employees">{t.employees}</option><option value="departments">{t.departments}</option></select></label>
    <fieldset><legend>{t.columns}</legend><div className="explore-actions">{columns.map(field => <label key={field}><input type="checkbox" checked={fields.includes(field)} onChange={event => setFields(previous => columns.filter(column => column === field ? event.target.checked : previous.includes(column)))}/><code>{field}</code></label>)}</div></fieldset>
    <fieldset><legend>{t.filter}</legend><div className="explore-actions"><label>{t.department}<select value={department} onChange={e => setDepartment(e.target.value)}><option value="">{t.all}</option>{sqlDepartments.map(row => <option key={row.department}>{row.department}</option>)}<option value="LEGAL">{t.none}</option></select></label><label>{t.salary}<input type="number" value={salary} disabled={source !== "employees"} onChange={e => setSalary(e.target.value)}/></label></div></fieldset>
    <div className="key-reference"><h3>{t.model}</h3><pre dir="ltr">{`FROM ${source}\nFIELDS ${fields.join(", ") || "?"}\nWHERE ${department ? `department = ${department}` : "all departments"}${source === "employees" ? ` AND salary >= ${salary || "0"}` : ""}`}</pre></div>
    {table(original, columns, t.sourceRows)}
    <div role="status" aria-live="polite"><p>{!fields.length ? t.choose : !Number.isFinite(Number(salary)) ? t.invalid : `${t.count}: ${rows.length}`}</p></div>
    {fields.length > 0 && table(rows, fields, t.resultRows)}<p>{t.explanation}</p><p>{t.order}</p>
  </section>;
}
