import type { Mission, SyntaxToken, Text } from "./curriculum";
import { fundamentals } from "./fundamentals";
const t = (en: string, ar: string): Text => ({en,ar});
const standardCode = `DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA lv_id TYPE i.
APPEND 30 TO lt_ids.
APPEND 10 TO lt_ids.
APPEND 30 TO lt_ids.
LOOP AT lt_ids INTO lv_id.
  WRITE lv_id.
ENDLOOP.`;
const sorted: SyntaxToken = {
  id: "sorted-category", label: "SORTED TABLE / NON-UNIQUE KEY",
  meaning: t("A sorted table keeps rows in ascending primary-key order. Its primary key may be unique or non-unique.", "يحافظ الجدول المرتب على ترتيب الصفوف تصاعديًا حسب المفتاح الأساسي، الذي قد يكون فريدًا أو غير فريد."),
  why: t("Choose it when key order or processing by the leading part of a key matters. Standard and sorted tables have primary indexes.", "اختره عندما تحتاج إلى ترتيب المفتاح أو المعالجة وفق بدايته. للجداول القياسية والمرتبة فهارس أساسية."),
  write: t("SAP reference syntax: NON-UNIQUE KEY table_line uses the whole elementary row as a key and permits duplicates. UNIQUE would prevent duplicate keys. The browser editor does not execute this declaration; use the conceptual comparison. Modern ABAP systems support these categories in classic ABAP and ABAP Cloud.", "صياغة مرجعية لنظام SAP: يستخدم NON-UNIQUE KEY table_line الصف البسيط كاملًا مفتاحًا ويسمح بتكراره. يمنع UNIQUE تكرار المفاتيح. لا ينفّذ محرر المتصفح هذا التعريف؛ استخدم المقارنة المفاهيمية. تدعم أنظمة ABAP الحديثة هذه الفئات في ABAP التقليدية وABAP Cloud."),
  correct: "DATA lt_sorted TYPE SORTED TABLE OF i WITH NON-UNIQUE KEY table_line.",
  mistake: "DATA lt_sorted TYPE SORTED TABLE OF i WITH EMPTY KEY.",
  question: t("Which values describe a sorted table with a non-unique whole-row key after accepting 30, 10, 30?", "ما القيم التي تمثل جدولًا مرتبًا بمفتاح غير فريد يشمل الصف كاملًا بعد قبول 30، 10، 30؟"),
  options: [t("10, 30, 30", "10، 30، 30"), t("30, 10, 30", "30، 10، 30")], answer:0,
  explanation: t("Key ordering is maintained automatically; NON-UNIQUE allows both rows with key 30. Populating a sorted table safely is taught with INSERT later; APPEND can violate its ordering requirements.", "يُحافَظ على ترتيب المفتاح تلقائيًا، ويسمح NON-UNIQUE بالصفين ذوي المفتاح 30. سنتعلّم لاحقًا تعبئة الجدول المرتب بأمان باستخدام INSERT؛ فقد تخالف APPEND متطلبات الترتيب."),
};
const hashed: SyntaxToken = {
  id: "hashed-category", label: "HASHED TABLE / UNIQUE KEY",
  meaning: t("A hashed table requires a unique primary key and supports efficient lookup using the full primary key.", "يتطلب الجدول القائم على التجزئة مفتاحًا أساسيًا فريدًا، ويتيح البحث بكفاءة باستخدام هذا المفتاح كاملًا."),
  why: t("Use it for repeated exact-key lookups, such as finding one product by its ID. It has no primary index; do not assume sorted order. Secondary keys are a later topic.", "استخدمه للبحث المتكرر بمفتاح محدد، مثل إيجاد منتج بمعرّفه. ليس له فهرس أساسي، ولا تفترض أن الصفوف مرتبة. سنتناول المفاتيح الثانوية لاحقًا."),
  write: t("SAP reference syntax: WITH UNIQUE KEY table_line. The whole integer row is the key. Two equal integers cannot both be stored. This declaration and its lookup operations require SAP; the browser comparison illustrates membership without simulating hashing internals.", "صياغة مرجعية لنظام SAP: WITH UNIQUE KEY table_line. يكون صف العدد الصحيح كاملًا هو المفتاح، فلا يمكن حفظ عددين متساويين معًا. يتطلب تنفيذ هذا التعريف وعمليات البحث نظام SAP؛ وتوضح مقارنة المتصفح القيم الموجودة دون محاكاة آلية التجزئة الداخلية."),
  correct: "DATA lt_hashed TYPE HASHED TABLE OF i WITH UNIQUE KEY table_line.",
  mistake: "DATA lt_hashed TYPE HASHED TABLE OF i WITH NON-UNIQUE KEY table_line.",
  question: t("Can a hashed primary table key be non-unique?", "هل يمكن أن يكون المفتاح الأساسي لجدول HASHED غير فريد؟"),
  options: [t("No; uniqueness is required", "لا؛ التفرّد إلزامي"), t("Yes", "نعم")], answer:0,
  explanation: t("Every hashed table has a unique primary key. Choose a non-unique sorted or standard table when duplicate primary-key values are part of the requirement.", "لكل جدول HASHED مفتاح أساسي فريد. اختر جدولًا مرتبًا بمفتاح غير فريد أو جدولًا قياسيًا عندما يتطلب العمل السماح بتكرار قيم المفتاح الأساسي."),
};
const challenge = {
  id: "data-category-sequence", title: t("Preserve the imported order", "احفظ ترتيب البيانات المستوردة"),
  goal: t("First choose categories for the three business requirements above. Then use lt_ids (a standard integer table with an empty key), three APPEND statements for 30, 10, 30 in that order, and LOOP AT INTO lv_id with WRITE lv_id. Preserve both duplicate values and input order. Keep these names for assessment.", "اختر أولًا فئات الجداول للمتطلبات الثلاثة أعلاه. ثم استخدم lt_ids، وهو جدول قياسي للأعداد الصحيحة بمفتاح فارغ، وثلاث تعليمات APPEND لإضافة 30 ثم 10 ثم 30، وLOOP AT INTO lv_id مع WRITE lv_id. احتفظ بالتكرار وترتيب البيانات الواردة، وبالأسماء المعطاة للتقييم."),
  hint: t("A standard table is suitable for a sequence that will be read in full. APPEND adds to the end without sorting or deduplicating. Read the stored values rather than printing literal answers.", "يلائم الجدول القياسي تسلسلًا ستُقرأ جميع صفوفه. تضيف APPEND إلى النهاية دون ترتيب أو حذف للتكرار. اقرأ القيم المحفوظة بدل طباعة إجابات ثابتة."),
  starter: "DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nDATA lv_id TYPE i.\n* Append three IDs, then display each stored value.\n",
  starterAr: "DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nDATA lv_id TYPE i.\n* أضف المعرّفات الثلاثة ثم اعرض كل قيمة محفوظة.\n",
  solution: standardCode, expected:"30\n10\n30",
};
export const tableCategoryMission: Mission = {
  id:"data-table-categories", pathId:"data", prerequisite:"data-table-model", difficulty:"intermediate", environment:"browser", assessment:"guided", visualization:"table",
  activity:"table-categories", requiredActivities:["data-category-choice"], minutes:25, xp:240,
  references:["https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/working-with-sorted-and-hashed-tables_de84be91-c7db-4166-95cf-2b036c8d5558", "https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/defining-dictionary-table-types_df502cc6-441f-4fdc-aa9e-cc81caf6919c"],
  title:t("Choose standard, sorted or hashed tables", "اختر الجداول القياسية أو المرتبة أو القائمة على التجزئة"),
  subtitle:t("Match order, uniqueness and access to the business task", "اربط الترتيب والتفرّد وطريقة الوصول بمتطلبات العمل"),
  brief:t("An import log needs original order, a report needs key order, and a product lookup needs one record per full unique key. These are different requirements. STANDARD preserves this lesson's APPEND order and permits duplicates; SORTED maintains ascending primary-key order with a unique or non-unique key; HASHED requires a unique primary key and has no primary index. Complete-key access can use hashing; a partial key does not guarantee that optimization. Category choice depends on operations, not a universal fastest-table rule. All lesson setup is provided, so you can explore without earlier missions.", "يحتاج سجل الاستيراد إلى ترتيب الوصول، ويحتاج التقرير إلى ترتيب المفتاح، ويحتاج البحث عن منتج إلى سجل واحد لكل مفتاح فريد كامل. هذه متطلبات مختلفة. يحافظ STANDARD على ترتيب APPEND في هذا الدرس ويسمح بالتكرار؛ ويحافظ SORTED على ترتيب المفتاح الأساسي تصاعديًا، بمفتاح فريد أو غير فريد؛ ويتطلب HASHED مفتاحًا أساسيًا فريدًا دون فهرس أساسي. يمكن للبحث بالمفتاح الكامل الاستفادة من التجزئة، أما المفتاح الجزئي فلا يضمن ذلك. يعتمد الاختيار على العمليات المطلوبة، ولا توجد فئة أسرع في كل الحالات. يتضمن الدرس جميع التعريفات اللازمة، ويمكنك استكشافه دون إكمال دروس سابقة."),
  objectives:[t("Compare ordering, duplicates and primary index access", "مقارنة الترتيب وتكرار المفاتيح والوصول بالفهرس الأساسي"),t("Select a category for a business requirement", "اختيار فئة جدول تناسب متطلب العمل")],
  tokens:[...fundamentals.find(m=>m.id === "tables")!.tokens, ...fundamentals.find(m=>m.id === "loop-at")!.tokens, sorted, hashed],
  example:standardCode,
  visual:t("Add the three sample IDs, then switch categories. Compare the standard sequence with the sorted non-unique sequence. For HASHED, observe that the duplicate key cannot be accepted. Membership chips do not promise hashed iteration order. The separate editor trace executes only the standard-table example.", "أضف المعرّفات الثلاثة ثم بدّل الفئة. قارن التسلسل القياسي بالتسلسل المرتب ذي المفتاح غير الفريد. في HASHED لاحظ تعذر قبول المفتاح المكرر. لا تمثل بطاقات القيم ترتيب مرور مضمونًا. ينفّذ تتبّع المحرر المنفصل مثال الجدول القياسي فقط."),
  practice:t("Predict each category's result before adding rows. Restart the comparison and inspect it after two IDs, before the duplicate arrives. In the standard-table editor, replace the last 30 with 20 and predict the order; it remains 30, 10, 20. Restore the required values for assessment. Sorted/hashed declarations shown in the lab are SAP reference examples and are not executable in this browser.", "توقّع نتيجة كل فئة قبل إضافة الصفوف. أعد المقارنة وافحصها بعد معرّفين، قبل وصول المفتاح المكرر. في محرر الجدول القياسي استبدل 30 الأخيرة بـ20 وتوقّع الترتيب؛ يبقى 30 ثم 10 ثم 20. أعد القيم المطلوبة قبل التقييم. تعريفات SORTED وHASHED في المختبر أمثلة مرجعية لنظام SAP ولا ينفّذها المتصفح."),
  challenges:[challenge], goal:challenge.goal, hint:challenge.hint, starter:challenge.starter, starterAr:challenge.starterAr, solution:standardCode, expected:challenge.expected,
  quiz:t("Which category has no primary index and requires a unique primary key?", "أي فئة ليس لها فهرس أساسي وتتطلب مفتاحًا أساسيًا فريدًا؟"),
  options:[t("HASHED TABLE", "HASHED TABLE"),t("STANDARD TABLE", "STANDARD TABLE")],answer:0,
  quizExplanation:t("HASHED uses its full unique primary key for hashed lookup. STANDARD and SORTED have primary indexes. Secondary keys are separate and will be taught later.", "يستخدم HASHED مفتاحه الأساسي الفريد كاملًا للبحث بالتجزئة. أما STANDARD وSORTED فلهما فهارس أساسية. المفاتيح الثانوية موضوع مستقل سنتناوله لاحقًا."),
};
