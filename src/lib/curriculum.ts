import { Locale } from "./engine";
export type Text = { en: string; ar: string };
export const text = (en: string, ar: string): Text => ({ en, ar });
export type SyntaxToken = {
  id: string;
  label: string;
  meaning: Text;
  why: Text;
  write: Text;
  correct: string;
  mistake: string;
  question: Text;
  options: [Text, Text];
  answer: number;
  explanation: Text;
};
function token(
  id: string,
  label: string,
  en: string[],
  ar: string[],
  correct: string,
  mistake: string,
  answer = 0,
): SyntaxToken {
  return {
    id,
    label,
    meaning: text(en[0], ar[0]),
    why: text(en[1], ar[1]),
    write: text(en[2], ar[2]),
    correct,
    mistake,
    question: text(en[3], ar[3]),
    options: [text(en[4], ar[4]), text(en[5], ar[5])],
    answer,
    explanation: text(en[6], ar[6]),
  };
}
export const orientation: SyntaxToken[] = [
  token(
    "statement",
    "statement",
    [
      "A statement is one complete instruction to the program.",
      "Small instructions let a program describe a bigger task.",
      "Write an instruction and finish it with a period.",
      "How many statements are here: WRITE 5. WRITE 8.?",
      "Two",
      "One",
      "Each period ends one instruction.",
    ],
    [
      "التعليمة أمر كامل واحد للبرنامج.",
      "تصف التعليمات الصغيرة مهمة أكبر عند جمعها.",
      "اكتب أمراً وأنهِه بنقطة.",
      "كم تعليمة في WRITE 5. WRITE 8.؟",
      "تعليمتان",
      "تعليمة واحدة",
      "تنهي كل نقطة تعليمة واحدة.",
    ],
    "WRITE 5.\nWRITE 8.",
    "WRITE 5 WRITE 8.",
  ),
  token(
    "keyword",
    "keyword",
    [
      "A keyword is a word ABAP recognizes, such as WRITE.",
      "Keywords tell the program what kind of instruction you mean.",
      "Place WRITE before the value to display. ABAP keywords are case-insensitive.",
      "Which part tells ABAP to display something?",
      "WRITE",
      "5",
      "WRITE is the action; 5 is the value.",
    ],
    [
      "الكلمة المحجوزة كلمة تتعرف إليها ABAP مثل WRITE.",
      "تحدد الكلمات المحجوزة نوع الأمر المقصود.",
      "ضع WRITE قبل القيمة المعروضة. لا تفرق الكلمات المحجوزة بين الأحرف الكبيرة والصغيرة.",
      "أي جزء يطلب من ABAP عرض قيمة؟",
      "WRITE",
      "5",
      "WRITE هي العملية، و5 هي القيمة.",
    ],
    "WRITE 5.",
    "SHOW 5.",
  ),
  token(
    "period",
    ".",
    [
      "A period ends a statement, not a physical line.",
      "It makes the boundary of an instruction unambiguous.",
      "Put . after the last part, even when the statement spans lines.",
      "Does a line break end an ABAP statement?",
      "No, a period does",
      "Yes",
      "A multi-line DATA declaration is still one statement until its period.",
    ],
    [
      "تنهي النقطة التعليمة لا السطر الفعلي.",
      "تحدد نهاية الأمر بوضوح.",
      "ضع . بعد الجزء الأخير ولو امتدت التعليمة على عدة أسطر.",
      "هل ينهي الانتقال إلى سطر جديد تعليمة ABAP؟",
      "لا، تنهيها النقطة",
      "نعم",
      "يبقى تعريف DATA على عدة أسطر تعليمة واحدة حتى النقطة.",
    ],
    "DATA lv_age\n  TYPE i.",
    "DATA lv_age TYPE i\nlv_age = 25.",
  ),
  token(
    "spaces",
    "spaces ↵",
    [
      "Spaces separate parts; line breaks make code easier to read.",
      "Readable spacing helps people follow an instruction.",
      "Separate names and keywords. You may wrap a statement before its period.",
      "Are these one instruction: DATA lv_age / TYPE i. on two lines?",
      "Yes",
      "No",
      "Whitespace can change layout without adding a new instruction.",
    ],
    [
      "تفصل المسافات الأجزاء وتجعل فواصل الأسطر القراءة أسهل.",
      "يساعد التنسيق الواضح على فهم الأمر.",
      "افصل الأسماء والكلمات المحجوزة. يمكنك تقسيم التعليمة قبل نقطتها.",
      "هل DATA lv_age ثم TYPE i. في سطرين تعليمة واحدة؟",
      "نعم",
      "لا",
      "يمكن تغيير التنسيق دون إضافة تعليمة جديدة.",
    ],
    "DATA lv_age\n  TYPE i.",
    "DATAlv_ageTYPEi.",
  ),
  token(
    "comments",
    '* / "',
    [
      "A comment is a note for a person, not an executed instruction.",
      "Notes explain why the code exists.",
      'Use * in column 1 for a full-line comment, or " for the rest of a line.',
      "Does a comment add anything to program output?",
      "No",
      "Yes",
      "The simulator ignores comments and keeps their source line positions.",
    ],
    [
      "التعليق ملاحظة للقارئ وليس أمراً يُنفّذ.",
      "تشرح الملاحظات سبب وجود الكود.",
      'استخدم * في العمود الأول لتعليق سطر كامل، أو " لبقية السطر.',
      "هل يضيف التعليق شيئاً إلى المخرجات؟",
      "لا",
      "نعم",
      "يتجاهل المحاكي التعليقات ويحافظ على مواضع أسطرها.",
    ],
    '* Display a value\nWRITE 5. " a note',
    "WRITE * a note 5.",
  ),
  token(
    "naming",
    "lv_age",
    [
      "A variable name is a label you choose for a stored value.",
      "Meaningful names make business data understandable.",
      "Use letters, digits and underscores, up to 30 characters; do not start with a digit. lv_ is a useful convention, not a language requirement.",
      "Which is a valid, readable name?",
      "lv_age",
      "2age",
      "The name starts with a letter and describes the value.",
    ],
    [
      "اسم المتغير ملصق تختاره لقيمة مخزنة.",
      "تجعل الأسماء الواضحة بيانات العمل مفهومة.",
      "استخدم أحرفاً وأرقاماً وشرطة سفلية حتى 30 محرفاً، ولا تبدأ برقم. البادئة lv_ اصطلاح مفيد وليست إلزامية.",
      "أي اسم صحيح وواضح؟",
      "lv_age",
      "2age",
      "يبدأ الاسم بحرف ويصف القيمة.",
    ],
    "DATA lv_age TYPE i.",
    "DATA 2age TYPE i.",
  ),
  token(
    "editor",
    "editor",
    [
      "The code editor is where you type and change the program text.",
      "Editing lets you experiment without changing any SAP system.",
      "Click the editor to type. Reset asks before replacing your edits.",
      "Does typing immediately run your program?",
      "No",
      "Yes",
      "Editing changes text; Build trace starts the teaching simulation.",
    ],
    [
      "محرر الكود مكان كتابة نص البرنامج وتعديله.",
      "يتيح التجربة دون تغيير أي نظام SAP.",
      "انقر المحرر للكتابة. تطلب إعادة الكود التأكيد قبل استبدال تعديلاتك.",
      "هل تُشغّل الكتابة برنامجك فوراً؟",
      "لا",
      "نعم",
      "تغيّر الكتابة النص، ويبدأ إنشاء التتبع المحاكاة التعليمية.",
    ],
    "WRITE 5.",
    "WRTE 5.",
  ),
  token(
    "simulation",
    "▶",
    [
      "Simulation follows a supported model of what statements mean.",
      "You can see memory change without access to a real SAP system.",
      "Build trace, then use Next, Previous or Play. ▶ marks execution; the thin text caret marks editing.",
      "Does this tool run arbitrary ABAP on SAP?",
      "No, only a teaching subset",
      "Yes",
      "This local simulator has no SAP connection and no full ABAP compiler.",
    ],
    [
      "تتبع المحاكاة نموذجاً مدعوماً لمعاني التعليمات.",
      "يمكنك رؤية تغير الذاكرة دون نظام SAP حقيقي.",
      "أنشئ التتبع ثم استخدم التالي أو السابق أو التشغيل. يحدد ▶ التنفيذ، ويحدد مؤشر النص موضع الكتابة.",
      "هل تُشغّل الأداة أي كود ABAP على SAP؟",
      "لا، مجموعة تعليمية محدودة فقط",
      "نعم",
      "لا يتصل المحاكي المحلي بنظام SAP ولا يقدم مترجماً كاملاً.",
    ],
    "WRITE 5.",
    "SELECT * FROM mara.",
  ),
];
export const additionTokens: SyntaxToken[] = [
  token(
    "data",
    "DATA",
    [
      "DATA declares a variable: a labeled box in memory.",
      "The program needs a place to keep a value.",
      "Put DATA first, followed by a name and TYPE.",
      "Which word creates a variable?",
      "DATA",
      "WRITE",
      "DATA declares storage; WRITE displays a value.",
    ],
    [
      "تعلن DATA متغيراً، مثل صندوق مسمى في الذاكرة.",
      "يحتاج البرنامج مكاناً لحفظ القيمة.",
      "ضع DATA أولاً ثم الاسم وTYPE.",
      "أي كلمة تنشئ متغيراً؟",
      "DATA",
      "WRITE",
      "تعلن DATA مكان التخزين وتعرض WRITE قيمة.",
    ],
    "DATA lv_first TYPE i.",
    "lv_first TYPE i.",
  ),
  token(
    "type",
    "TYPE",
    [
      "TYPE states which kind of data a variable holds.",
      "The type distinguishes numbers from text.",
      "Place TYPE after the variable name and before the type name.",
      "Where does TYPE belong?",
      "After the variable name",
      "After the period",
      "The pattern is DATA name TYPE type.",
    ],
    [
      "تحدد TYPE نوع البيانات التي يحملها المتغير.",
      "يميز النوع بين الأعداد والنصوص.",
      "ضع TYPE بعد اسم المتغير وقبل اسم النوع.",
      "أين توضع TYPE؟",
      "بعد اسم المتغير",
      "بعد النقطة",
      "النمط هو DATA name TYPE type.",
    ],
    "DATA lv_first TYPE i.",
    "DATA TYPE lv_first i.",
  ),
  token(
    "integer",
    "i",
    [
      "i is ABAP’s signed integer type for whole numbers.",
      "Whole-number quantities need exact integer storage.",
      "Write i after TYPE. Without VALUE, an integer starts at 0.",
      "What is the initial value of DATA lv_result TYPE i.?",
      "0",
      "Unknown",
      "An integer has an initial value of zero.",
    ],
    [
      "i نوع ABAP للأعداد الصحيحة بإشارة.",
      "تحتاج الكميات الصحيحة تخزيناً عددياً دقيقاً.",
      "اكتب i بعد TYPE. يبدأ العدد بصفر عند عدم استخدام VALUE.",
      "ما القيمة الأولية لـ DATA lv_result TYPE i.؟",
      "0",
      "غير معروفة",
      "القيمة الأولية للعدد الصحيح هي صفر.",
    ],
    "DATA lv_result TYPE i.",
    "DATA lv_result TYPE integer.",
  ),
  token(
    "value",
    "VALUE",
    [
      "VALUE gives a variable its starting value.",
      "It combines declaring a variable with initializing it.",
      "Place VALUE and a literal after the type, before the period.",
      "What does VALUE 5 do?",
      "Sets the starting value to 5",
      "Prints 5",
      "VALUE initializes memory; it does not print anything.",
    ],
    [
      "تحدد VALUE القيمة الابتدائية للمتغير.",
      "تجمع الإعلان عن المتغير وتهيئته.",
      "ضع VALUE وقيمة حرفية بعد النوع وقبل النقطة.",
      "ماذا تفعل VALUE 5؟",
      "تحدد القيمة الابتدائية 5",
      "تطبع 5",
      "تهيئ VALUE الذاكرة ولا تطبع شيئاً.",
    ],
    "DATA lv_first TYPE i VALUE 5.",
    "DATA lv_first VALUE 5 TYPE i.",
  ),
  orientation.find((t) => t.id === "naming")!,
  token(
    "equals",
    "=",
    [
      "In an assignment, = stores the right-hand value in the left-hand variable.",
      "Values need to change after a declaration.",
      "Write an existing variable on the left and a value or expression on the right.",
      "Which side receives the result?",
      "The left side",
      "The right side",
      "The right side is read first, then the left side is updated.",
    ],
    [
      "تخزن = في الإسناد قيمة الطرف الأيمن في متغير الطرف الأيسر.",
      "تحتاج القيم إلى التغيير بعد الإعلان.",
      "اكتب متغيراً موجوداً يساراً وقيمة أو تعبيراً يميناً.",
      "أي طرف يستقبل النتيجة؟",
      "الأيسر",
      "الأيمن",
      "يُقرأ الطرف الأيمن أولاً ثم يُحدّث الأيسر.",
    ],
    "lv_result = 13.",
    "13 = lv_result.",
  ),
  token(
    "plus",
    "+",
    [
      "+ adds two whole-number values here.",
      "It lets the program calculate a result rather than hardcode it.",
      "Place + between two integers or integer variables on the right of =.",
      "What is stored by lv_result = 5 + 8.?",
      "13",
      "58",
      "Integer addition produces 13; it does not join digits as text.",
    ],
    [
      "تجمع + قيمتين عدديتين صحيحتين هنا.",
      "تحسب نتيجة بدلاً من كتابتها مسبقاً.",
      "ضع + بين عددين أو متغيرين عدديين يمين =.",
      "ماذا يُخزن عند lv_result = 5 + 8.؟",
      "13",
      "58",
      "ينتج جمع العددين 13 ولا يدمج الرقمين كنص.",
    ],
    "lv_result = lv_first + lv_second.",
    "lv_result = lv_first lv_second.",
  ),
  orientation.find((t) => t.id === "period")!,
  token(
    "write",
    "WRITE",
    [
      "WRITE displays a value in the program output.",
      "A stored value is not visible until you choose to display it.",
      "Place WRITE before a variable, text literal, or number. End with a period.",
      "Does WRITE change the variable’s value?",
      "No",
      "Yes",
      "WRITE reads memory and adds output without replacing the stored value.",
    ],
    [
      "تعرض WRITE قيمة ضمن المخرجات.",
      "لا تظهر القيمة المخزنة حتى تطلب عرضها.",
      "ضع WRITE قبل متغير أو نص أو عدد وأنهِ التعليمة بنقطة.",
      "هل تغيّر WRITE قيمة المتغير؟",
      "لا",
      "نعم",
      "تقرأ WRITE الذاكرة وتضيف مخرجات دون استبدال القيمة.",
    ],
    "WRITE lv_result.",
    "WRITE = lv_result.",
  ),
];
export const structureTokens: SyntaxToken[] = [
  token(
    "types",
    "TYPES",
    [
      "TYPES defines a reusable description of data, not a variable.",
      "A blueprint lets multiple records share the same shape.",
      "Start a local structure definition with TYPES: BEGIN OF name, and close it with END OF name.",
      "Does defining a type create an employee record?",
      "No",
      "Yes",
      "TYPES defines the blueprint; DATA creates a record from it.",
    ],
    [
      "تعرّف TYPES وصفاً قابلاً لإعادة الاستخدام للبيانات، وليس متغيراً.",
      "يسمح المخطط لعدة سجلات بمشاركة البنية نفسها.",
      "ابدأ تعريف الهيكل بـ TYPES: BEGIN OF name, وأغلقه بـ END OF name.",
      "هل ينشئ تعريف النوع سجل موظف؟",
      "لا",
      "نعم",
      "تحدد TYPES المخطط وتنشئ DATA سجلاً منه.",
    ],
    "TYPES: BEGIN OF ty_employee,\n id TYPE i,\n END OF ty_employee.",
    "DATA: BEGIN OF ty_employee,",
  ),
  token(
    "begin",
    "BEGIN OF",
    [
      "BEGIN OF opens a structure definition and names its type.",
      "It groups the following components into one blueprint.",
      "Put BEGIN OF after TYPES: and the type name immediately after OF.",
      "What follows BEGIN OF?",
      "The structure type name",
      "The employee value",
      "The blueprint name identifies the structure’s type.",
    ],
    [
      "تفتح BEGIN OF تعريف الهيكل وتسمي نوعه.",
      "تجمع الحقول التالية ضمن مخطط واحد.",
      "ضع BEGIN OF بعد TYPES: واسم النوع مباشرة بعد OF.",
      "ماذا يلي BEGIN OF؟",
      "اسم نوع الهيكل",
      "قيمة الموظف",
      "يحدد اسم المخطط نوع الهيكل.",
    ],
    "TYPES: BEGIN OF ty_employee,\n id TYPE i,\n END OF ty_employee.",
    "TYPES: ty_employee BEGIN OF,",
  ),
  token(
    "endof",
    "END OF",
    [
      "END OF closes the group of structure components.",
      "The matching name makes the group boundary clear.",
      "Use the same type name as BEGIN OF, followed by the final period.",
      "Must BEGIN OF and END OF use the same name?",
      "Yes",
      "No",
      "Matching names close the structure definition correctly.",
    ],
    [
      "تغلق END OF مجموعة حقول الهيكل.",
      "يوضح الاسم المطابق حدود المجموعة.",
      "استخدم اسم النوع نفسه الموجود بعد BEGIN OF ثم النقطة النهائية.",
      "هل يجب تطابق الاسم بعد BEGIN OF وEND OF؟",
      "نعم",
      "لا",
      "تغلق الأسماء المطابقة تعريف الهيكل بصورة صحيحة.",
    ],
    "END OF ty_employee.",
    "END OF ty_customer.",
  ),
  token(
    "components",
    "id TYPE i",
    [
      "A component is one named field inside a structure.",
      "Related fields describe one business record.",
      "Between BEGIN OF and END OF, give each field a name and TYPE; separate entries with commas.",
      "What describes a whole-number ID field?",
      "id TYPE i,",
      "id = 101,",
      "The type definition describes the field, not a particular record’s value.",
    ],
    [
      "الحقل جزء مسمى داخل الهيكل.",
      "تصف الحقول المرتبطة سجل عمل واحداً.",
      "بين BEGIN OF وEND OF أعطِ كل حقل اسماً ونوعاً وافصل العناصر بفواصل.",
      "ما الذي يصف حقل معرف عددي صحيح؟",
      "id TYPE i,",
      "id = 101,",
      "يصف تعريف النوع الحقل، لا قيمة سجل معين.",
    ],
    "id TYPE i,",
    "id VALUE 101,",
  ),
  token(
    "chain",
    ": ,",
    [
      "The colon starts a declaration chain; commas separate its parts.",
      "The shared keyword TYPES does not need repeating.",
      "Use one colon after TYPES and commas between entries, then one final period.",
      "Which symbol ends the entire chain?",
      "A period",
      "A comma",
      "Commas continue the chain; the final period ends it.",
    ],
    [
      "تبدأ النقطتان سلسلة تعريفات وتفصل الفواصل أجزاءها.",
      "لا نحتاج إلى تكرار الكلمة المشتركة TYPES.",
      "ضع نقطتين بعد TYPES وفواصل بين العناصر ثم نقطة نهائية واحدة.",
      "أي رمز ينهي السلسلة كاملة؟",
      "النقطة",
      "الفاصلة",
      "تواصل الفاصلة السلسلة وتنهيها النقطة الأخيرة.",
    ],
    "TYPES: BEGIN OF ty_employee,\n id TYPE i,\n END OF ty_employee.",
    "TYPES BEGIN OF ty_employee. id TYPE i.",
  ),
  orientation.find((t) => t.id === "period")!,
  token(
    "record",
    "DATA ls_employee",
    [
      "DATA creates a structure variable from a previously defined type.",
      "The blueprint needs an actual record in memory to hold values.",
      "Write DATA variable TYPE structure_type. Integer fields start at 0, text fields empty.",
      "Which creates the record?",
      "DATA ls_employee TYPE ty_employee.",
      "TYPES ty_employee.",
      "DATA allocates the record described by the type.",
    ],
    [
      "تنشئ DATA متغير هيكل من نوع سبق تعريفه.",
      "يحتاج المخطط سجلاً فعلياً في الذاكرة لحمل القيم.",
      "اكتب DATA variable TYPE structure_type. تبدأ الحقول العددية بصفر والنصية فارغة.",
      "أي تعليمة تنشئ السجل؟",
      "DATA ls_employee TYPE ty_employee.",
      "TYPES ty_employee.",
      "تنشئ DATA السجل الذي يصفه النوع.",
    ],
    "DATA ls_employee TYPE ty_employee.",
    "DATA ls_employee TYPE missing_type.",
  ),
  token(
    "hyphen",
    "-",
    [
      "The hyphen selects one component of a structure variable.",
      "It identifies which field you want to read or change.",
      "Write variable-component with a single hyphen and a field name from the type.",
      "How do you access the employee name?",
      "ls_employee-name",
      "ls_employee.name",
      "A period ends a statement; a hyphen selects a structure component.",
    ],
    [
      "تحدد الشرطة حقلاً واحداً من متغير الهيكل.",
      "تحدد الحقل الذي تريد قراءته أو تغييره.",
      "اكتب variable-component بشرطة واحدة واسم حقل موجود في النوع.",
      "كيف تصل إلى اسم الموظف؟",
      "ls_employee-name",
      "ls_employee.name",
      "تنهي النقطة التعليمة وتحدد الشرطة حقل الهيكل.",
    ],
    "ls_employee-name = 'Ahmed'.",
    "ls_employee.name = Ahmed.",
  ),
  token(
    "string",
    "string / quotes",
    [
      "string holds text; single quotes here mark a text literal.",
      "Names and descriptions are text, rather than numeric quantities.",
      "Declare name TYPE string, and assign a value such as 'Ahmed'. A literal is a value written directly in code.",
      "Which is a text literal?",
      "'Ahmed'",
      "Ahmed",
      "Without quotes Ahmed is read as a variable name.",
    ],
    [
      "يحمل string نصاً، وتحدد علامات الاقتباس المفردة هنا قيمة نصية حرفية.",
      "الأسماء والأوصاف نصوص وليست كميات عددية.",
      "عرّف name TYPE string ثم أسند قيمة مثل 'Ahmed'. القيمة الحرفية قيمة مكتوبة مباشرة في الكود.",
      "أي خيار قيمة نصية حرفية؟",
      "'Ahmed'",
      "Ahmed",
      "دون اقتباس تُقرأ Ahmed كاسم متغير.",
    ],
    "ls_employee-name = 'Ahmed'.",
    "ls_employee-name = Ahmed.",
  ),
  additionTokens.find((t) => t.id === "equals")!,
  additionTokens.find((t) => t.id === "write")!,
];
export const additionExample = `DATA lv_first TYPE i VALUE 5.
DATA lv_second TYPE i VALUE 8.
DATA lv_result TYPE i.

lv_result = lv_first + lv_second.

WRITE lv_result.`;
export const structureExample = `TYPES: BEGIN OF ty_employee,
         id TYPE i,
         name TYPE string,
       END OF ty_employee.

DATA ls_employee TYPE ty_employee.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
WRITE ls_employee-name.`;
export const conditionalExample = `DATA total TYPE i VALUE 1200.

IF total >= 1000.
  WRITE 'Approved'.
ELSE.
  WRITE 'Review'.
ENDIF.`;
export type Mission = {
  id: string;
  prerequisite: string;
  minutes: number;
  xp: number;
  title: Text;
  subtitle: Text;
  brief: Text;
  visual: Text;
  goal: Text;
  hint: Text;
  quiz: Text;
  options: Text[];
  answer: number;
  quizExplanation: Text;
  tokens: SyntaxToken[];
  example: string;
  starter: string;
  starterAr?: string;
  solution: string;
  expected: string;
};
export const missions: Mission[] = [
  {
    id: "addition",
    prerequisite: "orientation",
    minutes: 7,
    xp: 100,
    title: text("Add two numbers", "اجمع عددين"),
    subtitle: text(
      "Your first calculation, from code to memory.",
      "أول عملية حسابية، من الكود إلى الذاكرة.",
    ),
    brief: text(
      "Imagine a warehouse combining two deliveries. Each variable is a labeled memory box. Declare two quantities, create an empty result box, then add the quantities and display the answer.",
      "تخيّل مستودعاً يجمع شحنتين. كل متغير صندوق مسمى في الذاكرة. أعلن كميتين وأنشئ صندوق نتيجة، ثم اجمعهما واعرض الإجابة.",
    ),
    visual: text(
      "Step through 5 + 8. The result starts at 0. Addition reads both source boxes before changing the result to 13. WRITE reads the result and displays it.",
      "تتبّع 5 + 8. تبدأ النتيجة بصفر. تقرأ عملية الجمع الصندوقين قبل تغيير النتيجة إلى 13. تقرأ WRITE النتيجة وتعرضها.",
    ),
    goal: text(
      "Declare two integer variables starting at 10 and 20, plus a result variable. Add the two variables, store their sum, and WRITE the result. Expected output: 30. You may choose your own valid names.",
      "أعلن متغيرين عدديين بقيمتين أوليتين 10 و20 ومتغيراً للنتيجة. اجمع المتغيرين وخزّن المجموع ثم اعرض النتيجة باستخدام WRITE. المخرج المتوقع: 30. يمكنك اختيار أسماء صحيحة.",
    ),
    hint: text(
      "Use VALUE 10 and VALUE 20 in the first two declarations. Put lv_first + lv_second on the right side of the result assignment.",
      "استخدم VALUE 10 وVALUE 20 في الإعلانين الأولين، وضع lv_first + lv_second يمين إسناد النتيجة.",
    ),
    quiz: text(
      "Why does lv_result initially contain 0?",
      "لماذا يحتوي lv_result على صفر أولاً؟",
    ),
    options: [
      text(
        "Integer variables start at 0 without VALUE",
        "تبدأ المتغيرات الصحيحة بصفر دون VALUE",
      ),
      text("WRITE puts 0 into memory", "تضع WRITE صفراً في الذاكرة"),
    ],
    answer: 0,
    quizExplanation: text(
      "TYPE i has an initial value of 0. Addition replaces it later; WRITE only reads it.",
      "للنوع i قيمة أولية تساوي صفراً. يستبدلها الجمع لاحقاً، وتقرأها WRITE فقط.",
    ),
    tokens: additionTokens,
    example: additionExample,
    starter:
      "DATA lv_first TYPE i VALUE 0.\nDATA lv_second TYPE i VALUE 0.\nDATA lv_result TYPE i.\n\nlv_result = lv_first + lv_second.\nWRITE lv_result.",
    solution: additionExample
      .replace("VALUE 5", "VALUE 10")
      .replace("VALUE 8", "VALUE 20"),
    expected: "30",
  },
  {
    id: "structures",
    prerequisite: "addition",
    minutes: 7,
    xp: 150,
    title: text("Create a structure", "أنشئ هيكلاً"),
    subtitle: text(
      "Give related information a shared home.",
      "امنح المعلومات المرتبطة مكاناً مشتركاً.",
    ),
    brief: text(
      "An employee record groups an ID and a name. TYPES is the blank form—the blueprint. DATA creates a filled-in form in memory. The hyphen selects one field, so changing the name does not change the ID.",
      "يجمع سجل الموظف المعرف والاسم. تمثل TYPES النموذج الفارغ أي المخطط. وتنشئ DATA سجلاً في الذاكرة. تحدد الشرطة حقلاً واحداً، فلا يغيّر تعديل الاسم المعرف.",
    ),
    visual: text(
      "The multi-line TYPES chain defines one blueprint. DATA creates a record with ID 0 and an empty name. Watch each component change, then click ls_employee-name in the editor to identify the field.",
      "تعرّف سلسلة TYPES متعددة الأسطر مخططاً واحداً. تنشئ DATA سجلاً بمعرف صفر واسم فارغ. شاهد تغير كل حقل، ثم انقر ls_employee-name في المحرر لتحديد الحقل.",
    ),
    goal: text(
      "Define a Product structure type with id TYPE i, name TYPE string, and quantity TYPE i. Declare a variable of that type. Assign id = 501, name = 'Keyboard', and quantity = 12. WRITE the name component. Expected output: Keyboard.",
      "عرّف نوع هيكل منتج بحقول id TYPE i وname TYPE string وquantity TYPE i. أعلن متغيراً من هذا النوع، وأسند id = 501 وname = 'Keyboard' وquantity = 12. اعرض حقل الاسم باستخدام WRITE. المخرج المتوقع: Keyboard.",
    ),
    hint: text(
      "Use TYPES: BEGIN OF ty_product, then the three field declarations separated by commas, and END OF ty_product. Declare ls_product with DATA. Access fields with ls_product-id, ls_product-name, and ls_product-quantity.",
      "استخدم TYPES: BEGIN OF ty_product, ثم تعريفات الحقول الثلاثة بفواصل وEND OF ty_product. أعلن ls_product باستخدام DATA. صِل إلى الحقول بـ ls_product-id وls_product-name وls_product-quantity.",
    ),
    quiz: text(
      "What is the difference between TYPES and DATA?",
      "ما الفرق بين TYPES وDATA؟",
    ),
    options: [
      text(
        "TYPES defines a shape; DATA creates a variable",
        "تعرّف TYPES البنية وتنشئ DATA متغيراً",
      ),
      text("Both print values", "كلاهما يطبع قيماً"),
    ],
    answer: 0,
    quizExplanation: text(
      "A type is a blueprint. A variable is the actual memory record. Multiple variables can use one type.",
      "النوع مخطط، والمتغير سجل فعلي في الذاكرة. يمكن لعدة متغيرات استخدام نوع واحد.",
    ),
    tokens: structureTokens,
    example: structureExample,
    starter:
      "* Define the product type, then create a variable.\n* Fields: id (i), name (string), quantity (i).\n",
    starterAr:
      "* عرّف نوع المنتج ثم أنشئ متغيراً.\n* الحقول: id (i)، name (string)، quantity (i).\n",
    solution:
      "TYPES: BEGIN OF ty_product,\n         id TYPE i,\n         name TYPE string,\n         quantity TYPE i,\n       END OF ty_product.\nDATA ls_product TYPE ty_product.\nls_product-id = 501.\nls_product-name = 'Keyboard'.\nls_product-quantity = 12.\nWRITE ls_product-name.",
    expected: "Keyboard",
  },
];
export const paths = [
  {
    id: "fundamentals",
    title: text("ABAP Fundamentals", "أساسيات ABAP"),
    concepts: text(
      "Syntax basics · Variables · Arithmetic · Structures · Conditions · Loops",
      "أساسيات الصياغة · المتغيرات · الحساب · الهياكل · الشروط · الحلقات",
    ),
    time: 45,
  },
  {
    id: "data",
    title: text("Working with Data", "العمل مع البيانات"),
    concepts: text(
      "Internal tables · Work areas · Field symbols · Table operations · Sorting and searching",
      "الجداول الداخلية · مناطق العمل · رموز الحقول · عمليات الجداول · الترتيب والبحث",
    ),
    time: 50,
  },
  {
    id: "dictionary",
    title: text("ABAP Dictionary", "قاموس ABAP"),
    concepts: text(
      "Domains · Data elements · Structures · Database tables · Foreign keys · Search helps",
      "المجالات · عناصر البيانات · الهياكل · جداول قواعد البيانات · المفاتيح الخارجية · مساعدات البحث",
    ),
    time: 60,
  },
  {
    id: "database",
    title: text("Database Development", "تطوير قواعد البيانات"),
    concepts: text(
      "Open SQL · SELECT · WHERE · Joins · Aggregations · Data modifications",
      "Open SQL · SELECT · WHERE · الربط · التجميع · تعديل البيانات",
    ),
    time: 60,
  },
  {
    id: "oop",
    title: text("Object-Oriented ABAP", "ABAP كائنية التوجه"),
    concepts: text(
      "Classes · Objects · Attributes · Methods · Constructors · Inheritance · Interfaces · Exceptions",
      "الأصناف · الكائنات · السمات · الأساليب · البُناة · الوراثة · الواجهات · الاستثناءات",
    ),
    time: 80,
  },
  {
    id: "applications",
    title: text("SAP Application Development", "تطوير تطبيقات SAP"),
    concepts: text(
      "Reports · ALV · Module Pool · Smart Forms · Debugging · SAP transactions",
      "التقارير · ALV · Module Pool · Smart Forms · تصحيح الأخطاء · معاملات SAP",
    ),
    time: 75,
  },
  {
    id: "modern",
    title: text("Modern ABAP", "ABAP الحديثة"),
    concepts: text(
      "Modern ABAP syntax · CDS Views · CDS Associations · DCL · AMDP · Performance optimization",
      "صياغة ABAP الحديثة · عروض CDS · ارتباطات CDS · DCL · AMDP · تحسين الأداء",
    ),
    time: 80,
  },
  {
    id: "cloud",
    title: text("ABAP Cloud and RAP", "ABAP Cloud وRAP"),
    concepts: text(
      "ADT · ABAP Cloud · RAP Business Objects · Behavior Definitions · EML · OData · Service Bindings · SAP BTP",
      "ADT · ABAP Cloud · كائنات أعمال RAP · تعريفات السلوك · EML · OData · ربط الخدمات · SAP BTP",
    ),
    time: 100,
  },
  {
    id: "projects",
    title: text("Real Projects", "مشاريع عملية"),
    concepts: text(
      "Employee management · Leave management · Sales order processing · API integration · Complete business applications",
      "إدارة الموظفين · إدارة الإجازات · معالجة طلبات البيع · تكامل API · تطبيقات أعمال متكاملة",
    ),
    time: 150,
  },
];
export const conceptLabels: Record<Locale, string[]> = {
  en: ["Conditions", "Loops"],
  ar: ["الشروط", "الحلقات"],
};
