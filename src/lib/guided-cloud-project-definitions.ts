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

const projectSource = source([
  {
    id: "employee-table", title: t("1. Persist a minimal employee record", "١. تخزين سجل موظف مصغّر"),
    explanation: t("An owned table stores a UUID, display name and department code. Client and UUID form the key; the UUID is identity, not the employee's editable name.", "يخزن جدول مملوك UUID واسم العرض ورمز القسم. يشكل العميل وUUID المفتاح؛ فالهوية ليست اسم الموظف القابل للتعديل."),
    detail: t("Separate ADT table definition. This teaching slice intentionally excludes salary and personal identifiers. Decide retention, read authorization and audit requirements before handling actual employee data; a client key alone is not a security policy.", "تعريف جدول منفصل في ADT. يستبعد هذا الجزء التعليمي الراتب والمعرّفات الشخصية عمداً. حدد الاحتفاظ وصلاحيات القراءة والتدقيق قبل معالجة بيانات موظفين فعلية؛ فمفتاح العميل وحده ليس سياسة أمنية."),
    code: `@EndUserText.label : 'Academy employee learning data'
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table zaca_employee {
  key client        : abap.clnt not null;
  key employee_uuid : sysuuid_x16 not null;
  employee_name     : abap.char(80);
  department_code   : abap.char(10);
}`,
  },
  {
    id: "employee-root", title: t("2. Give persistence a business model", "٢. منح التخزين نموذج أعمال"),
    explanation: t("The root view entity names business fields independently of physical column names. RAP behavior refers to these CDS element names.", "يسمي كيان العرض الجذري حقول الأعمال باستقلال عن أسماء الأعمدة الفعلية. ويشير سلوك RAP إلى أسماء عناصر CDS هذه."),
    detail: t("The CHECK annotation requests applicable CDS access control; it does not create a DCL role. A missing DCL must never be presented as completed read authorization. Confirm supported types and annotations in the target release.", "يطلب التعليق CHECK تطبيق تحكم الوصول المناسب لـCDS؛ ولا ينشئ دور DCL. لا يجوز اعتبار غياب DCL اكتمالاً لصلاحيات القراءة. تحقق من دعم الأنواع والتعليقات في الإصدار المستهدف."),
    code: `@EndUserText.label: 'Employee business object'
@AccessControl.authorizationCheck: #CHECK
define root view entity ZI_AcademyEmployee
  as select from zaca_employee
{
  key employee_uuid as EmployeeUUID,
      employee_name as EmployeeName,
      department_code as DepartmentCode
}`,
  },
  {
    id: "employee-behavior", title: t("3. Declare the transaction contract", "٣. التصريح بعقد المعاملة"),
    explanation: t("Managed RAP supplies standard persistence handling; the behavior pool must implement declared global authorization and name validation. Managed UUID numbering is paired with a read-only UUID field.", "يوفر RAP المُدار معالجة التخزين القياسية؛ ويجب أن ينفذ مجمع السلوك الصلاحيات العامة والتحقق من الاسم المصرح بهما. ويقترن ترقيم UUID المُدار بحقل UUID للقراءة فقط."),
    detail: t("Reference BDEF, not a complete deployable BO. Generate zbp_i_academyemployee in ADT; implement authorization and validateName. Return failed Employee keys and reported messages for empty names. No handler, DCL, message class, ETag or draft implementation is supplied here. Avoid COMMIT WORK in handlers: RAP owns the transaction.", "هذا BDEF مرجعي وليس كائن أعمال مكتمل النشر. ولّد zbp_i_academyemployee في ADT ونفذ الصلاحيات وvalidateName. أعد مفاتيح Employee في failed ورسائل reported للأسماء الفارغة. لا يقدم هذا المقطع المعالج أو DCL أو صنف الرسائل أو ETag أو المسودات. تجنب COMMIT WORK في المعالجات لأن RAP يدير المعاملة."),
    code: `managed implementation in class zbp_i_academyemployee unique;
strict ( 2 );
define behavior for ZI_AcademyEmployee alias Employee
persistent table zaca_employee
lock master
authorization master ( global )
{
  create;
  update;
  field ( readonly, numbering : managed ) EmployeeUUID;
  field ( mandatory ) EmployeeName;
  validation validateName on save { create; field EmployeeName; }
  mapping for zaca_employee {
    EmployeeUUID = employee_uuid;
    EmployeeName = employee_name;
    DepartmentCode = department_code;
  }
}`,
  },
  {
    id: "employee-projection", title: t("4. Design the service-facing model", "٤. تصميم النموذج الموجه للخدمة"),
    explanation: t("The transactional projection chooses the data available to this service while reusing the underlying business object.", "يختار إسقاط المعاملات البيانات المتاحة لهذه الخدمة مع إعادة استخدام كائن الأعمال الأساسي."),
    detail: t("No salary or sensitive identifier appears in the service contract. This is minimization, not a substitute for access control. For multiple consumers, evaluate separate projections rather than exposing the entire persistence schema.", "لا يظهر راتب أو معرّف حساس في عقد الخدمة. هذا تقليل للبيانات وليس بديلاً عن التحكم في الوصول. قيّم إسقاطات منفصلة للمستهلكين المختلفين بدلاً من إتاحة مخطط التخزين كله."),
    code: `@EndUserText.label: 'Employee service projection'
@AccessControl.authorizationCheck: #CHECK
define root view entity ZC_AcademyEmployee
  provider contract transactional_query
  as projection on ZI_AcademyEmployee
{
  key EmployeeUUID,
      EmployeeName,
      DepartmentCode
}`,
  },
  {
    id: "employee-projected-behavior", title: t("5. Expose only required operations", "٥. إتاحة العمليات المطلوبة فقط"),
    explanation: t("Projection behavior reuses create and update. Delete is not part of this first-stage business requirement.", "يعيد سلوك الإسقاط استخدام الإنشاء والتحديث. والحذف خارج متطلبات الأعمال لهذا الجزء الأول."),
    detail: t("Projection use statements do not implement validation or permissions. Resolve behavior problems at the base BO, then confirm the intended operations reach the service. Draft and concurrency design remain later implementation work, not implicit features.", "لا تنفذ عبارات use في الإسقاط التحقق أو الصلاحيات. عالج مشاكل السلوك في كائن الأعمال الأساسي ثم تحقق من وصول العمليات المطلوبة إلى الخدمة. يظل تصميم المسودات والتزامن عملاً تنفيذياً لاحقاً وليس ميزات ضمنية."),
    code: `projection;
strict ( 2 );
define behavior for ZC_AcademyEmployee alias Employee
{
  use create;
  use update;
}`,
  },
  {
    id: "employee-service", title: t("6. Define exposure and its acceptance gate", "٦. تعريف الإتاحة وبوابة القبول"),
    explanation: t("The service definition exposes the projection as Employees. A separate ADT binding chooses OData V4; testing must prove allowed writes, rejected invalid writes and denied unauthorized access.", "يتيح تعريف الخدمة الإسقاط باسم Employees. ويختار ربط ADT منفصل OData V4؛ ويجب أن تثبت الاختبارات قبول الكتابات المسموحة ورفض غير الصالحة ومنع الوصول غير المصرح."),
    detail: t("External build order: table → root → base behavior/pool → projection → projection behavior → service → binding. Resolve activation errors before publication. Run a valid create, empty-name create, name-clearing update and unauthorized request; inspect persisted state as well as messages. Do not report this browser assessment as those tests.", "ترتيب البناء الخارجي: الجدول ← الجذر ← السلوك الأساسي ومجمعه ← الإسقاط ← سلوك الإسقاط ← الخدمة ← الربط. عالج أخطاء التفعيل قبل النشر. اختبر إنشاءً صالحاً وإنشاءً باسم فارغ وتحديثاً يمسح الاسم وطلباً غير مصرح؛ وافحص حالة التخزين والرسائل معاً. لا تعتبر تقييم المتصفح بديلاً عن تلك الاختبارات."),
    code: `@EndUserText.label: 'Employee first-stage service'
define service ZUI_AcademyEmployee {
  expose ZC_AcademyEmployee as Employees;
}
// Separate ADT binding: choose supported OData V4 service type
// Implement missing handlers + DCL before claiming access enforcement
// External evidence: activation, authorized CRUD scope, rejection tests`,
  },
]);

const employeeProject: GuidedDefinition = {
  id: "projects-employee-management", pathId: "projects", prerequisite: "cloud-introduction",
  title: t("Employee management: guided project design", "إدارة الموظفين: تصميم مشروع موجّه"),
  subtitle: t("First-stage requirements, RAP artifacts and acceptance reasoning", "متطلبات الجزء الأول وكائنات RAP ومنطق القبول"),
  brief: t("Build a defensible plan for a small department directory. HR may create employees and correct names; readers see only permitted directory fields. Trace the schema, RAP operations, service exposure and failure cases. This is the first guided project stage, not a finished employee management capstone.", "ابنِ خطة واضحة لدليل أقسام مصغّر. تنشئ الموارد البشرية الموظفين وتصحح الأسماء؛ ويطّلع القراء على حقول الدليل المسموحة فقط. تتبّع المخطط وعمليات RAP وإتاحة الخدمة وحالات الفشل. هذا الجزء الموجّه الأول للمشروع وليس مشروع إدارة موظفين نهائياً مكتملاً."),
  objectives: [
    t("Turn requirements into identity, field and operation constraints.", "تحويل المتطلبات إلى قيود للهوية والحقول والعمليات."),
    t("Explain how root and projection artifacts reuse a managed BO.", "شرح إعادة استخدام كائن أعمال مُدار عبر الجذر والإسقاط."),
    t("Locate validation, authorization and exposure failures at the responsible layer.", "تحديد طبقة أخطاء التحقق والصلاحيات والإتاحة."),
    t("Specify external implementation prerequisites and honest acceptance evidence.", "تحديد متطلبات التنفيذ الخارجي وأدلة قبول دقيقة."),
  ],
  minutes: 55, xp: 320, difficulty: "advanced",
  coveredTopics: ["Employee Management", "Capstone project", "Business requirements", "RAP architecture", "Project debugging", "Acceptance criteria"],
  references: [
    "https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/defining-business-objects-and-their-behavior",
    "https://help.sap.com/docs/abap-cloud/abap-rap/strict-mode-implementation-requirements",
    "https://help.sap.com/docs/abap-cloud/abap-rap/validations",
    "https://developers.sap.com/concepts/rap-service-binding/",
  ],
  boundary: t("Guided first-stage design assessment; SAP implementation remains required. The combined source contains separate ADT objects, not an executable report. It omits behavior-handler implementations, DCL roles, messages, ETag/concurrency strategy, draft, UI, transport and deployment. No employee records are stored and no SAP backend is contacted. Passing awards learning completion only, not capstone or production certification.", "هذا تقييم تصميم موجّه للجزء الأول؛ وما زال تنفيذ SAP مطلوباً. يجمع المصدر كائنات ADT منفصلة وليس تقريراً تنفيذياً. ولا يتضمن تنفيذ معالجات السلوك أو أدوار DCL أو الرسائل أو استراتيجية ETag والتزامن أو المسودات أو الواجهة أو النقل والنشر. لا تُخزّن سجلات موظفين ولا يُتصل بخادم SAP. يمنح النجاح إكمال التعلم فقط وليس شهادة مشروع نهائي أو جاهزية إنتاجية."),
  practice: t("Prerequisites: understand structures/keys, ABAP SQL, classes, CDS and the cloud lesson. Stage 1: agree directory fields and create/update scope. Stage 2: map artifacts and inspect reference code. Stage 3: reason through invalid names and authorization failures. Stage 4 outside the academy: use an authorized ADT/SAP system, implement missing handlers and roles, activate, test persisted outcomes and document evidence. Later stages add concurrency, UI, audit, transport and deployment review.", "المتطلبات السابقة: فهم البنى والمفاتيح وABAP SQL والأصناف وCDS ودرس السحابة. المرحلة ١: الاتفاق على حقول الدليل ونطاق الإنشاء والتحديث. المرحلة ٢: ربط الكائنات وفحص المصدر المرجعي. المرحلة ٣: تحليل الأسماء غير الصالحة وفشل الصلاحيات. المرحلة ٤ خارج الأكاديمية: استخدام نظام ADT وSAP مصرح به وتنفيذ المعالجات والأدوار الناقصة والتفعيل واختبار نتائج التخزين وتوثيق الأدلة. تضيف المراحل اللاحقة التزامن والواجهة والتدقيق والنقل ومراجعة النشر."),
  ...projectSource,
  artifacts: [
    { id: "requirements", title: t("Business acceptance plan", "خطة قبول الأعمال"), description: t("HR creates and updates nonempty names; no delete, salary or sensitive IDs in this slice. Define reader and editor permissions separately.", "تنشئ الموارد البشرية الأسماء غير الفارغة وتحدثها؛ ولا حذف أو رواتب أو معرّفات حساسة في هذا الجزء. حدد صلاحيات القراء والمحررين بصورة منفصلة."), example: "Valid create → saved; empty name → rejected; unauthorized edit → denied" },
    { id: "table", title: t("Owned persistence", "التخزين المملوك"), description: t("zaca_employee stores the UUID identity and minimal directory data.", "يخزن zaca_employee هوية UUID وأقل بيانات الدليل."), example: "client + employee_uuid → employee_name, department_code" },
    { id: "root", title: t("Root CDS entity", "كيان CDS الجذري"), description: t("ZI_AcademyEmployee exposes business element names; requires a deliberate read-access policy.", "يتيح ZI_AcademyEmployee أسماء عناصر الأعمال؛ ويتطلب سياسة وصول مقصودة للقراءة."), example: "employee_uuid AS EmployeeUUID" },
    { id: "behavior", title: t("Base behavior and pool", "السلوك الأساسي ومجمعه"), description: t("Managed create/update, UUID numbering, validation and authorization declarations; custom handlers must still be implemented.", "تصريحات الإنشاء والتحديث المُدارين وترقيم UUID والتحقق والصلاحيات؛ وما زال تنفيذ المعالجات المخصصة مطلوباً."), example: "validateName → failed keys + reported messages (implementation required)" },
    { id: "projection", title: t("Consumer projection", "إسقاط المستهلك"), description: t("ZC_AcademyEmployee selects fields; projection behavior reuses only create/update.", "يختار ZC_AcademyEmployee الحقول؛ ويعيد سلوك الإسقاط استخدام الإنشاء والتحديث فقط."), example: "use create; use update;" },
    { id: "service", title: t("Business service", "خدمة الأعمال"), description: t("ZUI_AcademyEmployee exposes the projection with public entity name Employees.", "يتيح ZUI_AcademyEmployee الإسقاط بالاسم العام Employees."), example: "expose ZC_AcademyEmployee as Employees;" },
    { id: "binding", title: t("Protocol binding", "ربط البروتوكول"), description: t("An environment-supported binding provides actual service exposure after activation/publication in SAP.", "يوفر ربط تدعمه البيئة الإتاحة الفعلية للخدمة بعد التفعيل والنشر في SAP."), example: "ADT OData V4 binding → SAP endpoint" },
    { id: "evidence", title: t("External acceptance evidence", "أدلة القبول الخارجي"), description: t("Record activation, successful permitted requests, rejected empty-name writes and denied access. Verify database state; a visible preview alone is insufficient.", "سجّل التفعيل والطلبات المسموحة الناجحة ورفض الأسماء الفارغة ومنع الوصول. تحقق من حالة قاعدة البيانات؛ فظهور المعاينة وحده لا يكفي."), example: "Arrange roles/data → request → status/message + persisted-state assertion" },
  ],
  relations: [
    { from: "requirements", to: "table", label: t("constrains stored fields", "يقيّد الحقول المخزنة") },
    { from: "requirements", to: "behavior", label: t("defines allowed operations and rules", "يحدد العمليات والقواعد المسموحة") },
    { from: "table", to: "root", label: t("provides persistence for", "يوفر التخزين لـ") },
    { from: "root", to: "behavior", label: t("supplies BO element names", "يوفر أسماء عناصر كائن الأعمال") },
    { from: "root", to: "projection", label: t("is projected by", "يُسقط بواسطة") },
    { from: "behavior", to: "projection", label: t("operations are reused through", "تُعاد عملياته عبر") },
    { from: "projection", to: "service", label: t("is exposed as Employees by", "يُتاح باسم Employees عبر") },
    { from: "service", to: "binding", label: t("receives a protocol through", "يتلقى بروتوكولاً عبر") },
    { from: "binding", to: "evidence", label: t("must be tested to produce", "يجب اختباره لإنتاج") },
    { from: "requirements", to: "evidence", label: t("sets acceptance criteria for", "يحدد معايير قبول") },
  ],
  activityTitle: t("Employee service design review", "مراجعة تصميم خدمة الموظفين"),
  activityIntro: t("Resolve a sequence of project review findings: data identity, validation, missing update exposure, security and acceptance. These decisions assess the first project stage only.", "عالج سلسلة من ملاحظات مراجعة المشروع: هوية البيانات والتحقق وغياب إتاحة التحديث والأمان والقبول. تقيّم هذه القرارات الجزء الأول من المشروع فقط."),
  decisions: [
    { id: "employee-identity", prompt: t("Two employees share a name, and HR must later correct either name. Which identity design supports this?", "يتشارك موظفان الاسم وتحتاج الموارد البشرية إلى تصحيح أي منهما لاحقاً. أي تصميم للهوية يدعم ذلك؟"), options: [
      { id: "uuid", text: t("A stable UUID key and an editable EmployeeName field.", "مفتاح UUID ثابت وحقل EmployeeName قابل للتعديل.") },
      { id: "name", text: t("Use the name as the only key and reject duplicates.", "استخدم الاسم مفتاحاً وحيداً وارفض التكرار.") },
      { id: "row", text: t("Use the current list position as the permanent employee key.", "استخدم موضع القائمة الحالي مفتاحاً دائماً للموظف.") },
    ], correct: "uuid", explanation: t("Stable identity survives duplicate or corrected display names. Managed UUID numbering is a RAP behavior capability, not the same as declaring a raw field type.", "تبقى الهوية الثابتة صالحة مع تكرار أسماء العرض أو تصحيحها. ترقيم UUID المُدار قدرة لسلوك RAP ولا يساوي مجرد تعريف نوع الحقل."), hints: [t("Names can change without changing the person.", "قد يتغير الاسم دون أن يتغير الشخص."), t("Separate identity from editable business attributes.", "افصل الهوية عن سمات الأعمال القابلة للتعديل."), t("Choose the stable UUID key.", "اختر مفتاح UUID الثابت.")] },
    { id: "employee-validation", prompt: t("The UI marks EmployeeName mandatory, but an API update clears it. What completes enforcement?", "تجعل الواجهة EmployeeName إلزامياً لكن تحديث API يمسحه. ما الذي يكمل فرض القاعدة؟"), options: [
      { id: "hide", text: t("Hide the API error and keep the empty name.", "أخفِ خطأ الواجهة واحتفظ بالاسم الفارغ.") },
      { id: "handler", text: t("Implement the BO on-save validation for create/name changes, returning failed keys and reported messages.", "نفذ تحقق كائن الأعمال عند الحفظ للإنشاء وتغييرات الاسم مع إعادة مفاتيح failed ورسائل reported.") },
      { id: "label", text: t("Change the field label to 'Required' without backend logic.", "غيّر تسمية الحقل إلى «مطلوب» دون منطق خلفي.") },
    ], correct: "handler", explanation: t("UI hints are insufficient for other consumers. Implement the declared validation and verify invalid create and update leave persisted data unchanged. The reference declaration does not supply that handler.", "لا تكفي تلميحات الواجهة للمستهلكين الآخرين. نفذ التحقق المصرح به وتأكد أن الإنشاء والتحديث غير الصالحين لا يغيران التخزين. ولا يقدم التصريح المرجعي ذلك المعالج."), hints: [t("An API can bypass UI controls.", "قد يتجاوز مستهلك API عناصر الواجهة."), t("Rules belong in implemented transactional behavior.", "تنتمي القواعد إلى سلوك المعاملات المنفذ."), t("Select on-save validation with failed/reported results.", "اختر تحقق الحفظ مع نتائج failed وreported.")] },
    { id: "employee-exposure", prompt: t("Base behavior allows update, but the service exposes no update operation. Which artifact should you inspect first?", "يسمح السلوك الأساسي بالتحديث لكن الخدمة لا تتيحه. أي كائن تفحص أولاً؟"), options: [
      { id: "table", text: t("Increase the table's name field length.", "زد طول حقل الاسم في الجدول.") },
      { id: "projection", text: t("Check that projection behavior uses update and the service exposes that projection.", "تحقق من use update في سلوك الإسقاط ومن إتاحة الخدمة لذلك الإسقاط.") },
      { id: "commit", text: t("Add COMMIT WORK to a validation handler.", "أضف COMMIT WORK إلى معالج التحقق.") },
    ], correct: "projection", explanation: t("A projection controls operation reuse for its consumer. Check activated artifacts and metadata after correcting the projection; RAP controls commits, so adding a handler commit is not a fix.", "يتحكم الإسقاط في إعادة استخدام العمليات لمستهلكه. افحص الكائنات المفعلة والبيانات الوصفية بعد تصحيح الإسقاط؛ ويدير RAP الاعتماد، لذا ليست إضافة COMMIT في المعالج حلاً."), hints: [t("Trace from the BO to the service-facing contract.", "تتبّع من كائن الأعمال إلى العقد الموجه للخدمة."), t("A base operation must be reused by the projection behavior.", "يجب إعادة استخدام العملية الأساسية في سلوك الإسقاط."), t("Inspect use update and the exposed projection.", "افحص use update والإسقاط المُتاح.")] },
    { id: "employee-security", prompt: t("A reviewer sees authorizationCheck: #CHECK and authorization master declarations. Is security complete?", "يرى المراجع authorizationCheck: #CHECK وتصريح authorization master. هل اكتمل الأمان؟"), options: [
      { id: "complete", text: t("Yes; annotations generate all reader and editor permissions.", "نعم؛ تولد التعليقات كل صلاحيات القراءة والتحرير.") },
      { id: "implement", text: t("No; implement appropriate DCL/read access and behavior authorization, configure roles, and test allowed and denied access.", "لا؛ نفذ DCL وصلاحيات القراءة المناسبة وصلاحيات السلوك، واضبط الأدوار واختبر السماح والمنع.") },
      { id: "public", text: t("Publish publicly to avoid authorization errors.", "انشرها للعامة لتجنب أخطاء الصلاحيات.") },
    ], correct: "implement", explanation: t("Declarations state responsibilities. They do not implement permission logic or assign business roles. Read access and transactional authorization need deliberate implementation and external negative tests.", "تحدد التصريحات المسؤوليات ولا تنفذ منطق الأذونات ولا تعيّن أدوار الأعمال. تحتاج القراءة وصلاحيات المعاملات إلى تنفيذ مقصود واختبارات منع خارجية."), hints: [t("A declared check is not an implemented policy.", "التصريح بفحص ليس تنفيذاً لسياسة."), t("Consider read access separately from write authorization.", "راجع وصول القراءة بصورة منفصلة عن صلاحيات الكتابة."), t("Require DCL/authorization implementation, roles and negative tests.", "اطلب تنفيذ DCL والصلاحيات والأدوار واختبارات المنع.")] },
    { id: "employee-acceptance", prompt: t("A service preview opens. What evidence is still needed before accepting this first implementation stage?", "تفتح معاينة الخدمة. ما الأدلة المتبقية لقبول مرحلة التنفيذ الأولى؟"), options: [
      { id: "screenshot", text: t("Only a screenshot of the preview.", "لقطة شاشة للمعاينة فقط.") },
      { id: "browser", text: t("Only the academy quiz result.", "نتيجة اختبار الأكاديمية فقط.") },
      { id: "tests", text: t("Real authorized create/update outcomes, invalid-name rejection, denied access and persisted-state checks in SAP.", "نتائج إنشاء وتحديث مصرح بهما ورفض الاسم غير الصالح ومنع الوصول وفحص التخزين فعلياً في SAP.") },
    ], correct: "tests", explanation: t("A preview proves neither validation nor permissions. Record actual requests, messages and resulting persisted state. Concurrency, UI, audit and deployment remain later gates, so do not claim the full capstone complete.", "لا تثبت المعاينة التحقق أو الصلاحيات. سجّل الطلبات والرسائل وحالة التخزين الناتجة فعلياً. ويظل التزامن والواجهة والتدقيق والنشر بوابات لاحقة، فلا تدّعِ اكتمال المشروع النهائي كله."), hints: [t("Acceptance follows business outcomes, including failures.", "يتبع القبول نتائج الأعمال بما فيها حالات الفشل."), t("Check both response and database state under different permissions.", "افحص الاستجابة وحالة قاعدة البيانات تحت صلاحيات مختلفة."), t("Choose the real positive and negative SAP tests.", "اختر اختبارات SAP الفعلية للنجاح والمنع.")] },
  ],
  quiz: t("Which statement accurately describes completion of this guided project?", "أي عبارة تصف إكمال هذا المشروع الموجّه بدقة؟"),
  options: [t("The full production HR system is deployed.", "نُشر نظام الموارد البشرية الإنتاجي كاملاً."), t("The first-stage design and review assessment is complete; SAP implementation, security and runtime acceptance remain external work.", "اكتمل تصميم الجزء الأول وتقييم مراجعته؛ وما زال تنفيذ SAP والأمان وقبول التشغيل عملاً خارجياً."), t("The browser has persisted employee records in SAP.", "خزّن المتصفح سجلات الموظفين في SAP.")],
  answer: 1,
  quizExplanation: t("This activity assesses requirements and architectural reasoning against reference artifacts. It does not implement the omitted handlers or test a real service, and it cannot certify a completed capstone.", "يقيّم النشاط المتطلبات والاستدلال المعماري على كائنات مرجعية. ولا ينفذ المعالجات المحذوفة ولا يختبر خدمة فعلية، ولا يمنح شهادة اكتمال مشروع نهائي."),
};

export const guidedCloudProjectDefinitions: GuidedDefinition[] = [cloud, employeeProject];
