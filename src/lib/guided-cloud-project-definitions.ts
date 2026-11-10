import type { Text } from "./curriculum";
import type { GuidedDefinition } from "./guided-types";

const t = (en: string, ar: string): Text => ({ en, ar });
type Section = { id: string; title: Text; explanation: Text; detail: Text; code: string };
// Derive inclusive anatomy ranges from the displayed source, including separators.
function source(sections: Section[]) {
  let line = 1;
  const groups = sections.map((section, index) => {
    const start = line;
    const count = section.code.split("\n").length;
    line += count + (index < sections.length - 1 ? 1 : 0);
    return { id: section.id, start, end: line - 1, title: section.title, explanation: section.explanation, detail: section.detail };
  });
  return { code: sections.map((section) => section.code).join("\n\n"), groups };
}

const cloudSource = source([
  {
    id: "cloud-contract", title: t("1. Choose the development contract", "١. اختيار عقد التطوير"),
    explanation: t("ABAP Cloud is a development model with a restricted language version and released SAP dependencies; it is not simply ABAP hosted somewhere else.", "ABAP Cloud نموذج تطوير بإصدار لغة مقيّد واعتماديات SAP مُصدرة للاستخدام؛ وليس مجرد استضافة ABAP في مكان آخر."),
    detail: t("In an appropriate ADT project, inspect the package/software component and language version. Availability depends on the SAP product and release. Customer-owned objects still need suitable visibility; a Z prefix does not grant access to arbitrary packages.", "افحص الحزمة ومكوّن البرمجيات وإصدار اللغة في مشروع ADT مناسب. يتوقف التوفر على منتج SAP وإصداره. تحتاج كائنات العميل أيضاً إلى نطاق وصول مناسب؛ ولا تمنح البادئة Z وصولاً تلقائياً إلى كل الحزم."),
    code: `" ADT setup checklist; comments are not configuration statements.
" Package: customer development package in the permitted component
" ABAP language version: ABAP for Cloud Development
" SAP dependencies: check release state and applicable contract`,
  },
  {
    id: "cloud-class", title: t("2. A class-run entry point", "٢. نقطة دخول لتشغيل صنف"),
    explanation: t("IF_OO_ADT_CLASSRUN supplies an ADT console entry point where available. It does not create a web service.", "توفر IF_OO_ADT_CLASSRUN نقطة دخول لوحدة ADT عند توفرها. ولا تنشئ خدمة ويب."),
    detail: t("Create the class in ADT and verify interface availability in the target system. The academy explains this source; its restricted interpreter cannot activate classes, resolve release contracts or run an ADT console.", "أنشئ الصنف في ADT وتحقق من توفر الواجهة في النظام المستهدف. تشرح الأكاديمية المصدر؛ ولا يستطيع مفسّرها المقيّد تفعيل الأصناف أو التحقق من عقود الإصدار أو تشغيل وحدة ADT."),
    code: `CLASS zcl_academy_cloud_demo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.
CLASS zcl_academy_cloud_demo IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    out->write( 'Cloud development starts with a supported contract' ).
  ENDMETHOD.
ENDCLASS.`,
  },
  {
    id: "cloud-api", title: t("3. Review dependencies before reuse", "٣. مراجعة الاعتماديات قبل إعادة الاستخدام"),
    explanation: t("A technically callable SAP object is not automatically a supported API. Check the release state, contract, product scope and deprecation information before adopting it.", "إمكان استدعاء كائن SAP تقنياً لا يجعله تلقائياً واجهة مدعومة. افحص حالة الإصدار والعقد ونطاق المنتج ومعلومات الإهمال قبل اعتماده."),
    detail: t("A local released API and a remote API serve different consumption scenarios. Do not substitute an arbitrary unreleased function module or direct SAP-table write when no API is found. Investigate a supported extension point or redesign the integration.", "تخدم الواجهة المحلية المُصدرة والواجهة البعيدة سيناريوهات استهلاك مختلفة. لا تستبدلهما بوحدة دالة غير مُصدرة أو كتابة مباشرة إلى جدول SAP عند غياب الواجهة. ابحث عن نقطة توسعة مدعومة أو أعد تصميم التكامل."),
    code: `" Dependency review record (illustrative, no API name assumed)
" Need: read business data through a supported interface
" Evidence: target-product API catalog + ADT release state
" Decision: use only an available, permitted released API`,
  },
  {
    id: "cloud-exposure", title: t("4. Separate service scope from protocol", "٤. فصل نطاق الخدمة عن البروتوكول"),
    explanation: t("The service definition selects a CDS entity; a separate service binding chooses a protocol such as OData V4. Neither object alone supplies business validation or authorization.", "يختار تعريف الخدمة كيان CDS؛ ويختار ربط خدمة منفصل بروتوكولاً مثل OData V4. ولا يوفر أي منهما وحده تحقق الأعمال أو الصلاحيات."),
    detail: t("This separate repository object assumes ZC_AcademyEmployee already exists. Create and activate dependent CDS/behavior artifacts first, then choose a binding type supported by your environment. Publishing a local service is not a production deployment or a security review.", "يفترض كائن المستودع المنفصل وجود ZC_AcademyEmployee مسبقاً. أنشئ وفعّل كائنات CDS والسلوك المطلوبة أولاً، ثم اختر نوع ربط يدعمه نظامك. نشر خدمة محلية ليس نشراً إنتاجياً ولا مراجعة أمنية."),
    code: `@EndUserText.label: 'Academy employee service'
define service ZUI_AcademyEmployee {
  expose ZC_AcademyEmployee as Employees;
}
// ADT: create a separate supported OData V4 service binding`,
  },
]);

const cloud: GuidedDefinition = {
  id: "cloud-introduction", pathId: "cloud", prerequisite: "modern-syntax",
  title: t("ABAP Cloud and RAP foundations", "أساسيات ABAP Cloud وRAP"),
  subtitle: t("Trace a supported extension from package contract to service binding", "تتبّع توسعة مدعومة من عقد الحزمة إلى ربط الخدمة"),
  brief: t("A team wants an employee service that survives SAP upgrades. Review the language contract, choose supported dependencies, and distinguish a RAP business object from its OData exposure before writing integration code.", "يريد فريق خدمة موظفين تتحمل ترقيات SAP. راجع عقد اللغة واختر اعتماديات مدعومة وميّز كائن أعمال RAP عن إتاحته عبر OData قبل كتابة التكامل."),
  objectives: [
    t("Explain ABAP for Cloud Development and released API boundaries.", "شرح حدود ABAP for Cloud Development والواجهات المُصدرة."),
    t("Distinguish persistence, CDS, behavior, projection, service definition and binding.", "تمييز التخزين وCDS والسلوك والإسقاط وتعريف الخدمة وربطها."),
    t("Diagnose an unreleased dependency without bypassing clean-core constraints.", "تشخيص اعتمادية غير مُصدرة دون تجاوز قيود النواة النظيفة."),
    t("Identify what requires ADT and a real SAP environment.", "تحديد ما يتطلب ADT وبيئة SAP فعلية."),
  ],
  minutes: 35, xp: 220, difficulty: "intermediate",
  coveredTopics: ["ABAP Cloud", "Clean core", "Released APIs", "RAP", "Service definitions", "Service bindings", "OData"],
  references: [
    "https://help.sap.com/docs/abap-cloud/abap-cloud-background-concepts-and-overview/abap-cloud-development-model",
    "https://help.sap.com/docs/abap-cloud/abap-cloud/abap-language",
    "https://developers.sap.com/concepts/rap-service-binding/",
  ],
  boundary: t("Guided architecture and reference source only. No SAP tenant, ADT activation, API catalog lookup, RAP transaction or HTTP endpoint runs in this browser. Check product/release support and API state in your own environment; the snippets are separate repository artifacts, not one executable report.", "هذا درس معماري موجّه ومصدر مرجعي فقط. لا تعمل هنا بيئة SAP أو تفعيل ADT أو استعلام دليل الواجهات أو معاملة RAP أو نقطة HTTP. افحص دعم المنتج والإصدار وحالة الواجهات في بيئتك؛ والمقاطع كائنات مستودع منفصلة وليست تقريراً تنفيذياً واحداً."),
  practice: t("Inspect each artifact and follow its edges. Then decide how to resolve an unreleased dependency, locate business rules, and expose a service. For optional external practice, use an authorized SAP learning system and record the actual activation and authorization results.", "افحص كل كائن واتبع علاقاته. ثم قرر كيفية معالجة اعتمادية غير مُصدرة ووضع قواعد الأعمال وإتاحة الخدمة. وللتدريب الخارجي الاختياري، استخدم نظام SAP تعليمياً مصرحاً به وسجّل نتائج التفعيل والصلاحيات الفعلية."),
  ...cloudSource,
  artifacts: [
    { id: "package", title: t("Package and language contract", "الحزمة وعقد اللغة"), description: t("Defines the permitted development context; release checks apply to dependencies.", "يحدد سياق التطوير المسموح؛ وتخضع الاعتماديات لفحوص الإصدار."), example: "ABAP for Cloud Development" },
    { id: "api", title: t("Released dependency", "اعتمادية مُصدرة"), description: t("A supported local or remote API selected for the product and intended use.", "واجهة محلية أو بعيدة مدعومة تُختار وفق المنتج والاستخدام المقصود."), example: "Check API state + release contract in target system" },
    { id: "cds", title: t("CDS data model", "نموذج بيانات CDS"), description: t("Gives business fields and associations a semantic model; an annotation alone does not implement all security.", "يمنح حقول الأعمال والارتباطات نموذجاً دلالياً؛ ولا ينفذ تعليق توضيحي واحد كل الأمان."), example: "Root entity → service-specific projection" },
    { id: "behavior", title: t("RAP behavior", "سلوك RAP"), description: t("Declares operations and their implementations, validation, locking and authorization requirements.", "يصرح بالعمليات وتنفيذها ومتطلبات التحقق والقفل والصلاحيات."), example: "Create / update + validation + authorization" },
    { id: "service", title: t("Service definition", "تعريف الخدمة"), description: t("Chooses the entities exposed by a business service.", "يختار الكيانات التي تتيحها خدمة الأعمال."), example: "expose ZC_AcademyEmployee as Employees;" },
    { id: "binding", title: t("Service binding", "ربط الخدمة"), description: t("Associates a service definition with an environment-supported protocol and service type.", "يربط تعريف الخدمة ببروتوكول ونوع خدمة تدعمهما البيئة."), example: "ADT service binding → OData V4" },
    { id: "client", title: t("Authorized consumer", "مستهلك مصرح له"), description: t("Uses a published endpoint with appropriate identity, roles and communication configuration.", "يستخدم نقطة منشورة بهوية وأدوار وإعداد اتصال مناسب."), example: "HTTP request to an actual SAP endpoint (external only)" },
  ],
  relations: [
    { from: "package", to: "api", label: t("constrains reuse", "يقيّد إعادة الاستخدام") },
    { from: "cds", to: "behavior", label: t("models BO data for", "ينمذج بيانات كائن الأعمال من أجل") },
    { from: "cds", to: "service", label: t("projection is exposed by", "يُتاح الإسقاط عبر") },
    { from: "behavior", to: "service", label: t("projected operations reach", "تصل العمليات المسقطة إلى") },
    { from: "service", to: "binding", label: t("bound to protocol by", "يُربط بالبروتوكول بواسطة") },
    { from: "binding", to: "client", label: t("published endpoint serves", "تخدم النقطة المنشورة") },
  ],
  activityTitle: t("Review the upgrade-safe service plan", "راجع خطة خدمة قابلة للترقية"),
  activityIntro: t("Make four architecture decisions. Hints progress from a layer clue to the exact responsibility. Passing checks your design reasoning, not SAP deployment.", "اتخذ أربعة قرارات معمارية. تتدرج التلميحات من تحديد الطبقة إلى مسؤوليتها الدقيقة. يقيس النجاح استدلالك التصميمي وليس نشر SAP."),
  decisions: [
    { id: "cloud-release", prompt: t("An old report calls an unreleased SAP function module. What is the first migration step?", "يستدعي تقرير قديم وحدة دالة SAP غير مُصدرة. ما أول خطوة للترحيل؟"), options: [
      { id: "released", text: t("Find an available released API or supported extension point and check its contract.", "ابحث عن واجهة مُصدرة متاحة أو نقطة توسعة مدعومة وافحص عقدها.") },
      { id: "rename", text: t("Copy its name into a Z class to make the call supported.", "انسخ اسمها إلى صنف Z ليصبح الاستدعاء مدعوماً.") },
      { id: "direct", text: t("Replace it with direct writes to the SAP standard table.", "استبدلها بكتابة مباشرة إلى جدول SAP القياسي.") },
    ], correct: "released", explanation: t("A wrapper name does not change the dependency's release contract. Verify a supported replacement in the target product or revisit the extension design.", "لا يغير اسم الغلاف عقد إصدار الاعتمادية. تحقق من بديل مدعوم في المنتج المستهدف أو راجع تصميم التوسعة."), hints: [t("Check the dependency boundary before syntax.", "افحص حدود الاعتمادية قبل الصياغة."), t("Cloud reuse depends on a release contract and availability.", "تعتمد إعادة الاستخدام السحابية على عقد إصدار وتوفر فعلي."), t("Choose the supported API/extension-point investigation.", "اختر البحث عن واجهة أو نقطة توسعة مدعومة.")] },
    { id: "cloud-validation", prompt: t("Where should the rule 'employee name must not be empty' be enforced for writes through the BO?", "أين تُفرض قاعدة «يجب ألا يكون اسم الموظف فارغاً» للكتابة عبر كائن الأعمال؟"), options: [
      { id: "binding", text: t("Only in the service binding name.", "في اسم ربط الخدمة فقط.") },
      { id: "behavior", text: t("In RAP behavior validation with implemented failure/message handling.", "في تحقق سلوك RAP مع تنفيذ معالجة الفشل والرسائل.") },
      { id: "label", text: t("Only in a CDS display label.", "في تسمية عرض CDS فقط.") },
    ], correct: "behavior", explanation: t("A binding selects protocol and labels describe metadata. Implemented BO validation enforces the rule across relevant BO write consumers; a declaration alone is insufficient.", "يختار الربط البروتوكول وتصف التسميات البيانات الوصفية. يفرض تحقق كائن الأعمال المنفذ القاعدة على مستهلكي الكتابة المعنيين؛ ولا يكفي التصريح وحده."), hints: [t("Find the layer that owns transactional rules.", "حدد الطبقة المسؤولة عن قواعد المعاملات."), t("Metadata and transport do not implement validation.", "لا تنفذ البيانات الوصفية والنقل تحقق الأعمال."), t("Choose RAP behavior and implement its validation handler.", "اختر سلوك RAP ونفذ معالج التحقق.")] },
    { id: "cloud-protocol", prompt: t("A service definition exists. Which artifact chooses OData V4 exposure?", "يوجد تعريف خدمة. أي كائن يختار الإتاحة عبر OData V4؟"), options: [
      { id: "cds", text: t("The database key.", "مفتاح قاعدة البيانات.") },
      { id: "binding", text: t("A supported service binding referencing that definition.", "ربط خدمة مدعوم يشير إلى ذلك التعريف.") },
      { id: "console", text: t("The ADT class-run console.", "وحدة تشغيل الأصناف في ADT.") },
    ], correct: "binding", explanation: t("Definition = selected entities; binding = protocol/service type. Activation, publication and access configuration still require the SAP environment.", "التعريف يحدد الكيانات؛ والربط يحدد البروتوكول ونوع الخدمة. يظل التفعيل والنشر وإعداد الوصول بحاجة إلى بيئة SAP."), hints: [t("Separate what is exposed from how it is reached.", "افصل ما يُتاح عن طريقة الوصول إليه."), t("The service definition has no transport protocol selector.", "لا يختار تعريف الخدمة بروتوكول النقل."), t("Select the service binding.", "اختر ربط الخدمة.")] },
    { id: "cloud-proof", prompt: t("The academy architecture decisions all pass. What can you claim?", "نجحت كل القرارات المعمارية في الأكاديمية. ما الذي يمكنك ادعاؤه؟"), options: [
      { id: "production", text: t("A production OData service is deployed and secure.", "نُشرت خدمة OData إنتاجية وآمنة.") },
      { id: "review", text: t("The guided design assessment passed; actual activation, access and service tests remain external.", "نجح تقييم التصميم الموجّه؛ وما زالت اختبارات التفعيل والوصول والخدمة مطلوبة خارجياً.") },
      { id: "api", text: t("Every referenced API exists in every SAP release.", "تتوفر كل واجهة مذكورة في كل إصدارات SAP.") },
    ], correct: "review", explanation: t("Browser reasoning checks do not contact SAP. Record real environment evidence before claiming a deployed service or release compatibility.", "لا تتصل فحوص الاستدلال في المتصفح بـSAP. سجّل أدلة البيئة الفعلية قبل ادعاء نشر خدمة أو توافق إصدار."), hints: [t("Distinguish learning evidence from runtime evidence.", "ميّز دليل التعلم عن دليل التشغيل."), t("No SAP endpoint was contacted here.", "لم يجر الاتصال بنقطة SAP هنا."), t("Claim only the guided design assessment.", "اذكر نجاح تقييم التصميم الموجّه فقط.")] },
  ],
  quiz: t("Which chain correctly describes a RAP business service?", "أي تسلسل يصف خدمة أعمال RAP بشكل صحيح؟"),
  options: [t("CDS data model + behavior → service projection → service definition → protocol binding.", "نموذج CDS وسلوك → إسقاط للخدمة → تعريف خدمة → ربط بروتوكول."), t("A database table automatically becomes a secured OData endpoint.", "يتحول جدول قاعدة البيانات تلقائياً إلى نقطة OData آمنة."), t("A class console replaces a service binding.", "تحل وحدة تشغيل الصنف محل ربط الخدمة.")],
  answer: 0,
  quizExplanation: t("RAP separates business semantics, transactional behavior and service exposure. Each layer has its own activation and implementation responsibilities.", "يفصل RAP دلالات الأعمال وسلوك المعاملات وإتاحة الخدمة. ولكل طبقة مسؤولياتها في التفعيل والتنفيذ."),
};

export const guidedCloudProjectDefinitions: GuidedDefinition[] = [cloud];
