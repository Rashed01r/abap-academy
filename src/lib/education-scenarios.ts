import { missions, type Text } from "./curriculum";
import { defineAnatomy, sourceFingerprint, type AnatomyGroupSpec, type CodeAnatomy } from "./code-anatomy";
import { getAnatomy } from "./anatomy-content";

const t = (en: string, ar: string): Text => ({en, ar});
export type EducationScenario = { id: string; title: Text; boundary?: Text; doc: CodeAnatomy };
type Section = [number, number, string, string, string, string];
function scenario(lesson: string, id: string, title: Text, source: string, sections: Section[]): EducationScenario {
  const specs: AnatomyGroupSpec[] = sections.map(([start, end, en, ar, explanation, arabic], index) => ({
    id: `${id}-${index}`, lines: [start, end], title: t(en, ar), explanation: t(explanation, arabic),
    practice: t(`Find: ${en}`, `اختر: ${ar}`), visualizer: {kind: "snapshot", line: end},
  }));
  return { id, title, doc: defineAnatomy(`${lesson}:scenario:${id}`, source, sourceFingerprint(source), specs, specs.map(s => s.id)) };
}
function solution(lesson: string, challenge: string) {
  const source = missions.find(m => m.id === lesson)?.challenges?.find(c => c.id === challenge)?.solution;
  if (!source) throw new Error(`Missing scenario source ${lesson}/${challenge}`);
  return source;
}
const records = solution("tables", "tables-structured");
const employeeLoop = solution("loop-at", "loop-at-employees");
const sort = missions.find(m => m.id === "data-sorting-filtering")!;
const ascending = sort.example.replace("DESCENDING", "ASCENDING");
const ascendingDoc = getAnatomy(sort.id, sort.example);

export const educationScenarios: Record<string, EducationScenario[]> = {
  conditions: [scenario("conditions", "ranges", t("Three score ranges", "ثلاثة نطاقات للدرجات"), solution("conditions", "conditions-ranges"), [
    [1, 1, "Set a score", "تحديد الدرجة", "75 is between 50 and 79. Try 49, 50, 79 and 80 in the trace editor.", "تقع 75 بين 50 و79. جرّب 49 و50 و79 و80 في محرر التتبع."],
    [2, 3, "Test the highest range", "اختبار النطاق الأعلى", "Test >= 80 first. A score of 80 selects High and skips every later branch.", "افحص >= 80 أولاً. تختار الدرجة 80 فرع High وتتجاوز كل الفروع اللاحقة."],
    [4, 5, "Test the middle range", "اختبار النطاق المتوسط", "ELSEIF is reached only below 80. Its >= 50 test therefore represents 50 through 79.", "لا نصل إلى ELSEIF إلا دون 80؛ لذا يمثل شرطها >= 50 النطاق من 50 إلى 79."],
    [6, 8, "Use the remaining range", "استخدام النطاق المتبقي", "ELSE handles scores below 50. ENDIF closes this single decision.", "تعالج ELSE الدرجات دون 50. تغلق ENDIF هذا القرار الواحد."],
  ])],
  do: [scenario("do", "total", t("Accumulate a total", "تجميع المجموع"), solution("do", "do-total"), [
    [1, 2, "Keep counter and total separate", "فصل العداد عن المجموع", "Both start at zero, but the counter tracks the pass while the total stores all contributions so far.", "يبدأ كلاهما بصفر، لكن العداد يتابع الدورة بينما يحفظ المجموع جميع المساهمات السابقة."],
    [3, 3, "Choose five passes", "اختيار خمس دورات", "The block repeats five times.", "تتكرر مجموعة التعليمات خمس مرات."],
    [4, 5, "Advance and accumulate", "الزيادة والتجميع", "Counter values 1, 2, 3, 4, 5 produce totals 1, 3, 6, 10, 15.", "تنتج قيم العداد 1 و2 و3 و4 و5 المجاميع 1 و3 و6 و10 و15."],
    [6, 7, "Finish before displaying", "الإنهاء قبل العرض", "WRITE after ENDDO prints only the final total, 15.", "تعرض WRITE بعد ENDDO المجموع النهائي 15 فقط."],
  ])],
  tables: [scenario("tables", "records", t("Two independent employee rows", "صفا موظفين مستقلان"), records, [
    [1, 4, "Describe one employee", "وصف موظف واحد", "The row has an integer ID and a string name.", "يضم الصف معرّفاً صحيحاً واسماً نصياً."],
    [5, 6, "Create table and work area", "إنشاء الجدول ومنطقة العمل", "The table stores many rows; the work area holds one record being prepared.", "يحفظ الجدول صفوفاً متعددة، وتحفظ منطقة العمل سجلاً واحداً قيد الإعداد."],
    [7, 9, "Save Ahmed", "حفظ أحمد", "Fill both fields, then APPEND an independent copy of 101/Ahmed.", "املأ الحقلين ثم احفظ نسخة مستقلة من 101/Ahmed باستخدام APPEND."],
    [10, 12, "Reuse the work area for Sara", "إعادة استخدام منطقة العمل لسارة", "Replace both fields and APPEND 102/Sara. Ahmed remains stored in the first row.", "استبدل الحقلين وأضف 102/Sara. يظل أحمد محفوظاً في الصف الأول."],
    [13, records.split("\n").length, "Display the current work area", "عرض منطقة العمل الحالية", "WRITE reads Sara from the work area; inspect the table snapshot to see both copies.", "تقرأ WRITE اسم Sara من منطقة العمل؛ افحص لقطة الجدول لرؤية النسختين."],
  ])],
  "loop-at": [scenario("loop-at", "employees", t("Read structured rows", "قراءة صفوف ذات بنية"), employeeLoop, [
    [1, 4, "Define the row type", "تعريف نوع الصف", "Each employee row has an ID and name.", "لكل صف موظف معرّف واسم."],
    [5, 6, "Create compatible storage", "إنشاء تخزين متوافق", "The table and work area use the same employee type.", "يستخدم الجدول ومنطقة العمل نوع الموظف نفسه."],
    [7, 12, "Save two employees", "حفظ موظفين", "APPEND saves independent rows for Ahmed and Sara.", "تحفظ APPEND صفين مستقلين لأحمد وسارة."],
    [13, employeeLoop.split("\n").length, "Read and display each name", "قراءة كل اسم وعرضه", "INTO replaces the work-area contents each pass. WRITE accesses the current row's name component.", "تستبدل INTO محتويات منطقة العمل في كل دورة. تصل WRITE إلى حقل اسم الصف الحالي."],
  ])],
  "loop-control": [scenario("loop-control", "exit", t("Stop at four with EXIT", "التوقف عند أربعة باستخدام EXIT"), solution("loop-control", "loop-control-exit"), [
    [1, 3, "Prepare and advance the counter", "إعداد العداد وزيادته", "Increase before checking, so the passes reach 1, 2, 3 and then 4.", "زِد العداد قبل الفحص لتصل الدورات إلى 1 ثم 2 ثم 3 ثم 4."],
    [4, 6, "Leave at four", "المغادرة عند أربعة", "At 4, EXIT leaves this DO loop before WRITE. It does not merely skip one pass.", "عند 4 تغادر EXIT حلقة DO هذه قبل WRITE. وهي لا تتجاوز دورة واحدة فحسب."],
    [7, 8, "Observe the shorter output", "ملاحظة المخرجات الأقصر", "Only 1, 2 and 3 are displayed. Compare with CONTINUE in the main example, where later passes continue.", "تُعرض 1 و2 و3 فقط. قارنها بـ CONTINUE في المثال الرئيسي، حيث تستمر الدورات اللاحقة."],
  ])],
  "data-sorting-filtering": [{id: "ascending", title: t("Ascending salary order", "ترتيب الرواتب تصاعدياً"), doc: {
    ...defineAnatomy(`${sort.id}:scenario:ascending`, ascending, sourceFingerprint(ascending), ascendingDoc.groups.map(g => ({
      ...g, lines: [g.range.startLine, g.range.endLine],
      ...(g.id === "salary-sort" ? {title: t("Smallest salary first", "أصغر راتب أولاً"), explanation: t("ASCENDING orders salaries 5000, 6000, 8000. Filtering still keeps Omar then Sara, and all three rows remain stored.", "ترتب ASCENDING الرواتب 5000 ثم 6000 ثم 8000. يبقى عمر ثم سارة بعد الاختيار، وتظل الصفوف الثلاثة مخزنة.")} : {}),
    })), ascendingDoc.checks),
  }}],
};

const indexSource = `DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.
APPEND 101 TO lt_ids.
APPEND 102 TO lt_ids.
DATA lv_id TYPE i.
READ TABLE lt_ids INTO lv_id INDEX 2.
IF sy-subrc = 0.
  WRITE lv_id.
ELSE.
  WRITE 'Not found'.
ENDIF.`;
educationScenarios["data-read-table"] = [scenario("data-read-table", "index", t("Position two contains ID 102", "الموضع الثاني يحتوي المعرّف 102"), indexSource, [
  [1, 4, "Store two business IDs", "تخزين معرّفي أعمال", "The stored values are 101 and 102; their positions are 1 and 2.", "القيم المخزنة 101 و102، وموضعاهما 1 و2."],
  [5, 5, "Read by position", "القراءة بالموضع", "INDEX 2 retrieves the value 102. Try INDEX 1 and INDEX 3 to compare the first and an absent position.", "تسترجع INDEX 2 القيمة 102. جرّب INDEX 1 وINDEX 3 لمقارنة الموضع الأول بموضع غائب."],
  [6, 10, "Check the return code", "فحص رمز النتيجة", "Display the copied value only when sy-subrc is zero. An absent position takes the Not found branch.", "اعرض القيمة المنسوخة فقط عندما تكون sy-subrc صفراً. ينتقل الموضع الغائب إلى فرع Not found."],
])];

// Reference declarations are presented as anatomy, without pretending to execute them.
const categories = missions.find(m => m.id === "data-table-categories")!;
educationScenarios[categories.id] = ["sorted-category", "hashed-category"].map(id => {
  const token = categories.tokens.find(t => t.id === id)!;
  const source = token.correct;
  const doc = defineAnatomy(`${categories.id}:scenario:${id}`, source, sourceFingerprint(source), [{
    id, lines: [1, 1], title: token.label === "" ? token.meaning : t(token.label, token.label),
    explanation: token.meaning, detail: token.write, practice: token.question,
  }], [id]);
  return {id, title: t(token.label, token.label), boundary: t("SAP reference declaration; use the category model to compare behavior. This source is not executed by the browser interpreter.", "تعريف مرجعي لنظام SAP؛ استخدم نموذج الفئات لمقارنة السلوك. لا ينفّذ مفسر المتصفح هذا المصدر."), doc: {...doc, referenceOnly: true}};
});
