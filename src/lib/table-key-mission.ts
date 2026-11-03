import type { Mission, SyntaxToken, Text } from "./curriculum";
import { fundamentals } from "./fundamentals";

const t = (en: string, ar: string): Text => ({ en, ar });
const setup = `TYPES: BEGIN OF ty_employee,
  department TYPE string,
  id TYPE i,
  name TYPE string,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
DATA lv_department TYPE string VALUE 'IT'.
DATA lv_id TYPE i VALUE 101.
DATA lv_matches TYPE i.
ls_employee-department = 'IT'.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
APPEND ls_employee TO lt_employees.
ls_employee-department = 'HR'.
ls_employee-id = 101.
ls_employee-name = 'Sara'.
APPEND ls_employee TO lt_employees.
ls_employee-department = 'IT'.
ls_employee-id = 102.
ls_employee-name = 'Omar'.
APPEND ls_employee TO lt_employees.
ls_employee-id = 101.
ls_employee-name = 'Noura'.
APPEND ls_employee TO lt_employees.`;
const solution = `${setup}
LOOP AT lt_employees INTO ls_employee.
  IF ls_employee-department = lv_department.
    IF ls_employee-id = lv_id.
      WRITE ls_employee-name.
      lv_matches = lv_matches + 1.
    ENDIF.
  ENDIF.
ENDLOOP.
WRITE lv_matches.`;
const composite: SyntaxToken = {
  id: "composite-key", label: "WITH UNIQUE KEY department id",
  meaning: t("A composite key uses several fields together. Only the complete combination must be different when the key is unique.", "يتكوّن المفتاح المركّب من عدة حقول معًا. عند اشتراط التفرّد، يجب ألا تتكرر مجموعة قيم هذه الحقول كاملة."),
  why: t("An employee ID may repeat in another department. Department and ID together identify the employee; a name can change without changing that identity.", "قد يتكرر رقم الموظف في قسم آخر. يحدد القسم والرقم معًا هوية الموظف؛ ويمكن أن يتغير اسمه دون أن تتغير هويته."),
  write: t("SAP reference: declare the row type first, then list key fields after WITH UNIQUE KEY. This sorted declaration is not executable in the browser editor. Use the labelled key explorer. UNIQUE primary keys belong to sorted or hashed tables; standard primary keys are non-unique.", "مرجع لنظام SAP: عرّف نوع الصف أولًا، ثم اكتب حقول المفتاح بعد WITH UNIQUE KEY. لا ينفّذ محرر المتصفح هذا التعريف المرتب؛ استخدم مستكشف المفاتيح الموضّح بأنه نموذج تعليمي. تدعم الجداول المرتبة أو القائمة على التجزئة مفاتيح أساسية فريدة، أما المفتاح الأساسي للجدول القياسي فغير فريد."),
  correct: "DATA lt_unique TYPE SORTED TABLE OF ty_employee\n  WITH UNIQUE KEY department id.",
  mistake: "DATA lt_unique TYPE STANDARD TABLE OF ty_employee\n  WITH UNIQUE KEY department id.",
  question: t("With unique key department id, can (IT, 101) and (HR, 101) coexist?", "مع المفتاح الفريد department id، هل يمكن حفظ (IT، 101) و(HR، 101) معًا؟"),
  options: [t("Yes; the complete keys differ", "نعم؛ تختلف مجموعة قيم المفتاح كاملة"), t("No; ID 101 repeats", "لا؛ يتكرر الرقم 101")], answer: 0,
  explanation: t("Compare every key component together. Reusing 101 in another department is allowed. A different name for (IT, 101) still duplicates that key.", "قارن قيم جميع حقول المفتاح معًا. يُسمح باستخدام 101 في قسم آخر. أما تغيير اسم صاحب (IT، 101) فلا يمنع تكرار المفتاح نفسه."),
};
const empty: SyntaxToken = {
  id: "key-versus-filter", label: "EMPTY KEY / IF",
  meaning: t("An empty primary key has no fields. An explicit IF can still compare row fields; it does not declare a table key.", "لا يحتوي المفتاح الأساسي الفارغ على حقول. ومع ذلك تستطيع IF مقارنة حقول الصف صراحة؛ لكنها لا تعرّف مفتاحًا للجدول."),
  why: t("Keep imported duplicates for inspection before choosing a unique keyed design. Count all rows matching the proposed business identity.", "احتفظ بتكرارات الاستيراد لفحصها قبل اختيار تصميم بمفتاح فريد. احسب جميع الصفوف المطابقة لهوية الموظف المقترحة."),
  write: t("In this browser, LOOP AT copies each standard-table row. Nested IF statements compare department and ID. This scans rows; it is not an optimized key lookup. EMPTY KEY requires ABAP 7.40 or later. In ABAP Cloud use a class method and an output API instead of a classical WRITE list.", "في هذا المتصفح، تنسخ LOOP AT كل صف من الجدول القياسي. وتقارن تعليمتا IF المتداخلتان القسم والرقم. هذا مرور على الصفوف، وليس بحثًا محسّنًا بالمفتاح. تتطلب EMPTY KEY الإصدار ABAP 7.40 أو أحدث. في ABAP Cloud استخدم طريقة داخل صنف وواجهة إخراج بدل قائمة WRITE التقليدية."),
  correct: "IF ls_employee-department = lv_department.\n  IF ls_employee-id = lv_id.\n    lv_matches = lv_matches + 1.\n  ENDIF.\nENDIF.",
  mistake: "IF ls_employee-id = lv_id.\n  lv_matches = lv_matches + 1.\nENDIF.",
  question: t("Does checking ID alone distinguish IT 101 from HR 101?", "هل يكفي فحص الرقم وحده للتمييز بين IT 101 وHR 101؟"),
  options: [t("No; compare the department too", "لا؛ يجب مقارنة القسم أيضًا"), t("Yes; an ID is always globally unique", "نعم؛ الرقم فريد دائمًا في جميع الأقسام")], answer: 0,
  explanation: t("Uniqueness follows the business rule. This import permits repeated IDs across departments, so both fields are needed. EMPTY KEY does not prevent matching fields explicitly.", "يتبع التفرّد قاعدة العمل. تسمح بيانات الاستيراد هذه بتكرار الأرقام بين الأقسام، لذلك نحتاج إلى الحقلين. ولا يمنع EMPTY KEY مقارنة الحقول صراحة."),
};
const challenge = {
  id: "data-key-matches", title: t("Inspect every matching identity", "افحص كل صف يطابق الهوية"),
  goal: t("Keep the supplied import and identifiers. LOOP AT lt_employees INTO ls_employee; compare both department with lv_department and id with lv_id. Display each matching name, count matches in lv_matches, then display the count after the loop. For IT 101 expect Ahmed, Noura, 2. Check the key design activity too. The empty-key table intentionally preserves duplicate business identities.", "احتفظ ببيانات الاستيراد والمعرّفات المعطاة. مرّ على lt_employees إلى ls_employee باستخدام LOOP AT؛ وقارن department مع lv_department وid مع lv_id. اعرض اسم كل صف مطابق، واحسب المطابقات في lv_matches، ثم اعرض العدد بعد الحلقة. النتيجة المطلوبة لـIT 101 هي Ahmed ثم Noura ثم 2. أكمل أيضًا نشاط تصميم المفتاح. يحتفظ الجدول ذو المفتاح الفارغ عمدًا بهويات العمل المتكررة."),
  hint: t("Use two nested IF blocks inside LOOP AT. Increment the counter only after both comparisons succeed. Checking ID alone would also include Sara; EXIT would hide the second match. Read names from the current row rather than printing literal answers.", "استخدم تعليمتَي IF متداخلتين داخل LOOP AT. زد العدّاد فقط بعد تحقق المقارنتين. سيشمل فحص الرقم وحده Sara أيضًا، وستُخفي EXIT المطابقة الثانية. اقرأ الاسم من الصف الحالي بدل طباعة إجابات ثابتة."),
  starter: `${setup}\n* Compare both fields, show matching names, then show the count.\n`,
  starterAr: `${setup}\n* قارن الحقلين واعرض الأسماء المطابقة، ثم اعرض العدد.\n`,
  solution, expected: "Ahmed\nNoura\n2",
};
export const tableKeyMission: Mission = {
  id: "data-keys", pathId: "data", prerequisite: "data-table-categories", difficulty: "intermediate",
  environment: "browser", assessment: "guided", visualization: "table", activity: "table-keys",
  requiredActivities: ["data-key-design"], minutes: 30, xp: 260,
  references: ["https://learning.sap.com/courses/basic-abap-programming/declaring-a-complex-internal-table_e2463cb1-7806-46c5-8367-cff38681721f", "https://help.sap.com/docs/abap-cloud/abap-keywords/data-key", "https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/working-with-sorted-and-hashed-tables_de84be91-c7db-4166-95cf-2b036c8d5558"],
  title: t("Choose keys and protect uniqueness", "اختر المفاتيح واضبط التفرّد"),
  subtitle: t("Identify a row by its values, not its position", "حدّد الصف بقيمه، لا بموضعه"),
  brief: t("Two departments can both have employee 101. A row number is a position; a key is a chosen set of fields used to compare rows. Here the business identity is department plus ID. A unique key prevents two rows with that same combination, even when names differ. A non-unique key permits the combination to repeat. First explore the key policy, then inspect a duplicate import with supported LOOP and IF code. All setup is supplied; earlier lessons are recommendations only.", "قد يوجد الموظف 101 في قسمين مختلفين. رقم الصف موضع داخل الجدول؛ أما المفتاح فهو مجموعة حقول نختارها لمقارنة الصفوف. هوية الموظف هنا هي القسم مع الرقم. يمنع المفتاح الفريد وجود صفين لهما مجموعة القيم نفسها، حتى لو اختلف الاسمان. ويسمح المفتاح غير الفريد بتكرارها. استكشف أولًا سياسة المفتاح، ثم افحص استيرادًا به تكرارات باستخدام LOOP وIF المدعومتين. جميع التعريفات جاهزة؛ والدروس السابقة توصيات فقط."),
  objectives: [t("Distinguish row position, key fields and complete row equality", "التمييز بين موضع الصف وحقول المفتاح وتطابق الصف كاملًا"), t("Design a composite key and predict duplicate rejection", "تصميم مفتاح مركّب وتوقّع رفض التكرار"), t("Find all full-identity matches without assuming uniqueness", "إيجاد جميع مطابقات الهوية كاملة دون افتراض التفرّد")],
  tokens: [...fundamentals.find(m => m.id === "tables")!.tokens, ...fundamentals.find(m => m.id === "loop-at")!.tokens, composite, empty],
  example: solution,
  visual: t("Choose key fields, add incoming rows, and compare before/after. With department + id and UNIQUE, Noura conflicts with Ahmed even though the names differ. Toggle NON-UNIQUE to retain both. The explorer models key acceptance only, not sorting, hashing or SAP memory. The separate code trace runs a standard EMPTY KEY table and keeps all four imported rows.", "اختر حقول المفتاح وأضف الصفوف الواردة وقارن الحالة قبل الإضافة وبعدها. عند اختيار department وid مع UNIQUE، يتعارض صف Noura مع Ahmed رغم اختلاف الاسمين. بدّل إلى NON-UNIQUE للاحتفاظ بالصفين. يوضح المستكشف قبول المفاتيح فقط، ولا يحاكي الترتيب أو التجزئة أو ذاكرة SAP. يشغّل تتبّع الشيفرة المنفصل جدولًا قياسيًا بـEMPTY KEY ويحتفظ بصفوف الاستيراد الأربعة."),
  practice: t("In the explorer, use only id: which other department's employee gets rejected by UNIQUE? Restore department + id. In the editor, change lv_department to HR, then lv_id to 999; predict Sara/1 and then 0. Compare row highlights and the match counter. Restore IT/101 before assessment. A condition on a row is not a declared table key.", "في المستكشف اختر id وحده: أي موظف من قسم آخر سيرفضه UNIQUE؟ أعد department وid معًا. في المحرر غيّر lv_department إلى HR، ثم lv_id إلى 999؛ توقّع Sara ثم 1 في الحالة الأولى، و0 في الثانية. قارن تمييز الصفوف بعدّاد المطابقات. أعد IT و101 قبل التقييم. الشرط على الصف لا يعرّف مفتاحًا للجدول."),
  challenges: [challenge], goal: challenge.goal, hint: challenge.hint, starter: challenge.starter, starterAr: challenge.starterAr, solution, expected: challenge.expected,
  quiz: t("A UNIQUE key contains department and id. An incoming row has the same department and id but a different name. Is its key a duplicate?", "يحتوي مفتاح UNIQUE على department وid. يحمل صف وارد القسم والرقم نفسيهما، لكن اسمه مختلف. هل مفتاحه مكرر؟"),
  options: [t("Yes; the non-key name does not change the key", "نعم؛ الاسم خارج المفتاح ولا يغيّر قيمته"), t("No; every field must be identical", "لا؛ يجب أن تتطابق جميع الحقول")], answer: 0,
  quizExplanation: t("Only the selected key fields determine key equality. UNIQUE disallows repeating their complete combination. STANDARD primary keys cannot enforce this; choose an appropriate sorted or hashed key in SAP. The browser activity is conceptual and creates no SAP object.", "تحدد حقول المفتاح المختارة وحدها تساوي المفاتيح. يمنع UNIQUE تكرار مجموعة قيمها كاملة. لا يفرض المفتاح الأساسي لجدول STANDARD هذا القيد؛ اختر مفتاحًا مرتبًا أو قائمًا على التجزئة مناسبًا في SAP. نشاط المتصفح مفاهيمي ولا ينشئ كائنًا في SAP."),
};
