import type { GuidedDefinition } from "./guided-types";
import type { Text } from "./curriculum";

// ABAP Cloud and RAP path after the foundations lesson, English only while ENABLE_ARABIC = false.
// Reference lessons: none of this runs in the browser. Facts: .claude/skills/academy-lesson/references/sap-notes/cloud-rap.md
const t = (en: string): Text => ({ en });
const cheats = "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/";
type Section = [id: string, title: string, explanation: string, detail: string, code: string];
type Spec = {
  id: string; prerequisite: string; title: string; subtitle: string; topic: string; brief: string; objectives: string[]; minutes: number; xp: number;
  references: string[]; boundary: string; practice: string; sections: Section[];
  artifacts: [id: string, title: string, description: string, example: string][]; relations: [from: string, to: string, label: string][];
  decisions: [id: string, prompt: string, options: string[], correct: number, explanation: string, hints: [string, string]][];
  quiz: [question: string, options: string[], answer: number, explanation: string];
};

function lesson(s: Spec): GuidedDefinition {
  let line = 1;
  const groups = s.sections.map(([id, title, explanation, detail, code], i) => {
    const start = line; line += code.split("\n").length + (i < s.sections.length - 1 ? 1 : 0);
    return { id, start, end: line - 1, title: t(title), explanation: t(explanation), detail: t(detail) };
  });
  return {
    id: s.id, pathId: "cloud", prerequisite: s.prerequisite, title: t(s.title), subtitle: t(s.subtitle), brief: t(s.brief),
    objectives: s.objectives.map(t), minutes: s.minutes, xp: s.xp, difficulty: "advanced", coveredTopics: [s.topic], references: s.references,
    boundary: t(s.boundary), practice: t(s.practice), code: s.sections.map(x => x[4]).join("\n\n"), groups,
    artifacts: s.artifacts.map(([id, title, description, example]) => ({ id, title: t(title), description: t(description), example })),
    relations: s.relations.map(([from, to, label]) => ({ from, to, label: t(label) })),
    activityTitle: t("Check your decisions"), activityIntro: t("Make three decisions. Hints go from a clue to the exact rule."),
    decisions: s.decisions.map(([id, prompt, options, correct, explanation, hints]) => ({
      id, prompt: t(prompt), options: options.map((text, i) => ({ id: `o${i}`, text: t(text) })), correct: `o${correct}`, explanation: t(explanation), hints: hints.map(t),
    })),
    quiz: t(s.quiz[0]), options: s.quiz[1].map(t), answer: s.quiz[2], quizExplanation: t(s.quiz[3]),
  };
}

export const guidedCloudDefinitions: GuidedDefinition[] = [
  lesson({
    id: "cloud-adt", prerequisite: "cloud-introduction", topic: "ADT",
    title: "ADT: the tool for ABAP Cloud", subtitle: "Find a released API, write a class, run it and check it for cloud readiness",
    brief: "ABAP Cloud is developed in ABAP Development Tools for Eclipse (ADT). You connect a project, browse only the objects SAP released, write a class that ADT can run with F9, and let ATC tell you where code is not cloud-ready.",
    objectives: ["Say why ADT is the tool for ABAP Cloud", "Find a released API and read its API state", "Write and run a class-run class, and know what is not allowed", "Use ATC to find code that is not cloud-ready"],
    minutes: 25, xp: 200,
    references: [cheats + "19_ABAP_for_Cloud_Development.md", "https://help.sap.com/docs/abap-cloud/abap-keyword/abap-development-tools-for-eclipse"],
    boundary: "Reference lesson. ADT, the system connection, the Released Objects tree, F9 and ATC all need a real ABAP Cloud system; none of them run in this browser. Menu and view names can change between ADT versions.",
    practice: "Walk through the four parts. In the lab, make one decision per step and watch the design on the rail. If you have an ABAP Cloud trial or learning system, repeat the steps there.",
    sections: [
      ["adt-project", "1. Connect an ABAP project", "ADT is Eclipse plus the ABAP tooling. An ABAP project is your connection to one system.", "In ADT you create an ABAP project for the system and log on. The cheat sheet names ADT as the supported tool for ABAP Cloud development; SAP GUI transactions such as SE80 are not the way to build it.", `" ADT: File > New > ABAP Cloud Project (or ABAP project)
" System:  your ABAP Cloud / ABAP environment
" Then:    Project Explorer shows the packages and objects`],
      ["adt-released", "2. Find a released API", "Project Explorer has a Released Objects tree. An object's Properties show its API state and release contract.", "The cheat sheet example is class CL_ABAP_RANDOM_INT: its API State in the Properties shows contract C1. Ctrl+Shift+A opens the object search. Only released objects may be used in ABAP for Cloud Development.", `" Project Explorer > Released Objects
" Ctrl+Shift+A  : search for an object
" Properties > API State : read the release contract
" Example: CL_ABAP_RANDOM_INT shows contract C1`],
      ["adt-class", "3. Write a class and run it", "Executable reports are not allowed. A class that implements IF_OO_ADT_CLASSRUN is run with F9 and writes to the Console.", "The ABAP language scope is restricted: no REPORT, no WRITE list output. out->write( ) prints to the ADT Console view. Run the activated class with F9.", `CLASS zcl_academy_adt_demo DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.
CLASS zcl_academy_adt_demo IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    DATA(lo_random) = cl_abap_random_int=>create(
      seed = cl_abap_random=>seed( ) min = 1 max = 6 ).
    out->write( lo_random->get_next( ) ).
  ENDMETHOD.
ENDCLASS.`],
      ["adt-atc", "4. Check with ATC", "ATC can run a cloud-readiness check on your code. Findings appear in the ATC Problems view.", "The cheat sheet shows classic code producing errors and warnings in ATC Problems that mark it as not cloud-ready. Double-click a finding to see the detail and fix the cause.", `" Right-click the class > Run As > ABAP Test Cockpit
" Check variant: ABAP Cloud readiness
" Tab: ATC Problems  (double-click a finding)
" Fix: replace the unreleased object with a released API`],
    ],
    artifacts: [
      ["project", "ABAP project", "The connection from ADT to one ABAP system.", "ABAP Cloud Project > Project Explorer"],
      ["released", "Released Objects", "The only SAP objects ABAP for Cloud Development may use.", "Properties > API State = C1"],
      ["classrun", "Class-run class", "A class that implements IF_OO_ADT_CLASSRUN and runs with F9.", "out->write( ... )"],
      ["atc", "ATC check", "Finds code that is not cloud-ready.", "ATC Problems view"],
    ],
    relations: [["project", "released", "lets you browse"], ["released", "classrun", "supplies APIs for"], ["classrun", "atc", "is checked by"]],
    decisions: [
      ["adt-tool", "Which tool do you use to develop ABAP Cloud objects?", ["ABAP Development Tools for Eclipse (ADT)", "SAP GUI transaction SE80", "Any text editor, then paste into the system"], 0, "ADT is the supported tool for ABAP Cloud. SAP GUI tools are for classic ABAP.", ["Think about the tool built on Eclipse.", "ABAP Cloud has no SE80 workflow."]],
      ["adt-api", "You need random numbers. How do you know CL_ABAP_RANDOM_INT may be used?", ["It has a familiar name", "Its API State in Properties shows a release contract such as C1", "It compiles in a classic system"], 1, "Only objects released for ABAP Cloud are allowed. The API State tells you.", ["Where does ADT show release information?", "Look at Properties."]],
      ["adt-run", "How do you run a quick test of your logic in ADT?", ["Write a REPORT and press F8", "Implement IF_OO_ADT_CLASSRUN and press F9", "Use WRITE to fill a list"], 1, "Reports and list output are not available. A class-run class prints with out->write( ) to the Console.", ["Reports are not in the restricted language scope.", "Which interface has \"ADT\" in its name?"]],
    ],
    quiz: ["Where do cloud-readiness findings appear after an ATC run?", ["ATC Problems view in ADT", "SAP GUI transaction ST22", "The class-run Console"], 0, "ATC Problems lists errors and warnings for code that is not cloud-ready."],
  }),
  lesson({
    id: "cloud-rap-bo", prerequisite: "cloud-adt", topic: "RAP Business Objects",
    title: "RAP business objects", subtitle: "A root entity, child entities and the behavior that ties them together",
    brief: "A RAP business object is a tree of CDS entities with transactional behavior. The top of the tree is the root entity; children are linked by compositions and to-parent associations. The behavior definition then says what can be done with the tree.",
    objectives: ["Describe a RAP business object as a tree of CDS entities", "Define a root entity and a child with composition and to-parent association", "Say which entity is lock master and which is dependent", "Read a behavior definition for a root and a child"],
    minutes: 30, xp: 220,
    references: [cheats + "36_RAP_Behavior_Definition_Language.md", cheats + "08_EML_ABAP_for_RAP.md"],
    boundary: "Reference code for ADT and an ABAP Cloud system. Activating CDS entities and behavior definitions, and running a RAP business object, need a real system. The table names are lesson fixtures, not an existing SAP data model.",
    practice: "Read the four parts, then build the object in the lab by choosing one design option per step.",
    sections: [
      ["bo-root", "1. The root entity", "The root is the top of the tree and represents the business object. It uses define root view entity.", "A composition to the child says the child cannot live without its parent. The root exposes the child with _Items so consumers can navigate to it.", `define root view entity ZR_AcademyOrder
  as select from zaca_order
  composition [0..*] of ZR_AcademyOrderItem as _Items
{
  key order_id as OrderId,
      customer as Customer,
      _Items
}`],
      ["bo-child", "2. A child entity", "A child points back to its parent with a to-parent association.", "association to parent is the other half of the composition. Together they make the parent-child hierarchy a RAP framework can manage.", `define view entity ZR_AcademyOrderItem
  as select from zaca_order_item
  association to parent ZR_AcademyOrder as _Order
    on $projection.OrderId = _Order.OrderId
{
  key order_id as OrderId,
  key item_no  as ItemNo,
      product  as Product,
      _Order
}`],
      ["bo-root-behavior", "3. Behavior for the root", "The behavior definition belongs to the root and usually has the same name. The root is the lock master.", "managed means the framework supplies the standard operations and saving. The root declares the persistent table, the lock and authorization master, and which operations are enabled, including create by association for items.", `managed implementation in class zbp_r_academyorder unique;
strict ( 2 );
define behavior for ZR_AcademyOrder alias Order
  persistent table zaca_order
  lock master
  authorization master ( instance )
{
  create;
  update;
  delete;
  association _Items { create; }
}`],
      ["bo-child-behavior", "4. Behavior for the child", "The child depends on the root: it is not a lock or authorization master.", "A dependent entity names the parent: lock dependent by _Order and authorization dependent by _Order. The key fields that come from the parent are read-only.", `define behavior for ZR_AcademyOrderItem alias Item
  persistent table zaca_order_item
  lock dependent by _Order
  authorization dependent by _Order
{
  update;
  delete;
  field ( readonly ) OrderId;
  association _Order;
}`],
    ],
    artifacts: [
      ["root", "Root entity", "Top CDS entity of the tree. It represents the business object.", "define root view entity ZR_AcademyOrder"],
      ["child", "Child entity", "Depends on its parent through a to-parent association.", "association to parent ZR_AcademyOrder as _Order"],
      ["bdef", "Behavior definition", "Declares the operations and characteristics of the whole tree.", "managed implementation in class zbp_r_academyorder unique;"],
      ["pool", "Behavior pool", "The ABAP class that holds the implemented rules.", "zbp_r_academyorder"],
    ],
    relations: [["root", "child", "composes"], ["root", "bdef", "is described by"], ["bdef", "pool", "is implemented in"]],
    decisions: [
      ["bo-root-kind", "Which statement makes an entity the root of a RAP business object?", ["define root view entity", "define view entity with a long name", "define table entity"], 0, "The root of the composition tree uses define root view entity.", ["The keyword says root.", "Only the top entity is special."]],
      ["bo-lock", "In an order with items, which entity is the lock master?", ["The item", "The root (order)", "Both, to be safe"], 1, "The root is lock master. The child says lock dependent by _Order.", ["Who owns the whole tree?", "A child follows its parent."]],
      ["bo-link", "What links an item to its order in the data model?", ["A composition in the root and a to-parent association in the child", "A comment", "Two unrelated associations"], 0, "Composition and to-parent association together define the parent-child relationship.", ["There are two halves.", "One is on each side."]],
    ],
    quiz: ["What does a RAP business object consist of?", ["A tree of CDS entities plus a behavior definition", "One database table", "A single ABAP report"], 0, "The tree of entities carries the data, the behavior definition carries what can be done with it."],
  }),
  lesson({
    id: "cloud-behavior", prerequisite: "cloud-rap-bo", topic: "Behavior Definitions",
    title: "Behavior definitions", subtitle: "Operations, field control, validations and determinations",
    brief: "A behavior definition (BDEF) states what a business object can do: which operations exist, which fields are read-only or mandatory, and which validations and determinations run. The rules themselves are implemented in the behavior pool.",
    objectives: ["Read a behavior definition header and its characteristics", "Control fields and enable operations on purpose", "Tell a validation from a determination", "Read a validation in the behavior pool and know what it must not do"],
    minutes: 30, xp: 240,
    references: [cheats + "36_RAP_Behavior_Definition_Language.md", cheats + "08_EML_ABAP_for_RAP.md"],
    boundary: "Reference code for ADT and an ABAP Cloud system. Behavior definitions are activated and the behavior pool is generated in ADT; neither runs in this browser. Only a selection of the syntax is shown.",
    practice: "Read the four parts. In the lab, choose how to set the header, fields, rule and operations.",
    sections: [
      ["bdef-header", "1. Header and characteristics", "managed means the framework implements saving. The header names the behavior pool, the characteristics name the tables.", "strict ( 2 ) turns on stricter syntax checks. persistent table is only allowed for managed business objects. unmanaged would mean you provide the transactional buffer and every operation yourself.", `managed implementation in class zbp_r_academyemployee unique;
strict ( 2 );
define behavior for ZR_AcademyEmployee alias Employee
  persistent table zaca_employee
  lock master
  authorization master ( instance )`],
      ["bdef-fields", "2. Field control and operations", "Field control says which fields clients may set. Operations must be enabled explicitly.", "The EML cheat sheet says modifying operations are not enabled by default: write create, update and delete in the behavior definition if the business object should allow them.", `{
  field ( readonly ) EmployeeId;
  field ( mandatory ) Name, Department;

  create;
  update;
  delete;`],
      ["bdef-rules", "3. Validations and determinations", "A validation checks and rejects. A determination computes and changes data.", "validation ... on save runs at save time and reports problems. determination ... on modify runs when data changes and can set fields. internal action is a helper that only the BO itself can call.", `  validation checkName on save { create; field Name; }
  determination setDefaults on modify { create; }
  internal action recalculate;
}`],
      ["bdef-pool", "4. The validation in the behavior pool", "A validation reads the data, then reports failures. It never writes.", "The local handler class reads the instances with READ ENTITIES ... IN LOCAL MODE, puts failed keys into FAILED and a message into REPORTED. Changing data is the job of a determination or an action.", `CLASS lhc_employee DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS checkName FOR VALIDATE ON SAVE
      IMPORTING keys FOR Employee~checkName.
ENDCLASS.
CLASS lhc_employee IMPLEMENTATION.
  METHOD checkName.
    READ ENTITIES OF zr_academyemployee IN LOCAL MODE
      ENTITY Employee FIELDS ( Name ) WITH CORRESPONDING #( keys )
      RESULT DATA(employees).
    LOOP AT employees INTO DATA(employee) WHERE Name IS INITIAL.
      APPEND VALUE #( %tky = employee-%tky ) TO failed-employee.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`],
    ],
    artifacts: [
      ["header", "Header", "Implementation type, behavior pool and strictness.", "managed implementation in class zbp_... unique;"],
      ["fields", "Field control", "Which fields are read-only or mandatory.", "field ( readonly ) EmployeeId;"],
      ["ops", "Operations", "What clients can do: create, update, delete and actions.", "create; update; delete;"],
      ["rules", "Validations and determinations", "Rules implemented in the behavior pool.", "validation checkName on save { ... }"],
    ],
    relations: [["header", "fields", "applies to"], ["ops", "rules", "trigger"], ["fields", "rules", "are checked by"]],
    decisions: [
      ["bdef-ops", "A behavior definition has no create line. What can clients do?", ["Create anyway, create is the default", "Not create: modifying operations are not enabled by default", "Only create through SQL"], 1, "Operations must be written in the behavior definition to be available.", ["Is anything enabled for free?", "Check the EML note about modifying operations."]],
      ["bdef-rule", "You want a missing name to be rejected when the user saves. Which rule fits?", ["A determination on modify", "A validation on save", "A field with readonly"], 1, "A validation checks data and reports failures.", ["Rejecting means checking.", "Determinations compute values."]],
      ["bdef-write", "A validation needs to fill a CreatedAt field. What do you do?", ["Modify inside the validation", "Use a determination for that field", "Call COMMIT ENTITIES in the validation"], 1, "Validations only check. A determination is for computing and changing data.", ["Validations never change data.", "Which rule type changes data?"]],
    ],
    quiz: ["Which keyword makes the framework implement the standard operations and saving?", ["managed", "unmanaged", "abstract"], 0, "A managed implementation lets RAP supply the standard operations and the save sequence."],
  }),
  lesson({
    id: "cloud-eml", prerequisite: "cloud-behavior", topic: "EML",
    title: "EML: use a business object from ABAP", subtitle: "MODIFY, READ and COMMIT ENTITIES with their responses",
    brief: "Entity Manipulation Language (EML) is the ABAP subset for accessing RAP business objects. MODIFY ENTITIES and READ ENTITIES work on a transactional buffer. Nothing reaches the database until COMMIT ENTITIES.",
    objectives: ["Create or change instances with MODIFY ENTITIES", "Read the failed and reported responses", "Read instances with READ ENTITIES", "Persist with COMMIT ENTITIES and check the result"],
    minutes: 30, xp: 240,
    references: [cheats + "08_EML_ABAP_for_RAP.md", "https://help.sap.com/docs/abap-cloud/abap-keyword/commit-entities"],
    boundary: "Reference code for an ABAP Cloud system with the business object from the earlier lessons already activated. EML runs against a real RAP runtime; this browser only explains it. Instance data is invented for the lesson.",
    practice: "Read the four parts, then decide each step in the lab. Note which statements only change the buffer.",
    sections: [
      ["eml-modify", "1. Create with MODIFY ENTITIES", "MODIFY ENTITIES changes instances in the transactional buffer, not the database.", "%cid is a temporary key that links the request to the result. The response parameters MAPPED, FAILED and REPORTED tell you what happened.", `MODIFY ENTITIES OF zr_academyemployee
  ENTITY Employee
    CREATE FIELDS ( EmployeeId Name Department )
    WITH VALUE #( ( %cid = 'C1' EmployeeId = 101
                    Name = 'Ahmed' Department = 'IT' ) )
  MAPPED DATA(mapped)
  FAILED DATA(failed)
  REPORTED DATA(reported).`],
      ["eml-failed", "2. Look at the responses", "FAILED lists instances that could not be processed. REPORTED holds the messages.", "Always check FAILED before you go on. An empty FAILED means the requested change was accepted into the buffer, not that it is saved.", `IF failed IS NOT INITIAL.
  out->write( 'The change was rejected' ).
  RETURN.
ENDIF.`],
      ["eml-read", "3. Read with READ ENTITIES", "READ ENTITIES returns the instances as the business object sees them, including your unsaved changes.", "Reading through EML applies the business object's logic and authorization, instead of reading the table directly.", `READ ENTITIES OF zr_academyemployee
  ENTITY Employee FIELDS ( Name )
  WITH VALUE #( ( %key-EmployeeId = 101 ) )
  RESULT DATA(employees)
  FAILED DATA(read_failed).`],
      ["eml-commit", "4. Persist with COMMIT ENTITIES", "COMMIT ENTITIES starts the RAP save sequence and includes COMMIT WORK.", "It sets sy-subrc, so check it. It cannot be used inside behavior implementations. In an OData scenario the runtime performs it for you.", `COMMIT ENTITIES
  RESPONSE OF zr_academyemployee
  FAILED DATA(commit_failed)
  REPORTED DATA(commit_reported).
IF sy-subrc <> 0.
  out->write( 'Saving failed' ).
ENDIF.`],
    ],
    artifacts: [
      ["modify", "MODIFY ENTITIES", "Create, update, delete or run an action on instances, in the buffer.", "MODIFY ENTITIES OF ... CREATE ..."],
      ["response", "FAILED and REPORTED", "Responses that tell you what could not be done and why.", "FAILED DATA(failed)"],
      ["read", "READ ENTITIES", "Read instances through the business object.", "READ ENTITIES OF ... RESULT DATA(rows)"],
      ["commit", "COMMIT ENTITIES", "Starts the save sequence that writes to the database.", "COMMIT ENTITIES RESPONSE OF ..."],
    ],
    relations: [["modify", "response", "returns"], ["modify", "read", "is visible to"], ["modify", "commit", "is persisted by"]],
    decisions: [
      ["eml-saved", "After a successful MODIFY ENTITIES, is the new row in the database table?", ["Yes, MODIFY writes it", "No, it is in the transactional buffer until COMMIT ENTITIES", "Yes, after the method ends"], 1, "MODIFY only changes the buffer. COMMIT ENTITIES persists.", ["Where do the changes go first?", "What starts the save sequence?"]],
      ["eml-check", "What should you check right after MODIFY ENTITIES?", ["The FAILED response", "The clock", "Nothing, it always works"], 0, "FAILED lists what could not be processed.", ["Responses come back with the statement.", "Look at the names after MAPPED."]],
      ["eml-read", "Why READ ENTITIES instead of SELECT on the persistence table?", ["It is shorter", "It goes through the business object, including its logic and your unsaved changes", "SELECT is not allowed on any table"], 1, "EML reads the business object, not just the stored rows.", ["Who owns the rules?", "What about unsaved changes?"]],
    ],
    quiz: ["Which statement triggers the RAP save sequence in an EML consumer?", ["COMMIT ENTITIES", "MODIFY ENTITIES", "READ ENTITIES"], 0, "COMMIT ENTITIES persists the buffered changes and includes COMMIT WORK."],
  }),
  lesson({
    id: "cloud-service-bindings", prerequisite: "cloud-eml", topic: "Service Bindings",
    title: "Service bindings: expose the object", subtitle: "Projection, service definition, binding type and publishing",
    brief: "A consumer should not get the whole business object. A projection shapes it, a service definition chooses what is exposed, and a service binding picks the protocol and publishes it. Exposure is not authorization: access control still has to be defined.",
    objectives: ["Shape the consumer view with a projection view and projection behavior", "Write a service definition that exposes the projection", "Choose a binding type and publish the binding", "Explain why exposure does not grant access"],
    minutes: 30, xp: 240,
    references: [cheats + "36_RAP_Behavior_Definition_Language.md", "https://developers.sap.com/concepts/rap-service-binding/"],
    boundary: "Reference code for ADT and an ABAP Cloud system. Creating, activating and publishing a service binding and calling its URL need a real system and authorized users. Binding types available depend on the product and release.",
    practice: "Read the four parts, then build the service in the lab. Check which choice leaks fields or leaves the service unpublished.",
    sections: [
      ["svc-projection", "1. A projection for the consumer", "A projection view exposes only the fields one consumer needs.", "provider contract transactional_query declares the view as a projection of a RAP business object. It selects fields from the root view, so the service does not leak the whole entity.", `define root view entity ZC_AcademyEmployee
  provider contract transactional_query
  as projection on ZR_AcademyEmployee
{
  key EmployeeId,
      Name,
      Department
}`],
      ["svc-behavior", "2. A projection behavior", "A projection behavior lists which operations of the business object the service reuses.", "use create, use update and use delete take over operations that already exist in the underlying behavior definition. Leave out an operation and the service does not offer it.", `projection;
strict ( 2 );
define behavior for ZC_AcademyEmployee alias Employee
{
  use create;
  use update;
  use delete;
}`],
      ["svc-definition", "3. The service definition", "A service definition chooses which entities leave the system and under which names.", "Expose the projection, not the underlying root entity. The service definition has no protocol and no URL.", `@EndUserText.label: 'Academy employee service'
define service ZUI_AcademyEmployee {
  expose ZC_AcademyEmployee as Employees;
}`],
      ["svc-binding", "4. The service binding", "A service binding connects the definition to a protocol and publishes it.", "In ADT you choose a binding type such as OData V4 - UI or OData V4 - Web API, activate the binding, and publish it. Only then does it have a service URL. Access control still decides who may read the data.", `" ADT: New > Service Binding
" Name:     ZUI_ACADEMYEMPLOYEE_O4
" Type:     OData V4 - UI   (or: Web API)
" Service:  ZUI_AcademyEmployee
" Activate, then Publish, then open the URL / preview`],
    ],
    artifacts: [
      ["projection", "Projection view", "The consumer-shaped view of the business object.", "as projection on ZR_AcademyEmployee"],
      ["pbdef", "Projection behavior", "Operations the service reuses from the business object.", "use create; use update;"],
      ["servicedef", "Service definition", "Chooses which entities are exposed.", "expose ZC_AcademyEmployee as Employees;"],
      ["binding", "Service binding", "Protocol and publishing: gives the service a URL.", "OData V4 - UI, Published"],
    ],
    relations: [["projection", "pbdef", "gets operations from"], ["projection", "servicedef", "is exposed by"], ["servicedef", "binding", "is bound by"]],
    decisions: [
      ["svc-what", "What does a service definition decide?", ["The protocol, such as OData V4", "Which entities are exposed", "Who may read the data"], 1, "The definition selects the entities; the binding selects the protocol; access control decides who may read.", ["Think scope, not protocol.", "The binding is a different object."]],
      ["svc-publish", "The binding is activated but the client gets no URL. What is missing?", ["Publishing the binding", "A second service definition", "A bigger projection"], 0, "A binding must be published before the service is available.", ["Activate is not the same as publish.", "Look at the last step in ADT."]],
      ["svc-access", "The service is published. Can any user now read the employees?", ["Yes, exposure grants access", "No: access control and authorization are separate and still required", "Yes, but only on Tuesdays"], 1, "Exposure is not authorization. Define access control and behavior authorization.", ["Publishing is not security.", "Which objects define who may read?"]],
    ],
    quiz: ["Which object connects a service definition to OData V4?", ["The service binding", "The projection view", "The behavior pool"], 0, "The service binding chooses the protocol and publishes the service."],
  }),
  lesson({
    id: "cloud-btp", prerequisite: "cloud-service-bindings", topic: "SAP BTP",
    title: "SAP BTP: where ABAP Cloud runs", subtitle: "Choose a landscape and connect it safely with communication arrangements",
    brief: "ABAP Cloud code runs in an ABAP environment on SAP Business Technology Platform, or as in-app developer extensibility in SAP S/4HANA Cloud. Either way you use released APIs, and consumers or remote systems connect through communication scenarios and arrangements, not hard-coded logins.",
    objectives: ["Choose between side-by-side and in-app ABAP Cloud development", "Keep dependencies to released or remote APIs", "Explain what a communication scenario and arrangement do", "Avoid hard-coded endpoints and credentials"],
    minutes: 25, xp: 220,
    references: [cheats + "19_ABAP_for_Cloud_Development.md", "https://help.sap.com/docs/btp/sap-business-technology-platform/sap-business-technology-platform?version=Cloud"],
    boundary: "Reference lesson. SAP BTP, an ABAP environment, an S/4HANA Cloud system, and communication management apps are not available in this browser. Product and app names change between releases: check them in your own landscape.",
    practice: "Read the four parts, then choose a landscape and a safe connection in the lab. If you have a BTP trial or learning system, repeat the steps there.",
    sections: [
      ["btp-landscape", "1. Where does the code run?", "ABAP Cloud development is available side-by-side on SAP BTP or in-app in SAP S/4HANA Cloud.", "The cheat sheet lists SAP S/4HANA Cloud Public Edition and Private Edition as environments with released APIs, and an ABAP environment on SAP BTP as a place to develop. Pick by how tightly the extension must be coupled to the S/4HANA system.", `" Side-by-side : ABAP environment on SAP BTP
"                 own system, own lifecycle
" In-app       : developer extensibility in S/4HANA Cloud
"                 runs inside the S/4HANA Cloud system
" Both          : ABAP for Cloud Development, released APIs only`],
      ["btp-api", "2. Use released or remote APIs", "Code may use released local APIs, or call another system through a remote API.", "A local released API is called directly. For another system you use a remote API published there. SAP also asks you to follow the release contracts to keep upgrades safe.", `" Local:  released CDS view or class (API State: released)
" Remote: OData / HTTP service of another system
" Never:  unreleased SAP internals`],
      ["btp-scenario", "3. A communication scenario", "A communication scenario lists the services that a communication partner may use.", "For your own service, an inbound communication scenario names the service binding. The scenario is a design-time object transported with your code.", `" Communication scenario ZACA_EMPLOYEE_SCN
"   Inbound service: ZUI_ACADEMYEMPLOYEE_O4
"   Purpose:         allow a partner to use this service`],
      ["btp-arrangement", "4. A communication arrangement", "An arrangement connects a scenario to a communication system and user. It is configured, not coded.", "An administrator creates the arrangement. Code then gets its destination from the arrangement and sends the request, so the endpoint and credentials stay out of the source.", `DATA(lo_destination) =
  cl_http_destination_provider=>create_by_comm_arrangement(
    comm_scenario = 'ZACA_EMPLOYEE_SCN' ).
DATA(lo_client) =
  cl_web_http_client_manager=>create_by_http_destination( lo_destination ).
DATA(lo_response) =
  lo_client->execute( if_web_http_client=>get ).`],
    ],
    artifacts: [
      ["landscape", "Landscape", "Side-by-side on SAP BTP or in-app in S/4HANA Cloud.", "ABAP environment / developer extensibility"],
      ["api", "Released or remote API", "The only dependencies ABAP Cloud code may have.", "API State: released"],
      ["scenario", "Communication scenario", "Declares which services a partner may use.", "Inbound service ZUI_ACADEMYEMPLOYEE_O4"],
      ["arrangement", "Communication arrangement", "Links a scenario to a system and user, configured by an admin.", "Scenario + communication system + user"],
    ],
    relations: [["landscape", "api", "restricts to"], ["api", "scenario", "is described by"], ["scenario", "arrangement", "is activated by"]],
    decisions: [
      ["btp-where", "A new employee app has its own lifecycle and talks to several SAP systems. Which landscape fits?", ["Side-by-side on an ABAP environment on SAP BTP", "Inside the old SAP GUI system", "Modify SAP standard code"], 0, "A separate ABAP environment on SAP BTP fits an app with its own lifecycle that uses remote APIs.", ["Think side-by-side.", "Classic modifications are not upgrade-safe."]],
      ["btp-cred", "Your class must call another system. Where do the URL and credentials live?", ["In the source code", "In a communication arrangement that an administrator maintains", "In a comment"], 1, "Arrangements keep endpoints and credentials out of the code.", ["What can an admin configure without changing code?", "Hard-coded secrets are a security risk."]],
      ["btp-scenario", "What is a communication scenario for?", ["It lists the services a partner may use", "It stores the passwords", "It replaces the service binding"], 0, "The scenario names the services; the arrangement activates it for a system and user.", ["It is a design-time object.", "Think about which services are allowed."]],
    ],
    quiz: ["Which object holds the destination details so that code does not contain them?", ["A communication arrangement", "The service definition", "The projection view"], 0, "The arrangement is configured by an administrator and referenced by the code."],
  }),
];
