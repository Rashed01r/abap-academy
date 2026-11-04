import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import { fundamentals } from "./fundamentals";

const t = (en: string, ar: string): Text => ({ en, ar });
const seed = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
APPEND ls_employee TO lt_employees.
ls_employee-id = 103.
ls_employee-name = 'Omar'.
APPEND ls_employee TO lt_employees.`;
const setup = `${seed}
DATA lv_insert_id TYPE i VALUE 102.
DATA lv_insert_name TYPE string VALUE 'Sara'.
DATA lv_new_name TYPE string VALUE 'Sarah'.`;
export const tableMutationsExample = `${setup}
ls_employee-id = lv_insert_id.
ls_employee-name = lv_insert_name.
INSERT ls_employee INTO lt_employees INDEX 2.
IF sy-subrc = 0.
  ls_employee-name = lv_new_name.
  MODIFY lt_employees FROM ls_employee INDEX 2.
  IF sy-subrc = 0.
    DELETE lt_employees INDEX 1.
    IF sy-subrc = 0.
      LOOP AT lt_employees INTO ls_employee.
        WRITE ls_employee-name.
      ENDLOOP.
    ENDIF.
  ENDIF.
ENDIF.`;

const insert: SyntaxToken = {
  id: "insert-index", label: "INSERT … INTO … INDEX",
  meaning: t("Insert a copied value at a chosen position in an internal index table. Following rows move one position later.", "أدرج قيمة منسوخة في موضع مختار داخل جدول داخلي ذي فهرس. تنتقل الصفوف التالية موضعًا واحدًا إلى الخلف."),
  why: t("Use INSERT when a new employee belongs between existing rows. APPEND instead adds a new row at the end of this standard table.", "استخدم INSERT عندما ينتمي الموظف الجديد بين صفوف موجودة. أما APPEND فتضيف صفًا جديدًا في نهاية هذا الجدول القياسي."),
  write: t("INSERT ls_employee INTO lt_employees INDEX 2. inserts before the current second row. For n existing rows, valid positive insertion positions are 1 through n + 1. Position n + 1 adds at the end; a larger position returns sy-subrc = 4 without insertion. Check sy-subrc immediately; 0 means success. Use positive indexes; invalid nonpositive mutation indexes are errors, not ordinary not-found results.", "تدرج INSERT ls_employee INTO lt_employees INDEX 2. قبل الصف الثاني الحالي. لجدول يحوي n صفوف تكون مواضع الإدراج الموجبة الصالحة من 1 إلى n + 1. يضيف الموضع n + 1 في النهاية، ويعيد الموضع الأكبر sy-subrc = 4 دون إدراج. افحص sy-subrc مباشرة؛ تعني 0 النجاح. استخدم فهارس موجبة؛ ففهارس التعديل غير الموجبة غير الصالحة أخطاء وليست نتائج غياب عادية."),
  correct: `${setup}\nls_employee-id = lv_insert_id.\nls_employee-name = lv_insert_name.\nINSERT ls_employee INTO lt_employees INDEX 2.\nIF sy-subrc = 0.\n  WRITE 'Inserted'.\nENDIF.`,
  mistake: `${setup}\nINSERT ls_employee INTO lt_employees INDEX 99.\nWRITE 'Inserted'.`,
  question: t("Two rows exist. Can INDEX 3 insert at the end?", "يوجد صفان. هل يستطيع INDEX 3 الإدراج في النهاية؟"),
  options: [t("Yes; insertion permits the position after the final row", "نعم؛ يسمح الإدراج بالموضع التالي لآخر صف"), t("No; INSERT requires replacing an existing row", "لا؛ تتطلب INSERT استبدال صف موجود")], answer: 0,
  explanation: t("INSERT grows the table. With two rows, positions 1, 2 and 3 are valid; MODIFY would need an existing row.", "تزيد INSERT حجم الجدول. مع صفين تكون المواضع 1 و2 و3 صالحة؛ أما MODIFY فتحتاج صفًا موجودًا."),
};
const modify: SyntaxToken = {
  id: "modify-index", label: "MODIFY … FROM … INDEX",
  meaning: t("Replace an existing internal-table row with the work area's values. This direct form copies all row fields.", "استبدل صفًا موجودًا في الجدول الداخلي بقيم منطقة العمل. تنسخ هذه الصيغة المباشرة جميع حقول الصف."),
  why: t("Changing ls_employee-name alone changes only the work area. MODIFY writes that prepared value back into the selected table row.", "يغيّر تعديل ls_employee-name وحده منطقة العمل فقط. تكتب MODIFY القيمة المجهزة داخل صف الجدول المحدد."),
  write: t("MODIFY lt_employees FROM ls_employee INDEX 2. replaces row 2 without growing the table. Ensure every field, including id, is correct in the work area. sy-subrc is 0 if the row was modified and 4 if a positive index exceeds the row count. INDEX <= 0 is an error. This subset omits TRANSPORTING, key-based MODIFY and sorted/hashed-table rules.", "تستبدل MODIFY lt_employees FROM ls_employee INDEX 2. الصف الثاني دون زيادة حجم الجدول. تحقق من صحة جميع حقول منطقة العمل بما فيها id. تكون sy-subrc مساوية 0 عند تعديل الصف و4 إذا تجاوز فهرس موجب عدد الصفوف. يمثل INDEX <= 0 خطأ. لا يشمل هذا الجزء TRANSPORTING أو MODIFY بالمفتاح أو قواعد الجداول المرتبة والمجزأة."),
  correct: `${setup}\nls_employee-id = 103.\nls_employee-name = lv_new_name.\nMODIFY lt_employees FROM ls_employee INDEX 2.\nIF sy-subrc = 0.\n  WRITE 'Modified'.\nENDIF.`,
  mistake: `${setup}\nls_employee-name = lv_new_name.\n* The saved row has not been modified.\nLOOP AT lt_employees INTO ls_employee.\n  WRITE ls_employee-name.\nENDLOOP.`,
  question: t("Does changing a copied work area's name automatically change its saved table row?", "هل يغيّر تعديل اسم منطقة عمل منسوخة صفها المحفوظ تلقائيًا؟"),
  options: [t("No; write it back with MODIFY to the intended position", "لا؛ اكتبها مجددًا باستخدام MODIFY إلى الموضع المقصود"), t("Yes; every work area is a live row alias", "نعم؛ كل منطقة عمل اسم مستعار حي للصف")], answer: 0,
  explanation: t("APPEND and INSERT store copied integer/string values. MODIFY replaces the target row using the current work area; it is a separate operation.", "تحفظ APPEND وINSERT قيم الأعداد والنصوص بنسخها. تستبدل MODIFY الصف الهدف بقيم منطقة العمل الحالية؛ وهي عملية منفصلة."),
};
const remove: SyntaxToken = {
  id: "delete-index", label: "DELETE … INDEX",
  meaning: t("Remove one internal-table row by position. Later rows shift one position earlier.", "احذف صفًا واحدًا من الجدول الداخلي بموضعه. تنتقل الصفوف التالية موضعًا واحدًا إلى الأمام."),
  why: t("Remove a record from the in-memory collection. Recalculate positions after deletion: a row's position is not its permanent identity.", "أزل سجلًا من المجموعة الموجودة في الذاكرة. أعد حساب المواضع بعد الحذف؛ فموضع الصف ليس هويته الدائمة."),
  write: t("DELETE lt_employees INDEX 1. removes the first row. sy-subrc is 0 if deleted, or 4 when a positive index has no row. Use positive indexes and check status before depending on the new layout. Deleting a row does not clear an unrelated work area and does not delete a database record. SQL DELETE has a different target and syntax.", "تحذف DELETE lt_employees INDEX 1. الصف الأول. تكون sy-subrc مساوية 0 عند الحذف أو4 إذا لم يوجد صف لفهرس موجب. استخدم فهارس موجبة وافحص النتيجة قبل الاعتماد على الترتيب الجديد. لا يمسح حذف الصف منطقة عمل مستقلة ولا يحذف سجل قاعدة بيانات. تختلف وجهة DELETE بلغة SQL وصياغتها."),
  correct: `${setup}\nDELETE lt_employees INDEX 1.\nIF sy-subrc = 0.\n  LOOP AT lt_employees INTO ls_employee.\n    WRITE ls_employee-name.\n  ENDLOOP.\nENDIF.`,
  mistake: `${setup}\nDELETE lt_employees INDEX 101.\nWRITE 'Ahmed deleted'.`,
  question: t("After deleting row 1 from [Ahmed, Sara, Omar], what is Omar's new position?", "بعد حذف الصف الأول من [Ahmed, Sara, Omar] ما موضع Omar الجديد؟"),
  options: [t("2", "2"), t("3; positions never change", "3؛ لا تتغير المواضع أبدًا")], answer: 0,
  explanation: t("Deletion closes the gap. Sara becomes row 1 and Omar becomes row 2; their ID fields do not change.", "يسد الحذف الفراغ. تصبح Sara في الصف الأول وOmar في الثاني؛ ولا تتغير حقول المعرّف."),
};
const challenge = {
  id: "data-mutation-workflow", title: t("Update the employee list", "حدّث قائمة الموظفين"),
  goal: t("Keep the supplied employee imports and input variables. Fill ls_employee from lv_insert_id and lv_insert_name, then INSERT it at INDEX 2. Change its name to lv_new_name and MODIFY table row 2 from the work area. DELETE row 1, then LOOP through the remaining table and display each stored name. Check sy-subrc before relying on each mutation. Initial output must be Sarah then Omar. Use the input variables and saved table values so changed inputs also work.", "احتفظ باستيراد الموظفين ومتغيرات المدخلات المعطاة. املأ ls_employee من lv_insert_id وlv_insert_name ثم أدرجها باستخدام INSERT في INDEX 2. غيّر اسمها إلى lv_new_name وعدّل صف الجدول الثاني باستخدام MODIFY من منطقة العمل. احذف الصف الأول باستخدام DELETE ثم مرّ بحلقة LOOP على الجدول المتبقي واعرض كل اسم محفوظ. افحص sy-subrc قبل الاعتماد على كل تعديل. يجب أن تكون النتيجة الأولية Sarah ثم Omar. استخدم متغيرات المدخلات وقيم الجدول المحفوظة لتعمل المدخلات المتغيرة أيضًا."),
  hint: t("Prepare both work-area fields before INSERT. After a successful insert, set only its name to lv_new_name and MODIFY INDEX 2; the ID remains lv_insert_id. Then delete INDEX 1. Use nested IF sy-subrc = 0 blocks so later work depends on success, and display names by reading the final table with LOOP AT.", "جهّز حقلي منطقة العمل قبل INSERT. بعد نجاح الإدراج اضبط اسمها فقط إلى lv_new_name ونفّذ MODIFY INDEX 2؛ يظل المعرّف lv_insert_id. ثم احذف INDEX 1. استخدم كتل IF sy-subrc = 0 متداخلة لتتوقف الأعمال المعتمدة على النجاح عند الإخفاق، واعرض الأسماء بقراءة الجدول النهائي باستخدام LOOP AT."),
  starter: `${setup}\n* Insert the supplied employee at position 2, modify its name, delete position 1, and display the final table.\n`,
  starterAr: `${setup}\n* أدرج الموظف المعطى في الموضع 2 وعدّل اسمه واحذف الموضع 1 ثم اعرض الجدول النهائي.\n`,
  solution: tableMutationsExample, expected: "Sarah\nOmar",
};
export const tableMutationsMission: Mission = {
  id: "data-table-mutations", pathId: "data", prerequisite: "data-read-table", minutes: 30, xp: 300,
  difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  title: t("Insert, modify and delete rows", "إدراج الصفوف وتعديلها وحذفها"), subtitle: t("Change a typed in-memory table with explicit positions", "غيّر جدولًا محدد النوع في الذاكرة بمواضع صريحة"),
  coveredTopics: ["Table operations", "INSERT", "MODIFY", "DELETE"],
  brief: t("An internal table is like a numbered stack of employee cards. APPEND adds at the end; INSERT makes room at a chosen position; MODIFY replaces a card's values; DELETE removes a card and closes the gap. A work area is your preparation desk: editing it does not automatically edit previously copied table rows. Indexes describe today's positions, not employee IDs. These statements change program memory only. Their similar SQL names do not imply database persistence, transactions or commits.", "الجدول الداخلي يشبه مجموعة بطاقات موظفين مرقمة. تضيف APPEND في النهاية؛ وتفسح INSERT موضعًا مختارًا؛ وتستبدل MODIFY قيم بطاقة؛ وتحذف DELETE بطاقة وتغلق الفراغ. منطقة العمل مكتب تجهيزك: لا يغيّر تعديلها الصفوف المنسوخة مسبقًا تلقائيًا. تصف الفهارس المواضع الحالية لا معرّفات الموظفين. تغيّر هذه العبارات ذاكرة البرنامج فقط؛ ولا يعني تشابه أسمائها مع SQL حفظًا في قاعدة بيانات أو معاملات أو تثبيتًا."),
  objectives: [t("Choose APPEND, INSERT, MODIFY or DELETE for a requested change.", "اختر APPEND أوINSERT أوMODIFY أوDELETE للتغيير المطلوب."), t("Preserve a row's fields while writing a work-area copy back with MODIFY.", "احفظ حقول الصف أثناء كتابة نسخة منطقة العمل مجددًا باستخدام MODIFY."), t("Track shifting positions and check mutation return codes immediately.", "تتبّع تغير المواضع وافحص رموز نتيجة التعديل مباشرة."), t("Distinguish internal-table mutations from SQL database changes.", "ميّز تعديل الجداول الداخلية عن تغييرات قاعدة البيانات بلغة SQL.")],
  references: ["https://help.sap.com/saphelp_gbt10/helpdata/en/fc/eb361f358411d1829f0000e829fbfe/content.htm", "https://help.sap.com/docs/abap-cloud/abap-keyword/modify-itab-index", "https://help.sap.com/saphelp_autoid2007/helpdata/EN/fc/eb37b2358411d1829f0000e829fbfe/content.htm", "https://help.sap.com/docs/SAP_NETWEAVER_700/10a002cd6c531014b5e1cb16d2455072/06aafd54fc4011d195280000e8353423.html"],
  tokens: [...fundamentals.find(m => m.id === "tables")!.tokens.filter(token => ["standard-table", "append"].includes(token.id)), insert, modify, remove, ...fundamentals.find(m => m.id === "loop-at")!.tokens.filter(token => ["loop-at", "endloop", "row-field"].includes(token.id))],
  example: tableMutationsExample,
  visual: t("Start with Ahmed and Omar. INSERT creates a middle row for Sara and shifts Omar to position 3. Editing the work area changes its name to Sarah, while the table still stores Sara until MODIFY copies the new values to row 2. DELETE removes Ahmed and shifts the remaining rows: Sarah is now first, Omar second. Follow each successful status check and the final LOOP snapshots.", "ابدأ بالموظفين Ahmed وOmar. تنشئ INSERT صفًا أوسط لـSara وتنقل Omar إلى الموضع 3. يغيّر تعديل منطقة العمل اسمها إلى Sarah، بينما يظل Sara في الجدول حتى تنسخ MODIFY القيم الجديدة إلى الصف الثاني. تحذف DELETE الموظف Ahmed وتنقل الصفوف المتبقية: تصبح Sarah أولًا وOmar ثانيًا. تتبّع فحوص النجاح ولقطات حلقة LOOP النهائية."),
  practice: t("Predict Sarah then Omar. Pause between the name assignment and MODIFY to compare work area and stored row. In free exploration, change INSERT INDEX 2 to INDEX 3: identify the different target before letting MODIFY run. Try a positive index beyond the table size and inspect sy-subrc = 4; guarded dependent steps are skipped. Restore the valid workflow. This restricted runtime supports direct typed standard-table index operations, not SQL, key-based changes, range deletes, TRANSPORTING, sorted/hashed insertion rules or SAP exception handling. Use positive indexes: invalid nonpositive mutation indexes are errors, unlike the current READ TABLE miss behavior.", "توقّع Sarah ثم Omar. توقف بين إسناد الاسم وMODIFY لمقارنة منطقة العمل بالصف المحفوظ. في الاستكشاف الحر غيّر INSERT INDEX 2 إلى INDEX 3 وحدد اختلاف الهدف قبل متابعة MODIFY. جرّب فهرسًا موجبًا يتجاوز حجم الجدول وافحص sy-subrc = 4؛ تُتجاوز الخطوات اللاحقة المحمية. أعد المسار الصالح. يدعم المحاكي المحدود عمليات مباشرة بفهرس على جداول قياسية محددة النوع، دون SQL أو تغييرات بالمفتاح أو حذف نطاقات أوTRANSPORTING أو قواعد إدراج الجداول المرتبة والمجزأة أو معالجة استثناءات SAP. استخدم فهارس موجبة؛ ففهارس التعديل غير الموجبة أخطاء بخلاف سلوك غياب READ TABLE الحالي."),
  hints: [t("Separate the preparation desk from the saved card: changing one does not change the other.", "افصل مكتب التجهيز عن البطاقة المحفوظة؛ لا يغيّر تعديل أحدهما الآخر."), t("Inserting before row 2 shifts Omar to row 3; deleting row 1 later shifts him back to row 2.", "ينقل الإدراج قبل الصف الثاني Omar إلى الصف الثالث؛ ثم يعيده حذف الصف الأول إلى الصف الثاني."), challenge.hint],
  challenges: [challenge], goal: challenge.goal, hint: challenge.hint, starter: challenge.starter, starterAr: challenge.starterAr, solution: challenge.solution, expected: challenge.expected,
  quiz: t("After inserting Sara at position 2 between Ahmed and Omar, you change only the work-area name to Sarah. What changes in the table before MODIFY?", "بعد إدراج Sara في الموضع 2 بين Ahmed وOmar، غيّرت اسم منطقة العمل فقط إلى Sarah. ماذا يتغير في الجدول قبل MODIFY؟"),
  options: [t("Nothing; the table still stores Sara until MODIFY writes the copy back", "لا شيء؛ يظل Sara في الجدول حتى تكتب MODIFY النسخة مجددًا"), t("Sara becomes Sarah automatically", "تصبح Sara باسم Sarah تلقائيًا"), t("Omar is deleted because his position shifted", "يُحذف Omar لأن موضعه تغير")], answer: 0,
  quizExplanation: t("INSERT stores a copy. A work-area assignment changes only that separate variable. MODIFY is needed to replace row 2, and DELETE is a distinct operation. None of these internal-table operations persists a database record.", "تحفظ INSERT نسخة. يغيّر إسناد منطقة العمل ذلك المتغير المنفصل فقط. تتطلب كتابة الصف الثاني مجددًا MODIFY، والحذف عملية DELETE مستقلة. لا تحفظ أي من عمليات الجدول الداخلي هذه سجلًا في قاعدة البيانات."),
};

function g(id: string, lines: [number, number], title: Text, explanation: Text, practice: Text, syntaxRefs: string[] = [], concept = "table"): AnatomyGroupSpec {
  return { id, lines, title, explanation, practice, syntaxRefs, glossaryRefs: [concept], visualizer: { kind: "snapshot", line: lines[1] } };
}
export const tableMutationsAnatomy: { fingerprint: string; groups: AnatomyGroupSpec[]; checks: string[] } = {
  fingerprint: "feb9e44a",
  checks: ["append", "insert", "edit-copy", "modify", "delete", "display"],
  groups: [
    { ...g("shape", [1, 4], t("Define the employee shape", "عرّف بنية الموظف"), t("Describe each row's id and name fields.", "صف حقلي id وname لكل صف."), t("Which group defines the type rather than stored values?", "أي مجموعة تعرّف النوع لا القيم المحفوظة؟"), [], "type"), visualizer: { kind: "type", line: 4 } },
    g("storage", [5, 6], t("Create table and work area", "أنشئ الجدول ومنطقة العمل"), t("Allocate the standard table and a separate one-row work area.", "أنشئ الجدول القياسي ومنطقة عمل مستقلة لصف واحد."), t("Which group creates the collection and its preparation variable?", "أي مجموعة تنشئ المجموعة ومتغير تجهيزها؟"), ["standard-table"]),
    g("append", [7, 12], t("Import two saved rows", "استورد صفين محفوظين"), t("APPEND saves Ahmed at position 1 and Omar at position 2, each as a copy.", "تحفظ APPEND الموظف Ahmed في الموضع 1 وOmar في الموضع 2 بنسخة لكل منهما."), t("Which group builds the original two-row table?", "أي مجموعة تبني الجدول الأصلي ذي الصفين؟"), ["append"], "append"),
    g("inputs", [13, 15], t("Supply the new employee inputs", "جهّز مدخلات الموظف الجديد"), t("Separate inputs hold the inserted ID, original name and replacement name.", "تحفظ مدخلات منفصلة معرّف الإدراج والاسم الأصلي والاسم البديل."), t("Which group declares values that assessment can vary?", "أي مجموعة تصرّح بالقيم التي يمكن للتقييم تغييرها؟"), [], "variable"),
    g("prepare", [16, 17], t("Prepare both inserted fields", "جهّز حقلي الإدراج"), t("Fill the work area from lv_insert_id and lv_insert_name. The table is not changed yet.", "املأ منطقة العمل من lv_insert_id وlv_insert_name. لم يتغير الجدول بعد."), t("Which group prepares the new row without saving it?", "أي مجموعة تجهّز الصف الجديد دون حفظه؟"), [], "assign"),
    g("insert", [18, 18], t("Insert before Omar", "أدرج قبل Omar"), t("Insert the copied work area at position 2. Sara occupies row 2; Omar moves to row 3.", "أدرج نسخة منطقة العمل في الموضع 2. تشغل Sara الصف الثاني وينتقل Omar إلى الثالث."), t("Which group adds a middle row and shifts the following index?", "أي مجموعة تضيف صفًا أوسط وتغيّر فهرس الصف التالي؟"), ["insert-index"]),
    g("insert-status", [19, 19], t("Require successful insertion", "اشترط نجاح الإدراج"), t("Only enter the dependent workflow when INSERT returned sy-subrc = 0.", "ادخل مسار العمل المعتمد على الإدراج فقط عندما تعيد INSERT القيمة sy-subrc = 0."), t("Which group stops dependent work if insertion fails?", "أي مجموعة توقف العمل المعتمد على الإدراج عند فشله؟"), ["insert-index"], "condition"),
    g("edit-copy", [20, 20], t("Edit only the work area", "عدّل منطقة العمل فقط"), t("Change the prepared name to Sarah. The inserted table row still stores Sara.", "غيّر الاسم المجهز إلى Sarah. لا يزال صف الجدول المدرج يحفظ Sara."), t("Which group changes a separate variable while the saved row stays unchanged?", "أي مجموعة تغيّر متغيرًا مستقلًا بينما يبقى الصف المحفوظ دون تغيير؟"), ["modify-index"], "assign"),
    g("modify", [21, 21], t("Replace the saved middle row", "استبدل الصف الأوسط المحفوظ"), t("MODIFY copies all work-area fields into existing row 2, including the retained inserted ID.", "تنسخ MODIFY جميع حقول منطقة العمل إلى الصف الثاني الموجود، بما فيها معرّف الإدراج المحفوظ."), t("Which group makes the stored name become Sarah?", "أي مجموعة تجعل الاسم المحفوظ Sarah؟"), ["modify-index"]),
    g("modify-status", [22, 22], t("Require successful modification", "اشترط نجاح التعديل"), t("Only delete after the expected row was modified successfully.", "احذف فقط بعد نجاح تعديل الصف المقصود."), t("Which group checks the result of MODIFY before deletion?", "أي مجموعة تفحص نتيجة MODIFY قبل الحذف؟"), ["modify-index"], "condition"),
    g("delete", [23, 23], t("Remove the first row", "احذف الصف الأول"), t("Delete Ahmed. Sarah shifts to position 1 and Omar to position 2; their IDs are unchanged.", "احذف Ahmed. تنتقل Sarah إلى الموضع 1 وOmar إلى الموضع 2؛ ولا تتغير معرّفاتهما."), t("Which group reduces the row count and closes the first-position gap?", "أي مجموعة تقلل عدد الصفوف وتغلق فراغ الموضع الأول؟"), ["delete-index"]),
    g("delete-status", [24, 24], t("Require successful deletion", "اشترط نجاح الحذف"), t("Display the intended final report only after DELETE succeeds.", "اعرض التقرير النهائي المقصود فقط بعد نجاح DELETE."), t("Which group checks that the removal completed?", "أي مجموعة تتحقق من اكتمال الإزالة؟"), ["delete-index"], "condition"),
    g("display", [25, 27], t("Read the actual final table", "اقرأ الجدول النهائي الفعلي"), t("LOOP INTO copies each remaining row and displays Sarah then Omar from stored fields.", "تنسخ LOOP INTO كل صف متبقٍ وتعرض Sarah ثم Omar من الحقول المحفوظة."), t("Which group proves the final saved order by reading table rows?", "أي مجموعة تثبت الترتيب المحفوظ النهائي بقراءة صفوف الجدول؟"), ["loop-at"], "output"),
    g("close", [28, 30], t("Close the dependent decisions", "أغلق القرارات المترابطة"), t("Close the DELETE, MODIFY and INSERT success checks from innermost to outermost.", "أغلق فحوص نجاح DELETE ثم MODIFY ثم INSERT من الأعمق إلى الخارج."), t("Which group finishes the nested success gates?", "أي مجموعة تنهي شروط النجاح المتداخلة؟"), [], "condition"),
  ],
};
