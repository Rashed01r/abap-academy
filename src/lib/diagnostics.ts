import type { ErrorCode } from "./engine";
import { text } from "./curriculum";

// A specific explanation, repair hint, and example accompany every supported error.
export const diagnosticAdvice = {
  period: {
    why: text("ABAP uses periods to separate complete statements; line breaks only format them.", "تفصل النقطة بين التعليمات المكتملة في ABAP، أما فواصل الأسطر فتنظّم الكتابة فقط."),
    hint: text("Add a period at the end of the highlighted instruction, before the next one starts.", "ضع النقطة في نهاية التعليمة المحددة، قبل بدء التعليمة التالية."), example: "DATA lv_age TYPE i.\nWRITE lv_age.",
  },
  unknown: {
    why: text("The simulator needs a declared name and type before it can read a value.", "يحتاج المحاكي إلى معرفة اسم المتغير ونوعه قبل قراءة قيمته."),
    hint: text("Declare the name before using it: DATA for a variable or FIELD-SYMBOLS <name> TYPE type for a field symbol. Check for a spelling mismatch.", "عرّف الاسم قبل استخدامه: DATA للمتغير، أو FIELD-SYMBOLS <name> TYPE type لرمز الحقل. وطابق كتابة الاسم في الموضعين."), example: "DATA lv_total TYPE i.\nWRITE lv_total.",
  },
  declaration: {
    why: text("A declaration describes the storage or structure type before it is used.", "يحدد تعريف البيانات المتغير أو نوع البنية قبل استخدامها في البرنامج."),
    hint: text("Check DATA name TYPE type. For structures, match BEGIN OF and END OF names.", "راجع ترتيب DATA ثم الاسم ثم TYPE ثم النوع. في البنية، طابق الاسم بعد BEGIN OF وEND OF."), example: "DATA lv_count TYPE i VALUE 1.",
  },
  assignment: {
    why: text("Assignment updates a target; a condition compares two compatible values.", "يحدّث الإسناد قيمة المتغير، بينما تقارن الشروط قيمتين متوافقتين."),
    hint: text("For assignment use target = value. For conditions use =, <>, >, <, >=, or <=; ABAP does not use ==.", "للإسناد اكتب target = value. وللمقارنة استخدم = أو <> أو > أو < أو >= أو <=؛ لا تستخدم ==."), example: "lv_total = 10.\nIF lv_total >= 10.\n  WRITE lv_total.\nENDIF.",
  },
  unsupported: {
    why: text("This local teaching model implements a documented subset of ABAP.", "يطبّق هذا النموذج التعليمي مجموعة محددة من تعليمات ABAP فقط."),
    hint: text("Open the supported-syntax description below. Declarations inside conditions are also outside the current model.", "افتح وصف التعليمات المدعومة أدناه. تعريف المتغيرات داخل الشروط غير مدعوم حاليًا أيضًا."), example: "DATA lv_value TYPE i VALUE 5.\nWRITE lv_value.",
  },
  component: {
    why: text("A structure only contains the fields listed in its type definition.", "تحتوي البنية على الحقول المذكورة في تعريف نوعها فقط."),
    hint: text("Compare the selected field name with the TYPES fields; add the field there if needed.", "قارن اسم الحقل بحقول TYPES، وأضفه إلى تعريف النوع إذا كانت المهمة تتطلبه."), example: "TYPES: BEGIN OF ty_person,\n name TYPE string,\n END OF ty_person.\nDATA ls_person TYPE ty_person.\nWRITE ls_person-name.",
  },
  access: {
    why: text("A period ends an instruction; a hyphen selects a structure component.", "تنهي النقطة التعليمة، بينما تحدد الشرطة حقلًا داخل بنية البيانات."),
    hint: text("Use one hyphen with an actual structure variable and a declared field.", "استخدم شرطة واحدة بين اسم متغير البنية واسم حقل موجود في نوعها."), example: "ls_employee-name = 'Ahmed'.",
  },
  type: {
    why: text("This model does not implicitly convert text into integers or compare different types.", "لا يحوّل هذا المحاكي النصوص إلى أعداد تلقائيًا، ولا يقارن قيمًا من أنواع مختلفة."),
    hint: text("Match i with whole numbers and string with quoted text. Define structure types before their variables.", "استخدم أعدادًا صحيحة مع i، ونصوصًا بين علامتَي اقتباس مع string. عرّف نوع البنية قبل متغيراتها."), example: "DATA lv_count TYPE i VALUE 5.\nDATA lv_name TYPE string VALUE 'Ahmed'.",
  },
  block: {
    why: text("Each IF has one matching ENDIF. ELSEIF must precede the optional final ELSE.", "تحتاج كل IF إلى ENDIF مقابلة. تأتي ELSEIF قبل فرع ELSE الاختياري الأخير."),
    hint: text("Check matching block boundaries from the innermost IF outward; use no more than one ELSE per decision.", "راجع إغلاق الشروط من الداخل إلى الخارج، واستخدم ELSE مرة واحدة على الأكثر في كل قرار."), example: "IF lv_score >= 80.\n  WRITE 'High'.\nELSEIF lv_score >= 50.\n  WRITE 'Medium'.\nELSE.\n  WRITE 'Low'.\nENDIF.",
  },
  range: {
    why: text("Type i is bounded; overflow is an error rather than a wrapped value in this model.", "للنوع i نطاق محدود؛ يتوقف المحاكي عند تجاوزه بدلًا من عرض قيمة مضللة."),
    hint: text("Use values and sums between −2147483648 and 2147483647.", "استخدم قيمًا ونتائج جمع ضمن النطاق من −2147483648 إلى 2147483647."), example: "DATA lv_quantity TYPE i VALUE 100.",
  },
  string: {
    why: text("A quoted literal must close on the same physical line in this subset.", "يجب إغلاق القيمة النصية على السطر نفسه في الصياغة المدعومة هنا."),
    hint: text("Close single quotes. To include a quote in the text, double it.", "أغلق النص بعلامة اقتباس مفردة. لإدراج هذه العلامة داخل النص، اكتبها مرتين متتاليتين."), example: "WRITE 'It''s ready'.",
  },
  limit: {
    why: text("Deterministic limits keep examples responsive and their traces readable.", "تحافظ الحدود الثابتة على استجابة المحاكي وسهولة متابعة خطوات التنفيذ."),
    hint: text("For a repeating WHILE, update the counter so its condition becomes false. Otherwise simplify the program: 100 iterations per loop, 1,000 execution steps, 100 rows per table, depth 12, 16,000 source characters, 2,000 tokens, and 150 statements.", "إذا استمرت WHILE دون توقف، فحدّث العداد داخل الحلقة حتى يصبح الشرط خاطئًا. أو بسّط المثال للالتزام بالحدود: 100 دورة لكل حلقة و1000 خطوة تنفيذ و100 صف لكل جدول وعمق 12 و16000 محرف و2000 وحدة لغوية و150 تعليمة."), example: "DATA counter TYPE i VALUE 1.\nWHILE counter <= 5.\n  WRITE counter.\n  counter = counter + 1.\nENDWHILE.",
  },
  unassigned: {
    why: text("FIELD-SYMBOLS declares an alias, not a copied value. Until ASSIGN binds it to data, there is no value to access. UNASSIGN removes the binding without erasing the data.", "تعرّف FIELD-SYMBOLS اسمًا للوصول إلى بيانات، لا نسخة من قيمة. لا توجد بيانات يمكن الوصول إليها من خلاله حتى تربطه ASSIGN بكائن. وتلغي UNASSIGN الربط دون مسح البيانات."),
    hint: text("Declare a compatible field symbol, then execute ASSIGN object TO <symbol>. before accessing it. A skipped ASSIGN does not create a binding.", "عرّف رمز حقل بنوع متوافق، ثم نفّذ ASSIGN object TO <symbol>. قبل استخدامه. لا تنشئ ASSIGN ربطًا إذا تجاوزها التنفيذ."),
    example: "DATA lv_count TYPE i VALUE 5.\nFIELD-SYMBOLS <count> TYPE i.\nASSIGN lv_count TO <count>.\n<count> = <count> + 1.\nWRITE lv_count.",
  },
} satisfies Record<ErrorCode, { why: ReturnType<typeof text>; hint: ReturnType<typeof text>; example: string }>;
