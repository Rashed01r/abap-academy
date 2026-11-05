import { defineAnatomy, sourceFingerprint, type CodeAnatomy } from "./code-anatomy";
import type { Text } from "./curriculum";
export type EmployeeRow = {id: number; name: string; salary: number};
export const comparisonEmployees: EmployeeRow[] = [{id:30,name:"Ahmed",salary:5000},{id:10,name:"Sara",salary:7000},{id:30,name:"Omar",salary:6000}];
export type Category = "standard" | "sorted" | "hashed";
export function employeeCategoryState(category: Category, count: number, unique: boolean) {
  const rows: EmployeeRow[] = []; let rejected = false;
  for (const row of comparisonEmployees.slice(0, count)) {
    if ((category === "hashed" || category === "sorted" && unique) && rows.some(r => r.id === row.id)) rejected = true;
    else if(category === "sorted") {
      // Single-row INSERT ... INTO TABLE places a new non-unique duplicate
      // before existing equal-key rows; this is not a stable SORT operation.
      const at=rows.findIndex(saved=>saved.id >= row.id);
      rows.splice(at < 0 ? rows.length : at,0,{...row});
    } else rows.push({...row});
  }
  return {rows, rejected};
}
const t = (en: string, ar: string): Text => ({en,ar});
export function referenceAnatomy(id: string, sections: {id: string; title: Text; explanation: Text; code: string}[]): CodeAnatomy {
  let line = 1;
  const source = sections.map(s => s.code).join("\n");
  const groups = sections.map(section => {const start = line; line += section.code.split("\n").length; return {id: section.id, lines: [start,line-1] as [number,number], title:section.title, explanation:section.explanation, practice:section.title};});
  return {...defineAnatomy(id, source, sourceFingerprint(source), groups, groups.map(g => g.id)), referenceOnly: true};
}
export function categoryReference(category: Category, unique: boolean, count: number, key: number) {
  const declaration = category === "standard" ? "STANDARD TABLE OF ty_employee WITH NON-UNIQUE KEY id" : category === "sorted" ? `SORTED TABLE OF ty_employee WITH ${unique ? "UNIQUE" : "NON-UNIQUE"} KEY id` : "HASHED TABLE OF ty_employee WITH UNIQUE KEY id";
  return referenceAnatomy(`visual-category-${category}-${unique}`, [
    {id:"shape",title:t("Describe an employee","وصف الموظف"),explanation:t("Every row keeps ID, name and salary together.","يجمع كل صف معرّف الموظف واسمه وراتبه."),code:"TYPES: BEGIN OF ty_employee,\n id TYPE i,\n name TYPE string,\n salary TYPE i,\nEND OF ty_employee."},
    {id:"category",title:t("Choose order and key rules","اختيار الترتيب وقواعد المفتاح"),explanation:t("STANDARD has numbered rows; SORTED maintains primary-key order; HASHED uses its full unique primary key without a primary index.","للجدول القياسي صفوف مرقمة؛ ويحافظ SORTED على ترتيب المفتاح الأساسي؛ ويستخدم HASHED مفتاحه الأساسي الفريد كاملاً دون فهرس أساسي."),code:`DATA lt_employees TYPE ${declaration}.\nDATA ls_employee TYPE ty_employee.`},
    {id:"insert",title:t("Insert the incoming records","إدراج السجلات الواردة"),explanation:t("A single-row INSERT INTO TABLE returns sy-subrc 4 when a unique primary key already exists. Non-unique keys can accept the repeated ID.","تعيد INSERT INTO TABLE لصف واحد القيمة sy-subrc = 4 إذا كان المفتاح الأساسي الفريد موجوداً. ويمكن للمفتاح غير الفريد قبول المعرّف المكرر."),code:comparisonEmployees.slice(0,count).map(row => `ls_employee-id = ${row.id}.\nls_employee-name = '${row.name}'.\nls_employee-salary = ${row.salary}.\nINSERT ls_employee INTO TABLE lt_employees.\nIF sy-subrc <> 0.\n  WRITE / 'Duplicate key'.\nENDIF.`).join("\n") || '" No rows inserted yet.'},
    {id:"lookup",title:t("Find by employee ID","البحث بمعرّف الموظف"),explanation:t("WITH KEY searches row content. It does not use a primary row index; check this read's status before displaying its copy.","تبحث WITH KEY في محتوى الصف. ولا تستخدم فهرس الصف الأساسي؛ افحص حالة القراءة قبل عرض نسختها."),code:`READ TABLE lt_employees INTO ls_employee WITH KEY id = ${key}.\nIF sy-subrc = 0.\n  WRITE / ls_employee-name.\nELSE.\n  WRITE / 'Not found'.\nENDIF.`},
  ]);
}
export function rowAccessState(mode: "copy" | "alias", name: string, edited: boolean, saved: boolean) {
  const original = {id:101,name:"Ahmed",salary:5000};
  const row = {...original, name:edited && (mode === "alias" || saved) ? name : original.name};
  return {before:original, row, workArea: mode === "copy" ? {...original,name:edited ? name : original.name} : undefined};
}
export function rowAccessReference(mode: "copy" | "alias", name: string, saved: boolean) {
  const quoted = name.replaceAll("'", "''");
  return referenceAnatomy(`visual-row-access-${mode}-${saved}`, [
    {id:"source",title:t("Save the original employee","حفظ الموظف الأصلي"),explanation:t("The table owns one saved row. The ID is kept read-only in this comparison; only a non-key name is edited.","يمتلك الجدول صفاً محفوظاً واحداً. يبقى المعرّف للقراءة فقط في هذه المقارنة؛ ويُعدّل الاسم غير الداخل في المفتاح فقط."),code:"TYPES: BEGIN OF ty_employee,\n id TYPE i,\n name TYPE string,\n salary TYPE i,\nEND OF ty_employee.\nDATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.\nDATA ls_employee TYPE ty_employee.\nls_employee-id = 101.\nls_employee-name = 'Ahmed'.\nls_employee-salary = 5000.\nAPPEND ls_employee TO lt_employees."},
    {id:"access",title:mode === "copy" ? t("Copy with INTO","النسخ باستخدام INTO") : t("Access the row with ASSIGNING","الوصول إلى الصف باستخدام ASSIGNING"),explanation:mode === "copy" ? t("INTO copies each current row into a separate work area.","تنسخ INTO الصف الحالي إلى منطقة عمل مستقلة.") : t("ASSIGNING binds the symbol to the actual current row; it creates no work-area copy.","تربط ASSIGNING الرمز بالصف الحالي الفعلي؛ ولا تنشئ نسخة في منطقة عمل."),code:mode === "copy" ? "LOOP AT lt_employees INTO ls_employee." : "FIELD-SYMBOLS <employee> TYPE ty_employee.\nLOOP AT lt_employees ASSIGNING <employee>."},
    {id:"edit",title:t("Change a non-key name","تغيير اسم غير داخل في المفتاح"),explanation:mode === "copy" ? t("The work-area name changes; the saved row stays Ahmed until an explicit write-back.","يتغير اسم منطقة العمل؛ ويبقى الصف المحفوظ Ahmed حتى إعادة كتابة صريحة.") : t("Writing through the assigned symbol changes the original table row. Sorted/hashed primary key fields must not be changed through this access.","تغيّر الكتابة عبر الرمز المرتبط صف الجدول الأصلي. لا يجوز تعديل حقول المفتاح الأساسي في SORTED أو HASHED عبر هذا الوصول."),code:`  ${mode === "copy" ? "ls_employee" : "<employee>"}-name = '${quoted}'.\nENDLOOP.`},
    ...(mode === "copy" && saved ? [{id:"save",title:t("Write the copy back explicitly","إعادة كتابة النسخة صراحة"),explanation:t("After the one-row loop, MODIFY replaces row 1 with the changed copy.","بعد حلقة الصف الواحد، تستبدل MODIFY الصف الأول بالنسخة المعدلة."),code:"MODIFY lt_employees FROM ls_employee INDEX 1."}] : []),
  ]);
}
