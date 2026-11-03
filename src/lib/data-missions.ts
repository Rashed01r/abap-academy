import type { Mission, SyntaxToken, Text } from "./curriculum";
import { fundamentals } from "./fundamentals";
import { tableCategoryMission } from "./table-category-mission";
import { tableKeyMission } from "./table-key-mission";
import { workAreaMission } from "./work-area-mission";

const t = (en: string, ar: string): Text => ({ en, ar });
const setup = `TYPES: BEGIN OF ty_product,
  id TYPE i,
  name TYPE string,
END OF ty_product.
DATA lt_products TYPE STANDARD TABLE OF ty_product WITH EMPTY KEY.
DATA ls_product TYPE ty_product.`;
const solution = `${setup}
ls_product-id = 501.
ls_product-name = 'Keyboard'.
APPEND ls_product TO lt_products.
APPEND ls_product TO lt_products.
ls_product-name = 'Mouse'.
LOOP AT lt_products INTO ls_product.
  WRITE ls_product-name.
ENDLOOP.`;
const emptyKey: SyntaxToken = {
  id: "empty-key", label: "WITH EMPTY KEY",
  meaning: t("The primary key has no components. The standard table still has numbered rows and a defined row type.", "لا يحتوي المفتاح الأساسي على حقول. ويظل للجدول القياسي صفوف مرقمة ونوع محدد للصف."),
  why: t("Use this for a sequence where you do not need a primary key to identify rows. Equal rows are allowed.", "استخدمه لتسلسل لا تحتاج فيه إلى مفتاح أساسي لتحديد الصفوف. ويُسمح بتكرار الصفوف المتطابقة."),
  write: t("Write WITH EMPTY KEY before the declaration's final period. EMPTY describes the key, not the number of rows. This syntax requires ABAP 7.40 or later; check your SAP release.", "اكتب WITH EMPTY KEY قبل نقطة نهاية التعريف. تصف EMPTY المفتاح، لا عدد الصفوف. تتطلب هذه الصياغة ABAP 7.40 أو أحدث؛ تحقق من إصدار نظام SAP لديك."),
  correct: "DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nAPPEND 501 TO lt_ids.\nAPPEND 501 TO lt_ids.",
  mistake: "DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY\nAPPEND 501 TO lt_ids.",
  question: t("After appending 501 twice, how many rows are stored?", "كم صفًا يُحفظ بعد إضافة 501 مرتين؟"),
  options: [t("Two, including the duplicate", "صفان، بما فيهما الصف المكرر"), t("Zero because the key is empty", "صفر لأن المفتاح فارغ")], answer: 0,
  explanation: t("EMPTY KEY neither removes duplicates nor keeps the table empty. APPEND adds a new row each time.", "لا يحذف EMPTY KEY الصفوف المكررة ولا يُبقي الجدول فارغًا. تضيف APPEND صفًا جديدًا في كل مرة."),
};
const challenge = {
  id: "data-table-copies",
  title: t("Keep two independent product rows", "احتفظ بصفَّي منتجات مستقلَّين"),
  goal: t("Using the supplied names, store two identical rows (501, Keyboard) in lt_products by appending ls_product twice. Change only the work-area name to Mouse afterward, without appending it. LOOP AT the table and WRITE each stored name. Both names must remain Keyboard. Keep the supplied identifiers for assessment.", "باستخدام الأسماء المعطاة، احفظ صفين متطابقين (501، Keyboard) في lt_products بإضافة ls_product مرتين. غيّر اسم منطقة العمل فقط إلى Mouse بعد ذلك، دون إضافتها. استخدم LOOP AT وWRITE لعرض اسم كل صف محفوظ. يجب أن يبقى الاسمان Keyboard. احتفظ بالمعرّفات المعطاة للتقييم."),
  hint: t("Fill both fields before the first APPEND. A second APPEND copies the same values again. Changing the work area afterward does not update either stored row.", "املأ الحقلين قبل أول APPEND. تنسخ APPEND الثانية القيم نفسها مرة أخرى. لا يؤدي تغيير منطقة العمل بعدها إلى تحديث أي صف محفوظ."),
  starter: `${setup}\n* Fill, append twice, change the work area, then display stored names.\n`,
  starterAr: `${setup}\n* املأ الحقول وأضف صفين ثم غيّر منطقة العمل واعرض الأسماء المحفوظة.\n`,
  solution, expected: "Keyboard\nKeyboard",
};
export const dataMissions: Mission[] = [{
  id: "data-table-model", pathId: "data", prerequisite: "employees", minutes: 20, xp: 220,
  coveredTopics: ["Internal tables"],
  difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  references: ["https://learning.sap.com/courses/basic-abap-programming/working-with-simple-internal-tables_a4beb937-0c7b-45b9-92be-ff26a5159fad", "https://help.sap.com/docs/abap-cloud/abap-keywords/append", "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md"],
  title: t("Understand the internal table model", "افهم نموذج الجدول الداخلي"),
  subtitle: t("Row type, empty key and independent copies", "نوع الصف والمفتاح الفارغ والنسخ المستقلة"),
  brief: t("A product import can contain two identical records. A structure describes one product; an internal table holds many rows of that same type in program memory. A work area is a separate value used to prepare or read one row. In this lesson's standard table, APPEND preserves insertion order and allows duplicates. This browser exercise uses a restricted ABAP subset and does not save products to an SAP database.", "قد يحتوي ملف استيراد المنتجات على سجلين متطابقين. تصف البنية منتجًا واحدًا، ويحفظ الجدول الداخلي صفوفًا متعددة من النوع نفسه في ذاكرة البرنامج. منطقة العمل قيمة مستقلة لإعداد صف واحد أو قراءته. تحافظ APPEND في الجدول القياسي لهذا الدرس على ترتيب الإضافة وتسمح بالتكرار. يستخدم هذا التمرين مجموعة محدودة من ABAP في المتصفح، ولا يحفظ المنتجات في قاعدة بيانات SAP."),
  objectives: [t("Distinguish a row type, a table and a work area", "التمييز بين نوع الصف والجدول ومنطقة العمل"), t("Explain duplicates and work-area copy behavior", "تفسير تكرار الصفوف وسلوك نسخ منطقة العمل")],
  tokens: [...fundamentals.find(m => m.id === "tables")!.tokens, emptyKey, ...fundamentals.find(m => m.id === "loop-at")!.tokens],
  example: solution,
  visual: t("Step through both APPEND statements: the table grows from zero to two identical rows. At the Mouse assignment, compare ls_product with the table: stored names remain Keyboard. LOOP AT then copies each stored row back into the work area. Move backward to compare snapshots.", "تتبّع تعليمتي APPEND: ينتقل الجدول من صفر إلى صفين متطابقين. عند إسناد Mouse، قارن ls_product بالجدول: يبقى الاسمان المحفوظان Keyboard. تنسخ LOOP AT بعد ذلك كل صف محفوظ إلى منطقة العمل. ارجع خطوة لمقارنة لقطات الذاكرة."),
  practice: t("Predict the output before running. Change the second APPEND into a comment: how many names appear? Restore it, then move the Mouse assignment before the second APPEND. Predict which row changes and inspect the trace. Restore the original order for the challenge.", "توقّع المخرجات قبل التشغيل. حوّل APPEND الثانية إلى تعليق: كم اسمًا يظهر؟ أعدها ثم انقل إسناد Mouse إلى ما قبل APPEND الثانية. توقّع الصف الذي سيتغير وافحص التتبّع. أعد الترتيب الأصلي قبل التحدي."),
  challenges: [challenge], ...{ goal: challenge.goal, hint: challenge.hint, starter: challenge.starter, starterAr: challenge.starterAr, solution, expected: challenge.expected },
  quiz: t("Does changing a work area after APPEND change the stored row?", "هل يؤدي تغيير منطقة العمل بعد APPEND إلى تغيير الصف المحفوظ؟"),
  options: [t("No; APPEND copied its value", "لا؛ نسخت APPEND قيمتها"), t("Yes; they are the same storage", "نعم؛ يشتركان في موضع الذاكرة نفسه")], answer: 0,
  quizExplanation: t("For the integer and string fields used here, the stored row is independent of the work area. LOOP AT INTO also copies a row; updating that copy alone does not update the table. Reference-valued components are a later topic.", "بالنسبة إلى حقول الأعداد والنصوص المستخدمة هنا، يكون الصف المحفوظ مستقلًا عن منطقة العمل. تنسخ LOOP AT INTO الصف أيضًا؛ ولا يكفي تعديل هذه النسخة لتحديث الجدول. سنتناول الحقول ذات القيم المرجعية لاحقًا."),
}, tableCategoryMission, tableKeyMission, workAreaMission];
