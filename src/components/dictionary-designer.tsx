"use client";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";

export type DomainDraft = { type: "CHAR" | "NUMC" | "INT4"; length: number; fixed: string[] };
export function domainValueIssues(domain: DomainDraft, value: string): string[] {
  const issues: string[] = [];
  if (!Number.isInteger(domain.length) || domain.length < 1 || domain.length > 40) issues.push("length");
  if (domain.type === "INT4") {
    if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < -2147483648 || Number(value) > 2147483647) issues.push("integer");
  } else {
    if (value.length > domain.length) issues.push("overflow");
    if (domain.type === "NUMC" && !/^\d+$/.test(value)) issues.push("digits");
  }
  if (domain.fixed.length && !domain.fixed.includes(value)) issues.push("fixed");
  return issues;
}
export function dictionaryDesignIssues(domain: DomainDraft, binding: string, keys: string[]): string[] {
  const issues: string[] = [];
  if (!Number.isInteger(domain.length) || domain.length < 1 || domain.length > 40) issues.push("length");
  if (!binding) issues.push("binding");
  if (domain.fixed.some(value => domainValueIssues({ ...domain, fixed: [] }, value).length)) issues.push("fixedDefinition");
  if (!keys.length) issues.push("keyMissing");
  if (!keys.includes("employee_id")) issues.push("identityMissing");
  if (keys.includes("name") || keys.includes("status")) issues.push("mutableKey");
  return [...new Set(issues)];
}
const copy = {
  en: {
    title: "Dictionary designer", boundary: "Local teaching model: no SAP objects are created or activated. These input checks illustrate a domain policy; they do not claim that a domain enforces a database CHECK constraint.",
    domain: "1. Technical domain", type: "Dictionary type", length: "Length (1–40 for this lab)", fixed: "Fixed values (comma separated; blank means unrestricted)", intInfo: "INT4 uses a signed 32-bit integer range; the character length control does not apply.",
    element: "2. Semantic data element", binding: "Domain binding for ZACA_EMPLOYEE_STATUS", unbound: "Unbound — missing dependency", custom: "ZACA_STATUS_DOMAIN — your domain above", label: "Translated label", labelValue: "Employee status / حالة الموظف", table: "3. Table key", keyHelp: "Single-client teaching table: an employee ID is unique; names and status may change. Select the stable identity. A real client-dependent table also includes its client field in the primary key.", test: "4. Check an input value", value: "Candidate status", accepted: "Value satisfies the selected local domain policy.", valid: "Dependencies and identity are consistent in this model. This is not SAP activation.", sample: "Current design", issues: "Review the design", changed: "Changing a shared domain can affect every dependent element and field; review consumers before real SAP activation.",
    lengthError: "Choose an integer length between 1 and 40.", bindingError: "Bind the data element to a domain.", fixedDefinition: "A fixed value conflicts with the domain type or length.", keyMissing: "A persistent table needs a defined primary key.", identityMissing: "Include employee_id to distinguish employees.", mutableKey: "For this business rule, keep mutable name and status outside the employee identity.", overflow: "The value exceeds the chosen character length; this model rejects it instead of truncating.", digits: "NUMC accepts digit characters in this lab, for example 000101; it is not an arithmetic integer type.", integer: "INT4 requires a whole number from -2147483648 to 2147483647.", fixedError: "The value is absent from the selected fixed-value list.", noBinding: "An unbound element has no resolved domain for this test.",
  },
  ar: {
    title: "مصمم القاموس", boundary: "نموذج تعليمي محلي: لا ينشئ كائنات SAP ولا يفعّلها. توضح فحوص الإدخال سياسة نطاق؛ ولا تدّعي أن النطاق يفرض قيد CHECK في قاعدة البيانات.",
    domain: "1. النطاق التقني", type: "نوع القاموس", length: "الطول (من 1 إلى 40 في هذا المختبر)", fixed: "القيم الثابتة (افصل بفاصلة إنجليزية؛ الفراغ يعني دون تقييد)", intInfo: "يستخدم INT4 مجال أعداد صحيحة موقعة من 32 بت؛ ولا ينطبق عليه تحكم طول الحروف.",
    element: "2. عنصر البيانات الدلالي", binding: "ربط نطاق ZACA_EMPLOYEE_STATUS", unbound: "غير مرتبط — اعتماد ناقص", custom: "ZACA_STATUS_DOMAIN — النطاق المصمم أعلاه", label: "التسمية المترجمة", labelValue: "حالة الموظف / Employee status", table: "3. مفتاح الجدول", keyHelp: "جدول تعليمي لعميل واحد: معرّف الموظف فريد وقد يتغير الاسم والحالة. اختر الهوية الثابتة. يتضمن المفتاح الأساسي للجدول الحقيقي المعتمد على العميل حقل العميل أيضًا.", test: "4. افحص قيمة إدخال", value: "الحالة المرشحة", accepted: "تستوفي القيمة سياسة النطاق المحلي المختار.", valid: "الاعتمادات والهوية متسقة في هذا النموذج. هذا ليس تفعيلًا في SAP.", sample: "التصميم الحالي", issues: "راجع التصميم", changed: "قد يؤثر تعديل النطاق المشترك في كل عنصر وحقل يعتمد عليه؛ راجع المستهلكين قبل التفعيل الحقيقي في SAP.",
    lengthError: "اختر طولًا صحيحًا بين 1 و40.", bindingError: "اربط عنصر البيانات بنطاق.", fixedDefinition: "تتعارض قيمة ثابتة مع نوع النطاق أو طوله.", keyMissing: "يحتاج الجدول الدائم إلى مفتاح أساسي محدد.", identityMissing: "أدرج employee_id لتمييز الموظفين.", mutableKey: "لهذه القاعدة التجارية أبقِ الاسم والحالة القابلين للتعديل خارج هوية الموظف.", overflow: "تتجاوز القيمة طول الحروف المختار؛ يرفضها النموذج بدل اقتطاعها.", digits: "يقبل NUMC حروف الأرقام هنا مثل 000101؛ وليس نوع عدد صحيح للحساب.", integer: "يتطلب INT4 عددًا صحيحًا بين -2147483648 و2147483647.", fixedError: "القيمة غير موجودة في قائمة القيم الثابتة المختارة.", noBinding: "لا يملك العنصر غير المرتبط نطاقًا محددًا لهذا الفحص.",
  },
};
export function DictionaryDesigner({ lang }: { lang: Locale }) {
  const t = copy[lang];
  const [type, setType] = useTopicSession<DomainDraft["type"]>("dictionary-designer:type", "CHAR");
  const [length, setLength] = useTopicSession("dictionary-designer:length", 1);
  const [fixed, setFixed] = useTopicSession("dictionary-designer:fixed", "A,I");
  const [binding, setBinding] = useTopicSession("dictionary-designer:binding", "ZACA_STATUS_DOMAIN");
  const [keys, setKeys] = useTopicSession("dictionary-designer:keys", ["employee_id"]);
  const [value, setValue] = useTopicSession("dictionary-designer:value", "A");
  const domain: DomainDraft = { type, length: type === "INT4" ? 10 : length, fixed: fixed.split(",").map(v => v.trim()).filter(Boolean) };
  const issues = dictionaryDesignIssues(domain, binding, keys);
  const valueIssues = domainValueIssues(domain, value);
  const messages: Record<string, string> = { length: t.lengthError, binding: t.bindingError, fixedDefinition: t.fixedDefinition, keyMissing: t.keyMissing, identityMissing: t.identityMissing, mutableKey: t.mutableKey, overflow: t.overflow, digits: t.digits, integer: t.integer, fixed: t.fixedError };
  return <section className="learn-card guided-explorer guided-assessment" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.boundary}</p>
    <fieldset><legend>{t.domain}</legend><div className="explore-actions">
      <label>{t.type}<select value={type} onChange={e => setType(e.target.value as DomainDraft["type"])}>{["CHAR", "NUMC", "INT4"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>{t.length}<input type="number" min={1} max={40} value={length} disabled={type === "INT4"} onChange={e => setLength(Number(e.target.value))}/></label>
      <label>{t.fixed}<input dir="ltr" value={fixed} onChange={e => setFixed(e.target.value)}/></label>
    </div>{type === "INT4" && <p>{t.intInfo}</p>}</fieldset>
    <fieldset><legend>{t.element}</legend><label>{t.binding}<select value={binding} onChange={e => setBinding(e.target.value)}><option value="">{t.unbound}</option><option value="ZACA_STATUS_DOMAIN">{t.custom}</option></select></label><p>{t.label}: {t.labelValue}</p></fieldset>
    <fieldset><legend>{t.table}</legend><p>{t.keyHelp}</p><div className="explore-actions">{["employee_id", "name", "status"].map(field => <label key={field}><input type="checkbox" checked={keys.includes(field)} onChange={e => setKeys(previous => e.target.checked ? [...previous, field] : previous.filter(v => v !== field))}/><code>{field}</code></label>)}</div></fieldset>
    <div role="status" aria-live="polite"><h3>{issues.length ? t.issues : t.valid}</h3>{issues.length > 0 && <ul>{issues.map(issue => <li key={issue}>{messages[issue]}</li>)}</ul>}</div>
    <fieldset><legend>{t.test}</legend><label>{t.value}<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label><div role="status" aria-live="polite">{!binding ? <p>{t.noBinding}</p> : valueIssues.length ? <ul>{valueIssues.map(issue => <li key={issue}>{messages[issue]}</li>)}</ul> : <p>{t.accepted}</p>}</div></fieldset>
    <div className="key-reference"><h3>{t.sample}</h3><pre dir="ltr">{`DOMAIN ZACA_STATUS_DOMAIN: ${type}${type === "INT4" ? "" : `(${length})`}\nFIXED: ${domain.fixed.join(" | ") || "—"}\nELEMENT ZACA_EMPLOYEE_STATUS → ${binding || "?"}\nTABLE STATUS → ZACA_EMPLOYEE_STATUS\nKEY: ${keys.join(" + ") || "?"}`}</pre></div><p>{t.changed}</p>
  </section>;
}
