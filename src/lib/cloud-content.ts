import type { Text } from "./curriculum";
import type { BeginnerLesson } from "./beginner-lessons";
import type { EducationSpec } from "./education-content";

// Education, beginner copy and tab data (Learn side panel, Explore designer, Challenge code review) for the ABAP Cloud and RAP path.
// English only while ENABLE_ARABIC = false. Reference teaching models: nothing runs in an SAP system.
// Facts: .claude/skills/academy-lesson/references/sap-notes/cloud-rap.md
const t = (en: string): Text => ({ en });

// ---------- Tab data used by src/components/cloud-lessons.tsx ----------
export type Kind = "ok" | "warn" | "bad";
export type CloudOption = [text: string, note: string, good: boolean];
export type CloudLessonData = {
  layers: [name: string, what: string][];
  tries: { part: number; title: string; options: [label: string, text: string, kind: Kind][] }[];
  notes: { part: number; title: string; code?: string; text: string }[];
  lab: { label: string; steps: { name: string; hint: string; title: string; intro: string; opts: CloudOption[]; code: string }[] };
  review: { title: string; intro: string; file: string; xp: number; lines: [code: string, bad: boolean, why: string][] };
};

export const cloudLessons: Record<string, CloudLessonData> = {
  "cloud-introduction": {
    layers: [["Development contract", "ABAP for Cloud Development"], ["Class-run entry point", "if_oo_adt_classrun"], ["Reviewed dependency", "released API only"], ["Service scope + protocol", "definition + binding"]],
    tries: [
      { part: 0, title: "Try it · which language version?", options: [["ABAP for Cloud Development", "Restricted language and released SAP dependencies only. This is the upgrade-safe contract.", "ok"], ["Standard ABAP", "Every SAP object is technically callable, but nothing guarantees it will exist after an upgrade.", "warn"]] },
      { part: 2, title: "Try it · what is the API's release state?", options: [["released", "Allowed. The release contract keeps this call working across upgrades.", "ok"], ["deprecated", "Allowed today, but plan the move: a successor API is named in the release information.", "warn"], ["unreleased", "Not allowed in ABAP Cloud. Look for a released API or a supported extension point instead.", "bad"]] },
    ],
    notes: [{ part: 3, title: "Two objects, two jobs", code: "service definition  → WHAT is exposed\nservice binding     → HOW (OData V4 ...)", text: "Neither one validates data or checks authorization. Those live in the behavior definition and access control." }],
    lab: { label: "RAP service designer", steps: [
      { name: "CDS entity", hint: "business model", title: "What does the service read?", intro: "RAP starts from a data model with business meaning.", opts: [["Root view entity on the table", "A business-level model that behavior and projections build on.", true], ["Expose the database table directly", "A table is not a RAP business object.", false]], code: "define root view entity ZI_Employee\n  as select from zaca_employee\n{ key employee_id, name, department }" },
      { name: "Behavior", hint: "operations, rules", title: "How are changes handled?", intro: "The behavior definition declares operations, validation and locking.", opts: [["managed + persistent table + validation", "RAP supplies create, update and delete; you add the rules.", true], ["No behavior definition", "Read-only: clients cannot create or change anything.", false]], code: "managed implementation in class zbp_employee unique;\ndefine behavior for ZI_Employee\n  persistent table zaca_employee\n{ create; update; delete;\n  validation checkDept on save { field department; } }" },
      { name: "Service definition", hint: "what is exposed", title: "Which entity leaves the system?", intro: "Expose a projection shaped for the consumer.", opts: [["The projection ZC_AcademyEmployee", "Only the fields this consumer needs.", true], ["The root entity ZI_Employee", "Leaks internal fields and operations.", false]], code: "define service ZUI_AcademyEmployee {\n  expose ZC_AcademyEmployee as Employees;\n}" },
      { name: "Service binding", hint: "protocol", title: "How is it reached?", intro: "The binding chooses the protocol. Only a published binding gives an endpoint.", opts: [["OData V4 - UI", "A supported type for Fiori elements.", true], ["No binding created", "The service definition alone has no URL.", false]], code: "service binding  ZUI_ACADEMYEMPLOYEE_O4\nprotocol         OData V4 - UI\nservice          ZUI_AcademyEmployee" },
    ] },
    review: { title: "Review a pull request for ABAP Cloud", intro: "A colleague submitted a class for an upgrade-safe employee service. Flag every line that ABAP for Cloud Development would not allow. Your own tables and released APIs are fine.", file: "zcl_employee_service.clas.abap", xp: 220, lines: [
      ["DATA lt_emp TYPE STANDARD TABLE OF zi_employee WITH EMPTY KEY.", false, ""],
      ["SELECT * FROM pa0001 INTO TABLE @DATA(lt_hr).", true, "PA0001 is an SAP standard table. Read it through a released CDS view or API instead."],
      ["SELECT employee_id, name FROM zaca_employee INTO TABLE @lt_emp.", false, ""],
      ["CALL FUNCTION 'HR_READ_INFOTYPE' EXPORTING pernr = lv_pernr.", true, "An unreleased function module: find a released API or a supported extension point."],
      ["WRITE: / lv_name.", true, "Classic list output is not available in ABAP Cloud. Use out->write( ) in a class-run."],
      ["DATA(lv_user) = cl_abap_context_info=>get_user_technical_name( ).", false, ""],
    ] },
  },
  "cloud-adt": {
    layers: [["ABAP project", "ADT connection"], ["Released API", "API State: C1"], ["Class-run class", "run with F9"], ["ATC check", "ATC Problems"]],
    tries: [
      { part: 1, title: "Try it · is this object allowed?", options: [["API State shows C1", "A release contract exists. ABAP for Cloud Development may use it.", "ok"], ["No release information", "Not released for ABAP Cloud. Search the Released Objects tree for a replacement.", "bad"]] },
      { part: 3, title: "Try it · what does ATC say?", options: [["Class with released APIs only", "No cloud-readiness findings.", "ok"], ["Class with an unreleased call", "An ATC Problems entry marks the line as not cloud-ready. Double-click it to see the detail.", "bad"]] },
    ],
    notes: [{ part: 2, title: "Run with F9", code: "out->write( 'Hello' ).   \" Console view", text: "Reports and WRITE lists are not in the restricted language scope. A class-run class prints to the Console." }],
    lab: { label: "ADT workflow designer", steps: [
      { name: "Project", hint: "connect", title: "How do you reach the system?", intro: "ABAP Cloud is developed in ADT.", opts: [["An ABAP project in ADT", "ADT is the supported tool for ABAP Cloud development.", true], ["SAP GUI transaction SE80", "SE80 is a classic tool, not the way to build ABAP Cloud objects.", false]], code: "ABAP Cloud Project\n  └ Project Explorer" },
      { name: "Find an API", hint: "released objects", title: "How do you find a dependency?", intro: "Only released objects may be used.", opts: [["Released Objects tree and API State", "Shows what is released and under which contract.", true], ["Reuse a function module you remember", "Remembered names are not release information.", false]], code: "Project Explorer > Released Objects\nProperties > API State = C1" },
      { name: "Run", hint: "class-run", title: "How do you test your code?", intro: "No reports in ABAP Cloud.", opts: [["Class with if_oo_adt_classrun, F9", "Runs in ADT and prints to the Console.", true], ["REPORT with WRITE and F8", "Executable programs are not allowed in the restricted scope.", false]], code: "INTERFACES if_oo_adt_classrun.\nMETHOD if_oo_adt_classrun~main.\n  out->write( 'Hello' ).\nENDMETHOD." },
      { name: "Check", hint: "ATC", title: "How do you find problems early?", intro: "Do not wait for an upgrade.", opts: [["Run ATC with the cloud readiness check", "Findings appear in ATC Problems.", true], ["Trust that it activates", "Activation does not prove the code is cloud-ready.", false]], code: "Run As > ABAP Test Cockpit\nCheck variant: ABAP Cloud readiness" },
    ] },
    review: { title: "Review a first ABAP Cloud class", intro: "A colleague ported a classic program. Flag every line that ABAP for Cloud Development would not allow.", file: "zcl_academy_adt_demo.clas.abap", xp: 200, lines: [
      ["INTERFACES if_oo_adt_classrun.", false, ""],
      ["REPORT zacademy_demo.", true, "Executable programs (reports) are not allowed in the restricted language scope. Use a class-run class."],
      ["WRITE: / 'Hello'.", true, "Classic list output is not available. Use out->write( )."],
      ["out->write( 'Hello' ).", false, ""],
      ["DATA(lo_random) = cl_abap_random_int=>create( seed = cl_abap_random=>seed( ) min = 1 max = 6 ).", false, ""],
      ["CALL FUNCTION 'POPUP_TO_CONFIRM' EXPORTING text_question = 'Run?'.", true, "A classic GUI popup function module. It is not a released API and there is no SAP GUI in ABAP Cloud."],
    ] },
  },
  "cloud-rap-bo": {
    layers: [["Root entity", "define root view entity"], ["Child entity", "to-parent association"], ["Root behavior", "lock master"], ["Child behavior", "lock dependent"]],
    tries: [{ part: 1, title: "Try it · can the item exist alone?", options: [["Item without an order", "Not in a composition: the child depends on its parent.", "bad"], ["Item created through the order", "Yes: create by association from the root.", "ok"]] }],
    notes: [{ part: 2, title: "Root behavior", text: "The behavior definition belongs to the root and usually has the same name. The root is the lock master." }],
    lab: { label: "Business object designer", steps: [
      { name: "Root", hint: "top of the tree", title: "How is the top entity defined?", intro: "A business object has exactly one root.", opts: [["define root view entity", "Marks the root of the composition tree.", true], ["define view entity", "A plain view entity is not the root of a business object.", false]], code: "define root view entity ZR_AcademyOrder\n  as select from zaca_order" },
      { name: "Child link", hint: "composition", title: "How is the item linked to the order?", intro: "The child cannot exist without its parent.", opts: [["composition + to-parent association", "Two halves of one parent-child relationship.", true], ["Two plain associations", "No lifecycle dependency: the framework cannot treat it as a child.", false]], code: "composition [0..*] of ZR_AcademyOrderItem as _Items\n...\nassociation to parent ZR_AcademyOrder as _Order" },
      { name: "Implementation", hint: "managed or unmanaged", title: "Who implements saving?", intro: "A new table and no legacy logic.", opts: [["managed + persistent table", "RAP supplies the buffer and standard operations.", true], ["unmanaged", "You must supply the buffer and every operation. Meant for existing logic.", false]], code: "managed implementation in class zbp_r_academyorder unique;\ndefine behavior for ZR_AcademyOrder alias Order\n  persistent table zaca_order" },
      { name: "Locking", hint: "who is master", title: "Which entity is the lock master?", intro: "One entity locks the whole tree.", opts: [["Root is master; item is dependent by _Order", "One lock for the tree.", true], ["Declare lock master on the item too", "Only the root can be lock master.", false]], code: "define behavior for ZR_AcademyOrderItem alias Item\n  lock dependent by _Order" },
    ] },
    review: { title: "Review the item behavior definition", intro: "A colleague copied the root behavior to the item. Flag every line that does not belong to a dependent entity.", file: "ZR_AcademyOrder.bdef", xp: 220, lines: [
      ["define behavior for ZR_AcademyOrderItem alias Item", false, ""],
      ["persistent table zaca_order_item", false, ""],
      ["lock master", true, "Only the root is lock master. A child writes lock dependent by _Order."],
      ["authorization master ( instance )", true, "A child takes its authorization from the root: authorization dependent by _Order."],
      ["field ( readonly ) OrderId;", false, ""],
      ["association _Order;", false, ""],
    ] },
  },
  "cloud-behavior": {
    layers: [["Header", "managed, strict"], ["Fields + operations", "readonly, create ..."], ["Rules", "validation, determination"], ["Implementation", "behavior pool"]],
    tries: [{ part: 2, title: "Try it · which rule type?", options: [["Reject an empty name on save", "Validation on save: it checks and reports. It never changes data.", "ok"], ["Fill CreatedAt automatically", "Determination on modify: it computes and may change fields.", "ok"], ["Change data inside a validation", "Not allowed. Move the change to a determination or an action.", "bad"]] }],
    notes: [{ part: 1, title: "Nothing is on by default", code: "create;\nupdate;\ndelete;", text: "Modifying operations must be written in the behavior definition, or clients cannot use them." }],
    lab: { label: "Behavior definition designer", steps: [
      { name: "Header", hint: "managed", title: "How is the object implemented?", intro: "A new business object with a new table.", opts: [["managed with persistent table", "RAP implements the standard operations and saving.", true], ["unmanaged", "You would implement the buffer and all operations yourself.", false]], code: "managed implementation in class zbp_r_academyemployee unique;\nstrict ( 2 );\ndefine behavior for ZR_AcademyEmployee alias Employee\n  persistent table zaca_employee" },
      { name: "Fields", hint: "control", title: "Which fields may clients set?", intro: "Generated keys should not be typed by clients.", opts: [["readonly key, mandatory name", "Clients cannot change the key and must supply the name.", true], ["No field control", "Clients may set any field, including generated ones.", false]], code: "field ( readonly ) EmployeeId;\nfield ( mandatory ) Name, Department;" },
      { name: "Operations", hint: "enable", title: "Which operations exist?", intro: "Be explicit.", opts: [["create; update; delete; written out", "Exactly the operations the object allows.", true], ["Assume CRUD is on by default", "Modifying operations are not enabled by default.", false]], code: "create;\nupdate;\ndelete;" },
      { name: "Rules", hint: "validation", title: "Where is the name check?", intro: "Reject empty names when saving.", opts: [["validation checkName on save", "A validation checks and reports failures.", true], ["A validation that sets a default name", "Validations must not change data. Use a determination.", false]], code: "validation checkName on save { create; field Name; }" },
    ] },
    review: { title: "Review the validation method", intro: "A colleague wrote the name validation in the behavior pool. Flag every line that a validation must not contain.", file: "zbp_r_academyemployee.clas.locals_imp.abap", xp: 240, lines: [
      ["METHODS checkName FOR VALIDATE ON SAVE IMPORTING keys FOR Employee~checkName.", false, ""],
      ["READ ENTITIES OF zr_academyemployee IN LOCAL MODE ENTITY Employee FIELDS ( Name ) WITH CORRESPONDING #( keys ) RESULT DATA(employees).", false, ""],
      ["MODIFY ENTITIES OF zr_academyemployee IN LOCAL MODE ENTITY Employee UPDATE FIELDS ( Name ) WITH VALUE #( ( %tky = employee-%tky Name = 'N/A' ) ).", true, "A validation only checks. Changing data belongs to a determination or an action."],
      ["APPEND VALUE #( %tky = employee-%tky ) TO failed-employee.", false, ""],
      ["INSERT zaca_employee FROM @ls_row.", true, "A direct database write bypasses the transactional buffer. Change data through EML in a determination or action."],
      ["COMMIT ENTITIES.", true, "COMMIT ENTITIES cannot be used in behavior implementations. The RAP runtime runs the save sequence."],
    ] },
  },
  "cloud-eml": {
    layers: [["Created in buffer", "MODIFY ENTITIES"], ["Responses checked", "FAILED, REPORTED"], ["Read back", "READ ENTITIES"], ["Saved", "COMMIT ENTITIES"]],
    tries: [{ part: 0, title: "Try it · is it in the database yet?", options: [["After MODIFY ENTITIES", "Not yet. The change is in the transactional buffer only.", "warn"], ["After COMMIT ENTITIES", "Yes, if the save sequence succeeded. Check sy-subrc.", "ok"]] }],
    notes: [{ part: 1, title: "Check before you go on", code: "IF failed IS NOT INITIAL.\n  RETURN.\nENDIF.", text: "An empty FAILED means the change was accepted into the buffer, not that it is saved." }],
    lab: { label: "EML consumer designer", steps: [
      { name: "Change", hint: "MODIFY", title: "How do you create an employee?", intro: "Use the business object, not the table.", opts: [["MODIFY ENTITIES with %cid and responses", "Goes through the object's validations and rules.", true], ["INSERT into the table", "Bypasses the business object's logic.", false]], code: "MODIFY ENTITIES OF zr_academyemployee\n  ENTITY Employee\n    CREATE FIELDS ( EmployeeId Name )\n    WITH VALUE #( ( %cid = 'C1' EmployeeId = 101 Name = 'Ahmed' ) )\n  FAILED DATA(failed) REPORTED DATA(reported)." },
      { name: "Responses", hint: "FAILED", title: "What do you do with the response?", intro: "Something may have been rejected.", opts: [["Check FAILED and read REPORTED", "You know what was rejected and why.", true], ["Ignore the responses", "A rejected change would go unnoticed.", false]], code: "IF failed IS NOT INITIAL.\n  RETURN.\nENDIF." },
      { name: "Read", hint: "READ", title: "How do you read it back?", intro: "Include unsaved changes.", opts: [["READ ENTITIES", "Reads through the object, including buffered changes.", true], ["SELECT from the persistence table", "Sees only stored rows and skips the object's logic.", false]], code: "READ ENTITIES OF zr_academyemployee\n  ENTITY Employee FIELDS ( Name )\n  WITH VALUE #( ( %key-EmployeeId = 101 ) )\n  RESULT DATA(employees)." },
      { name: "Save", hint: "COMMIT", title: "How do you persist?", intro: "Nothing is stored yet.", opts: [["COMMIT ENTITIES, then check sy-subrc", "Starts the save sequence and tells you the outcome.", true], ["Do nothing", "The changes stay in the buffer and are lost.", false]], code: "COMMIT ENTITIES\n  RESPONSE OF zr_academyemployee\n  FAILED DATA(commit_failed).\nIF sy-subrc <> 0. ... ENDIF." },
    ] },
    review: { title: "Review an EML consumer", intro: "A colleague wrote a class that renames an employee. Flag every line that does not belong in a RAP consumer.", file: "zcl_employee_client.clas.abap", xp: 240, lines: [
      ["MODIFY ENTITIES OF zr_academyemployee ENTITY Employee UPDATE FIELDS ( Name ) WITH VALUE #( ( EmployeeId = 102 Name = 'Sarah' ) ) FAILED DATA(failed).", false, ""],
      ["UPDATE zaca_employee SET name = 'Sarah' WHERE employee_id = 102.", true, "A direct table update bypasses the business object's validations and the transactional buffer. Use MODIFY ENTITIES."],
      ["IF failed IS NOT INITIAL.", false, ""],
      ["READ ENTITIES OF zr_academyemployee IN LOCAL MODE ENTITY Employee ALL FIELDS WITH VALUE #( ( EmployeeId = 102 ) ) RESULT DATA(rows).", true, "IN LOCAL MODE is for the business object's own behavior pool. A consumer reads without it."],
      ["COMMIT ENTITIES.", false, ""],
      ["ROLLBACK ENTITIES.", false, ""],
    ] },
  },
  "cloud-service-bindings": {
    layers: [["Projection view", "consumer fields"], ["Projection behavior", "use create ..."], ["Service definition", "expose ... as"], ["Binding published", "OData V4 - UI"]],
    tries: [{ part: 3, title: "Try it · which binding type?", options: [["OData V4 - UI", "For SAP Fiori elements apps that use UI annotations.", "ok"], ["OData V4 - Web API", "For other consumers that call the API without a generated UI.", "ok"], ["Activated but not published", "No service URL yet. Publish the binding.", "bad"]] }],
    notes: [{ part: 2, title: "Definition is not binding", code: "service definition  → WHAT is exposed\nservice binding     → HOW and where", text: "The definition has no protocol and no URL. The binding supplies both once it is published." }],
    lab: { label: "Service designer", steps: [
      { name: "Projection", hint: "consumer view", title: "What does the consumer see?", intro: "Shape the object for one consumer.", opts: [["A projection view with the needed fields", "Only the fields this consumer needs.", true], ["Expose the root entity as is", "Leaks internal fields.", false]], code: "define root view entity ZC_AcademyEmployee\n  provider contract transactional_query\n  as projection on ZR_AcademyEmployee\n{ key EmployeeId, Name, Department }" },
      { name: "Operations", hint: "projection behavior", title: "Which operations does the service offer?", intro: "Reuse only what is needed.", opts: [["use create; use update; use delete;", "Offers those operations from the business object.", true], ["No projection behavior", "The service is read-only: editing apps cannot save.", false]], code: "projection;\ndefine behavior for ZC_AcademyEmployee alias Employee\n{ use create; use update; use delete; }" },
      { name: "Definition", hint: "scope", title: "What does the service definition expose?", intro: "Name the entity the client sees.", opts: [["The projection as Employees", "The consumer-shaped view.", true], ["The root entity ZR_AcademyEmployee", "Exposes the whole entity.", false]], code: "define service ZUI_AcademyEmployee {\n  expose ZC_AcademyEmployee as Employees;\n}" },
      { name: "Binding", hint: "publish", title: "How does the client reach it?", intro: "A binding gives the URL.", opts: [["OData V4 binding, activated and published", "The service becomes available.", true], ["Activate the binding only", "Not published: there is no service URL.", false]], code: "Service Binding ZUI_ACADEMYEMPLOYEE_O4\nType: OData V4 - UI\nActivate > Publish" },
    ] },
    review: { title: "Review the service artifacts", intro: "A colleague prepared the exposure of the employee object. Flag every line that exposes too much or removes protection.", file: "ZUI_AcademyEmployee.srvd", xp: 240, lines: [
      ["define service ZUI_AcademyEmployee {", false, ""],
      ["expose ZR_AcademyEmployee as Employees;", true, "This exposes the whole root entity. Expose the projection ZC_AcademyEmployee instead."],
      ["@AccessControl.authorizationCheck: #NOT_REQUIRED", true, "Switching off the authorization check lets any user read the data. Exposure is not authorization: define access control."],
      ["projection;", false, ""],
      ["use update;", false, ""],
      ["use create;", false, ""],
    ] },
  },
  "cloud-btp": {
    layers: [["Landscape", "BTP or S/4HANA Cloud"], ["Released or remote API", "supported dependencies"], ["Communication scenario", "allowed services"], ["Communication arrangement", "system + user"]],
    tries: [{ part: 0, title: "Try it · where does it run?", options: [["Side-by-side: ABAP environment on SAP BTP", "Its own system and lifecycle. Uses released or remote APIs of other systems.", "ok"], ["In-app: developer extensibility in S/4HANA Cloud", "Runs inside the S/4HANA Cloud system with released objects, for tightly coupled extensions.", "ok"], ["Classic custom code copied unchanged", "Not upgrade-safe by contract. Rewrite it with released APIs first.", "bad"]] }],
    notes: [{ part: 3, title: "Configured, not coded", text: "An administrator creates the arrangement. The code asks for a destination by scenario, so URL and credentials stay out of the source." }],
    lab: { label: "Landscape and connection designer", steps: [
      { name: "Landscape", hint: "where", title: "Where does the code run?", intro: "A new app with its own lifecycle.", opts: [["Side-by-side on an ABAP environment", "Own system and lifecycle.", true], ["Copy classic code into the cloud system", "Classic code is not upgrade-safe.", false]], code: "ABAP environment on SAP BTP\nlanguage version: ABAP for Cloud Development" },
      { name: "Dependencies", hint: "APIs", title: "What may the code call?", intro: "Keep to supported interfaces.", opts: [["Released and remote APIs", "Supported contracts.", true], ["Unreleased SAP internals", "May change or vanish at an upgrade.", false]], code: "\" Local: released CDS view or class\n\" Remote: OData / HTTP service" },
      { name: "Scenario", hint: "exposure", title: "How is your service opened to a partner?", intro: "Say which services a partner may use.", opts: [["An inbound communication scenario", "Lists the allowed services.", true], ["Hard-code a user in the code", "A security risk and not configurable.", false]], code: "Communication scenario ZACA_EMPLOYEE_SCN\n  Inbound service: ZUI_ACADEMYEMPLOYEE_O4" },
      { name: "Arrangement", hint: "connection", title: "Where do endpoint and credentials live?", intro: "Keep secrets out of the source.", opts: [["Communication arrangement kept by an administrator", "Configured, not coded.", true], ["Share a developer's login", "Not auditable and not safe.", false]], code: "Arrangement = scenario + communication system + user" },
    ] },
    review: { title: "Review a remote call", intro: "A colleague wrote a class that calls another system. Flag every line that hard-codes what a communication arrangement should hold.", file: "zcl_academy_remote_client.clas.abap", xp: 220, lines: [
      ["DATA(lo_destination) = cl_http_destination_provider=>create_by_comm_arrangement( comm_scenario = 'ZACA_EMPLOYEE_SCN' ).", false, ""],
      ["DATA(lo_client) = cl_web_http_client_manager=>create_by_http_destination( lo_destination ).", false, ""],
      ["DATA(lv_url) = 'https://my-system.example.com/api/employees'.", true, "A hard-coded endpoint. The destination from the arrangement already holds it."],
      ["lo_client->get_http_request( )->set_authorization_basic( i_username = 'DEV1' i_password = 'secret' ).", true, "Hard-coded credentials. The communication arrangement supplies the user."],
      ["DATA(lo_response) = lo_client->execute( if_web_http_client=>get ).", false, ""],
      ["lo_client->close( ).", false, ""],
    ] },
  },
};

// ---------- Education (concepts) ----------
type Concept = EducationSpec["concepts"][number];
// [name, explanation, misconception, learn group, learn artifact, assess ids]
type Row = [name: string, explanation: string, misconception: string, group: string, artifact: string, assess: string[]];
const spec = (what: string, why: string, rows: Row[]): EducationSpec => ({
  what: t(what), why: t(why),
  concepts: rows.map(([name, explanation, misconception, group, artifact, assess], i): Concept => ({
    id: `${group.split("-")[0]}${i + 1}`, name: t(name), explanation: t(explanation), misconception: t(misconception), objectives: [i], learn: [`group:${group}`, `artifact:${artifact}`], demonstrate: "guided", assess,
  })),
});

export const cloudEducation: Record<string, EducationSpec> = {
  "cloud-adt": spec("ADT is the supported tool for ABAP Cloud: you connect a project, use released objects, run class-run classes and check with ATC.", "Work in the one tool that ABAP Cloud supports and learn to find and fix cloud-readiness problems early.", [
    ["An ABAP project in ADT", "ADT is Eclipse with ABAP tooling. The ABAP project is the connection to one system.", "SAP GUI transactions are not the way to build ABAP Cloud objects.", "adt-project", "project", ["adt-tool"]],
    ["Released objects and API state", "The Released Objects tree and the Properties > API State show what ABAP for Cloud Development may use.", "A familiar object name is not release information.", "adt-released", "released", ["adt-api"]],
    ["Class-run classes", "A class with IF_OO_ADT_CLASSRUN runs with F9 and writes to the Console. Reports and WRITE lists are not available.", "A report with WRITE is not an ABAP Cloud program.", "adt-class", "classrun", ["adt-run"]],
    ["ATC cloud-readiness check", "ATC lists code that is not cloud-ready in the ATC Problems view.", "Successful activation does not prove the code is cloud-ready.", "adt-atc", "atc", ["knowledge-check"]],
  ]),
  "cloud-rap-bo": spec("A RAP business object is a tree of CDS entities, linked by compositions, with one behavior definition.", "Understand the data side of RAP before you write behavior: which entity is the root, and how children depend on it.", [
    ["The root entity", "The top of the composition tree is defined with define root view entity and represents the business object.", "A normal view entity is not a business object root.", "bo-root", "root", ["bo-root-kind"]],
    ["Child entity and association", "A composition in the parent and an association to parent in the child form the hierarchy.", "Two ordinary associations do not make a parent-child relationship.", "bo-child", "child", ["bo-link"]],
    ["Root behavior", "The behavior definition belongs to the root, names the persistent table and makes the root lock and authorization master.", "A behavior definition is not a separate object for each table.", "bo-root-behavior", "bdef", ["concept-check"]],
    ["Child behavior", "A dependent entity uses lock dependent by and authorization dependent by its parent.", "A child cannot be lock master.", "bo-child-behavior", "pool", ["bo-lock", "knowledge-check"]],
  ]),
  "cloud-behavior": spec("A behavior definition states which operations a business object offers, which fields are controlled and which rules run.", "Place each rule in the right artifact: field control, operation, validation, determination.", [
    ["Header and characteristics", "managed lets RAP implement the standard operations and saving; the characteristics name the tables and masters.", "unmanaged is not just another word for managed: you implement the buffer and every operation.", "bdef-header", "header", ["concept-check"]],
    ["Field control and operations", "Field control marks fields read-only or mandatory. Operations must be enabled explicitly.", "Create, update and delete are not on by default.", "bdef-fields", "ops", ["bdef-ops"]],
    ["Validation and determination", "A validation checks and reports; a determination computes and may change data.", "A validation does not change data.", "bdef-rules", "rules", ["bdef-rule"]],
    ["The behavior pool", "A validation reads with READ ENTITIES ... IN LOCAL MODE and reports failures; it does not write or commit.", "COMMIT ENTITIES is not allowed in behavior implementations.", "bdef-pool", "fields", ["bdef-write", "knowledge-check"]],
  ]),
  "cloud-eml": spec("EML is the ABAP subset for using RAP business objects: MODIFY, READ and COMMIT ENTITIES.", "Use business objects from ABAP without bypassing their rules, and know when data is really saved.", [
    ["MODIFY ENTITIES", "MODIFY ENTITIES creates, updates or deletes instances in the transactional buffer.", "MODIFY does not write to the database.", "eml-modify", "modify", ["eml-saved"]],
    ["FAILED and REPORTED", "The responses tell you what was rejected and why. Check FAILED before you continue.", "An empty FAILED does not mean the data is saved.", "eml-failed", "response", ["eml-check"]],
    ["READ ENTITIES", "READ ENTITIES reads through the business object, including unsaved changes.", "SELECT on the persistence table does not see buffered changes.", "eml-read", "read", ["eml-read"]],
    ["COMMIT ENTITIES", "COMMIT ENTITIES starts the save sequence, includes COMMIT WORK and sets sy-subrc.", "COMMIT ENTITIES is not for behavior implementations.", "eml-commit", "commit", ["knowledge-check", "concept-check"]],
  ]),
  "cloud-service-bindings": spec("A projection shapes the object for one consumer, a service definition exposes it and a published service binding gives it a protocol and URL.", "Expose a business object safely: only the needed fields and operations, and with access control still in place.", [
    ["The projection view", "A projection view with provider contract transactional_query exposes only the fields one consumer needs.", "The root entity is not meant to be exposed as is.", "svc-projection", "projection", ["concept-check"]],
    ["Projection behavior", "use create, use update and use delete reuse operations from the business object.", "A projection behavior does not invent new logic.", "svc-behavior", "pbdef", ["knowledge-check"]],
    ["Service definition", "A service definition chooses the exposed entities and their names. It has no protocol.", "A service definition is not a URL.", "svc-definition", "servicedef", ["svc-what"]],
    ["Service binding", "A binding chooses the protocol and must be published. Exposure does not grant access.", "Activating a binding is not publishing it, and publishing is not authorization.", "svc-binding", "binding", ["svc-publish", "svc-access"]],
  ]),
  "cloud-btp": spec("ABAP Cloud runs side-by-side on SAP BTP or in-app in SAP S/4HANA Cloud, and connections go through communication scenarios and arrangements.", "Choose a landscape and connect systems without hard-coded endpoints or credentials.", [
    ["Choosing a landscape", "Side-by-side means an ABAP environment on SAP BTP; in-app means developer extensibility in S/4HANA Cloud.", "Classic code can be copied unchanged into a cloud system.", "btp-landscape", "landscape", ["btp-where"]],
    ["Released and remote APIs", "ABAP Cloud code uses released local APIs or remote APIs of other systems.", "Unreleased internals are not available just because they exist.", "btp-api", "api", ["concept-check"]],
    ["Communication scenario", "A communication scenario lists the services a partner may use.", "A scenario is not a password store.", "btp-scenario", "scenario", ["btp-scenario"]],
    ["Communication arrangement", "An arrangement links a scenario to a communication system and user and is configured by an administrator.", "The URL and credentials do not belong in the source code.", "btp-arrangement", "arrangement", ["btp-cred", "knowledge-check"]],
  ]),
};

// ---------- Beginner Learn/Challenge copy ----------
export const cloudBeginner: Record<string, Pick<BeginnerLesson, "ideas" | "mistakes" | "check" | "challenge">> = {
  "cloud-adt": {
    ideas: [["ADT is the tool.", "ABAP Cloud is developed in ABAP Development Tools for Eclipse."], ["Only released objects.", "Properties > API State tells you which ones."], ["Classes, not reports.", "A class-run class runs with F9."]],
    mistakes: [
      { title: "Writing a report", wrong: "REPORT zdemo.\nWRITE 'Hello'.", right: "INTERFACES if_oo_adt_classrun.\nout->write( 'Hello' ).", why: "Executable programs and list output are not in the restricted language scope." },
      { title: "Guessing that an object is allowed", wrong: "CALL FUNCTION 'POPUP_TO_CONFIRM' ...", right: "\" Check Released Objects and API State first", why: "Only released objects may be used. A name you remember is not release information." },
      { title: "Skipping ATC", wrong: "\" it activates, so it is cloud-ready", right: "\" run ATC with the cloud readiness check", why: "Activation does not prove the code is cloud-ready. ATC lists what is not." },
    ],
    check: { question: "Which view lists the cloud-readiness findings of an ATC run?", options: ["ATC Problems", "Console", "Project Explorer"], answer: 0, explanation: "ATC Problems lists errors and warnings. The Console shows class-run output." },
    challenge: { title: "Prepare a class for ABAP Cloud", must: ["Choose the tool.", "Choose how to know an object is allowed.", "Choose how to run and check it."], hints: ["Which tool is built on Eclipse?", "Properties has an API State."] },
  },
  "cloud-rap-bo": {
    ideas: [["A business object is a tree.", "CDS entities linked by compositions."], ["One root.", "define root view entity at the top."], ["Children depend on the root.", "lock dependent by _Order."]],
    mistakes: [
      { title: "A plain view as the top", wrong: "define view entity ZR_AcademyOrder", right: "define root view entity ZR_AcademyOrder", why: "Only a root view entity can be the top of a business object." },
      { title: "Two lock masters", wrong: "define behavior for ZR_AcademyOrderItem\n  lock master", right: "define behavior for ZR_AcademyOrderItem\n  lock dependent by _Order", why: "Only the root is lock master. A child depends on it." },
      { title: "Only half of the link", wrong: "composition [0..*] of ZR_AcademyOrderItem as _Items\n\" the item has no to-parent association", right: "association to parent ZR_AcademyOrder as _Order\n  on $projection.OrderId = _Order.OrderId", why: "Composition and to-parent association belong together." },
    ],
    check: { question: "Which entity is the lock master of an order with items?", options: ["The root", "The item", "Both"], answer: 0, explanation: "The root is lock master. The item names lock dependent by _Order." },
    challenge: { title: "Design an order business object", must: ["Choose the root definition.", "Choose how the item is linked.", "Choose who is lock master."], hints: ["Look for the word root.", "There are two halves to the link."] },
  },
  "cloud-behavior": {
    ideas: [["Operations are explicit.", "Write create, update and delete."], ["Validation checks.", "It reports failures and never changes data."], ["Determination computes.", "It may set fields when data changes."]],
    mistakes: [
      { title: "Assuming CRUD is on", wrong: "define behavior for ZR_AcademyEmployee\n{ }", right: "define behavior for ZR_AcademyEmployee\n{ create; update; delete; }", why: "Modifying operations are not enabled by default." },
      { title: "Changing data in a validation", wrong: "METHOD checkName.\n  MODIFY ENTITIES ... UPDATE ...", right: "METHOD setDefaults.  \" determination\n  MODIFY ENTITIES ... UPDATE ...", why: "A validation only checks. Use a determination or an action to change data." },
      { title: "Committing in a handler", wrong: "METHOD checkName.\n  COMMIT ENTITIES.", right: "METHOD checkName.\n  \" report failed and reported, nothing more", why: "COMMIT ENTITIES cannot be used in behavior implementations." },
    ],
    check: { question: "Which rule type rejects an empty name when the user saves?", options: ["A validation on save", "A determination on modify", "An internal action"], answer: 0, explanation: "A validation checks data and reports failures." },
    challenge: { title: "Define the employee behavior", must: ["Choose the implementation type.", "Choose how operations are enabled.", "Choose the rule type for the name check."], hints: ["Is anything on by default?", "Which rule type must not change data?"] },
  },
  "cloud-eml": {
    ideas: [["MODIFY changes the buffer.", "Nothing is in the database yet."], ["Check FAILED.", "It tells you what was rejected."], ["COMMIT ENTITIES saves.", "Then check sy-subrc."]],
    mistakes: [
      { title: "Writing to the table directly", wrong: "UPDATE zaca_employee SET name = 'Sarah' ...", right: "MODIFY ENTITIES OF zr_academyemployee ...", why: "A direct update bypasses the business object's validations." },
      { title: "Never committing", wrong: "MODIFY ENTITIES ... CREATE ...\n\" done", right: "MODIFY ENTITIES ... CREATE ...\nCOMMIT ENTITIES ...", why: "Without COMMIT ENTITIES the changes stay in the buffer." },
      { title: "Ignoring FAILED", wrong: "MODIFY ENTITIES ... FAILED DATA(failed).\nCOMMIT ENTITIES.", right: "IF failed IS NOT INITIAL.\n  RETURN.\nENDIF.", why: "A rejected change should stop you before the commit." },
    ],
    check: { question: "Where is the data right after a successful MODIFY ENTITIES?", options: ["In the transactional buffer", "In the database table", "Nowhere"], answer: 0, explanation: "COMMIT ENTITIES moves buffered changes to the database." },
    challenge: { title: "Rename an employee through EML", must: ["Choose how to change the data.", "Choose what to check next.", "Choose how to persist."], hints: ["Which statement works on the business object?", "Which response lists rejected changes?"] },
  },
  "cloud-service-bindings": {
    ideas: [["A projection shapes the view.", "Only the fields a consumer needs."], ["A definition exposes it.", "expose ... as Employees."], ["A binding publishes it.", "Protocol and URL come from the binding."]],
    mistakes: [
      { title: "Exposing the root entity", wrong: "expose ZR_AcademyEmployee as Employees;", right: "expose ZC_AcademyEmployee as Employees;", why: "Expose the projection, so the consumer sees only what it needs." },
      { title: "Forgetting to publish", wrong: "\" binding activated, so the URL works", right: "\" activate, then publish", why: "A binding must be published before the service is available." },
      { title: "Trusting exposure as security", wrong: "@AccessControl.authorizationCheck: #NOT_REQUIRED", right: "\" define access control and behavior authorization", why: "Exposure is not authorization. Access control still has to be defined." },
    ],
    check: { question: "Which object chooses OData V4?", options: ["The service binding", "The service definition", "The projection view"], answer: 0, explanation: "The definition chooses the entities; the binding chooses the protocol." },
    challenge: { title: "Expose the employee object", must: ["Choose what the consumer sees.", "Choose what the service definition exposes.", "Choose what makes the URL available."], hints: ["Shape the view first.", "A binding has two steps."] },
  },
  "cloud-btp": {
    ideas: [["Two landscapes.", "Side-by-side on SAP BTP, or in-app in S/4HANA Cloud."], ["Supported APIs only.", "Released or remote APIs."], ["Connections are configured.", "Scenarios and arrangements, not code."]],
    mistakes: [
      { title: "A hard-coded endpoint", wrong: "DATA(lv_url) = 'https://my-system.example.com/api'.", right: "cl_http_destination_provider=>create_by_comm_arrangement( ... )", why: "The destination from the arrangement already holds the endpoint." },
      { title: "A hard-coded login", wrong: "set_authorization_basic( i_username = 'DEV1' i_password = 'secret' )", right: "\" the arrangement supplies the user", why: "Credentials in source code are a security risk and cannot be changed without a transport." },
      { title: "Copying classic code unchanged", wrong: "\" copy the classic report into the cloud system", right: "\" rewrite with released APIs in a class", why: "Classic code is not upgrade-safe by contract and is often not allowed at all." },
    ],
    check: { question: "Who creates a communication arrangement?", options: ["An administrator, by configuration", "The class at runtime, from a hard-coded user", "The service definition"], answer: 0, explanation: "It is configured, not coded. The code only references the scenario." },
    challenge: { title: "Connect to another system safely", must: ["Choose where the code runs.", "Choose what the code may call.", "Choose where the endpoint and user live."], hints: ["Which landscape has its own lifecycle?", "Who maintains the arrangement?"] },
  },
};

// ---------- Flows ----------
export const cloudFlows: Record<string, ([string, string] | [string, string, boolean])[]> = {
  "cloud-adt": [["ABAP project", "connect"], ["Released Objects", "what is allowed"], ["F9", "run a class-run"], ["ATC", "cloud-ready?", true]],
  "cloud-rap-bo": [["root entity", "top of the tree"], ["composition", "children"], ["behavior", "operations", true], ["lock dependent", "child follows root"]],
  "cloud-behavior": [["managed", "RAP implements"], ["create; update;", "enable operations"], ["validation", "check on save", true], ["determination", "compute"]],
  "cloud-eml": [["MODIFY ENTITIES", "change the buffer"], ["FAILED", "was it rejected?", true], ["READ ENTITIES", "read it back"], ["COMMIT ENTITIES", "save"]],
  "cloud-service-bindings": [["projection", "consumer view"], ["service definition", "expose"], ["service binding", "protocol"], ["Publish", "get the URL", true]],
  "cloud-btp": [["landscape", "BTP or in-app"], ["released API", "supported calls"], ["scenario", "allowed services"], ["arrangement", "system + user", true]],
};

/** [id, visualize concepts, knowledge concepts] for education-surfaces.ts. */
export const cloudSurfaces: [string, string, string][] = [
  ["cloud-adt", "adt1 adt2", "adt3 adt4"], ["cloud-rap-bo", "bo1 bo2", "bo3 bo4"], ["cloud-behavior", "bdef1 bdef2", "bdef3 bdef4"],
  ["cloud-eml", "eml1 eml2", "eml3 eml4"], ["cloud-service-bindings", "svc1 svc2", "svc3 svc4"], ["cloud-btp", "btp1 btp2", "btp3 btp4"],
];
