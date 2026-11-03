import type { Mission, SyntaxToken, Text } from "./curriculum";
import { fundamentals } from "./fundamentals";

const t = (en:string, ar:string):Text => ({en,ar});
export const workAreaExample = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
END OF ty_employee.
DATA ls_employee TYPE ty_employee.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
WRITE / ls_employee-name.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
APPEND ls_employee TO lt_employees.
FIELD-SYMBOLS <employee> TYPE ty_employee.
ASSIGN ls_employee TO <employee>.
<employee>-name = 'Sara'.
WRITE / ls_employee-name.
LOOP AT lt_employees INTO ls_employee.
  WRITE / ls_employee-name.
ENDLOOP.`;
const fieldSymbols: SyntaxToken = {
  id:"field-symbols", label:"FIELD-SYMBOLS <employee> TYPE ty_employee",
  meaning:t("A field symbol is an alias for existing data. Its declaration describes the data it can access; it does not create another employee record.","رمز الحقل اسم يتيح الوصول إلى بيانات موجودة. يحدد تعريفه نوع البيانات التي يستطيع الوصول إليها، ولا ينشئ سجل موظف آخر."),
  why:t("Use an alias when you want to read or change an existing object through another name. A work area stores its own values; a field symbol accesses the object assigned to it.","استخدم رمز الحقل لقراءة كائن موجود أو تعديله باسم آخر. تحتفظ منطقة العمل بقيمها، بينما يصل رمز الحقل إلى الكائن المرتبط به."),
  write:t("Put the name inside angle brackets and specify a compatible TYPE. This browser supports explicitly typed i, string and named structures. Generic types, dynamic ASSIGN and LOOP ASSIGNING are not supported here.","اكتب الاسم بين قوسين زاويين وحدد TYPE متوافقًا. يدعم المتصفح الأنواع الصريحة i وstring وبُنى البيانات المعرّفة. لا يدعم هنا الأنواع العامة أو ASSIGN الديناميكية أو LOOP ASSIGNING."),
  correct:"DATA lv_count TYPE i VALUE 5.\nFIELD-SYMBOLS <count> TYPE i.\nASSIGN lv_count TO <count>.\n<count> = <count> + 1.\nWRITE / lv_count.",
  mistake:"DATA lv_count TYPE i VALUE 5.\nFIELD-SYMBOLS <count> TYPE i.\n<count> = 6.",
  question:t("After FIELD-SYMBOLS alone, does the symbol contain its own employee record?","هل يملك رمز الحقل سجل موظف مستقلًا بمجرد تعريفه باستخدام FIELD-SYMBOLS؟"),
  options:[t("No; assign existing data before accessing it","لا؛ اربطه ببيانات موجودة قبل استخدامها من خلاله"),t("Yes; it is a new empty employee","نعم؛ هو سجل موظف جديد فارغ")], answer:0,
  explanation:t("The symbol starts unassigned. Trying to access its value before an executed ASSIGN is an error, not an initial zero or blank record.","يبدأ الرمز دون ارتباط ببيانات. محاولة الوصول إلى قيمته قبل تنفيذ ASSIGN خطأ، ولا تعطي صفرًا أو سجلًا فارغًا."),
};
const assign: SyntaxToken = {
  id:"assign-symbol", label:"ASSIGN / UNASSIGN",
  meaning:t("ASSIGN binds a field symbol to a data object. UNASSIGN removes that binding and leaves the object's data intact.","تربط ASSIGN رمز الحقل بكائن بيانات. وتلغي UNASSIGN هذا الربط مع إبقاء بيانات الكائن كما هي."),
  why:t("Binding chooses which existing object the symbol accesses. Changing the object through its own name is visible through the symbol too.","يحدد الربط الكائن الموجود الذي يصل إليه الرمز. ويظهر تعديل الكائن باسمه الأصلي عند قراءته من خلال الرمز أيضًا."),
  write:t("Write ASSIGN ls_employee TO <employee>. Then <employee>-name accesses that same employee's name. = changes a value; ASSIGN changes a binding. This lesson uses known direct objects of matching types. In real SAP, use IS ASSIGNED when a binding can fail; that guard and dynamic assignments are outside this browser subset.","اكتب ASSIGN ls_employee TO <employee>. ثم يصل <employee>-name إلى اسم الموظف نفسه. تغيّر = قيمةً، وتغيّر ASSIGN الارتباط. يستخدم الدرس كائنات مباشرة معروفة بأنواع متطابقة. في SAP الحقيقي، استخدم IS ASSIGNED عندما يمكن أن يفشل الربط؛ هذا الشرط والربط الديناميكي خارج نطاق محاكي المتصفح الحالي."),
  correct:"DATA lv_name TYPE string VALUE 'Ahmed'.\nFIELD-SYMBOLS <name> TYPE string.\nASSIGN lv_name TO <name>.\n<name> = 'Sara'.\nUNASSIGN <name>.\nWRITE / lv_name.",
  mistake:"DATA lv_name TYPE string.\nFIELD-SYMBOLS <name> TYPE i.\nASSIGN lv_name TO <name>.",
  question:t("What does UNASSIGN <employee>. do to the original employee?","ماذا تفعل UNASSIGN <employee>. ببيانات الموظف الأصلي؟"),
  options:[t("Keeps the data; removes only the symbol's access","تُبقي البيانات؛ وتلغي وصول الرمز إليها فقط"),t("Deletes all employee fields","تمسح جميع حقول الموظف")], answer:0,
  explanation:t("UNASSIGN removes the link, not the object. A later direct ASSIGN can bind the symbol again.","تلغي UNASSIGN الرابط، لا الكائن. ويمكن لتعليمة ASSIGN مباشرة لاحقة ربط الرمز من جديد."),
};
const workAreaSolution = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
  salary TYPE i,
END OF ty_employee.
DATA ls_employee TYPE ty_employee.
ls_employee-id = 202.
ls_employee-name = 'Maha'.
ls_employee-salary = 6000.
WRITE / ls_employee-name.`;
const aliasSetup = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
END OF ty_employee.
DATA ls_employee TYPE ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA lv_new_name TYPE string VALUE 'Sara'.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
APPEND ls_employee TO lt_employees.`;
const aliasSolution = `${aliasSetup}
FIELD-SYMBOLS <employee> TYPE ty_employee.
ASSIGN ls_employee TO <employee>.
<employee>-name = lv_new_name.
WRITE / ls_employee-name.
LOOP AT lt_employees INTO ls_employee.
  WRITE / ls_employee-name.
ENDLOOP.`;
const challenges = [{
  id:"data-work-area-record", title:t("Create an employee work area","أنشئ منطقة عمل لموظف"),
  goal:t("Define ty_employee with id TYPE i, name TYPE string and salary TYPE i. Create ls_employee with that type. Set ID 202, name Maha and salary 6000. Display the stored name with WRITE. Keep these identifiers and values for assessment.","عرّف ty_employee بالحقول id من النوع i وname من النوع string وsalary من النوع i. أنشئ ls_employee بهذا النوع. ضع الرقم 202 والاسم Maha والراتب 6000. اعرض الاسم المحفوظ باستخدام WRITE. احتفظ بهذه المعرّفات والقيم للتقييم."),
  hint:t("Define the shape with TYPES first, then create the record with DATA. Use ls_employee-field to fill each field. WRITE must read the name field rather than print a literal.","عرّف الشكل أولًا باستخدام TYPES، ثم أنشئ السجل باستخدام DATA. استخدم ls_employee-field لتعبئة كل حقل. يجب أن تقرأ WRITE حقل الاسم بدل طباعة نص ثابت."),
  starter:"* Define the type, create the work area, fill its fields and display its name.\n",
  starterAr:"* عرّف النوع وأنشئ منطقة العمل واملأ حقولها واعرض اسم الموظف.\n",
  solution:workAreaSolution, expected:"Maha",
},{
  id:"data-field-symbol-alias", title:t("Change the work area through an alias","عدّل منطقة العمل عبر رمز حقل"),
  goal:t("Keep the supplied import and identifiers. Declare <employee> TYPE ty_employee and ASSIGN ls_employee to it. Change the name through <employee>-name using lv_new_name. Display ls_employee-name, then LOOP AT the saved table INTO ls_employee and display its saved name. Expect Sara then Ahmed. Change only the work area through the symbol; do not append another row.","احتفظ ببيانات الاستيراد والمعرّفات المعطاة. عرّف <employee> بالنوع ty_employee واربط ls_employee به باستخدام ASSIGN. عدّل الاسم عبر <employee>-name باستخدام lv_new_name. اعرض ls_employee-name، ثم مرّ على الجدول المحفوظ إلى ls_employee واعرض الاسم المحفوظ. النتيجة Sara ثم Ahmed. عدّل منطقة العمل فقط عبر الرمز، ولا تضف صفًا آخر."),
  hint:t("FIELD-SYMBOLS declares the alias; ASSIGN connects it. Use <employee>-name = lv_new_name. APPEND already saved an independent copy. The alias points to ls_employee, not to the table row. Reading the saved row INTO the work area later replaces its contents, so the alias sees that replacement too.","تعرّف FIELD-SYMBOLS الرمز، وتربطه ASSIGN. استخدم <employee>-name = lv_new_name. حفظت APPEND نسخة مستقلة من قبل. يشير الرمز إلى ls_employee، لا إلى صف الجدول. وعند قراءة الصف المحفوظ إلى منطقة العمل لاحقًا، تُستبدل محتوياتها ويرى الرمز هذه القيم الجديدة أيضًا."),
  starter:`${aliasSetup}\n* Declare, bind, change through the alias, then display live and saved names.\n`,
  starterAr:`${aliasSetup}\n* عرّف الرمز واربطه وعدّل الاسم عبره، ثم اعرض الاسم الحالي والمحفوظ.\n`,
  solution:aliasSolution, expected:"Sara\nAhmed",
}];
export const workAreaMission: Mission = {
  id:"data-work-areas-field-symbols", pathId:"data", prerequisite:"data-keys", minutes:30, xp:280,
  difficulty:"intermediate", environment:"browser", assessment:"simulated", visualization:"structure",
  coveredTopics:["Work areas","Field symbols"],
  title:t("Work areas and field symbols","مناطق العمل ورموز الحقول"),
  subtitle:t("Store a row, copy it, or access the same data through an alias","احفظ صفًا أو انسخه أو صِل إلى بياناته نفسها عبر رمز حقل"),
  brief:t("A work area is a variable with the shape of one table row. Use it to prepare an employee or receive a copied row. Its fields have their own values. A field symbol is an alias for an existing object: after ASSIGN, changing a field through the symbol changes that same object's data. APPEND has already copied the work area's values into a separate table row, so an alias to the work area does not update the saved row. Explore the employee card and link diagram before practicing both skills. All setup is provided; earlier missions are recommendations only.","منطقة العمل متغير له شكل صف واحد في الجدول. نستخدمها لإعداد بيانات موظف أو لاستقبال نسخة من صف. تحتفظ حقولها بقيمها. أما رمز الحقل فهو اسم للوصول إلى كائن موجود: بعد ASSIGN، يغيّر تعديل الحقل عبر الرمز بيانات الكائن نفسه. تكون APPEND قد نسخت قيم منطقة العمل إلى صف مستقل، لذلك لا يحدّث الرمز المرتبط بمنطقة العمل الصف المحفوظ. استكشف بطاقة الموظف ومخطط الربط قبل تطبيق المهارتين. جميع التعريفات جاهزة؛ والدروس السابقة توصيات فقط."),
  objectives:[t("Create and fill a structured employee work area","إنشاء منطقة عمل منظّمة لموظف وتعبئة حقولها"),t("Distinguish an independent copy from a field-symbol alias","التمييز بين النسخة المستقلة ورمز الحقل المرتبط بالبيانات"),t("Bind a typed symbol, update its target and diagnose unassigned access","ربط رمز بنوع صريح وتعديل الكائن المرتبط به وتشخيص استخدام رمز غير مرتبط")],
  references:["https://learning.sap.com/courses/deepening-your-abap-programming-knowledge/using-field-symbols-to-process-internal-tables_f1855f41-00d3-4f8d-9a2c-663a321c6637","https://help.sap.com/docs/abap-cloud/abap-concepts/field-symbols","https://help.sap.com/saphelp_em900/helpdata/en/fc/eb387a358411d1829f0000e829fbfe/content.htm"],
  tokens:[...fundamentals.find(m=>m.id === "tables")!.tokens,...fundamentals.find(m=>m.id === "loop-at")!.tokens,fieldSymbols,assign],
  example:workAreaExample,
  visual:t("Select Assign Values to see the employee's ID and name highlighted. Save a row, then inspect Declare Alias: no second record is created. Bind the alias and change its name field. The link points to ls_employee; its name becomes Sara while the table still stores Ahmed. The final LOOP INTO copies Ahmed back into the work area. Use Watch Execution to move between the actual snapshots.","اختر تعبئة الحقول لترى رقم الموظف واسمه مميّزين. احفظ صفًا، ثم افحص تعريف الرمز: لا يُنشأ سجل ثانٍ. اربط الرمز وعدّل حقل الاسم. يشير الرابط إلى ls_employee؛ فيصبح اسمه Sara بينما يبقى Ahmed في الجدول. تنسخ LOOP INTO الأخيرة Ahmed مجددًا إلى منطقة العمل. استخدم متابعة التنفيذ للانتقال بين لقطات الذاكرة الفعلية."),
  practice:t("Predict Ahmed, Sara, Ahmed before running. Change the alias assignment to Omar and compare the work area with the saved row. Comment out ASSIGN: the simulator explains unassigned access. Restore it, then insert UNASSIGN <employee>. after the change; the original employee still has the changed name. Dynamic ASSIGN, IS ASSIGNED guards and LOOP ASSIGNING are not part of this restricted runtime. In SAP, check assignment safety when the target may not exist. The browser does not connect to SAP.","توقّع Ahmed ثم Sara ثم Ahmed قبل التشغيل. غيّر الاسم عبر الرمز إلى Omar وقارن منطقة العمل بالصف المحفوظ. حوّل ASSIGN إلى تعليق: يشرح المحاكي خطأ استخدام رمز غير مرتبط. أعدها، ثم أضف UNASSIGN <employee>. بعد التعديل؛ سيحتفظ الموظف الأصلي بالاسم الجديد. لا يشمل هذا المحاكي المحدود ASSIGN الديناميكية أو شرط IS ASSIGNED أو LOOP ASSIGNING. في SAP، تحقق من سلامة الربط عندما يُحتمل عدم وجود الكائن. لا يتصل المتصفح بنظام SAP."),
  challenges, goal:challenges[0].goal, hint:challenges[0].hint, starter:challenges[0].starter, starterAr:challenges[0].starterAr, solution:workAreaSolution, expected:challenges[0].expected,
  quiz:t("After APPEND ls_employee and ASSIGN ls_employee TO <employee>, which data changes when <employee>-name is updated?","بعد APPEND ls_employee وربط ls_employee بالرمز <employee>، ما البيانات التي تتغير عند تعديل <employee>-name؟"),
  options:[t("The work area; the appended row remains an independent copy","منطقة العمل؛ ويبقى الصف المضاف نسخة مستقلة"),t("Only a private copy inside the field symbol","نسخة خاصة داخل رمز الحقل فقط")], answer:0,
  quizExplanation:t("The field symbol accesses the assigned work area directly. It does not own a copied employee, and it is not bound to the saved table row. LOOP INTO also copies a row; changing the receiving work area alone does not change the table. These examples use integer/string fields and explicit matching types.","يصل رمز الحقل إلى منطقة العمل المرتبط بها مباشرة. لا يملك نسخة من الموظف، وليس مرتبطًا بصف الجدول المحفوظ. تنسخ LOOP INTO الصف أيضًا؛ ولا يكفي تعديل منطقة العمل المستقبِلة لتغيير الجدول. تستخدم هذه الأمثلة حقول أعداد ونصوص وأنواعًا صريحة متطابقة."),
};
