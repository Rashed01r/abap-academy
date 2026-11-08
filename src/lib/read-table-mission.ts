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
ls_employee-id = 102.
ls_employee-name = 'Sara'.
APPEND ls_employee TO lt_employees.`;
const setup = `${seed}
DATA lv_id TYPE i VALUE 102.`;
const lookup = `READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.
IF sy-subrc = 0.
  WRITE ls_employee-name.
ELSE.
  WRITE 'Not found'.
ENDIF.`;
const solution = `${setup}
${lookup}`;
export const readTableExample = `${solution}
lv_id = 999.
${lookup}`;

const keyToken: SyntaxToken = {
  id: "read-table-key", label: "READ TABLE … INTO … WITH KEY",
  meaning: t("Read one matching internal-table row and copy it into a compatible work area. WITH KEY supplies field comparisons; the first matching row is selected.", "اقرأ صفًا مطابقًا واحدًا من جدول داخلي وانسخه إلى منطقة عمل متوافقة. تحدد WITH KEY مقارنات الحقول؛ ويُختار أول صف مطابق."),
  why: t("Find an employee by business ID instead of processing every employee with a LOOP. Reading INTO copies a row; changing that work area later does not update the saved table row.", "اعثر على موظف بمعرّف العمل بدل معالجة الجميع بحلقة LOOP. تنسخ INTO الصف؛ ولا يغيّر تعديل منطقة العمل لاحقًا الصف المحفوظ في الجدول."),
  write: t("Write READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id. The field left of = belongs to each table row; lv_id is the search value. Multiple pairs require all comparisons to match. EMPTY KEY does not forbid free-key lookup or enforce ID uniqueness. This subset supports explicitly typed standard tables, direct INTO, WITH KEY and INDEX; BINARY SEARCH comes later in Internal table performance, and secondary keys are not supported.", "اكتب READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id. ينتمي الحقل يسار = إلى كل صف؛ وlv_id قيمة البحث. عند تعدد الأزواج يجب أن تتطابق جميع المقارنات. لا يمنع EMPTY KEY البحث بمفتاح حر ولا يفرض تفرّد المعرّف. يدعم هذا الجزء الجداول القياسية ذات الأنواع الصريحة وINTO المباشرة وWITH KEY وINDEX؛ دون BINARY SEARCH أو مفاتيح ثانوية."),
  correct: `${setup}\n${lookup}`,
  mistake: `${setup}\nREAD TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nWRITE ls_employee-name.`,
  question: t("Does WITH KEY id = 102 mean read the 102nd row?", "هل تعني WITH KEY id = 102 قراءة الصف رقم 102؟"),
  options: [t("No; find a row whose id field equals 102", "لا؛ ابحث عن صف قيمة حقله id تساوي 102"), t("Yes; key and row position are the same", "نعم؛ المفتاح وموضع الصف شيء واحد")], answer: 0,
  explanation: t("The search compares row content. INDEX 2 would instead select the second row by its 1-based position in this standard table.", "يقارن البحث محتوى الصف. أما INDEX 2 فيختار الصف الثاني بموضعه الذي يبدأ من 1 في هذا الجدول القياسي."),
};
const statusToken: SyntaxToken = {
  id: "sy-subrc", label: "sy-subrc / IF … ELSE",
  meaning: t("sy-subrc is a system return code. In these supported READ TABLE forms, 0 means found and 4 means no matching row. On a miss, INTO leaves the destination unchanged.", "sy-subrc رمز نتيجة نظامي. في صيغ READ TABLE المدعومة هنا تعني 0 العثور على الصف و4 عدم العثور عليه. عند الإخفاق تترك INTO الوجهة دون تغيير."),
  why: t("A work area can still contain a previous employee after a failed read. The return code tells you whether its contents came from this lookup.", "قد تبقى في منطقة العمل بيانات موظف سابق بعد فشل القراءة. يخبرك رمز النتيجة هل جاءت محتوياتها من عملية البحث الحالية."),
  write: t("Check IF sy-subrc = 0. immediately after READ TABLE, display ls_employee-name only in that branch, and display Not found in ELSE. Do not assign to sy-subrc. In SAP other statements can overwrite it and other READ TABLE additions can produce other return codes; this lesson models only direct INTO key/index reads with 0/4.", "افحص IF sy-subrc = 0. مباشرة بعد READ TABLE، واعرض ls_employee-name داخل هذا الفرع فقط واعرض Not found في ELSE. لا تُسند إلى sy-subrc. في SAP قد تستبدل عبارات أخرى قيمته وقد تنتج إضافات أخرى لـREAD TABLE رموزًا أخرى؛ يمثل هذا الدرس قراءة INTO المباشرة بالمفتاح أو الفهرس بنتيجتي 0 و4 فقط."),
  correct: `${setup}\nlv_id = 999.\n${lookup}`,
  mistake: `${setup}\nlv_id = 999.\nREAD TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nWRITE ls_employee-name.`,
  question: t("After reading 102 successfully, reading 999 fails. Is the work area's remaining Sara proof that 999 was found?", "بعد نجاح قراءة 102 تفشل قراءة 999. هل بقاء Sara في منطقة العمل دليل على العثور على 999؟"),
  options: [t("No; check sy-subrc and take the not-found branch", "لا؛ افحص sy-subrc واتبع فرع عدم العثور"), t("Yes; a nonempty name proves success", "نعم؛ يثبت الاسم غير الفارغ نجاح القراءة")], answer: 0,
  explanation: t("A miss preserves the previous destination. It sets sy-subrc to 4; the IF condition is false, so only Not found should be displayed.", "يحافظ الإخفاق على الوجهة السابقة ويضبط sy-subrc إلى 4. يكون شرط IF خاطئًا، لذا يجب عرض Not found فقط."),
};
const indexToken: SyntaxToken = {
  id: "read-table-index", label: "READ TABLE … INDEX",
  meaning: t("INDEX reads one row by its 1-based position in an index table.", "تقرأ INDEX صفًا واحدًا بموضعه الذي يبدأ من 1 في جدول ذي فهرس."),
  why: t("Use position when the position itself is the requirement. A business ID is row content and can differ completely from its position.", "استخدم الموضع عندما يكون هو المطلوب. معرّف العمل محتوى صف وقد يختلف تمامًا عن موضعه."),
  write: t("READ TABLE lt_employees INTO ls_employee INDEX 2. selects Sara in the supplied order. Check sy-subrc before using the destination. Current SAP keyword documentation returns 4 for an index outside 1 through the row count, including zero and negative values. Older SAP documentation describes a runtime error for nonpositive indexes; check the target release and use positive positions for portable code.", "تختار READ TABLE lt_employees INTO ls_employee INDEX 2. الموظفة Sara وفق الترتيب المعطى. افحص sy-subrc قبل استخدام الوجهة. يعيد توثيق SAP الحالي القيمة 4 للفهرس خارج الفترة من 1 إلى عدد الصفوف، بما فيها الصفر والقيم السالبة. يصف توثيق SAP الأقدم خطأ وقت تشغيل للفهرس غير الموجب؛ تحقق من الإصدار المستهدف واستخدم مواضع موجبة لشيفرة قابلة للنقل."),
  correct: `${seed}\nREAD TABLE lt_employees INTO ls_employee INDEX 2.\nIF sy-subrc = 0.\n  WRITE ls_employee-name.\nENDIF.`,
  mistake: `${seed}\nREAD TABLE lt_employees INTO ls_employee INDEX 102.\nWRITE ls_employee-name.`,
  question: t("Which position contains employee ID 102 in the supplied table?", "أي موضع يحتوي الموظف صاحب المعرّف 102 في الجدول المعطى؟"), options: [t("Position 2", "الموضع 2"), t("Position 102", "الموضع 102")], answer: 0,
  explanation: t("APPEND stored Ahmed first and Sara second. IDs are values, not indexes.", "حفظت APPEND الموظف Ahmed أولًا وSara ثانيًا. المعرّفات قيم وليست فهارس."),
};
const challenge = {
  id: "data-read-lookup", title: t("Find an employee safely", "اعثر على موظف بأمان"),
  goal: t("Keep the supplied type, imported rows, identifiers and lv_id input. Read lt_employees INTO ls_employee WITH KEY id = lv_id. Check sy-subrc immediately: if 0, display ls_employee-name; otherwise display exactly Not found. Read the stored field rather than hardcoding a name. The initial input 102 should display Sara; your code must also handle changed IDs, names and missing employees.", "احتفظ بالنوع والصفوف المستوردة والمعرّفات والمدخل lv_id المعطاة. اقرأ lt_employees إلى ls_employee باستخدام WITH KEY id = lv_id. افحص sy-subrc مباشرة: إذا كان 0 فاعرض ls_employee-name، وإلا فاعرض النص Not found بالضبط. اقرأ الحقل المحفوظ بدل تثبيت اسم في الشيفرة. يجب أن يعرض المدخل الأولي 102 الاسم Sara؛ وعلى شيفرتك معالجة تغيير المعرّفات والأسماء وغياب الموظفين أيضًا."),
  hint: t("Use READ TABLE with lv_id as the search value. Then IF sy-subrc = 0. WRITE ls_employee-name. ELSE. WRITE 'Not found'. ENDIF. A nonempty work area can be stale, so do not use its name as the success test.", "استخدم READ TABLE بقيمة البحث lv_id. ثم IF sy-subrc = 0. WRITE ls_employee-name. ELSE. WRITE 'Not found'. ENDIF. قد تحمل منطقة العمل غير الفارغة بيانات قديمة، فلا تستخدم الاسم لاختبار النجاح."),
  starter: `${setup}\n* Read by lv_id and display the found name or Not found.\n`,
  starterAr: `${setup}\n* ابحث باستخدام lv_id واعرض الاسم الموجود أو Not found.\n`,
  solution, expected: "Sara",
};
export const readTableMission: Mission = {
  id: "data-read-table", pathId: "data", prerequisite: "data-work-areas-field-symbols", minutes: 25, xp: 280,
  difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["READ TABLE", "Single-row lookup"],
  title: t("READ TABLE and safe lookup", "READ TABLE والبحث الآمن"), subtitle: t("Find one row, then prove that this read succeeded", "اعثر على صف ثم تحقق من نجاح هذه القراءة"),
  brief: t("An internal table is like an employee directory. READ TABLE asks for one matching entry; INTO copies that row into a work area. WITH KEY compares content such as an employee ID, while INDEX chooses a position. For the direct forms taught here, sy-subrc is 0 when found and 4 when absent. A failed read leaves the work area unchanged: it may still show the previous employee. Check the return code before reading the destination as a new result. This browser runs a restricted educational subset with typed standard tables; it does not query an SAP database.", "الجدول الداخلي يشبه دليل الموظفين. تطلب READ TABLE مدخلًا مطابقًا واحدًا، وتنسخ INTO ذلك الصف إلى منطقة العمل. تقارن WITH KEY المحتوى مثل معرّف الموظف، بينما تختار INDEX موضعًا. في الصيغ المباشرة التي ندرّسها تكون sy-subrc مساوية 0 عند العثور و4 عند الغياب. تترك القراءة الفاشلة منطقة العمل دون تغيير، فقد تعرض الموظف السابق. افحص رمز النتيجة قبل التعامل مع الوجهة بوصفها نتيجة جديدة. يشغّل المتصفح جزءًا تعليميًا محدودًا بجداول قياسية محددة النوع؛ ولا يستعلم من قاعدة بيانات SAP."),
  objectives: [t("Read a typed row with a variable key and explain the INTO copy.", "اقرأ صفًا محدد النوع بمفتاح متغير واشرح نسخة INTO."), t("Distinguish employee ID from a 1-based table index.", "ميّز معرّف الموظف عن فهرس الجدول الذي يبدأ من 1."), t("Guard found/not-found output with sy-subrc and identify stale work-area data.", "احمِ إخراج النجاح والغياب باستخدام sy-subrc وميّز بيانات منطقة العمل القديمة.")],
  references: ["https://help.sap.com/docs/abap-cloud/abap-concepts/reading-single-lines", "https://help.sap.com/docs/abap-cloud/abap-keyword/read-table-itab", "https://help.sap.com/docs/abap-cloud/abap-keyword/read-table-index", "https://help.sap.com/SAPHELP_SCM700_EHP02/helpdata/EN/fc/eb35f8358411d1829f0000e829fbfe/content.htm"],
  tokens: [...fundamentals.find(m => m.id === "tables")!.tokens.filter(token => ["standard-table", "append"].includes(token.id)), keyToken, statusToken, indexToken],
  example: readTableExample,
  visual: t("Watch the first lookup select the stored row with ID 102 and copy Sara into ls_employee. Its return code is 0. The second lookup searches for 999: no table row is selected, sy-subrc becomes 4, and the destination remains Sara. The guard displays Not found instead of incorrectly treating that retained name as a new match.", "راقب البحث الأول وهو يختار الصف المحفوظ صاحب المعرّف 102 وينسخ Sara إلى ls_employee. رمز النتيجة 0. يبحث الاستعلام الثاني عن 999: لا يُختار أي صف وتصبح sy-subrc مساوية 4 وتبقى Sara في الوجهة. يعرض الشرط Not found بدل اعتبار الاسم الباقي مطابقة جديدة بالخطأ."),
  practice: t("Predict Sara then Not found. Change the final lv_id assignment from 999 to 101 and rerun: the second result becomes Ahmed. Restore 999 and inspect the unchanged destination at the failed READ. Try INDEX 1 instead of WITH KEY in free exploration and compare position with business ID. Multiple key fields are AND conditions; duplicate free-key matches return the first matching row. Secondary keys, binary search, TRANSPORTING, ASSIGNING and table-expression exceptions are outside this executable lesson.", "توقّع Sara ثم Not found. غيّر إسناد lv_id الأخير من 999 إلى 101 وأعد التشغيل: تصبح النتيجة الثانية Ahmed. أعد 999 وافحص الوجهة التي لم تتغير عند READ الفاشلة. جرّب INDEX 1 بدل WITH KEY في الاستكشاف الحر وقارن الموضع بمعرّف العمل. تمثل حقول المفتاح المتعددة شروطًا مجتمعة؛ وعند تكرر المطابقات بالمفتاح الحر يُعاد أول صف مطابق. تقع المفاتيح الثانوية والبحث الثنائي وTRANSPORTING وASSIGNING واستثناءات تعبيرات الجداول خارج هذا الدرس التنفيذي."),
  challenges: [challenge], goal: challenge.goal, hint: challenge.hint, starter: challenge.starter, starterAr: challenge.starterAr, solution, expected: challenge.expected,
  hints: [t("Separate finding a row from using its copied values.", "افصل العثور على الصف عن استخدام قيمه المنسوخة."), t("READ TABLE sets sy-subrc; check it before displaying the work-area name.", "تضبط READ TABLE قيمة sy-subrc؛ افحصها قبل عرض اسم منطقة العمل."), challenge.hint],
  quiz: t("A successful READ returned Sara. A later READ for missing ID 999 sets sy-subrc to 4. What is safe to display?", "أعادت READ ناجحة الاسم Sara. تضبط READ لاحقة للمعرّف الغائب 999 قيمة sy-subrc إلى 4. ما الإخراج الآمن؟"),
  options: [t("Not found; the retained Sara belongs to the earlier read", "Not found؛ فالاسم Sara الباقي يخص القراءة السابقة"), t("Sara, because a nonempty destination proves this read succeeded", "Sara، لأن الوجهة غير الفارغة تثبت نجاح هذه القراءة"), t("An empty name, because every miss clears the destination", "اسم فارغ، لأن كل إخفاق يمسح الوجهة")], answer: 0,
  quizExplanation: t("READ TABLE INTO leaves the work area unchanged when no row is found. sy-subrc describes the lookup outcome; check it immediately and do not mistake old data for a new result.", "تترك READ TABLE INTO منطقة العمل دون تغيير عند غياب الصف. تصف sy-subrc نتيجة البحث؛ افحصها مباشرة ولا تخلط البيانات القديمة بنتيجة جديدة."),
};

function group(id: string, lines: [number, number], title: Text, explanation: Text, practice: Text, syntaxRefs: string[] = [], concept = "table"): AnatomyGroupSpec {
  return { id, lines, title, explanation, practice, syntaxRefs, glossaryRefs: [concept], visualizer: { kind: "snapshot", line: lines[1] } };
}
export const readTableAnatomy: { fingerprint: string; groups: AnatomyGroupSpec[]; checks: string[] } = {
  fingerprint: "533a1d0c",
  checks: ["seed-first", "key-found", "guard-found", "key-missing", "guard-missing", "missing-output"],
  groups: [
    { ...group("shape", [1, 4], t("Define one employee", "عرّف موظفًا واحدًا"), t("Define the row shape with integer id and string name.", "عرّف شكل الصف بحقل id صحيح وحقل name نصي."), t("Which group defines the shape without creating records?", "أي مجموعة تعرّف الشكل دون إنشاء سجلات؟"), [], "type"), visualizer: { kind: "type", line: 4 } },
    group("storage", [5, 6], t("Create table and destination", "أنشئ الجدول والوجهة"), t("The standard table holds many employees; ls_employee holds one copied row.", "يحفظ الجدول القياسي موظفين متعددين؛ وتحفظ ls_employee صفًا منسوخًا واحدًا."), t("Which group creates storage for the collection and its receiving work area?", "أي مجموعة تنشئ تخزين المجموعة ومنطقة العمل المستقبلة؟"), ["standard-table"]),
    group("seed-first", [7, 9], t("Save Ahmed", "احفظ Ahmed"), t("Fill ID 101 and name Ahmed, then APPEND an independent copy as row 1.", "املأ المعرّف 101 والاسم Ahmed ثم أضف نسخة مستقلة باستخدام APPEND كصف أول."), t("Which group stores the first employee in the table?", "أي مجموعة تحفظ الموظف الأول في الجدول؟"), ["append"], "append"),
    group("seed-second", [10, 12], t("Save Sara", "احفظ Sara"), t("Replace the work-area values and append row 2 with ID 102. Ahmed's saved row is unchanged.", "استبدل قيم منطقة العمل وأضف الصف الثاني بالمعرّف 102. لا يتغير صف Ahmed المحفوظ."), t("Which group adds the second independent employee?", "أي مجموعة تضيف الموظف الثاني المستقل؟"), ["append"], "append"),
    group("input", [13, 13], t("Choose the search value", "اختر قيمة البحث"), t("Start lv_id at 102. This is an ID value, not row position 102.", "ابدأ lv_id بالقيمة 102. إنها قيمة معرّف وليست موضع الصف 102."), t("Which group supplies the variable used on the right of the key comparison?", "أي مجموعة توفر المتغير المستخدم يمين مقارنة المفتاح؟"), [], "variable"),
    group("key-found", [14, 14], t("Find the matching ID", "اعثر على المعرّف المطابق"), t("Search id = lv_id, find row 2 and copy Sara into ls_employee. sy-subrc becomes 0.", "ابحث عن id = lv_id واعثر على الصف الثاني وانسخ Sara إلى ls_employee. تصبح sy-subrc مساوية 0."), t("Which group performs the successful single-row key lookup?", "أي مجموعة تنفذ البحث الناجح عن صف واحد بالمفتاح؟"), ["read-table-key"]),
    group("guard-found", [15, 15], t("Check this read's status", "افحص نتيجة هذه القراءة"), t("Check sy-subrc = 0 immediately. This condition is true after finding 102.", "افحص sy-subrc = 0 مباشرة. يتحقق الشرط بعد العثور على 102."), t("Which group checks success before displaying the found name?", "أي مجموعة تفحص النجاح قبل عرض الاسم الموجود؟"), ["sy-subrc"], "condition"),
    group("found-output", [16, 19], t("Display the found result", "اعرض النتيجة الموجودة"), t("Display the copied name Sara. The Not found alternative is skipped on this read.", "اعرض الاسم المنسوخ Sara. يُتجاوز البديل Not found في هذه القراءة."), t("Which group displays the successful lookup's copied name?", "أي مجموعة تعرض الاسم المنسوخ من البحث الناجح؟"), ["sy-subrc"], "output"),
    group("missing-input", [20, 20], t("Request an absent employee", "اطلب موظفًا غير موجود"), t("Change only the search ID to 999. Neither saved row nor the destination is changed by this assignment.", "غيّر معرّف البحث فقط إلى 999. لا يغيّر هذا الإسناد الصفوف المحفوظة أو الوجهة."), t("Which group changes the next request without modifying the table?", "أي مجموعة تغيّر الطلب التالي دون تعديل الجدول؟"), [], "assign"),
    group("key-missing", [21, 21], t("Observe a failed read", "راقب قراءة فاشلة"), t("No row has ID 999. sy-subrc becomes 4, and ls_employee still contains Sara from the successful read.", "لا يوجد صف بمعرّف 999. تصبح sy-subrc مساوية 4 وتظل Sara في ls_employee من القراءة الناجحة."), t("Which group leaves the destination unchanged because no row matches?", "أي مجموعة تترك الوجهة دون تغيير لغياب الصف المطابق؟"), ["read-table-key", "sy-subrc"]),
    group("guard-missing", [22, 23], t("Reject stale data", "ارفض البيانات القديمة"), t("The condition is false because the latest read returned 4. The WRITE of the retained name is skipped.", "الشرط غير متحقق لأن آخر قراءة أعادت 4. تُتجاوز WRITE التي تعرض الاسم الباقي."), t("Which group prevents Sara from being displayed as the result for ID 999?", "أي مجموعة تمنع عرض Sara بوصفها نتيجة المعرّف 999؟"), ["sy-subrc"], "condition"),
    group("missing-output", [24, 26], t("Display the missing result", "اعرض نتيجة الغياب"), t("ELSE displays Not found, then ENDIF closes the decision. The destination still exists but is not a valid result for 999.", "تعرض ELSE النص Not found ثم تغلق ENDIF القرار. تظل الوجهة موجودة لكنها ليست نتيجة صالحة للمعرّف 999."), t("Which group presents the not-found outcome instead of an old employee name?", "أي مجموعة تعرض نتيجة عدم العثور بدل اسم موظف قديم؟"), ["sy-subrc"], "output"),
  ],
};
