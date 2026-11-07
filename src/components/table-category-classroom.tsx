"use client";
import { localizedText } from "../lib/language-policy";
import { employeeCategoryState, comparisonEmployees, categoryReference, type Category, type EmployeeRow } from "@/lib/visual-comparisons";
import { useTopicSession } from "@/lib/use-topic-session";
import type { Locale } from "@/lib/engine";
import { VisualCodeAnatomy } from "./visual-code-anatomy";

import { TeachingTrace } from "./teaching-trace";
import { firstSentence } from "@/lib/teaching-trace";
export function EmployeeTable({rows, match, indexed, lang,primaryKey=false}: {rows: EmployeeRow[]; match?: number; indexed?: boolean; lang: Locale;primaryKey?:boolean}) {
  return <div className="employee-table-picture"><table dir="ltr"><thead><tr>{indexed && <th scope="col">#</th>}<th scope="col" className={primaryKey ? "key-column" : ""}>{lang === "en" ? primaryKey ? "ID · KEY" : "ID" : primaryKey ? "المعرّف · المفتاح" : "المعرّف"}</th><th scope="col">{lang === "en" ? "Name" : "الاسم"}</th><th scope="col">{lang === "en" ? "Salary" : "الراتب"}</th></tr></thead><tbody>{rows.map((row,i) => <tr key={i} className={row.id === match && rows.findIndex(r=>r.id === match) === i ? "selected-row" : ""}>{indexed && <th scope="row">{i+1}</th>}<td className={primaryKey ? "key-column" : ""}>{row.id}</td><td>{row.name}</td><td>{row.salary}</td></tr>)}</tbody></table>{!rows.length && <p>∅</p>}</div>;
}
export function TableCategoryClassroom({lang, theme}: {lang: Locale; theme: "light"|"dark"}) {
  const [category,setCategory] = useTopicSession<Category>("category-classroom:category","standard");
  const [count,setCount] = useTopicSession("category-classroom:count",2);
  const [unique,setUnique] = useTopicSession("category-classroom:unique",false);
  const [key,setKey] = useTopicSession("category-classroom:key",10);
  const [looked,setLooked] = useTopicSession("category-classroom:looked",false);
  const [group,setGroup] = useTopicSession("category-classroom:code-group","category");
  const en = lang === "en", snapshot = employeeCategoryState(category,count,unique), found = snapshot.rows.find(row => row.id === key);
  const traceDoc=categoryReference(category,unique,count,key);
  const traceSteps=traceDoc.groups.map((g,i)=>({id:g.id,title:localizedText(g.title, lang),sentence:i===2 ? (en ? `The ${category} table keeps ${snapshot.rows.length} rows from ${count} incoming records because its key rules determine which records are accepted.` : `يحتفظ الجدول ${category} بـ ${snapshot.rows.length} صفوف من ${count} سجلات واردة وفق قواعد مفتاحه.`) : i===3 ? (en ? `Searching for ID ${key} ${found ? "finds "+found.name : "finds no row"}, so only a matching record can supply the result.` : `البحث عن المعرف ${key} ${found ? "يعثر على "+found.name : "لا يعثر على صف"}، لذلك لا توفر النتيجة إلا بيانات مطابقة.`) : firstSentence(localizedText(g.explanation, lang)),line:g.range.startLine,endLine:g.range.endLine,state:i<2 ? {} : i===2 ? {lt_employees:snapshot.rows} : {lt_employees:snapshot.rows,result:found?.name || (en ? "Not found" : "غير موجود")}}));
  const traceIndex=Math.max(0,traceDoc.groups.findIndex(g=>g.id===(group==="source"?"shape":group)));
  const rules = {
    standard: en ? "Positions follow insertion. Repeated keys are allowed." : "تتبع المواضع ترتيب الإدراج. ويُسمح بتكرار المفاتيح.",
    sorted: en ? `ABAP maintains ascending key order. ${unique ? "Repeated keys are rejected." : "Repeated keys are allowed."}` : `تحافظ ABAP على ترتيب المفتاح تصاعدياً. ${unique ? "تُرفض المفاتيح المكررة." : "يُسمح بالمفاتيح المكررة."}`,
    hashed: en ? "A full unique key leads to a record. There is no primary row index." : "يقود المفتاح الفريد الكامل إلى سجل. ولا يوجد فهرس صفوف أساسي.",
  };
  return <section className="category-classroom" data-primary-diagram="categories" aria-label={en ? "Three ways to organize employees" : "ثلاث طرق لتنظيم الموظفين"}>
    <TeachingTrace steps={traceSteps} index={traceIndex} onChoose={index=>{const next=traceDoc.groups[index].id;setGroup(next);setLooked(next==="lookup");}} lang={lang} source={traceDoc.source} reference>
    <div className="category-models" role="group" aria-label={en ? "Compare table organization" : "مقارنة تنظيم الجداول"}>{(["standard","sorted","hashed"] as const).map(c => {
      const model=employeeCategoryState(c,count,unique);
      return <article className={`category-model ${c === category ? "selected" : ""}`} key={c}>
        <button className="category-model-title" aria-pressed={category === c} onClick={() => {setCategory(c);setGroup("category");setLooked(false);}}><strong>{c.toUpperCase()}</strong><span>{c === "standard" ? en ? "Keep incoming order" : "احتفظ بترتيب الوصول" : c === "sorted" ? en ? "Keep key order" : "احتفظ بترتيب المفتاح" : en ? "Find by unique key" : "ابحث بالمفتاح الفريد"}</span></button>
        {c === "hashed" ? <div className="key-record-map" dir="ltr">{model.rows.map(row => <div key={row.id} className={looked && category === c && row.id === key ? "selected-row" : ""}><b>{row.id}</b><span aria-hidden="true">→</span><span>{row.name}<small>{row.salary}</small></span></div>)}</div> : <EmployeeTable rows={model.rows} indexed primaryKey match={looked && category === c ? key : undefined} lang={lang}/>}
        <p>{rules[c]}</p>
      </article>;
    })}</div>
    </TeachingTrace>
    <div className="visual-stage-toolbar"><div className="explore-actions"><button className="primary" disabled={count === 3} onClick={() => {setCount(n => n+1);setGroup("insert");setLooked(false);}}>{en ? `Insert ${comparisonEmployees[count]?.id || 30} / ${comparisonEmployees[count]?.name || "Omar"}` : `أدرج ${comparisonEmployees[count]?.id || 30} / ${comparisonEmployees[count]?.name || "Omar"}`}</button><button className="secondary" onClick={() => {setCount(2);setLooked(false);setGroup("source");}}>{en ? "Restart sample" : "أعد العينة"}</button>{category === "sorted" && <label><input type="checkbox" checked={unique} onChange={e => {setUnique(e.target.checked);setGroup("category");}}/>{en ? "Unique primary key" : "مفتاح أساسي فريد"}</label>}</div>
    <label>{en ? "Find employee ID" : "ابحث عن معرّف الموظف"}<select value={key} onChange={e => {setKey(Number(e.target.value));setLooked(false);}}>{[10,30,999].map(id => <option key={id}>{id}</option>)}</select><button className="secondary" onClick={() => {setLooked(true);setGroup("lookup");}}>{en ? "Look up key" : "ابحث بالمفتاح"}</button></label></div>
    <div className="visual-outcome" role="status">{snapshot.rejected ? en ? "Duplicate ID 30 rejected: the existing employee is preserved." : "رُفض المعرّف المكرر 30؛ وبقي الموظف الموجود محفوظاً." : count === 3 ? en ? "The repeated ID is accepted by this non-unique key." : "قَبِل هذا المفتاح غير الفريد المعرّف المكرر." : en ? "The same incoming records produce different organizations. Try inserting the repeated ID." : "تنتج السجلات الواردة نفسها تنظيمات مختلفة. جرّب إدراج المعرّف المكرر."}{looked && <p>{found ? `${en ? "Found" : "وُجد"}: ${found.name} (${found.id})` : en ? "Not found. Do not display old work-area data." : "لم يُعثر عليه. لا تعرض بيانات قديمة من منطقة العمل."}</p>}</div>
    {looked && <EmployeeTable rows={snapshot.rows} indexed={category !== "hashed"} match={key} lang={lang}/>}
    <p className="visual-boundary">{en ? "Controlled row model · SAP reference code below. Sorted/hashed declarations are not executed by the browser interpreter. Hashed arrows show key lookup, not SAP hash buckets or iteration order. For this single-row INSERT, a new sorted duplicate is placed before existing equal keys." : "نموذج صفوف مضبوط · أكواد SAP مرجعية أدناه. لا ينفّذ مفسر المتصفح تعريفات SORTED وHASHED. توضح الأسهم البحث بالمفتاح، لا حاويات التجزئة أو ترتيب المرور في SAP. وفي INSERT لصف واحد، يسبق الصف المرتب الجديد الصفوف الموجودة ذات المفتاح نفسه."}</p>
    <div className="connected-reference-anatomy"><h2>{en ? "Read the code behind this comparison" : "اقرأ الأكواد وراء هذه المقارنة"}</h2><VisualCodeAnatomy key={`${category}-${unique}`} doc={categoryReference(category,unique,count,key)} lang={lang} theme={theme} selectedGroup={group === "source" ? "shape" : group} onGroupSelect={next=>{setGroup(next);if(next === "lookup")setLooked(true);else setLooked(false);}} onMatched={() => {}}/></div>
  </section>;
}
