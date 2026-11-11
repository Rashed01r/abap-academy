// Modern ABAP path (after "Modern ABAP expressions"): Learn = classic vs modern, Explore code = build it, Challenge = one decision at a time.
// English only while ENABLE_ARABIC = false. Reference teaching content: nothing runs in an SAP system.
// Facts: SAP-samples cheat sheets 12 (AMDP), 25 (DCL), 32 (performance); CDS syntax and path expressions are general SAP knowledge.
export type Status = "ok" | "warn" | "err";
export type Opt = { id: string; t: string; def: boolean; benefit: string };
export type Pick = { t: string; ok: boolean; why: string };
export type ModernLesson = {
  id: string; key: string; topic: string; title: string; subtitle: string; minutes: number; xp: number;
  objectives: [string, string, string]; boundary: string; what: string; why: string; references: string[];
  ideas: [string, string][];
  compare: { left: { title: string; lines: string[] }; right: { title: string; lines: { t: string; note: string }[] } };
  mistakes: { title: string; wrong: string; right: string; why: string }[];
  flow: [string, string][];
  check: { q: string; o: string[]; a: number; e: string };
  explore: { intro: string; opts: Opt[]; build: (s: Record<string, boolean>) => { code: string; status: [Status, string][] } };
  challenge: { title: string; intro: string; decisions: { q: string; o: Pick[]; hints: [string, string] }[] };
};
const o = (t: string, ok: boolean, why: string): Pick => ({ t, ok, why });
const D = (q: string, opts: Pick[], hints: [string, string]) => ({ q, o: opts, hints });
const sheet = (n: string) => `https://github.com/SAP-samples/abap-cheat-sheets/blob/main/${n}.md`;

export const modernLessons: ModernLesson[] = [
  {
    id: "modern-abap-syntax", key: "syntax", topic: "Modern ABAP syntax", title: "Modern ABAP syntax: say it shorter", subtitle: "Same logic, fewer lines", minutes: 20, xp: 200,
    objectives: ["Declare a variable where you first use it", "Build text with a string template", "Create an object with NEW"],
    boundary: "Reference code. Most modern syntax needs ABAP 7.40 or later. The browser shows a model and runs nothing.",
    what: "Modern ABAP lets you say the same thing in fewer lines: declare variables where you first use them, build text with templates, and create objects with NEW.",
    why: "Shorter code is easier to read and has fewer places to go wrong. The program still does exactly the same.",
    references: [sheet("05_Constructor_Expressions"), sheet("33_ABAP_Release_News")],
    ideas: [["Declare where you use it", "DATA( ) creates the variable from the value on the right."], ["Text templates", "|Hello { name }| builds text without CONCATENATE."], ["NEW creates objects", "One expression instead of a TYPE REF TO line plus CREATE OBJECT."]],
    compare: {
      left: { title: "Classic: declare first, then fill", lines: ["DATA lv_name TYPE string.", "DATA lv_text TYPE string.", "DATA lo_counter TYPE REF TO lcl_counter.", "lv_name = `Sara`.", "CONCATENATE 'Hello' lv_name INTO lv_text SEPARATED BY space.", "CREATE OBJECT lo_counter."] },
      right: { title: "Modern: declare and fill in one step", lines: [
        { t: "DATA(lv_name) = `Sara`.", note: "DATA( ) declares the variable and gives it the type of the value, here string. A literal in backticks is type string." },
        { t: "DATA(lv_text) = |Hello { lv_name }|.", note: "A string template. Whatever is inside { } is replaced by its value." },
        { t: "DATA(lo_counter) = NEW lcl_counter( ).", note: "NEW creates the object, and DATA( ) takes its type from it." }] },
    },
    mistakes: [
      { title: "Using # without a known type", wrong: "DATA(lo_x) = NEW #( ).", right: "DATA(lo_x) = NEW lcl_counter( ).", why: "# needs a known target type. DATA( ) has none yet, so name the class." },
      { title: "Forgetting the braces in a template", wrong: "|Hello lv_name|", right: "|Hello { lv_name }|", why: "Only text inside { } is replaced by a value." },
      { title: "Using quotes for a string", wrong: "DATA(lv_name) = 'Sara'.", right: "DATA(lv_name) = `Sara`.", why: "'Sara' is a fixed-length text literal. Backticks give a string. DATA( ) follows the value." }],
    flow: [["DATA( )", "declare where used"], ["|…{ }…|", "text template"], ["NEW", "create the object"], ["fewer lines", "same behavior"]],
    check: { q: "What type does lv_name get from DATA(lv_name) = `Sara`. ?", o: ["string", "c with length 4", "i"], a: 0, e: "A literal in backticks is a string, and DATA( ) takes the type of the value." },
    explore: {
      intro: "Switch each modern feature on and watch the same program get shorter.",
      opts: [{ id: "inline", t: "Declare with DATA( )", def: false, benefit: "Declaration and value in one line." }, { id: "tmpl", t: "Build text with a template", def: false, benefit: "No CONCATENATE and no separator to remember." }, { id: "neww", t: "Create the object with NEW", def: false, benefit: "One expression instead of two statements." }],
      build(s) {
        const a = s.inline ? "DATA(lv_name) = `Sara`." : "DATA lv_name TYPE string.\nlv_name = `Sara`.";
        const b = s.tmpl ? (s.inline ? "DATA(lv_text) = |Hello { lv_name }|." : "DATA lv_text TYPE string.\nlv_text = |Hello { lv_name }|.") : "DATA lv_text TYPE string.\nCONCATENATE 'Hello' lv_name INTO lv_text SEPARATED BY space.";
        const c = s.neww ? (s.inline ? "DATA(lo_counter) = NEW lcl_counter( )." : "DATA lo_counter TYPE REF TO lcl_counter.\nlo_counter = NEW #( ).") : "DATA lo_counter TYPE REF TO lcl_counter.\nCREATE OBJECT lo_counter.";
        const code = [a, b, c].join("\n"), n = code.split("\n").length;
        return { code, status: [[n < 6 ? "ok" : "warn", `${n} lines, the classic version has 6. The program behaves the same.`]] };
      },
    },
    challenge: {
      title: "Shorten the program without changing it", intro: "A colleague asks you to modernize a short program. Decide how each line should be written.",
      decisions: [
        D("You write DATA(lv_count) = 0. What type does lv_count get?", [o("An integer (type i)", true, "DATA( ) takes the type of the value. The literal 0 is an integer."), o("A string", false, "A string needs backticks."), o("No type, it is untyped", false, "A variable always has a type.")], ["Look at the value on the right.", "DATA( ) copies its type."]),
        D("Which text template is correct?", [o("|Total: { lv_total }|", true, "The braces tell ABAP to insert the value."), o("|Total: lv_total|", false, "Without braces it prints the word lv_total."), o("'Total: { lv_total }'", false, "Only |…| is a template.")], ["Which delimiter marks a template?", "What do the braces do?"]),
        D("Why does DATA(lo) = NEW #( ). fail?", [o("# needs a known type and DATA( ) has none yet", true, "Name the class: NEW lcl_counter( )."), o("NEW cannot create objects", false, "It can."), o("DATA( ) cannot hold an object", false, "It can, once the type is known.")], ["What does # stand for?", "Does DATA( ) know the type before the value?"]),
        D("Does modern syntax change what the program does?", [o("No, it says the same thing in fewer lines", true, "It changes how you write it, not what it does."), o("Yes, it runs faster", false, "Speed is not the point."), o("Yes, it needs a new database", false, "It does not touch the database.")], ["Think of it as spelling, not logic.", "Compare the two versions in Explore code."])],
    },
  },
  {
    id: "modern-cds-views", key: "cdsviews", topic: "CDS Views", title: "CDS Views: define it once", subtitle: "A reusable definition of data", minutes: 25, xp: 220,
    objectives: ["Explain what a CDS view entity defines", "Read it like a table from ABAP", "Choose what belongs in the view and what stays in the program"],
    boundary: "Reference code. CDS views are created in ABAP Development Tools on a real system. The browser shows a model and runs nothing.",
    what: "A CDS view is a reusable definition of data, written once and read by many programs and apps. Instead of every program repeating the same join, rule and field names, they read the view.",
    why: "When a rule changes, you change one view instead of every program that copied it.",
    references: [sheet("15_CDS_View_Entities"), sheet("03_ABAP_SQL")],
    ideas: [["Define once", "The join, the rule and the field names live in one place."], ["Read like a table", "A program uses a short SELECT on the view."], ["Reuse everywhere", "ABAP programs and apps share the same definition."]],
    compare: {
      left: { title: "Classic: every program repeats the join", lines: ["SELECT e~employee_id, e~employee_name, d~department_name", "  FROM zaca_employee AS e", "  INNER JOIN zaca_department AS d ON d~department = e~department", "  INTO TABLE @DATA(lt_result).", "\" the same join is copied into every program"] },
      right: { title: "Modern: define it once as a CDS view entity", lines: [
        { t: "define view entity ZACA_I_Employee", note: "A view entity is a named, reusable definition of data. It is created once and read by many." },
        { t: "  as select from zaca_employee", note: "The view reads from the table, so the rows stay in one place." },
        { t: "  association [0..1] to ZACA_I_Department as _Department", note: "An association is a ready-made link to another view. It is only followed when a program asks for it." },
        { t: "    on $projection.Department = _Department.Department", note: "The link condition is written once, here, and not in every program." },
        { t: "{ key employee_id   as EmployeeId,", note: "key marks what identifies a row. The name after as is the clean name every program sees." },
        { t: "        employee_name as Name,", note: "Renaming here means every program and app sees the same field names." },
        { t: "        department    as Department,", note: "" },
        { t: "        _Department }", note: "Exposing the association lets programs reach department details through the view." },
        { t: "SELECT FROM zaca_i_employee FIELDS EmployeeId, Name INTO TABLE @DATA(lt_result).", note: "A program reads the view like a table, in one short statement." }] },
    },
    mistakes: [
      { title: "Copying the join into every program", wrong: "SELECT … FROM zaca_employee AS e\n  INNER JOIN zaca_department …", right: "SELECT FROM zaca_i_employee\n  FIELDS EmployeeId, Name …", why: "Four copies of a join drift apart. One view cannot." },
      { title: "Leaving out the key", wrong: "{ employee_id as EmployeeId,\n  employee_name as Name }", right: "{ key employee_id as EmployeeId,\n  employee_name as Name }", why: "Mark the field that identifies a row with key." },
      { title: "Reading the table, not the view", wrong: "SELECT FROM zaca_employee …", right: "SELECT FROM zaca_i_employee …", why: "Reading the view reuses its names and rules. Reading the table skips them." }],
    flow: [["define view entity", "name the view"], ["as select from", "choose the source"], ["{ key … as … }", "pick and name fields"], ["SELECT FROM view", "read it like a table"]],
    check: { q: "How does an ABAP program read a CDS view?", o: ["Like a table, with SELECT FROM", "With CALL FUNCTION", "With CREATE OBJECT"], a: 0, e: "A CDS view entity can be used as a data source in ABAP SQL, just like a table." },
    explore: {
      intro: "Switch the parts of the view on and off and watch the definition grow.",
      opts: [{ id: "label", t: "Add a label (@EndUserText.label)", def: false, benefit: "Documents the view for tools and other developers." }, { id: "name", t: "Name: employee_name as Name", def: true, benefit: "Every program sees the same clean field name." }, { id: "dept", t: "Department: department as Department", def: true, benefit: "The department code is available to every reader." }, { id: "assoc", t: "Link to departments (association)", def: false, benefit: "Programs reach department data through _Department, with no join written by hand." }],
      build(s) {
        const L: string[] = []; if (s.label) L.push("@EndUserText.label: 'Employees'");
        L.push("define view entity ZACA_I_Employee", "  as select from zaca_employee");
        if (s.assoc) L.push("  association [0..1] to ZACA_I_Department as _Department", "    on $projection.Department = _Department.Department");
        const f = ["key employee_id as EmployeeId"]; if (s.name) f.push("employee_name as Name"); if (s.dept) f.push("department as Department"); if (s.assoc) f.push("_Department");
        L.push("{"); f.forEach((x, i) => L.push("  " + x + (i < f.length - 1 ? "," : ""))); L.push("}");
        // The ON condition uses $projection.Department, so the association needs that field in the view.
        if (s.assoc && !s.dept) return { code: L.join("\n"), status: [["err", "The association's ON condition uses $projection.Department, but Department is not in the view. Add it back."]] };
        return { code: L.join("\n"), status: [["ok", `${f.length} item${f.length === 1 ? "" : "s"} in the view. A program reads it with SELECT FROM zaca_i_employee.`], s.assoc ? ["ok", "Programs can now reach department details through _Department."] : ["warn", "No association yet: programs would still write their own join."]] };
      },
    },
    challenge: {
      title: "Design one view for four readers", intro: "Three programs and a Fiori app need employee data. Decide what goes into a CDS view.",
      decisions: [
        D("Three programs and a Fiori app all need employees with department names. What is the best design?", [o("One CDS view with an association to departments, read by all four", true, "Defined once and reused, so the four readers cannot drift apart."), o("Copy the join into each program", false, "Four copies to keep in step when the link changes."), o("A new table that stores the combined data", false, "Duplicated data can get out of date.")], ["How many places should hold the join?", "Which option defines it once?"]),
        D("What does an association give a program?", [o("A ready-made link to another view, followed only when the program uses it", true, "The department data is reached through _Department without writing the join."), o("A copy of the other table's rows inside the view", false, "Nothing is copied. It is a link."), o("An automatic database commit", false, "Associations do not change data.")], ["Is anything copied?", "When is the link followed?"]),
        D("Where do you write the rule “ignore the TEMP department”?", [o("In the view, with a WHERE clause", true, "Written once, it applies to every reader."), o("In every program", false, "It is easy to forget one program."), o("In a comment", false, "A comment does not do anything.")], ["Who needs the rule?", "Where is it written once?"]),
        D("A program needs only EmployeeId and Name from the view. What does it read?", [o("SELECT FROM the view with FIELDS EmployeeId, Name", true, "It reads the view like a table and asks only for what it needs."), o("Every field of the view, then ignores the rest", false, "Moving unneeded data is wasteful."), o("It copies the view definition into the program", false, "The point of the view is that nobody copies it.")], ["A view is read like a table.", "Ask for what you need."])],
    },
  },
  {
    id: "modern-cds-associations", key: "cdsassoc", topic: "CDS Associations", title: "CDS Associations: link without joining", subtitle: "Declare, expose, follow", minutes: 22, xp: 230,
    objectives: ["Declare an association with its cardinality and condition", "Expose it so others can use it", "Follow it with a path expression"],
    boundary: "Reference code. Path-expression syntax is shown as in the ABAP documentation. The browser shows a model and runs nothing.",
    what: "An association is a named link from one CDS view to another. It is declared once, exposed in the select list, and only followed when a program uses it.",
    why: "Programs get related data without writing joins, and the department table is only read when it is needed.",
    references: [sheet("15_CDS_View_Entities"), sheet("03_ABAP_SQL")],
    ideas: [["Declare the link", "association [0..1] to … on … says how the two views relate."], ["Expose it", "Add _Department to the select list so others can use it."], ["Follow it with a path", "\\_Department-Name reads department data through the link."]],
    compare: {
      left: { title: "Classic: write the join by hand", lines: ["SELECT e~employee_id, d~department_name", "  FROM zaca_employee AS e", "  INNER JOIN zaca_department AS d ON d~department = e~department", "  INTO TABLE @DATA(lt_result)."] },
      right: { title: "Modern: declare once, follow with a path", lines: [
        { t: "association [0..1] to ZACA_I_Department as _Department", note: "Declares the link. [0..1] means an employee has at most one department, and may have none." },
        { t: "  on $projection.Department = _Department.Department", note: "How the two views match up. Written once, in the view." },
        { t: "{ key employee_id as EmployeeId, department as Department, _Department }", note: "Exposing _Department in the select list lets programs follow the link." },
        { t: "SELECT FROM zaca_i_employee", note: "The program reads the employee view." },
        { t: "  FIELDS EmployeeId, \\_Department-Name AS DepartmentName", note: "A path expression follows the association and reads the department name. The department table is read only because the path is used." },
        { t: "  INTO TABLE @DATA(lt_result).", note: "" }] },
    },
    mistakes: [
      { title: "Forgetting to expose the link", wrong: "{ key employee_id as EmployeeId }", right: "{ key employee_id as EmployeeId,\n  _Department }", why: "Without exposing it, nobody outside the view can follow the association." },
      { title: "Writing the join by hand", wrong: "INNER JOIN zaca_department AS d\n  ON d~department = e~department", right: "FIELDS EmployeeId,\n  \\_Department-Name AS DepartmentName", why: "The view already knows how the two match. Follow the association." },
      { title: "Wrong cardinality", wrong: "association [1..1] to ZACA_I_Department …", right: "association [0..1] to ZACA_I_Department …", why: "Say [0..1] when the related row may be missing, such as an employee without a department." }],
    flow: [["association … to", "declare the link"], ["on $projection…", "say how they match"], ["_Department", "expose it"], ["\\_Department-Name", "follow it"]],
    check: { q: "What does a path expression do?", o: ["Follows an association to related data", "Creates a new table", "Deletes the link"], a: 0, e: "A path expression follows an association, so the related data is read through the link." },
    explore: {
      intro: "Declare, expose and follow the association. Skip a step and see what goes wrong.",
      opts: [{ id: "decl", t: "Declare the association", def: false, benefit: "Says how Employee relates to Department." }, { id: "expose", t: "Expose it in the select list", def: false, benefit: "Lets other views and programs use the link." }, { id: "path", t: "Follow it with a path expression", def: false, benefit: "Reads the department name without a hand-written join." }],
      build(s) {
        const L = ["define view entity ZACA_I_Employee", "  as select from zaca_employee"];
        if (s.decl) L.push("  association [0..1] to ZACA_I_Department as _Department", "    on $projection.Department = _Department.Department");
        L.push("{", "  key employee_id as EmployeeId,", "  department as Department" + (s.expose ? "," : "")); if (s.expose) L.push("  _Department"); L.push("}", "");
        L.push("SELECT FROM zaca_i_employee", s.path ? "  FIELDS EmployeeId, \\_Department-Name AS DepartmentName" : "  FIELDS EmployeeId, Department", "  INTO TABLE @DATA(lt_result).");
        const st: [Status, string][] = [];
        if (s.expose && !s.decl) st.push(["err", "_Department is exposed but never declared."]);
        if (s.path && !s.expose) st.push(["err", "The program cannot follow _Department because the view does not expose it."]);
        if (!st.length) st.push(s.path ? ["ok", "The department table is read only because the SELECT follows the association."] : ["ok", "No path expression, so the department table is not read at all."]);
        return { code: L.join("\n"), status: st };
      },
    },
    challenge: {
      title: "Link employees to departments", intro: "Decide how the employee view reaches its department.",
      decisions: [
        D("What does [0..1] say?", [o("At most one related row, and it may be missing", true, "An employee has one department or none."), o("Exactly one related row", false, "That would be [1..1]."), o("Many related rows", false, "That would use a star, such as [0..*].")], ["Read the two numbers as minimum and maximum.", "Can the department be missing?"]),
        D("When is the department table read?", [o("Only when a program follows the association", true, "An unused association costs nothing."), o("Every time the view is read", false, "Not unless the association is used."), o("Once, when the view is activated", false, "It is read when data is requested.")], ["Compare the two cases in Explore code.", "What triggers the join?"]),
        D("What must the view do so others can use _Department?", [o("Expose it in the select list", true, "Without exposing it, the link cannot be followed from outside."), o("Copy the department rows", false, "Nothing is copied."), o("Nothing, associations are always visible", false, "They must be exposed.")], ["Look at the last line of the select list.", "Who can see it if you do not expose it?"]),
        D("What does \\_Department-Name do in a SELECT?", [o("Follows the link and reads the department name", true, "It is a path expression."), o("Declares a new association", false, "Declaring happens in the view."), o("Deletes the department", false, "It only reads.")], ["The backslash starts a path.", "A path goes through an association."])],
    },
  },
  {
    id: "modern-dcl", key: "dcl", topic: "DCL", title: "DCL: one rule protects every reader", subtitle: "Access control on a CDS view", minutes: 22, xp: 230,
    objectives: ["Say what a DCL role controls", "Read the pieces of a grant rule", "Explain why one role beats a check in every program"],
    boundary: "Reference code. Access control is written in ABAP Development Tools on a real system and needs authorization objects. The browser shows a model and runs nothing.",
    what: "Access control (DCL) decides which rows of a CDS view a user may read. The rule is written once on the view and protects every program and app that reads it.",
    why: "One rule instead of an authority check in every program, so no program can forget it.",
    references: [sheet("25_Authorization_Checks"), sheet("15_CDS_View_Entities")],
    ideas: [["The rule sits on the view", "A role is defined for the view, not for each program."], ["Rows follow authorizations", "A user sees only the rows their authorizations allow."], ["The view asks for the check", "An annotation on the view requests it."]],
    compare: {
      left: { title: "Classic: every program checks each row", lines: ["LOOP AT lt_all ASSIGNING FIELD-SYMBOL(<ls_row>).", "  AUTHORITY-CHECK OBJECT 'ZACA_DEPT'", "    ID 'DEPT'  FIELD <ls_row>-department", "    ID 'ACTVT' FIELD '03'.", "  IF sy-subrc <> 0. DELETE lt_all. ENDIF.", "ENDLOOP."] },
      right: { title: "Modern: one role on the view", lines: [
        { t: "@AccessControl.authorizationCheck: #CHECK", note: "The view asks for an access check. With #CHECK, a warning is issued if no access control exists." },
        { t: "define role ZACA_I_EMPLOYEE {", note: "A role holds the access rules for a view." },
        { t: "  grant select on ZACA_I_Employee", note: "The rule applies whenever this view is read." },
        { t: "    where (Department) = aspect pfcg_auth( ZACA_DEPT, DEPT, ACTVT = '03' );", note: "Only rows whose department the user is authorized for are returned. ACTVT = '03' means display access." },
        { t: "}", note: "" },
        { t: "SELECT FROM zaca_i_employee FIELDS EmployeeId, Department INTO TABLE @DATA(lt_result).", note: "The program asks for everything. The view hands back only the rows this user may see." }] },
    },
    mistakes: [
      { title: "Checking in every program", wrong: "AUTHORITY-CHECK OBJECT 'ZACA_DEPT' …\n\" repeated in each program", right: "grant select on ZACA_I_Employee\n  where (Department) = aspect pfcg_auth( … );", why: "A forgotten program leaves the data open. A role on the view protects all readers." },
      { title: "Naming the wrong field", wrong: "where (Salary) = aspect pfcg_auth( ZACA_DEPT, DEPT, … )", right: "where (Department) = aspect pfcg_auth( ZACA_DEPT, DEPT, … )", why: "The condition field must hold the value the authorization is about." },
      { title: "Only hiding a column", wrong: "\" hide Department on the screen", right: "\" a DCL role on the view", why: "Hiding a field does not stop another program from reading the rows." }],
    flow: [["@AccessControl…", "ask for the check"], ["define role", "rules for the view"], ["grant select on", "which view"], ["where … aspect pfcg_auth", "which rows"]],
    check: { q: "What does a DCL rule do?", o: ["Limits which rows a user can read from the view", "Speeds up the view", "Renames the fields"], a: 0, e: "A DCL role restricts the rows a user may read, based on their authorizations." },
    explore: {
      intro: "Add the four parts of access control one by one and see who can read what.",
      opts: [{ id: "ann", t: "Ask for the check (@AccessControl.authorizationCheck: #CHECK)", def: false, benefit: "Marks the view as one that needs access control." }, { id: "role", t: "Define a role for the view", def: false, benefit: "A home for the access rules." }, { id: "grant", t: "Grant select on the view", def: false, benefit: "A rule that applies whenever the view is read." }, { id: "cond", t: "Add the condition (where … aspect pfcg_auth)", def: false, benefit: "Limits the rows by the user's authorizations." }],
      build(s) {
        const L: string[] = []; if (s.ann) L.push("@AccessControl.authorizationCheck: #CHECK"); L.push("define view entity ZACA_I_Employee … { … }");
        if (s.role) { L.push("", "define role ZACA_I_EMPLOYEE {"); if (s.grant) { L.push("  grant select on ZACA_I_Employee"); if (s.cond) L.push("    where (Department) = aspect pfcg_auth( ZACA_DEPT, DEPT, ACTVT = '03' )"); L[L.length - 1] += ";"; } L.push("}"); }
        const st: [Status, string][] = [];
        if (s.cond && !s.grant) st.push(["err", "A condition needs a grant rule to belong to."]);
        if (s.grant && !s.role) st.push(["err", "A grant rule must sit inside a role."]);
        if (s.role && !s.grant) st.push(["warn", "A role without a rule protects nothing."]);
        if (s.grant && s.role && !s.cond) st.push(["warn", "A rule without a condition does not limit the rows."]);
        if (s.ann && !s.role) st.push(["warn", "The view asks for a check, but no access control exists yet. The system warns."]);
        st.push(s.ann && s.role && s.grant && s.cond ? ["ok", "A user authorized for IT sees 2 of 4 employees. Every program and app that reads the view gets the same result."] : ["warn", "Not complete yet: every user still sees all 4 employees."]);
        return { code: L.join("\n"), status: st };
      },
    },
    challenge: {
      title: "Protect the employee view", intro: "HR wants each manager to see only their own department. Decide where the rule lives.",
      decisions: [
        D("Where do you write the rule that limits employees by department?", [o("In a DCL role on the view", true, "One rule on the view protects every reader."), o("In every program", false, "A forgotten program leaves the data open."), o("On the screen", false, "Hiding fields does not stop other readers.")], ["Who reads the view?", "Where can one rule cover all of them?"]),
        D("What does ACTVT = '03' mean in the rule?", [o("Display access", true, "Activity 03 is display."), o("Change access", false, "That would be a different activity."), o("Delete access", false, "That would be a different activity.")], ["Look at the lesson code.", "Which activity only reads?"]),
        D("Why is a DCL role better than a check in each program?", [o("One rule protects every program and app that reads the view", true, "Nobody can forget it."), o("It makes the view faster", false, "Speed is not the reason."), o("It removes the need for authorizations", false, "It uses them.")], ["Count the places that need the rule.", "What happens if one program forgets?"]),
        D("Which annotation asks the view to be checked?", [o("@AccessControl.authorizationCheck: #CHECK", true, "With #CHECK, a warning is issued if no access control exists."), o("@EndUserText.label", false, "That only labels the view."), o("define role", false, "That defines the rule, it is not an annotation.")], ["It starts with @AccessControl.", "Which value asks for the check?"])],
    },
  },
  {
    id: "modern-amdp", key: "amdp", topic: "AMDP", title: "AMDP: run the heavy work in the database", subtitle: "ABAP methods written in SQLScript", minutes: 25, xp: 250,
    objectives: ["Say what an AMDP is and where it runs", "Read the parts of an AMDP method", "Decide when AMDP is the right tool"],
    boundary: "Reference code. AMDP works only on SAP HANA and is edited in ABAP Development Tools. In ABAP Cloud the code must be read-only. The browser shows a model and runs nothing.",
    what: "An AMDP (ABAP Managed Database Procedure) is an ABAP method whose body is written in SQLScript and runs inside the SAP HANA database. ABAP calls it like any other method.",
    why: "Heavy calculations run next to the data, so less data travels to the program.",
    references: [sheet("12_AMDP")],
    ideas: [["The body is SQLScript", "It is not ABAP. It runs in SAP HANA."], ["ABAP calls it", "Callers use an ordinary method call."], ["Use it when ABAP SQL is not enough", "SAP does not recommend AMDP if ABAP SQL can do the job."]],
    compare: {
      left: { title: "Classic: fetch every row, add up in ABAP", lines: ["SELECT department, salary FROM zaca_employee", "  INTO TABLE @DATA(lt_rows).", "LOOP AT lt_rows ASSIGNING FIELD-SYMBOL(<ls_row>).", "  \" add up the salary per department in ABAP", "ENDLOOP."] },
      right: { title: "Modern: the database does the adding", lines: [
        { t: "CLASS zcl_aca_totals DEFINITION PUBLIC.", note: "AMDP methods live in a global class." },
        { t: "  PUBLIC SECTION.", note: "" },
        { t: "    INTERFACES if_amdp_marker_hdb.", note: "This interface marks the class as holding AMDP methods for SAP HANA." },
        { t: "    CLASS-METHODS get_totals EXPORTING VALUE(et_totals) TYPE tt_totals.", note: "Declared like a normal method. AMDP parameters are passed by VALUE( ) and RETURNING is not allowed." },
        { t: "ENDCLASS.", note: "" },
        { t: "METHOD get_totals BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY USING zaca_employee.", note: "The body is SQLScript for SAP HANA. READ-ONLY is mandatory in ABAP for Cloud Development. USING lists the tables the code accesses." },
        { t: "  et_totals = SELECT department, SUM( salary ) AS total FROM zaca_employee GROUP BY department;", note: "SQLScript, not ABAP. It runs in the database and returns one row per department." },
        { t: "ENDMETHOD.", note: "" },
        { t: "zcl_aca_totals=>get_totals( IMPORTING et_totals = DATA(lt_totals) ).", note: "ABAP calls it like any method." }] },
    },
    mistakes: [
      { title: "Using RETURNING", wrong: "CLASS-METHODS get_totals\n  RETURNING VALUE(rt) TYPE tt_totals.", right: "CLASS-METHODS get_totals\n  EXPORTING VALUE(et_totals) TYPE tt_totals.", why: "AMDP procedures cannot use RETURNING, and parameters are passed by VALUE( )." },
      { title: "Writing ABAP in the body", wrong: "LOOP AT lt_rows … ENDLOOP.", right: "et_totals = SELECT … GROUP BY …;", why: "The body is SQLScript for HANA, not ABAP." },
      { title: "Using AMDP for a simple read", wrong: "\" an AMDP just to filter rows", right: "SELECT … WHERE … INTO TABLE …", why: "SAP does not recommend AMDP when ABAP SQL can do the same task." }],
    flow: [["IF_AMDP_MARKER_HDB", "mark the class"], ["BY DATABASE PROCEDURE", "body is SQLScript"], ["READ-ONLY, USING", "what it reads"], ["call it", "like any method"]],
    check: { q: "Where does the body of an AMDP method run?", o: ["In the SAP HANA database", "On the application server", "In the browser"], a: 0, e: "The SQLScript body is stored in and runs on the SAP HANA database." },
    explore: {
      intro: "Assemble the AMDP method. Leave a part out and the status explains the problem.",
      opts: [{ id: "marker", t: "Mark the class (INTERFACES if_amdp_marker_hdb)", def: true, benefit: "Tells the system this class holds AMDP methods." }, { id: "value", t: "Pass the result by VALUE( )", def: false, benefit: "Required for AMDP parameters." }, { id: "body", t: "Write the body BY DATABASE PROCEDURE … SQLSCRIPT", def: false, benefit: "The body runs in the database." }, { id: "ro", t: "Add OPTIONS READ-ONLY", def: false, benefit: "Mandatory in ABAP for Cloud Development." }, { id: "using", t: "List the tables with USING", def: false, benefit: "Names the database objects the code accesses." }],
      build(s) {
        const L = ["CLASS zcl_aca_totals DEFINITION PUBLIC.", "  PUBLIC SECTION."]; if (s.marker) L.push("    INTERFACES if_amdp_marker_hdb.");
        L.push("    CLASS-METHODS get_totals EXPORTING " + (s.value ? "VALUE(et_totals)" : "et_totals") + " TYPE tt_totals.", "ENDCLASS.", "", "CLASS zcl_aca_totals IMPLEMENTATION.");
        L.push("  METHOD get_totals" + (s.body ? " BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT" + (s.ro ? " OPTIONS READ-ONLY" : "") + (s.using ? " USING zaca_employee" : "") : "") + ".");
        L.push(s.body ? "    et_totals = SELECT department, SUM( salary ) AS total FROM zaca_employee GROUP BY department;" : "    SELECT department, SUM( salary ) AS total FROM zaca_employee GROUP BY department INTO TABLE @et_totals.", "  ENDMETHOD.", "ENDCLASS.");
        const st: [Status, string][] = [];
        if (s.body && !s.marker) st.push(["err", "The class is not marked with IF_AMDP_MARKER_HDB, so the method cannot be an AMDP."]);
        if (s.body && !s.value) st.push(["err", "AMDP parameters must be passed by VALUE( )."]);
        if (s.body && !s.ro) st.push(["warn", "READ-ONLY is mandatory in ABAP for Cloud Development."]);
        if (s.body && !s.using) st.push(["warn", "The tables the code reads should be listed in USING."]);
        if (!s.body) st.push(["warn", "Without BY DATABASE PROCEDURE the body is ordinary ABAP and runs on the application server."]);
        if (s.body && s.marker && s.value && s.ro && s.using) st.push(["ok", "The SQLScript runs in HANA and returns one row per department: 3 rows travel to the program instead of every employee."]);
        return { code: L.join("\n"), status: st };
      },
    },
    challenge: {
      title: "Choose when to use AMDP", intro: "The team wants department totals fast. Decide how an AMDP fits in.",
      decisions: [
        D("Where does the body of an AMDP method run?", [o("In the SAP HANA database", true, "The code is stored in and runs on the database."), o("On the application server", false, "That is where ordinary ABAP runs."), o("In the user's browser", false, "AMDP has nothing to do with the browser.")], ["The name says managed database procedure.", "Which system holds the data?"]),
        D("Which language is the body of an AMDP method written in?", [o("SQLScript", true, "The method header says LANGUAGE SQLSCRIPT."), o("ABAP", false, "The declaration is ABAP. The body is not."), o("Java", false, "Not supported.")], ["Look at the BY DATABASE PROCEDURE line.", "What does LANGUAGE say?"]),
        D("The same task can be done with a normal SELECT … GROUP BY. What does SAP recommend?", [o("Use ABAP SQL, AMDP is not recommended if ABAP SQL can do the job", true, "AMDP is for what ABAP SQL cannot do well."), o("Always use AMDP", false, "AMDP adds restrictions, such as HANA only."), o("Use both at once", false, "That doubles the work.")], ["Which option is simpler?", "AMDP only works on one database."]),
        D("Why must AMDP code care about the client?", [o("Native SQL does not handle the client automatically", true, "Use the client-handling additions the AMDP syntax offers."), o("The client is a screen setting", false, "Here the client is a data column."), o("AMDP always ignores clients safely", false, "It does not, so the code must be client-safe.")], ["ABAP SQL adds the client for you.", "Does SQLScript do the same?"])],
    },
  },
  {
    id: "modern-performance", key: "perf", topic: "Performance optimization", title: "Performance optimization: move less, ask less", subtitle: "Fewer trips, less data", minutes: 25, xp: 250,
    objectives: ["Explain why a SELECT inside a loop is costly", "Let the database filter and restrict columns", "Know how to check that a change helped"],
    boundary: "Reference code and counts, not timings. Real runtimes depend on the system, so measure with the profiling tools. The browser runs nothing.",
    what: "A fast program moves less data and makes fewer trips to the database. The rule of thumb: let the database filter, join and add up, and bring back only what the program needs.",
    why: "The same result, with less waiting and less load on the system.",
    references: [sheet("32_Performance_Notes"), sheet("03_ABAP_SQL")],
    ideas: [["Fewer trips", "One read instead of one read per row."], ["Less data", "Only the needed columns and rows travel."], ["Work where the data is", "The database does the heavy work. This is called code pushdown."]],
    compare: {
      left: { title: "Classic: read everything, loop, read again", lines: ["SELECT * FROM zaca_employee INTO TABLE @DATA(lt_all).", "LOOP AT lt_all ASSIGNING FIELD-SYMBOL(<ls_emp>).", "  IF <ls_emp>-department = 'IT'.", "    SELECT SINGLE department_name FROM zaca_department", "      WHERE department = @<ls_emp>-department INTO @DATA(lv_name).", "  ENDIF.", "ENDLOOP."] },
      right: { title: "Modern: one statement, the database does the work", lines: [
        { t: "SELECT FROM zaca_employee AS e", note: "One statement means one trip to the database." },
        { t: "  INNER JOIN zaca_department AS d ON d~department = e~department", note: "The join replaces a SELECT inside the loop." },
        { t: "  FIELDS e~employee_id, e~employee_name, d~department_name", note: "Only the needed columns travel, not SELECT *." },
        { t: "  WHERE e~department = 'IT'", note: "The database drops the other rows before anything is sent." },
        { t: "  INTO TABLE @DATA(lt_it).", note: "The rows arrive already filtered." }] },
    },
    mistakes: [
      { title: "A SELECT inside a loop", wrong: "LOOP AT lt_all …\n  SELECT SINGLE … WHERE …", right: "SELECT … INNER JOIN … WHERE …", why: "One trip per row grows with the table. A join is one trip." },
      { title: "Reading every column", wrong: "SELECT * FROM zaca_employee …", right: "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name …", why: "Name the columns you need. Unneeded columns still have to travel." },
      { title: "Filtering in the program", wrong: "LOOP AT lt_all …\n  IF department = 'IT'.", right: "SELECT … WHERE department = 'IT'", why: "Let the database drop the rows before they are sent." }],
    flow: [["WHERE", "filter in the database"], ["FIELDS", "only needed columns"], ["JOIN", "one trip, not N"], ["measure", "use the profiler"]],
    check: { q: "Why is a SELECT inside a LOOP costly?", o: ["It makes one database trip for every row", "SELECT is not allowed in loops", "It always returns wrong rows"], a: 0, e: "The number of trips grows with the number of rows. A join does it in one." },
    explore: {
      intro: "Switch the three habits on and watch how much data travels (a four-row table with four columns).",
      opts: [{ id: "fields", t: "Name only the needed columns", def: false, benefit: "Two of four columns travel instead of all four." }, { id: "where", t: "Filter in the database (WHERE)", def: false, benefit: "Only the IT rows are sent." }, { id: "order", t: "Sort in the database (ORDER BY)", def: false, benefit: "The rows arrive in a defined order." }],
      build(s) {
        const L = ["SELECT FROM zaca_employee", s.fields ? "  FIELDS employee_id, employee_name" : "  FIELDS *"]; if (s.where) L.push("  WHERE department = 'IT'"); if (s.order) L.push("  ORDER BY employee_name"); L.push("  INTO TABLE @DATA(lt_result).");
        const rows = s.where ? 2 : 4, cols = s.fields ? 2 : 4, cells = rows * cols;
        return { code: L.join("\n"), status: [[cells < 16 ? "ok" : "warn", `${cells} of 16 cells are sent to the program (${rows} rows × ${cols} columns).`], s.fields && s.where ? ["ok", "Both habits are on: only what the program needs travels."] : ["warn", "Turn on both columns and filter to move the least data."]] };
      },
    },
    challenge: {
      title: "Make the employee report fast", intro: "The employee report is slow. Decide what to change, and how to know it helped.",
      decisions: [
        D("Why is a SELECT inside a LOOP a problem?", [o("It makes one database trip for every row", true, "The number of trips grows with the number of rows."), o("SELECT is not allowed in loops", false, "It is allowed, it is just costly."), o("It always returns the wrong rows", false, "The rows can be right. The cost is the problem.")], ["Count the trips for 1,000 rows.", "What does the loop repeat?"]),
        D("Where should the filter department = 'IT' be applied?", [o("In the WHERE clause, so the database drops the rows", true, "Fewer rows travel to the program."), o("In an IF inside the loop", false, "All rows travel first, then most are thrown away."), o("After WRITE", false, "By then the work is done.")], ["Who can drop rows before sending?", "Which option moves the least data?"]),
        D("A report needs two columns of a four-column table. What do you write?", [o("Name the two columns in FIELDS", true, "Only the needed columns travel."), o("SELECT * and ignore the rest", false, "Unneeded data still has to be moved."), o("Read all rows first, then delete the columns", false, "That moves everything first.")], ["What does * ask for?", "Ask only for what you need."]),
        D("How do you know a change made the program faster?", [o("Measure it with the profiling tools", true, "Counts and rules of thumb guide you. Measuring proves it."), o("It must be faster because there are fewer lines", false, "Fewer lines are not the same as faster."), o("Ask a colleague what they think", false, "An opinion is not a measurement.")], ["Lines of code do not measure speed.", "Which tool shows where time goes?"])],
    },
  },
];
/** The six new lessons plus the existing "Modern ABAP expressions", which keeps its own definition. */
export const isModernLesson = (id: string) => id === "modern-syntax" || modernLessons.some(l => l.id === id);
