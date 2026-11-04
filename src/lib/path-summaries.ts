import type { Text } from "./curriculum";

/** Learning outcomes, separate from topic labels used to track planned coverage. */
export const pathSummaries: Record<string, Text> = {
  fundamentals: {en: "Learn to write ABAP with variables, conditions, loops and employee records.", ar: "تعلّم كتابة ABAP باستخدام المتغيرات والشروط والحلقات وسجلات الموظفين."},
  data: {en: "Find, update and organize records in internal tables to build useful reports.", ar: "ابحث عن السجلات وعدّلها ونظّمها في الجداول الداخلية لبناء تقارير مفيدة."},
  dictionary: {en: "Understand how domains, data elements and fields form a reusable data model.", ar: "افهم كيف تكوّن النطاقات وعناصر البيانات والحقول نموذج بيانات قابلًا لإعادة الاستخدام."},
  database: {en: "Learn how ABAP SQL selects, filters and combines stored business data.", ar: "تعلّم كيف تختار ABAP SQL بيانات الأعمال المخزّنة وتصفيها وتربطها."},
  oop: {en: "Model business behavior with classes, independent objects and methods.", ar: "مثّل سلوك الأعمال باستخدام الأصناف والكائنات المستقلة والدوال الأعضاء."},
  applications: {en: "Follow the flow from user input and validation to SAP report output.", ar: "تتبّع العمل من إدخال المستخدم والتحقق منه إلى عرض نتائج تقارير SAP."},
  modern: {en: "Compare classic and modern syntax, then explore expressions and CDS data models.", ar: "قارن الصياغة التقليدية والحديثة، ثم استكشف التعبيرات ونماذج بيانات CDS."},
  cloud: {en: "Understand released APIs and how RAP connects data, behavior and services.", ar: "افهم الواجهات المُصدرة وكيف يربط RAP البيانات والسلوك والخدمات."},
  projects: {en: "Turn business requirements into data models, implementation stages and acceptance checks.", ar: "حوّل متطلبات الأعمال إلى نماذج بيانات ومراحل تنفيذ وفحوص قبول."},
};
