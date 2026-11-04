import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import { fundamentals } from "./fundamentals";

const t = (en: string, ar: string): Text => ({ en, ar });
const setup = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
  salary TYPE i,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
DATA lv_min_salary TYPE i VALUE 6000.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
ls_employee-salary = 5000.
APPEND ls_employee TO lt_employees.
ls_employee-id = 102.
ls_employee-name = 'Sara'.
ls_employee-salary = 8000.
APPEND ls_employee TO lt_employees.
ls_employee-id = 103.
ls_employee-name = 'Omar'.
ls_employee-salary = 6000.
APPEND ls_employee TO lt_employees.`;
export const sortingFilteringExample = `${setup}
SORT lt_employees BY salary DESCENDING.
LOOP AT lt_employees INTO ls_employee.
  IF ls_employee-salary >= lv_min_salary.
    WRITE / ls_employee-name.
  ENDIF.
ENDLOOP.`;

const sortToken: SyntaxToken = {
  id: "sort-by", label: "SORT ... BY ... DESCENDING",
  meaning: t("SORT rearranges the rows of an existing internal table. BY salary compares the salary component of each row; DESCENDING puts the highest value first.", "تعيد SORT ترتيب صفوف جدول داخلي موجود. تقارن BY salary مكوّن الراتب في كل صف؛ وتضع DESCENDING القيمة الأعلى أولًا."),
  why: t("A salary report should show the highest-paid qualifying employee first, regardless of arrival order. Reordering complete rows keeps each name attached to its own salary.", "يجب أن يعرض تقرير الرواتب الموظف المؤهل الأعلى راتبًا أولًا بصرف النظر عن ترتيب الإدخال. يحافظ ترتيب الصفوف كاملة على ارتباط كل اسم براتبه."),
  write: t("Write SORT, the standard-table variable, BY, the row component name, and DESCENDING. Use salary after BY, not ls_employee-salary. ASCENDING is the default when the direction is omitted. This lesson focuses on one explicit component; multiple sort fields, STABLE and AS TEXT are outside its scope.", "اكتب SORT ثم متغير الجدول القياسي ثم BY واسم مكوّن الصف وDESCENDING. استخدم salary بعد BY وليس ls_employee-salary. يكون ASCENDING هو الاتجاه الافتراضي عند حذفه. يركز هذا الدرس على مكوّن صريح واحد؛ وتقع حقول الترتيب المتعددة وSTABLE وAS TEXT خارج نطاقه."),
  correct: "SORT lt_employees BY salary DESCENDING.", mistake: "SORT lt_employees BY ls_employee-salary DESCENDING.",
  question: t("Which salary sequence follows descending sorting of 5000, 8000, 6000?", "ما تسلسل الرواتب بعد ترتيب 5000 و8000 و6000 تنازليًا؟"),
  options: [t("8000, 6000, 5000", "8000 ثم 6000 ثم 5000"), t("5000, 6000, 8000", "5000 ثم 6000 ثم 8000")], answer: 0,
  explanation: t("Descending compares salary values from largest to smallest. It changes positions, not the salary values or employee IDs.", "يقارن الترتيب التنازلي الرواتب من الأكبر إلى الأصغر. تتغير المواضع ولا تتغير قيم الرواتب أو معرّفات الموظفين."),
};
const filterToken: SyntaxToken = {
  id: "filter-loop-if", label: "LOOP ... IF ... >=",
  meaning: t("The loop visits each row in its current order. IF allows the output statement only when that row's salary reaches the threshold.", "تزور الحلقة كل صف بترتيبه الحالي. تسمح IF بتعليمة العرض فقط عندما يصل راتب الصف إلى الحد المطلوب."),
  why: t("Keep all imported employees available while showing only the report's eligible employees. This is conditional processing, not deletion from the table.", "احتفظ بجميع الموظفين المستوردين مع عرض المؤهلين للتقرير فقط. هذه معالجة مشروطة وليست حذفًا من الجدول."),
  write: t("Inside LOOP AT, compare ls_employee-salary >= lv_min_salary, write the current name inside IF, then close ENDIF before ENDLOOP. >= includes an employee exactly at the threshold.", "داخل LOOP AT قارن ls_employee-salary >= lv_min_salary واعرض الاسم الحالي داخل IF ثم أغلق ENDIF قبل ENDLOOP. تشمل >= الموظف الذي يساوي راتبه الحد تمامًا."),
  correct: "IF ls_employee-salary >= lv_min_salary.\n  WRITE / ls_employee-name.\nENDIF.", mistake: "IF ls_employee-salary > lv_min_salary.\n  WRITE / ls_employee-name.\nENDIF.",
  question: t("At threshold 6000, should Omar with salary 6000 appear?", "عند الحد 6000، هل يظهر عمر الذي يبلغ راتبه 6000؟"),
  options: [t("Yes; >= includes equality", "نعم؛ تشمل >= المساواة"), t("No; only strictly larger salaries qualify", "لا؛ تُقبل الرواتب الأكبر فقط")], answer: 0,
  explanation: t("The lower bound is inclusive. Using > would incorrectly omit the boundary row. A skipped WRITE leaves that row stored in the internal table.", "الحد الأدنى شامل. سيؤدي استخدام > إلى استبعاد الصف الواقع على الحد خطأً. يترك تجاوز WRITE الصف محفوظًا في الجدول الداخلي."),
};
const goal = t("Keep the supplied rows, names, salaries, types and lv_min_salary. Sort lt_employees by salary descending. LOOP AT it INTO ls_employee; display ls_employee-name only when ls_employee-salary >= lv_min_salary. Expect Sara then Omar on separate output lines. Preserve all three stored rows and read the current row instead of printing literal answers. The checker also varies salaries and the threshold.", "احتفظ بالصفوف والأسماء والرواتب والأنواع وlv_min_salary المعطاة. رتّب lt_employees حسب salary تنازليًا. مرّ عليه باستخدام LOOP AT إلى ls_employee واعرض ls_employee-name فقط عندما يتحقق ls_employee-salary >= lv_min_salary. النتيجة Sara ثم Omar في سطري إخراج منفصلين. احتفظ بالصفوف الثلاثة المخزنة واقرأ الصف الحالي بدل طباعة إجابات ثابتة. يغيّر الفاحص الرواتب والحد أيضًا.");
const hints = [
  t("First separate two requirements: SORT changes report order; IF chooses which visited rows produce output. Neither requirement needs DELETE.", "افصل أولًا بين متطلبين: تغيّر SORT ترتيب التقرير وتحدد IF الصفوف المزارة التي تنتج إخراجًا. لا يحتاج أي منهما إلى DELETE."),
  t("Place SORT before LOOP AT. Name salary directly after BY and choose DESCENDING; loop into ls_employee so you can inspect each complete employee.", "ضع SORT قبل LOOP AT. اكتب salary مباشرة بعد BY واختر DESCENDING؛ واقرأ الصفوف إلى ls_employee لفحص كل موظف كاملًا."),
  t("Inside the loop use IF ls_employee-salary >= lv_min_salary. then WRITE / ls_employee-name. Close ENDIF and ENDLOOP. The inclusive boundary keeps Omar.", "داخل الحلقة استخدم IF ls_employee-salary >= lv_min_salary. ثم WRITE / ls_employee-name. أغلق ENDIF وENDLOOP. يحافظ الحد الشامل على ظهور عمر."),
];
const starter = `${setup}\n* Sort the complete rows, then display only qualifying names.\n`;
const starterAr = `${setup}\n* رتّب الصفوف كاملة ثم اعرض الأسماء المؤهلة فقط.\n`;
export const sortingFilteringMission: Mission = {
  id: "data-sorting-filtering", pathId: "data", prerequisite: "data-table-mutations",
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Sorting and searching"],
  title: t("Sort rows and filter a report", "رتّب الصفوف وصفِّ التقرير"),
  subtitle: t("Change row order while preserving the complete source table", "غيّر ترتيب الصفوف مع الاحتفاظ بجدول المصدر كاملًا"),
  brief: t("Three employee cards arrive in the order Ahmed, Sara, Omar. To build a highest-salary-first report, SORT rearranges the complete rows in the program's standard internal table. A LOOP then visits that new order; IF checks a minimum salary before displaying a name. Sara and Omar qualify at 6000, while Ahmed stays stored but produces no output. A row index is its current position: Sara moves to position 1, but her ID remains 102. Sorting neither creates a unique key nor removes duplicates. All setup is supplied, and earlier missions are recommendations only.", "تصل ثلاث بطاقات موظفين بترتيب أحمد ثم سارة ثم عمر. لبناء تقرير يبدأ بالراتب الأعلى، تعيد SORT ترتيب الصفوف كاملة في الجدول الداخلي القياسي للبرنامج. تزور LOOP بعد ذلك الترتيب الجديد وتفحص IF الحد الأدنى للراتب قبل عرض الاسم. تتأهل سارة وعمر عند الحد 6000، ويبقى أحمد مخزنًا دون إخراج. فهرس الصف موضعه الحالي؛ تنتقل سارة إلى الموضع 1 لكن معرّفها يبقى 102. لا ينشئ الترتيب مفتاحًا فريدًا ولا يزيل التكرارات. جميع التعريفات جاهزة والدروس السابقة توصيات فقط."),
  objectives: [t("Sort structured standard-table rows by a numeric component", "ترتيب صفوف جدول قياسي منظّمة حسب مكوّن رقمي"), t("Compare ascending and descending output order", "مقارنة ترتيب الإخراج التصاعدي والتنازلي"), t("Apply an inclusive condition without deleting stored rows", "تطبيق شرط شامل دون حذف الصفوف المخزنة"), t("Distinguish employee identity from a changing row position", "التمييز بين هوية الموظف وموضع الصف المتغير")],
  references: ["https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/processing-the-contents-of-internal-tables_b69864af-3b88-4887-83c8-7ac6701add94", "https://help.sap.com/docs/abap-cloud/abap-concepts/sorting-table-content"],
  tokens: [...fundamentals.find(m => m.id === "tables")!.tokens, ...fundamentals.find(m => m.id === "loop-at")!.tokens, sortToken, filterToken],
  example: sortingFilteringExample,
  visual: t("Watch Execution before and after SORT: IDs move from 101,102,103 to 102,103,101, with their names and salaries attached. Step through LOOP and IF: the first two rows write Sara and Omar; Ahmed's condition is false. The table still contains all three rows. Change DESCENDING to ASCENDING in exploration: qualifying output becomes Omar then Sara, while the threshold still selects the same employees.", "تابع التنفيذ قبل SORT وبعدها: تنتقل المعرّفات من 101 و102 و103 إلى 102 و103 و101 مع أسمائها ورواتبها. تقدّم عبر LOOP وIF: يعرض الصفان الأولان Sara وOmar ويكون شرط أحمد غير متحقق. يظل الجدول محتويًا على الصفوف الثلاثة. غيّر DESCENDING إلى ASCENDING أثناء الاستكشاف: يصبح إخراج المؤهلين Omar ثم Sara، مع استمرار الحد في اختيار الموظفين أنفسهم."),
  practice: t("Predict the report before running. Try ASCENDING, or omit the direction to use its ascending default; at threshold 6000 the output is Omar then Sara. Restore DESCENDING and raise lv_min_salary to 8000: only Sara appears; raise it to 9000: no names appear, but three rows remain stored. At 0, descending output is Sara, Omar, Ahmed. Do not assume a portable order among equal salaries: real SAP SORT is not stable unless STABLE is requested, and this restricted runtime does not support that addition. Multiple sort fields are outside this lesson. This lab uses integer teaching salaries without currency modeling. It changes program memory only, never a database or SAP system; real ABAP Cloud output uses an appropriate class/output API instead of a classical WRITE list.", "توقّع التقرير قبل تشغيله. جرّب ASCENDING أو احذف الاتجاه لاستخدام الافتراضي التصاعدي؛ عند الحد 6000 يكون الإخراج Omar ثم Sara. أعد DESCENDING وارفع lv_min_salary إلى 8000: تظهر Sara فقط؛ ارفعه إلى 9000: لا تظهر أسماء لكن تبقى ثلاثة صفوف مخزنة. عند 0 يكون الإخراج التنازلي Sara ثم Omar ثم Ahmed. لا تفترض ترتيبًا قابلًا للنقل بين الرواتب المتساوية؛ فليست SORT في SAP مستقرة دون طلب STABLE، ولا يدعم هذا المحاكي هذه الإضافة. يقع الترتيب متعدد الحقول خارج هذا الدرس. يستخدم المختبر رواتب تعليمية صحيحة دون نمذجة العملات. يغيّر ذاكرة البرنامج فقط وليس قاعدة بيانات أو نظام SAP؛ ويستخدم إخراج ABAP Cloud الحقيقي صنفًا وواجهة إخراج مناسبة بدل قائمة WRITE التقليدية."),
  goal, hint: hints[0], hints, starter, starterAr, solution: sortingFilteringExample, expected: "Sara\nOmar",
  challenges: [{ id: "data-sort-report", title: t("Build the descending salary report", "أنشئ تقرير الرواتب التنازلي"), goal, hint: hints[2], starter, starterAr, solution: sortingFilteringExample, expected: "Sara\nOmar" }],
  quiz: t("After SORT and the conditional report, which statement is true about Ahmed?", "بعد SORT والتقرير المشروط، ما العبارة الصحيحة عن أحمد؟"),
  options: [t("He remains stored with ID 101, at a new position, but produces no output at threshold 6000", "يبقى مخزنًا بالمعرّف 101 في موضع جديد لكنه لا ينتج إخراجًا عند الحد 6000"), t("IF deletes him from the internal table", "تحذفه IF من الجدول الداخلي"), t("Sorting replaces his ID with his row index", "يستبدل الترتيب معرّفه بفهرس الصف")], answer: 0,
  quizExplanation: t("SORT reorders complete rows. IF controls the output block; it does not remove rows. Position, identity and eligibility are separate properties.", "تعيد SORT ترتيب الصفوف كاملة. تتحكم IF في كتلة الإخراج ولا تحذف الصفوف. الموضع والهوية والأهلية خصائص منفصلة."),
};

function group(id: string, lines: [number, number], title: Text, explanation: Text, practice?: Text, syntaxRefs: string[] = []): AnatomyGroupSpec {
  return { id, lines, title, explanation, detail: explanation, practice, syntaxRefs, visualizer: { kind: lines[0] === 1 ? "type" : "snapshot", line: lines[1] } };
}
export const sortingFilteringAnatomy: { fingerprint: string; groups: AnatomyGroupSpec[]; checks: string[] } = {
  fingerprint: "2b2932c3",
  checks: ["salary-row", "salary-first", "salary-sort", "salary-filter", "salary-output"],
  groups: [
    group("salary-row", [1, 5], t("Define one employee row", "عرّف صف موظف واحدًا"), t("Each row groups an integer ID, a name and an integer teaching salary. This type defines a shape; it creates no employee yet.", "يجمع كل صف معرّفًا صحيحًا واسمًا وراتبًا تعليميًا صحيحًا. يحدد النوع شكلًا ولا ينشئ موظفًا بعد."), t("Which group defines the fields that stay together during sorting?", "أي مجموعة تعرّف الحقول التي تبقى معًا أثناء الترتيب؟")),
    group("salary-storage", [6, 8], t("Create storage and threshold", "أنشئ التخزين والحد"), t("Create the standard table, work area and minimum salary 6000. EMPTY KEY imposes no employee-ID uniqueness. Explicit SORT BY salary can still compare a row field.", "أنشئ الجدول القياسي ومنطقة العمل وحد الراتب 6000. لا تفرض EMPTY KEY تفرّد معرّف الموظف. تستطيع SORT BY salary الصريحة مقارنة حقل الصف.")),
    group("salary-first", [9, 12], t("Store Ahmed's complete row", "احفظ صف أحمد كاملًا"), t("Fill ID 101, name Ahmed and salary 5000. APPEND copies the complete work-area value into position 1.", "املأ المعرّف 101 والاسم Ahmed والراتب 5000. تنسخ APPEND قيمة منطقة العمل كاملة إلى الموضع 1."), t("Which group stores the employee who remains in memory but is below the report threshold?", "أي مجموعة تحفظ الموظف الذي يبقى في الذاكرة لكنه دون حد التقرير؟")),
    group("salary-second", [13, 16], t("Store Sara independently", "احفظ سارة بصورة مستقلة"), t("Replace the work-area fields with Sara, ID 102 and salary 8000, then append a second copied row. Ahmed remains unchanged.", "استبدل حقول منطقة العمل بسارة ومعرّفها 102 وراتبها 8000 ثم أضف صفًا ثانيًا منسوخًا. يبقى أحمد دون تغيير.")),
    group("salary-third", [17, 20], t("Store the boundary employee", "احفظ الموظف الواقع على الحد"), t("Append Omar with ID 103 and salary 6000. All three rows now exist in arrival order; Omar exactly meets the inclusive threshold.", "أضف عمر بالمعرّف 103 والراتب 6000. توجد الصفوف الثلاثة الآن بترتيب الإدخال؛ ويطابق عمر الحد الشامل تمامًا.")),
    group("salary-sort", [21, 21], t("Reorder the complete rows", "أعد ترتيب الصفوف كاملة"), t("Compare salary descending: Sara 8000, Omar 6000, Ahmed 5000. Each row keeps its ID and name. Sara's index changes from 2 to 1; no record is deleted and no key is created.", "قارن الراتب تنازليًا: سارة 8000 ثم عمر 6000 ثم أحمد 5000. يحتفظ كل صف بمعرّفه واسمه. يتغير فهرس سارة من 2 إلى 1؛ ولا يُحذف سجل ولا يُنشأ مفتاح."), t("Which group changes row positions before the report scans the table?", "أي مجموعة تغيّر مواضع الصفوف قبل مرور التقرير على الجدول؟"), ["sort-by"]),
    group("salary-loop", [22, 22], t("Visit the sorted table", "زر الجدول المرتب"), t("LOOP AT copies each current row into ls_employee, following the new table order. This loop still visits Ahmed even though he will not be printed.", "تنسخ LOOP AT كل صف حالي إلى ls_employee باتباع ترتيب الجدول الجديد. تزور الحلقة أحمد أيضًا رغم أنه لن يُطبع.")),
    group("salary-filter", [23, 23], t("Check an inclusive lower bound", "افحص حدًا أدنى شاملًا"), t("The IF condition is true for salaries 8000 and 6000, and false for 5000. It controls processing without changing table contents.", "يتحقق شرط IF للراتبين 8000 و6000 ولا يتحقق للراتب 5000. يتحكم في المعالجة دون تغيير محتويات الجدول."), t("Which group decides whether the visited employee qualifies while preserving the stored row?", "أي مجموعة تقرر أهلية الموظف المزار مع الحفاظ على الصف المخزّن؟"), ["filter-loop-if"]),
    group("salary-output", [24, 24], t("Display the qualifying name", "اعرض الاسم المؤهل"), t("Read the name from the current work area. The repeated statement produces Sara and Omar on separate simulator output lines; it is skipped for Ahmed.", "اقرأ الاسم من منطقة العمل الحالية. تنتج التعليمة المتكررة Sara وOmar في سطري إخراج منفصلين في المحاكي؛ وتُتجاوز لأحمد."), t("Which group produces output from the current row rather than a literal answer?", "أي مجموعة تنتج الإخراج من الصف الحالي بدل إجابة ثابتة؟")),
    group("salary-close", [25, 26], t("Finish the condition and loop", "أنه الشرط والحلقة"), t("ENDIF closes eligibility checking and ENDLOOP moves to the next row until all three have been visited. At the end all three sorted records are still stored.", "تغلق ENDIF فحص الأهلية وتنتقل ENDLOOP إلى الصف التالي حتى زيارة الصفوف الثلاثة. في النهاية تبقى السجلات الثلاثة المرتبة مخزنة.")),
  ],
};
