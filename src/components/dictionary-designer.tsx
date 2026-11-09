"use client";
import { ENABLE_ARABIC } from "@/lib/language-policy";
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
    steps: [["Domain", "type and length"], ["Data element", "bind to a domain"], ["Table key", "choose key fields"], ["Test a value", "see it checked"]] as [string, string][], stepsLabel: "Design steps",
    stepTitles: ["Define the technical domain", "Give ZACA_EMPLOYEE_STATUS its technical type", "Choose the table key", "Check a value against the domain"],
    stepIntros: ["A domain sets the type, length and allowed values once, so many fields can share it.", "A data element says what a field means. It borrows its type and length from a domain, so many fields can share one definition.", "A good key never changes and never repeats. Tick the fields that identify an employee row.", "Type a candidate status and see whether the domain you designed accepts it."],
    boundHint: "Your domain from step 1: type, length and fixed values are inherited.", unboundHint: "Missing dependency: activation would fail.", boundResult: "Bound. The element now inherits the type, length and values of your domain.",
    keyAdvice: { employee_id: "Stable business identifier. Each employee has exactly one.", name: "Names change and repeat, so two people could collide.", status: "Changes from A to I when someone leaves." } as Record<string, string>, goodKey: "good key", badKey: "bad key",
    checksLabel: "Checks", checkLength: "Length is between 1 and 40", checkFixed: "Fixed values fit the domain", checkBinding: "Element is bound to a domain", checkKey: "Table has a primary key", checkIdentity: "Key contains employee_id", checkStable: "Key avoids name and status",
    problem: "problem", problems: "problems", consistent: "Design is consistent", back: "Back", next: "Next", done: "Last step", stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
    title: "Dictionary designer", boundary: "Local teaching model: no SAP objects are created or activated. These input checks illustrate a domain policy; they do not claim that a domain enforces a database CHECK constraint.",
    domain: "1. Technical domain", type: "Dictionary type", length: "Length (1–40 for this lab)", fixed: "Fixed values (comma separated; blank means unrestricted)", intInfo: "INT4 uses a signed 32-bit integer range; the character length control does not apply.",
    element: "2. Semantic data element", binding: "Domain binding for ZACA_EMPLOYEE_STATUS", unbound: "Unbound — missing dependency", custom: "ZACA_STATUS_DOMAIN — your domain above", label: "Translated label", labelValue: ENABLE_ARABIC ? "Employee status / حالة الموظف" : "Employee status", table: "3. Table key", keyHelp: "Single-client teaching table: an employee ID is unique; names and status may change. Select the stable identity. A real client-dependent table also includes its client field in the primary key.", test: "4. Check an input value", value: "Candidate status", accepted: "Value satisfies the selected local domain policy.", valid: "Dependencies and identity are consistent in this model. This is not SAP activation.", sample: "Current design", issues: "Review the design", changed: "Changing a shared domain can affect every dependent element and field; review consumers before real SAP activation.",
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
  const t = { ...copy.en, ...copy[lang] }; // new guided-step wording is English only while ENABLE_ARABIC = false
  const [step, setStep] = useTopicSession("dictionary-designer:step", 0);
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
  const has = (...names: string[]) => names.some(n => issues.includes(n));
  const valid = [!has("length", "fixedDefinition"), !has("binding"), !has("keyMissing", "identityMissing", "mutableKey"), !!binding && !valueIssues.length];
  const checks: [string, boolean, string, string][] = [
    ["length", !has("length"), t.checkLength, t.lengthError], ["fixed", !has("fixedDefinition"), t.checkFixed, t.fixedDefinition], ["binding", !has("binding"), t.checkBinding, t.bindingError],
    ["key", !has("keyMissing"), t.checkKey, t.keyMissing], ["identity", !has("identityMissing"), t.checkIdentity, t.identityMissing], ["stable", !has("mutableKey"), t.checkStable, t.mutableKey],
  ];
  const current = Math.min(Math.max(step, 0), t.steps.length - 1);
  return <section className="learn-card guided-explorer guided-assessment dd" dir={lang === "ar" ? "rtl" : "ltr"} aria-label={t.title}>
    <h2>{t.title}</h2><p className="dd-note">{t.boundary}</p>
    <ol className="dd-steps" aria-label={t.stepsLabel}>{t.steps.map(([name, hint], i) => <li key={name}>
      <button type="button" className="dd-step" aria-current={i === current ? "step" : undefined} data-state={i === current ? "current" : i < current ? (valid[i] ? "ok" : "problem") : "todo"} onClick={() => setStep(i)}>
        <b aria-hidden="true">{i === current ? i + 1 : i < current ? (valid[i] ? "✓" : "!") : i + 1}</b><span>{name}<small>{hint}</small></span></button></li>)}</ol>
    <div className="dd-grid">
      <div className="dd-main">
        <h3>{t.stepTitles[current]}</h3><p className="muted">{t.stepIntros[current]}</p>
        {current === 0 && <><div className="explore-actions">
          <label>{t.type}<select value={type} onChange={e => setType(e.target.value as DomainDraft["type"])}>{["CHAR", "NUMC", "INT4"].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>{t.length}<input type="number" min={1} max={40} value={length} disabled={type === "INT4"} onChange={e => setLength(Number(e.target.value))}/></label>
          <label>{t.fixed}<input dir="ltr" value={fixed} onChange={e => setFixed(e.target.value)}/></label>
        </div>{type === "INT4" && <p className="muted">{t.intInfo}</p>}</>}
        {current === 1 && <><fieldset className="dd-choices"><legend>{t.binding}</legend>
          {[["ZACA_STATUS_DOMAIN", t.custom, t.boundHint], ["", t.unbound, t.unboundHint]].map(([id, title, hint]) => <label key={id || "none"} data-on={binding === id || undefined}>
            <input type="radio" name="dd-binding" checked={binding === id} onChange={() => setBinding(id)}/><span><b>{title}</b><small>{hint}</small></span></label>)}</fieldset>
          <p>{t.label}: <strong>{t.labelValue}</strong></p>
          <p role="status" aria-live="polite" data-ok={!!binding}>{binding ? t.boundResult : t.bindingError}</p></>}
        {current === 2 && <fieldset className="dd-choices"><legend>{t.table}</legend>
          {["employee_id", "name", "status"].map(field => <label key={field} data-on={keys.includes(field) || undefined}>
            <input type="checkbox" checked={keys.includes(field)} onChange={e => setKeys(previous => e.target.checked ? [...previous, field] : previous.filter(v => v !== field))}/>
            <span><b><code>{field}</code></b><small>{t.keyAdvice[field]}</small></span><em data-good={field === "employee_id"}>{field === "employee_id" ? t.goodKey : t.badKey}</em></label>)}</fieldset>}
        {current === 3 && <><label className="dd-test">{t.value}<input dir="ltr" value={value} onChange={e => setValue(e.target.value)}/></label>
          <div role="status" aria-live="polite" data-ok={valid[3]}>{!binding ? <p>{t.noBinding}</p> : valueIssues.length ? <ul>{valueIssues.map(issue => <li key={issue}>{messages[issue]}</li>)}</ul> : <p>{t.accepted}</p>}</div></>}
      </div>
      <div className="dd-rail">
        <section className="dd-box" aria-label={t.sample}><div className="dd-head"><span className="eyebrow">{t.sample}</span>
          <span className="dd-pill" data-ok={!issues.length} role="status" aria-live="polite">{issues.length ? `${issues.length} ${issues.length === 1 ? t.problem : t.problems}` : t.consistent}</span></div>
          <pre dir="ltr">{`DOMAIN ZACA_STATUS_DOMAIN: ${type}${type === "INT4" ? "" : `(${length})`}\nFIXED: ${domain.fixed.join(" | ") || "—"}\nELEMENT ZACA_EMPLOYEE_STATUS → ${binding || "?"}\nTABLE STATUS → ZACA_EMPLOYEE_STATUS\nKEY: ${keys.join(" + ") || "?"}`}</pre></section>
        <section className="dd-box" aria-label={t.checksLabel}><span className="eyebrow">{t.checksLabel}</span>
          <ul className="dd-checks">{checks.map(([id, ok, good, bad]) => <li key={id} data-ok={ok}>{ok ? `✓ ${good}` : `✗ ${bad}`}</li>)}</ul>
          <p className="muted">{issues.length ? t.issues : t.valid}</p></section>
      </div>
    </div>
    <div className="add-controls"><button type="button" onClick={() => setStep(current - 1)} disabled={!current}><span aria-hidden="true">← </span>{t.back}</button>
      <span className="add-progress">{t.stepOf(current + 1, t.steps.length)}</span>
      <button type="button" className="primary" onClick={() => setStep(current + 1)} disabled={current === t.steps.length - 1}>{current === t.steps.length - 1 ? t.done : `${t.next}: ${t.steps[current + 1][0]} →`}</button></div>
    <p className="muted">{t.changed}</p>
  </section>;
}
