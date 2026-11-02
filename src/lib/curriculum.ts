import { Locale } from "./engine";
export type Text = { en: string; ar: string };
import { fundamentals } from "./fundamentals";
import { dataMissions } from "./data-missions";
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
  "التعليمة البرمجية أمر مكتمل يحدد عملية ينفّذها البرنامج.",
  "نبني البرنامج من تعليمات صغيرة، تؤدي كل منها جزءًا واضحًا من المهمة.",
  "اكتب الأمر ثم أنهِه بنقطة، حتى لو امتدت كتابته على أكثر من سطر.",
  "كم تعليمة برمجية في المثال WRITE 5. WRITE 8.؟",
  "تعليمتان",
  "تعليمة واحدة",
  "تنتهي كل تعليمة بنقطة؛ لذلك يحتوي المثال على تعليمتين منفصلتين."
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
  "الكلمة المحجوزة كلمة لها معنى محدد في ABAP، مثل WRITE.",
  "تحدد الكلمة المحجوزة العملية المطلوبة، كتعريف متغير أو عرض قيمة.",
  "اكتب WRITE قبل القيمة التي تريد عرضها. لا يختلف معناها عند تغيير حالة الأحرف الإنجليزية.",
  "أي جزء من WRITE 5. يطلب عرض القيمة؟",
  "WRITE",
  "5",
  "تحدد WRITE عملية العرض، أما 5 فهي القيمة المعروضة."
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
  "تنهي النقطة التعليمة البرمجية، وليس السطر الذي كُتبت فيه.",
  "توضح النقطة أين ينتهي الأمر، حتى عندما تتوزع أجزاؤه على عدة أسطر.",
  "ضع النقطة بعد آخر جزء من التعليمة. الانتقال إلى سطر جديد لا يغني عنها.",
  "هل يكفي الانتقال إلى سطر جديد لإنهاء تعليمة ABAP؟",
  "لا، يجب وضع النقطة",
  "نعم",
  "يبقى تعريف DATA تعليمة واحدة حتى نقطته النهائية، ولو كُتب على عدة أسطر."
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
  "تفصل المسافات بين الكلمات والرموز، وتساعد فواصل الأسطر على تنظيم الأكواد.",
  "يسهّل التنسيق الواضح قراءة التعليمات وفهم العلاقة بين أجزائها.",
  "افصل اسم المتغير عن الكلمات المحجوزة. يمكنك متابعة التعليمة على سطر آخر قبل نقطتها النهائية.",
  "إذا كتبت DATA lv_age ثم TYPE i. على سطرين، فهل هما تعليمة واحدة؟",
  "نعم",
  "لا",
  "تغيير توزيع الكلمات على الأسطر لا يضيف تعليمة جديدة؛ النقطة هي التي تحدد نهايتها."
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
  "التعليق ملاحظة يقرؤها المطوّر، ولا ينفّذها البرنامج.",
  "نستخدم التعليقات لشرح الهدف من الأكواد أو توضيح قرار برمجي.",
  "ضع * في أول موضع من السطر لتعليق كامل، أو استخدم علامة الاقتباس المزدوجة \" لبدء تعليق يمتد إلى نهاية السطر.",
  "هل يظهر نص التعليق ضمن مخرجات البرنامج؟",
  "لا",
  "نعم",
  "يتجاهل المحاكي محتوى التعليقات أثناء التنفيذ، ويحافظ على أرقام أسطر الأكواد."
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
  "اسم المتغير هو الاسم الذي تختاره للوصول إلى قيمة محفوظة في ذاكرة البرنامج.",
  "توضح الأسماء المعبرة طبيعة البيانات؛ فاسم lv_age أسهل فهمًا من اسم لا يصف محتواه.",
  "في هذا المحاكي، استخدم الحروف الإنجليزية والأرقام والشرطة السفلية، بحد أقصى 30 محرفًا، ولا تبدأ برقم. البادئة lv_ اصطلاح للتسمية وليست شرطًا في اللغة.",
  "أي اسم صحيح وواضح لمتغير يمثل العمر؟",
  "lv_age",
  "2age",
  "يبدأ lv_age بحرف، ويعبّر عن القيمة التي يحتفظ بها المتغير."
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
  "محرر الأكواد هو المساحة التي تكتب فيها تعليمات البرنامج وتعدّلها.",
  "يتيح لك تجربة الأفكار وتصحيح الأخطاء دون الحاجة إلى نظام SAP.",
  "انقر داخل المحرر لبدء الكتابة. يطلب زر «استعادة الأكواد الأولية» تأكيدك قبل استبدال تعديلاتك.",
  "هل تؤدي الكتابة في المحرر إلى تنفيذ البرنامج فورًا؟",
  "لا",
  "نعم",
  "تغيّر الكتابة نص البرنامج فقط. لبدء المحاكاة، اضغط «إنشاء تتبع التنفيذ»."
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
  "توضّح المحاكاة أثر التعليمات المدعومة وفق نموذج تعليمي محدود.",
  "تساعدك على متابعة تغير القيم خطوة بخطوة دون الاتصال بنظام SAP.",
  "أنشئ تتبع التنفيذ، ثم استخدم «التالي» أو «السابق» أو التشغيل التلقائي. يحدد الرمز ▶ التعليمة الجاري تنفيذها، بينما يحدد مؤشر الكتابة موضع التحرير.",
  "هل يمكن لهذا المحاكي تنفيذ أي برنامج ABAP على نظام SAP؟",
  "لا، يحاكي مجموعة محددة من التعليمات",
  "نعم",
  "يعمل المحاكي محليًا لأغراض التعلّم، ولا يتصل بنظام SAP ولا يحل محل مترجم ABAP."
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
  "تُستخدم DATA لتعريف متغير يحتفظ بقيمة في ذاكرة البرنامج.",
  "يحتاج البرنامج إلى متغيرات لحفظ البيانات وقراءة قيمها أو تغييرها لاحقًا.",
  "ابدأ بـ DATA، ثم اكتب اسم المتغير، وبعده TYPE ونوع البيانات.",
  "أي كلمة تُستخدم لإنشاء متغير؟",
  "DATA",
  "WRITE",
  "تنشئ DATA متغيرًا في الذاكرة، بينما تعرض WRITE قيمة في مخرجات البرنامج."
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
  "تحدد TYPE نوع البيانات التي يمكن للمتغير الاحتفاظ بها.",
  "يميز نوع البيانات بين القيم العددية والنصية، ويساعد على اكتشاف الاستخدام غير المناسب.",
  "اكتب TYPE بعد اسم المتغير، ثم اكتب اسم النوع مثل i أو string.",
  "أين توضع TYPE في تعريف المتغير؟",
  "بعد اسم المتغير",
  "بعد النقطة النهائية",
  "ترتيب التعريف هو DATA ثم اسم المتغير ثم TYPE ثم نوع البيانات."
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
  "النوع i مخصص للأعداد الصحيحة الموجبة والسالبة والصفر.",
  "نستخدمه للكميات التي لا تحتاج إلى كسور، مثل عدد المنتجات.",
  "اكتب i بعد TYPE. إذا لم تحدد VALUE، تكون القيمة الأولية للمتغير صفرًا.",
  "ما القيمة الأولية للمتغير في DATA lv_result TYPE i.؟",
  "0",
  "غير معروفة",
  "تبدأ متغيرات النوع i بالقيمة صفر عندما لا نحدد قيمة أولية أخرى."
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
  "تحدد VALUE قيمة المتغير عند إنشائه.",
  "تتيح لك تعريف المتغير وتهيئته بالقيمة المطلوبة في تعليمة واحدة.",
  "اكتب VALUE ثم القيمة بعد نوع البيانات وقبل النقطة النهائية.",
  "ماذا تعني VALUE 5 في تعريف متغير؟",
  "بدء المتغير بالقيمة 5",
  "عرض العدد 5 في المخرجات",
  "تضع VALUE القيمة في ذاكرة البرنامج، ولا تعرضها للمستخدم."
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
  "تُستخدم = في تعليمة الإسناد لتخزين قيمة الطرف الأيمن في متغير الطرف الأيسر.",
  "نحتاج إلى الإسناد لتحديث قيمة متغير بعد إنشائه، مثل حفظ نتيجة عملية حسابية.",
  "ضع متغيرًا سبق تعريفه على اليسار، وقيمة أو تعبيرًا حسابيًا على اليمين.",
  "أي طرف يستقبل نتيجة الإسناد؟",
  "الطرف الأيسر",
  "الطرف الأيمن",
  "يحسب البرنامج قيمة الطرف الأيمن أولًا، ثم يخزّن النتيجة في المتغير الموجود على اليسار."
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
  "تجمع العلامة + قيمتين من نوع الأعداد الصحيحة في هذا الدرس.",
  "تتيح حساب النتيجة من البيانات بدلًا من كتابة إجابة ثابتة لا تتغير معها.",
  "ضع + بين العددين أو المتغيرين على يمين علامة الإسناد =.",
  "ما القيمة التي تُخزّنها lv_result = 5 + 8.؟",
  "13",
  "58",
  "تجري العملية جمعًا عدديًا ينتج 13؛ ولا تدمج الرقمين لتكوين نص."
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
  "تعرض WRITE قيمة ضمن مخرجات البرنامج.",
  "لا يعني تخزين القيمة في متغير أنها ظهرت للمستخدم؛ نستخدم WRITE لعرضها.",
  "اكتب WRITE ثم اسم المتغير أو القيمة النصية أو العدد، وأنهِ التعليمة بنقطة.",
  "هل تغيّر WRITE القيمة المخزنة في المتغير؟",
  "لا",
  "نعم",
  "تقرأ WRITE القيمة من الذاكرة وتضيفها إلى المخرجات دون تغيير المتغير."
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
  "تُستخدم TYPES لتعريف نوع بيانات يمكن إعادة استخدامه، ولا تنشئ متغيرًا بحد ذاتها.",
  "يتيح النوع المشترك إنشاء عدة سجلات تتكون من الحقول نفسها.",
  "ابدأ تعريف البنية بـ TYPES: BEGIN OF ثم اسم النوع، وأغلقه بـ END OF والاسم نفسه.",
  "هل يؤدي تعريف نوع بيانات إلى إنشاء سجل موظف في الذاكرة؟",
  "لا",
  "نعم",
  "تصف TYPES الحقول وأنواعها، ثم تنشئ DATA متغيرًا يستند إلى هذا الوصف."
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
  "تبدأ BEGIN OF تعريف بنية بيانات وتحدد اسم نوعها.",
  "تجمع الحقول اللاحقة ضمن نوع واحد يمثل سجلًا مترابطًا.",
  "اكتب BEGIN OF بعد TYPES:، ثم اسم النوع مباشرة بعد OF.",
  "ماذا نكتب بعد BEGIN OF؟",
  "اسم نوع بنية البيانات",
  "قيمة حقل الموظف",
  "يسمي هذا الجزء نوع البنية الذي سنستخدمه لاحقًا عند تعريف المتغيرات."
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
  "تنهي END OF تعريف حقول بنية البيانات.",
  "توضح نهاية البنية، ويؤكد تطابق الاسم أننا أغلقنا النوع المقصود.",
  "اكتب بعد END OF اسم النوع نفسه المستخدم بعد BEGIN OF، ثم ضع النقطة النهائية.",
  "هل يجب أن يتطابق اسما النوع بعد BEGIN OF وEND OF؟",
  "نعم",
  "لا",
  "يبدأ تعريف البنية وينتهي باسم النوع نفسه. اختلاف الاسمين خطأ في التعريف."
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
  "الحقل جزء له اسم ونوع بيانات داخل البنية.",
  "تجمع الحقول المرتبطة معلومات سجل واحد، مثل رقم الموظف واسمه.",
  "بين BEGIN OF وEND OF، اكتب اسم كل حقل ثم TYPE ونوعه، وافصل الأجزاء بفواصل.",
  "أي صياغة تعرّف حقلًا لرقم صحيح؟",
  "id TYPE i,",
  "id = 101,",
  "يصف تعريف النوع طبيعة الحقل. أما إسناد قيمة إلى سجل محدد فيأتي بعد إنشاء المتغير."
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
  "تبدأ النقطتان : تعريفًا متسلسلًا، وتفصل الفاصلة , بين أجزائه.",
  "يسمح ذلك باستخدام TYPES مرة واحدة لكتابة تعريف بنية تضم عدة حقول.",
  "ضع : بعد TYPES، وفاصلة بين الأجزاء، ونقطة واحدة عند نهاية التعريف كاملًا.",
  "ما الرمز الذي ينهي التعريف المتسلسل كاملًا؟",
  "النقطة",
  "الفاصلة",
  "تعني الفاصلة أن التعريف مستمر، أما النقطة فتُنهي التعليمة كاملة."
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
  "تنشئ DATA متغيرًا من نوع بنية بيانات سبق تعريفه.",
  "يصف النوع شكل السجل، بينما يحتفظ المتغير بالقيم الفعلية في ذاكرة البرنامج.",
  "اكتب DATA ثم اسم المتغير ثم TYPE واسم نوع البنية. تبدأ الحقول من نوع i بصفر، والحقول من نوع string بنص فارغ.",
  "أي تعليمة تنشئ سجل الموظف في الذاكرة؟",
  "DATA ls_employee TYPE ty_employee.",
  "TYPES ty_employee.",
  "تنشئ DATA متغيرًا يحتوي على الحقول التي وصفها النوع ty_employee."
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
  "تصل الشرطة - إلى حقل محدد داخل متغير من نوع بنية بيانات.",
  "نستخدمها لقراءة حقل واحد أو تغيير قيمته دون تعديل بقية الحقول.",
  "اكتب اسم المتغير ثم شرطة واحدة ثم اسم حقل موجود في تعريف النوع.",
  "كيف نصل إلى حقل اسم الموظف؟",
  "ls_employee-name",
  "ls_employee.name",
  "تحدد الشرطة حقل البنية، بينما تنهي النقطة التعليمة البرمجية."
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
  "يحتفظ النوع string بالنصوص. وتحدد علامتا الاقتباس المفردتان قيمة نصية مكتوبة مباشرة في الأكواد.",
  "نستخدم النصوص للأسماء والأوصاف، ونميزها عن الأعداد التي تُجرى عليها العمليات الحسابية.",
  "عرّف الحقل باستخدام TYPE string، ثم أسند إليه قيمة مثل 'Ahmed'. تسمى القيمة المكتوبة مباشرة قيمة حرفية.",
  "أي خيار يمثل قيمة نصية حرفية؟",
  "'Ahmed'",
  "Ahmed",
  "إذا حذفت علامتَي الاقتباس، يتعامل البرنامج مع Ahmed بوصفه اسم متغير، لا نصًا."
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
         id   TYPE i,
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
  pathId: string;
  objectives: Text[];
  visualization: "scalar" | "structure" | "condition" | "loop" | "table" | "project";
  difficulty?: "beginner" | "intermediate" | "advanced";
  environment?: "browser" | "sap-required";
  assessment?: "simulated" | "conceptual" | "structural" | "guided";
  references?: string[];
  hints?: Text[];
  practice: Text;
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
  challenges?: Challenge[];
  activity?: "table-categories";
  requiredActivities?: string[];
};
export type Challenge = Pick<Mission, "id" | "title" | "goal" | "hint" | "starter" | "starterAr" | "solution" | "expected">;
export const conditionTokens: SyntaxToken[] = [
  additionTokens.find(t => t.id === "data")!,
  additionTokens.find(t => t.id === "value")!,
  token("if", "IF", [
    "IF checks a logical expression before choosing a block of statements.",
    "Business rules often need different actions for different values.",
    "Write IF, a comparison, and a period. Close the whole block with ENDIF.",
    "With an amount of 1200, is lv_amount >= 1000 true?", "Yes", "No",
    "1200 is at least 1000, so the statements directly after IF run.",
  ], [
    "تفحص IF شرطًا لتحديد مجموعة التعليمات التي سينفّذها البرنامج.",
    "تحتاج قواعد العمل إلى قرارات؛ فطلب الشراء الكبير قد يتطلب موافقة إضافية.",
    "اكتب IF ثم المقارنة ثم النقطة. أغلق مجموعة التعليمات باستخدام ENDIF.",
    "إذا كانت قيمة lv_amount تساوي 1200، فهل الشرط lv_amount >= 1000 صحيح؟", "نعم", "لا",
    "القيمة 1200 أكبر من 1000، لذا ينفّذ البرنامج التعليمات الموجودة بعد IF.",
  ], "IF lv_amount >= 1000.\n  WRITE 'Needs approval'.\nENDIF.", "IF lv_amount >= 1000\n  WRITE 'Needs approval'.\nENDIF."),
  token("compare", "= <> > < >= <=", [
    "A comparison produces a logical result: TRUE or FALSE.",
    "Compare a stored value with the threshold for a business rule.",
    "Use = for equality, <> for inequality, > and < for strict comparisons, >= and <= to include equality. Both operands need matching types here.",
    "Does lv_sales >= 5000 include exactly 5000?", "Yes", "No",
    "The equality part includes the boundary. Use > when equality should be excluded.",
  ], [
    "تعطي المقارنة نتيجة منطقية: صحيحة (TRUE) أو خاطئة (FALSE).",
    "نقارن قيمة المتغير بالحد المطلوب لمعرفة ما إذا كانت قاعدة العمل تنطبق.",
    "استخدم = للتساوي و<> لعدم التساوي و> و< للمقارنة الصارمة. تشمل >= و<= حالة التساوي. يشترط المحاكي تطابق نوعَي القيمتين.",
    "هل يشمل الشرط lv_sales >= 5000 القيمة 5000 نفسها؟", "نعم", "لا",
    "تشمل >= حالة التساوي. استخدم > إذا كنت تريد استبعاد القيمة الحدية.",
  ], "IF lv_sales >= 5000.\n  WRITE 'Bonus'.\nENDIF.", "IF lv_sales => 5000.\nENDIF."),
  token("compare-assignment", "= in context", [
    "The position of = determines whether it assigns or compares.",
    "Assignment changes memory; comparison asks whether two values are equal.",
    "lv_amount = 1000. stores a value. IF lv_amount = 1000. checks equality without changing memory.",
    "Does IF lv_amount = 1000. replace lv_amount?", "No", "Yes",
    "Inside IF, = is a comparison. Outside the condition it can be assignment.",
  ], [
    "يتحدد معنى العلامة = بحسب موضعها: إسناد قيمة أو مقارنة قيمتين.",
    "يغيّر الإسناد القيمة المخزنة، أما المقارنة فتتحقق من التساوي دون تغييرها.",
    "تخزّن lv_amount = 1000. القيمة في المتغير. أما IF lv_amount = 1000. فتفحص ما إذا كانت قيمته تساوي 1000.",
    "هل تغيّر IF lv_amount = 1000. قيمة المتغير؟", "لا", "نعم",
    "تُستخدم = داخل شرط IF للمقارنة. وفي تعليمة الإسناد تُستخدم لتخزين قيمة.",
  ], "lv_amount = 1000.\nIF lv_amount = 1000.\n  WRITE 'Equal'.\nENDIF.", "IF lv_amount == 1000.\nENDIF."),
  token("else", "ELSE", [
    "ELSE supplies a fallback when all preceding conditions are false.",
    "It makes the alternative business action explicit.",
    "Write ELSE. after the IF statements and before ENDIF. Use at most one ELSE, after any ELSEIF branches.",
    "Does ELSE run after a true IF branch?", "No", "Yes",
    "Only one branch is selected. The other branch is skipped, not executed.",
  ], [
    "تحدد ELSE ما ينفّذه البرنامج إذا لم يتحقق أي شرط سابق.",
    "توضح الإجراء البديل، مثل الموافقة التلقائية على طلب شراء صغير.",
    "اكتب ELSE. قبل ENDIF. تُستخدم مرة واحدة على الأكثر، وبعد جميع فروع ELSEIF إن وُجدت.",
    "هل ينفّذ البرنامج فرع ELSE بعد تنفيذ فرع IF الصحيح؟", "لا", "نعم",
    "يختار البرنامج فرعًا واحدًا فقط، ويتجاوز تعليمات الفروع الأخرى دون تنفيذها.",
  ], "IF lv_amount >= 1000.\n  WRITE 'Needs approval'.\nELSE.\n  WRITE 'Automatically approved'.\nENDIF.", "ELSE lv_amount < 1000."),
  token("elseif", "ELSEIF", [
    "ELSEIF checks another condition only when earlier conditions are false.",
    "Several ranges can share one decision, such as high, medium, and low scores.",
    "Write ELSEIF followed by a comparison and a period, before ELSE. Test the highest threshold first for descending ranges.",
    "If IF is true, is the following ELSEIF comparison evaluated?", "No", "Yes",
    "The first true branch wins. Later comparisons and their bodies are skipped.",
  ], [
    "تفحص ELSEIF شرطًا إضافيًا فقط إذا كانت جميع الشروط السابقة خاطئة.",
    "تتيح تصنيف القيم إلى عدة فئات، مثل مرتفعة ومتوسطة ومنخفضة.",
    "اكتب ELSEIF ثم المقارنة ثم النقطة، وضعها قبل ELSE. عند التصنيف بحدود تنازلية، ابدأ بالحد الأعلى.",
    "إذا تحقق شرط IF، فهل يفحص البرنامج شرط ELSEIF الذي يليه؟", "لا", "نعم",
    "ينفّذ البرنامج أول فرع يتحقق شرطه، ويتجاوز بقية المقارنات وتعليماتها.",
  ], "IF lv_score >= 80.\n  WRITE 'High'.\nELSEIF lv_score >= 50.\n  WRITE 'Medium'.\nELSE.\n  WRITE 'Low'.\nENDIF.", "IF lv_score >= 50.\nELSE.\nELSEIF lv_score >= 80.\nENDIF."),
  token("endif", "ENDIF", [
    "ENDIF marks where the decision ends and normal execution continues.",
    "An explicit boundary keeps nested decisions unambiguous.",
    "Close each IF with ENDIF. Nested IF blocks need their own ENDIF, working from inside out.",
    "How many ENDIF statements close two nested IF blocks?", "Two", "One",
    "Each IF has its own ENDIF. After a branch finishes, execution continues beyond its ENDIF.",
  ], [
    "تحدد ENDIF نهاية القرار؛ بعدها يتابع البرنامج تنفيذ التعليمات التالية.",
    "توضح حدود كل قرار، خصوصًا عند وضع شرط داخل شرط آخر.",
    "أغلق كل IF باستخدام ENDIF. للشروط المتداخلة، أغلق الشرط الداخلي أولًا ثم الخارجي.",
    "كم تعليمة ENDIF نحتاج لإغلاق شرطَي IF متداخلين؟", "تعليمتان", "تعليمة واحدة",
    "لكل IF تعليمة ENDIF خاصة بها. بعد انتهاء الفرع المختار، يتابع البرنامج بعد ENDIF المقابلة.",
  ], "IF lv_amount >= 1000.\n  IF lv_amount >= 5000.\n    WRITE 'Manager approval'.\n  ENDIF.\nENDIF.", "IF lv_amount >= 1000.\nWRITE 'Review'."),
  additionTokens.find(t => t.id === "write")!,
  orientation.find(t => t.id === "period")!,
];
export const purchaseExample = `DATA lv_amount TYPE i VALUE 1200.

IF lv_amount >= 1000.
  WRITE 'Needs approval'.
ELSE.
  WRITE 'Automatically approved'.
ENDIF.`;
export const conditionChallenges: Challenge[] = [
  {
    id: "conditions-positive", title: text("A · Is the number positive?", "أ · هل العدد موجب؟"),
    goal: text("Declare lv_number TYPE i VALUE 4. Use IF/ELSE to print 'Positive' for values greater than 0, or 'Not positive' otherwise. Zero is not positive. Keep the input unchanged; the checker also tries other values.", "عرّف lv_number TYPE i VALUE 4. استخدم IF/ELSE لعرض 'Positive' إذا كانت القيمة أكبر من صفر، و'Not positive' خلاف ذلك. الصفر ليس عددًا موجبًا. لا تغيّر قيمة الإدخال؛ يفحص التقييم قيمًا أخرى أيضًا."),
    hint: text("Compare lv_number > 0. Put one WRITE in each branch, then close with ENDIF.", "قارن lv_number > 0. ضع تعليمة WRITE في كل فرع، ثم أغلق القرار باستخدام ENDIF."),
    starter: "DATA lv_number TYPE i VALUE 4.\n* Decide whether the number is positive.\n",
    starterAr: "DATA lv_number TYPE i VALUE 4.\n* افحص ما إذا كان العدد موجبًا.\n",
    solution: "DATA lv_number TYPE i VALUE 4.\nIF lv_number > 0.\n  WRITE 'Positive'.\nELSE.\n  WRITE 'Not positive'.\nENDIF.", expected: "Positive",
  },
  {
    id: "conditions-bonus", title: text("B · Employee bonus eligibility", "ب · استحقاق مكافأة الموظف"),
    goal: text("Declare lv_sales TYPE i VALUE 6000. An employee earns a bonus when sales are at least 5000. Print 'Bonus' or 'No bonus' using IF/ELSE. Keep the input unchanged. Exactly 5000 must qualify.", "عرّف lv_sales TYPE i VALUE 6000. يستحق الموظف مكافأة إذا بلغت مبيعاته 5000 أو أكثر. استخدم IF/ELSE لعرض 'Bonus' أو 'No bonus' دون تغيير الإدخال. يجب أن تشمل المكافأة القيمة 5000 نفسها."),
    hint: text("Use >= rather than > so that the threshold itself qualifies.", "استخدم >= بدلًا من > لتشمل المقارنة قيمة الحد نفسها."),
    starter: "DATA lv_sales TYPE i VALUE 6000.\n* Apply the 5000 sales threshold.\n",
    starterAr: "DATA lv_sales TYPE i VALUE 6000.\n* طبّق شرط استحقاق المكافأة عند بلوغ 5000.\n",
    solution: "DATA lv_sales TYPE i VALUE 6000.\nIF lv_sales >= 5000.\n  WRITE 'Bonus'.\nELSE.\n  WRITE 'No bonus'.\nENDIF.", expected: "Bonus",
  },
  {
    id: "conditions-ranges", title: text("C · Classify a score", "ج · تصنيف الدرجة"),
    goal: text("Declare lv_score TYPE i VALUE 75. Use IF/ELSEIF/ELSE: print 'High' for 80 or above, 'Medium' for 50 through 79, and 'Low' below 50. Keep the input unchanged. Test the boundaries 50 and 80.", "عرّف lv_score TYPE i VALUE 75. استخدم IF/ELSEIF/ELSE لعرض 'High' للدرجات من 80 فأعلى، و'Medium' من 50 إلى 79، و'Low' لما دون 50. لا تغيّر الإدخال، وجرّب القيمتين الحديتين 50 و80."),
    hint: text("Check >= 80 first, then ELSEIF >= 50. The final ELSE covers every remaining value.", "افحص >= 80 أولًا، ثم ELSEIF مع >= 50. يغطي فرع ELSE الأخير جميع القيم المتبقية."),
    starter: "DATA lv_score TYPE i VALUE 75.\n* Classify the score with three branches.\n",
    starterAr: "DATA lv_score TYPE i VALUE 75.\n* صنّف الدرجة باستخدام ثلاثة فروع.\n",
    solution: "DATA lv_score TYPE i VALUE 75.\nIF lv_score >= 80.\n  WRITE 'High'.\nELSEIF lv_score >= 50.\n  WRITE 'Medium'.\nELSE.\n  WRITE 'Low'.\nENDIF.", expected: "Medium",
  },
];
const originalMissions: Mission[] = [
  {
    id: "addition",
    pathId: "fundamentals",
    objectives: [text("Declare integer variables", "تعريف متغيرات للأعداد الصحيحة"), text("Calculate and display a sum", "حساب مجموع وعرضه")],
    visualization: "scalar",
    practice: text("Change 5 and 8 to two quantities of your choice. Predict their sum, build a trace, and follow when lv_result changes. Go back one step to compare the previous value.", "استبدل 5 و8 بكميتين تختارهما. توقّع المجموع، ثم أنشئ تتبع التنفيذ وتابع لحظة تغيّر lv_result. ارجع خطوة واحدة لمقارنة قيمته السابقة."),
    prerequisite: "orientation",
    minutes: 7,
    xp: 100,
    title: text("Add two numbers", "جمع عددين"),
    subtitle: text(
      "Your first calculation, from code to memory.",
      "تعلّم كيف تُخزّن القيم وتجمعها، ثم تعرض النتيجة.",
    ),
    brief: text(
      "Imagine a warehouse combining two deliveries. Each variable is a labeled memory box. Declare two quantities, create an empty result box, then add the quantities and display the answer.",
      "استلم مستودع شحنتين ويريد معرفة إجمالي الكمية. سنحفظ كمية كل شحنة في متغير، وننشئ متغيرًا ثالثًا للمجموع. بعد جمع الكميتين، نعرض النتيجة باستخدام WRITE. يمكنك تصور المتغير بوصفه مكانًا له اسم في ذاكرة البرنامج.",
    ),
    visual: text(
      "Step through 5 + 8. The result starts at 0. Addition reads both source boxes before changing the result to 13. WRITE reads the result and displays it.",
      "تابع جمع 5 و8 خطوة بخطوة. يبدأ متغير النتيجة بصفر، ثم يقرأ البرنامج قيمتَي الشحنتين ويخزّن مجموعهما، 13، في متغير النتيجة. تعرض WRITE هذه القيمة دون تغييرها في الذاكرة.",
    ),
    goal: text(
      "Declare two integer variables starting at 10 and 20, plus a result variable. Add the two variables, store their sum, and WRITE the result. Expected output: 30. You may choose your own valid names.",
      "عرّف متغيرين من النوع i بقيمتَين أوليتَين 10 و20، ومتغيرًا ثالثًا للنتيجة. اجمع قيمتَي المتغيرين وخزّن المجموع، ثم اعرضه باستخدام WRITE. المخرجات المتوقعة: 30. يمكنك اختيار أسماء المتغيرات وفق قواعد التسمية.",
    ),
    hint: text(
      "Use VALUE 10 and VALUE 20 in the first two declarations. Put lv_first + lv_second on the right side of the result assignment.",
      "استخدم VALUE 10 وVALUE 20 عند تعريف متغيرَي الإدخال. لحفظ المجموع، ضع متغير النتيجة يسار =، والتعبير lv_first + lv_second على يمينها.",
    ),
    quiz: text(
      "Why does lv_result initially contain 0?",
      "لماذا تكون قيمة lv_result صفرًا عند إنشائه؟",
    ),
    options: [
      text(
        "Integer variables start at 0 without VALUE",
        "تبدأ متغيرات النوع i بصفر إذا لم نحدد VALUE",
      ),
      text("WRITE puts 0 into memory", "تضع WRITE صفراً في الذاكرة"),
    ],
    answer: 0,
    quizExplanation: text(
      "TYPE i has an initial value of 0. Addition replaces it later; WRITE only reads it.",
      "القيمة الأولية للنوع i هي صفر. يستبدل إسناد المجموع هذه القيمة لاحقًا، أما WRITE فتقرأ القيمة وتعرضها دون تغييرها.",
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
    pathId: "fundamentals",
    references: ["https://learning.sap.com/courses/basic-abap-programming/declaring-a-structured-data-object_cd245e79-eb25-4099-a5b4-9ad46b1659b6", "https://help.sap.com/docs/ABAP_PLATFORM_BW4HANA/7bfe8cdcfbb040dcb6702dada8c3e2f0/05bfe43c3bc24d2294335787bc381721.html"],
    objectives: [text("Define a structure type", "تعريف نوع بنية بيانات"), text("Create a record and access its fields", "إنشاء سجل والوصول إلى حقوله")],
    visualization: "structure",
    practice: text("Change Ahmed to a different name and change the employee ID. Predict which memory fields change. Build a trace, then click ls_employee-name in the editor to find the matching field.", "غيّر اسم Ahmed ورقم الموظف. توقّع الحقول التي ستتغير في الذاكرة، ثم أنشئ تتبع التنفيذ. انقر ls_employee-name في المحرر لتحديد الحقل المقابل."),
    prerequisite: "addition",
    minutes: 7,
    xp: 150,
    title: text("Create a structure", "إنشاء بنية بيانات"),
    subtitle: text(
      "Give related information a shared home.",
      "اجمع الحقول المرتبطة في سجل واحد يسهل التعامل معه.",
    ),
    brief: text(
      "An employee record groups an ID and a name. TYPES describes the fields and their types. DATA creates an actual record in memory with initial field values. The hyphen selects one field, so changing the name does not change the ID.",
      "يضم سجل الموظف حقولًا مرتبطة، مثل الرقم والاسم. نستخدم TYPES لوصف هذه الحقول وأنواعها، ثم DATA لإنشاء سجل فعلي في ذاكرة البرنامج. تصل الشرطة - إلى حقل محدد؛ لذلك يمكنك تغيير الاسم دون تغيير رقم الموظف.",
    ),
    visual: text(
      "The multi-line TYPES chain defines one blueprint. DATA creates a record with ID 0 and an empty name. Watch each component change, then click ls_employee-name in the editor to identify the field.",
      "تصف تعليمة TYPES متعددة الأسطر نوع بنية واحدًا. تنشئ DATA سجلًا يبدأ رقمه بصفر واسمه بنص فارغ. تابع تغيّر كل حقل بعد الإسناد، ثم انقر ls_employee-name في المحرر لتحديد الحقل المقابل في الذاكرة.",
    ),
    goal: text(
      "Define a Product structure type with id TYPE i, name TYPE string, and quantity TYPE i. Declare a variable of that type. Assign id = 501, name = 'Keyboard', and quantity = 12. WRITE the name component. Expected output: Keyboard.",
      "عرّف نوع بنية لمنتج يحتوي على الحقول id TYPE i وname TYPE string وquantity TYPE i. أنشئ متغيرًا من هذا النوع، ثم أسند إلى حقوله القيم id = 501 وname = 'Keyboard' وquantity = 12. استخدم WRITE لعرض حقل الاسم نفسه. المخرجات المتوقعة: Keyboard.",
    ),
    hint: text(
      "Use TYPES: BEGIN OF ty_product, then the three field declarations separated by commas, and END OF ty_product. Declare ls_product with DATA. Access fields with ls_product-id, ls_product-name, and ls_product-quantity.",
      "ابدأ بـ TYPES: BEGIN OF ty_product, ثم اكتب الحقول الثلاثة وأنواعها، مع فصل الأجزاء بفواصل. أغلق التعريف بـ END OF ty_product. أنشئ ls_product باستخدام DATA، ثم استخدم الشرطة للوصول إلى كل حقل، مثل ls_product-name.",
    ),
    quiz: text(
      "What is the difference between TYPES and DATA?",
      "ما الفرق بين TYPES وDATA؟",
    ),
    options: [
      text(
        "TYPES defines a shape; DATA creates a variable",
        "تصف TYPES نوع البنية، وتنشئ DATA متغيرًا من هذا النوع",
      ),
      text("Both print values", "كلاهما يطبع قيماً"),
    ],
    answer: 0,
    quizExplanation: text(
      "A type is a blueprint. A variable is the actual memory record. Multiple variables can use one type.",
      "يصف النوع الحقول وأنواع بياناتها، أما المتغير فيحتفظ بالقيم الفعلية في الذاكرة. يمكن إنشاء عدة متغيرات من النوع نفسه، ولكل منها قيم مستقلة.",
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
  {
    id: "conditions", prerequisite: "structures", minutes: 18, xp: 200,
    pathId: "fundamentals",
    objectives: [text("Compare values and select a branch", "مقارنة القيم واختيار فرع التنفيذ"), text("Classify ranges with ELSEIF", "تصنيف نطاقات القيم باستخدام ELSEIF"), text("Test threshold boundaries", "اختبار القيم الحدية")],
    visualization: "condition",
    practice: text("Change the purchase amount to 999, then 1000. Predict which branch runs before building each trace. Compare the condition and output at both boundaries. Optional: use the nested IF example from the ENDIF Syntax Lab topic to add manager approval at 5000.", "غيّر قيمة طلب الشراء إلى 999 ثم 1000. توقّع الفرع الذي سيُنفّذ قبل إنشاء كل تتبع، وقارن نتيجة الشرط والمخرجات. للتوسع اختياريًا، جرّب مثال IF المتداخل في شرح ENDIF لإضافة موافقة المدير عند بلوغ 5000."),
    title: text("Make a decision with IF / ELSE", "اتخذ قرارًا باستخدام IF / ELSE"),
    subtitle: text("Apply a purchase approval rule and classify business values.", "طبّق قاعدة الموافقة على طلبات الشراء، وصنّف القيم بحسب شروط واضحة."),
    brief: text("A purchasing team reviews requests of 1000 or more; smaller requests are approved automatically. A condition chooses exactly one action. Start with the Syntax Lab, then follow the comparison, predict the selected branch, and practice with amounts below, at, and above 1000.", "يراجع فريق المشتريات الطلبات التي تبلغ قيمتها 1000 أو أكثر، ويوافق تلقائيًا على الطلبات الأقل قيمة. يحدد الشرط إجراءً واحدًا فقط. تعرّف إلى الصياغة أولًا، ثم تابع المقارنة وتوقّع الفرع المختار. جرّب قيمة أقل من 1000 وأخرى مساوية لها وثالثة أكبر منها."),
    visual: text("Step through the creation of lv_amount, then inspect 1200 >= 1000 → TRUE. Only 'Needs approval' is written. The other branch is dimmed as skipped. Use Previous to compare snapshots. In practice, change 1200 to 999, then 1000; predict each result before building a trace.", "تابع إنشاء lv_amount ثم افحص نتيجة المقارنة 1200 >= 1000: الشرط صحيح. تظهر 'Needs approval' فقط، وتُعرض تعليمات الفرع الآخر بوصفها متجاوزة. استخدم «السابق» لمراجعة الحالة. أثناء التجربة، استبدل 1200 بالقيمة 999 ثم 1000، وتوقّع النتيجة قبل إنشاء التتبع."),
    goal: text("Complete three decisions: identify positive numbers, check bonus eligibility, then classify scores with ELSEIF. Each check tries multiple input values, including boundaries.", "أكمل ثلاثة قرارات: تحديد العدد الموجب، والتحقق من استحقاق المكافأة، ثم تصنيف الدرجات باستخدام ELSEIF. يفحص كل تقييم عدة قيم، بما فيها القيم الحدية."),
    hint: conditionChallenges[0].hint,
    quiz: text("IF is false and the first ELSEIF is true. What happens next?", "إذا كان شرط IF خاطئًا وشرط ELSEIF الأول صحيحًا، فماذا ينفّذ البرنامج؟"),
    options: [text("Only that ELSEIF body; later branches are skipped", "تعليمات فرع ELSEIF المختار فقط، ويتجاوز الفروع التالية"), text("Both ELSEIF and ELSE", "تعليمات ELSEIF وتعليمات ELSE معًا")], answer: 0,
    quizExplanation: text("Conditions are checked in order. The first true branch runs; later tests and bodies are skipped. Execution continues after ENDIF.", "يفحص البرنامج الشروط بالترتيب وينفّذ أول فرع يتحقق شرطه. يتجاوز المقارنات والفروع اللاحقة، ثم يتابع بعد ENDIF."),
    tokens: conditionTokens, example: purchaseExample,
    starter: conditionChallenges[0].starter, starterAr: conditionChallenges[0].starterAr,
    solution: conditionChallenges[0].solution, expected: conditionChallenges[0].expected,
    challenges: conditionChallenges,
  },
];
export const missions: Mission[] = [...originalMissions, ...fundamentals, ...dataMissions].map(mission => ({
  difficulty: "beginner",
  environment: "browser",
  assessment: "simulated",
  references: ["https://learning.sap.com/courses/basic-abap-programming/using-control-structures-in-abap_a4d7803e-eac2-458e-acf9-8628289f3701"],
  ...mission,
}));
export const paths = [
  {
    id: "fundamentals",
    title: text("ABAP Fundamentals", "أساسيات ABAP"),
    concepts: text(
      "Syntax basics · Variables · Arithmetic · Structures · Conditions · Loops",
      "الصياغة البرمجية · المتغيرات · العمليات الحسابية · بُنى البيانات · الشروط · الحلقات التكرارية",
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
      "النطاقات · عناصر البيانات · بُنى البيانات · جداول قواعد البيانات · المفاتيح الخارجية · وسائل المساعدة في البحث",
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
      "التقارير · ALV · Module Pool · Smart Forms · تنقيح الأخطاء · معاملات SAP",
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
  ar: ["الشروط", "الحلقات التكرارية"],
};
