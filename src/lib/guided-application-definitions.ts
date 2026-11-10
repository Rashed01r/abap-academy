import type { GuidedDefinition } from "./guided-types";
import type { Text } from "./curriculum";

// SAP Application Development path (after Classical reports), English only while ENABLE_ARABIC = false.
// Reference lessons: none of this runs in the browser. Facts: .claude/skills/academy-lesson/references/sap-notes/applications.md
const t = (en: string): Text => ({ en });
const cheats = "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/";
const g = (id: string, start: number, end: number, title: string, explanation: string, detail: string) => ({ id, start, end, title: t(title), explanation: t(explanation), detail: t(detail) });
const a = (id: string, title: string, description: string, example: string) => ({ id, title: t(title), description: t(description), example });
const r = (from: string, to: string, label: string) => ({ from, to, label: t(label) });
const o = (id: string, text: string) => ({ id, text: t(text) });
const d = (id: string, prompt: string, options: { id: string; text: Text }[], correct: string, explanation: string, hints: string[]) => ({ id, prompt: t(prompt), options, correct, explanation: t(explanation), hints: hints.map(t) });

export const guidedApplicationDefinitions: GuidedDefinition[] = [
  {
    id: "applications-alv", pathId: "applications", prerequisite: "applications-reports",
    title: t("ALV: show a table as a list"), subtitle: t("Describe the columns, then call the ALV function module"),
    brief: t("A WRITE list prints text line by line. The SAP List Viewer (ALV) shows an internal table with column headings and the standard ALV toolbar. The traditional way is a function module: you read the rows into an internal table, describe each column in a field catalog, and call REUSE_ALV_LIST_DISPLAY with both. ALV only shows the table: it does not change the database."),
    objectives: [t("Read the selected rows into an internal table that ALV can show"), t("Build a field catalog that describes each column"), t("Call REUSE_ALV_LIST_DISPLAY, check sy-subrc, and say what ALV does not do")],
    minutes: 20, xp: 180, difficulty: "intermediate", coveredTopics: ["ALV"],
    references: [cheats + "20_Selection_Screens_Lists.md"],
    boundary: t("Reference code for an SAP system with SAP GUI. The browser does not run the ALV function module and shows only a local model. REUSE_ALV function modules are the traditional classic way; the cheat sheet names CL_SALV_TABLE as a modern alternative. Classic list UIs cannot be created in ABAP Cloud."),
    practice: t("In the lab, answer each step to build the program, and watch the field catalog and the rows on the rail."),
    code: `TYPES: BEGIN OF ty_employee,
         employee_id   TYPE zaca_employee-employee_id,
         employee_name TYPE zaca_employee-employee_name,
         department    TYPE zaca_employee-department,
       END OF ty_employee.
DATA: lt_employees TYPE TABLE OF ty_employee,
      lt_fieldcat  TYPE TABLE OF slis_fieldcat_alv,
      ls_fieldcat  TYPE slis_fieldcat_alv,
      lv_id        TYPE zaca_employee-employee_id.
SELECT-OPTIONS s_id FOR lv_id.
START-OF-SELECTION.
  SELECT employee_id employee_name department
    FROM zaca_employee
    INTO TABLE lt_employees
    WHERE employee_id IN s_id.
  ls_fieldcat-fieldname = 'EMPLOYEE_ID'.
  ls_fieldcat-seltext_l = 'Employee ID'.
  APPEND ls_fieldcat TO lt_fieldcat.
  CLEAR ls_fieldcat.
  ls_fieldcat-fieldname = 'EMPLOYEE_NAME'.
  ls_fieldcat-seltext_l = 'Employee name'.
  APPEND ls_fieldcat TO lt_fieldcat.
  CLEAR ls_fieldcat.
  ls_fieldcat-fieldname = 'DEPARTMENT'.
  ls_fieldcat-seltext_l = 'Department'.
  APPEND ls_fieldcat TO lt_fieldcat.
  CLEAR ls_fieldcat.
  CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY'
    EXPORTING  it_fieldcat   = lt_fieldcat
    TABLES     t_outtab      = lt_employees
    EXCEPTIONS program_error = 1
               OTHERS        = 2.
  IF sy-subrc <> 0.
    MESSAGE 'The list could not be displayed' TYPE 'E'.
  ENDIF.`,
    groups: [
      g("alv-data", 1, 10, "Declare the data and the selection", "ty_employee describes one row, lt_employees will hold the rows, lt_fieldcat and ls_fieldcat describe the columns, and s_id lets the user choose employee IDs.", "SELECT-OPTIONS creates a selection table on the selection screen. An empty selection means all employees."),
      g("alv-select", 11, 15, "Read the rows", "After the selection screen, SELECT fills lt_employees with the employees whose ID is in s_id.", "This is the classic SELECT form: no commas between the fields and no @ before ABAP variables. It reads three columns, the same three the field catalog will describe."),
      g("alv-fieldcat", 16, 27, "Describe each column", "For each column, ls_fieldcat gets the field name and the heading, is appended to lt_fieldcat, and is cleared for the next column.", "FIELDNAME is the column name of ty_employee in capitals. SELTEXT_L is the long heading shown to the user. CLEAR stops one column's settings leaking into the next."),
      g("alv-display", 28, 32, "Call the ALV function module", "REUSE_ALV_LIST_DISPLAY gets the field catalog in it_fieldcat and the rows in the table t_outtab.", "Most other parameters are optional and are left out here. The list only appears when this call runs."),
      g("alv-errors", 33, 35, "Check the result", "If the function module raises program_error or any other exception, sy-subrc is not 0 and the program shows a message.", "EXCEPTIONS program_error = 1 and OTHERS = 2 turn exceptions into sy-subrc values. ALV never writes changes back to zaca_employee by itself."),
    ],
    artifacts: [
      a("selection", "Selection table", "Lets the user restrict which employee IDs are read.", "s_id"),
      a("table", "Internal table", "The rows to show, handed over in t_outtab.", "lt_employees"),
      a("fieldcat", "Field catalog", "One entry per column: field name and heading.", "lt_fieldcat TYPE slis_fieldcat_alv"),
      a("alv-fm", "ALV function module", "Shows the rows with the described columns.", "REUSE_ALV_LIST_DISPLAY"),
    ],
    relations: [r("selection", "table", "restricts the rows of"), r("table", "alv-fm", "is passed in t_outtab to"), r("fieldcat", "alv-fm", "is passed in it_fieldcat to")],
    activityTitle: t("Show the employees with ALV"), activityIntro: t("The HR team wants the employee table in an ALV list. Decide what the function module needs and what it leaves to you."),
    decisions: [
      d("alv-first", "In this program, what tells ALV which columns to show and how to name them?", [o("fieldcat", "The field catalog lt_fieldcat, passed in it_fieldcat"), o("select", "The SELECT statement alone"), o("screen", "The selection screen")], "fieldcat", "Each entry of the field catalog names a column (FIELDNAME) and its heading (SELTEXT_L). The function module reads the catalog from it_fieldcat.", ["Look at the ls_fieldcat lines.", "Which EXPORTING parameter carries the columns?"]),
      d("alv-display-step", "The program fills lt_employees and lt_fieldcat but never calls the function module. What does the user see?", [o("nothing", "No ALV list: the function module call shows it"), o("list", "The ALV list, because the table is filled"), o("write", "A classic WRITE list")], "nothing", "Filling tables only prepares the data. The list appears when CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY' runs.", ["Which line makes the list appear?", "Preparing data is not showing it."]),
      d("alv-write-back", "A user sorts the displayed list. Is the database table zaca_employee changed?", [o("changed", "Yes, ALV saves the new order"), o("unchanged", "No: ALV shows the internal table and never writes to the database by itself"), o("both", "Yes, but only after F8")], "unchanged", "ALV displays program data. Saving anything to the database is separate code that you write.", ["Which statement in the lesson code touches the database?", "SELECT reads, it does not change."]),
    ],
    quiz: t("What does the IF sy-subrc <> 0 check after the call catch?"), options: [t("An exception raised by the function module, such as program_error"), t("The user closing the list"), t("A table with more than 100 rows")], answer: 0,
    quizExplanation: t("EXCEPTIONS program_error = 1 and OTHERS = 2 make exceptions of the function module set sy-subrc, so the program can show a message."),
  },
  {
    id: "applications-module-pool", pathId: "applications", prerequisite: "applications-alv",
    title: t("Module pool: your own screen"), subtitle: t("Prepare the screen, then react to what the user did"),
    brief: t("A module pool is a program with its own screens (dynpros). Each screen has flow logic that calls ABAP modules: PBO modules run before the screen is shown, PAI modules run after the user acts. Screen fields share names with global variables, and a button sends a function code that the program reads from the OK field."),
    objectives: [t("Tell PBO (before the screen) from PAI (after the user acts)"), t("Explain how screen fields, global variables and the OK field connect"), t("Choose how a button leaves or changes the screen")],
    minutes: 20, xp: 190, difficulty: "intermediate", coveredTopics: ["Module Pool"],
    references: [cheats + "18_Dynpro.md"],
    boundary: t("Reference code for SAP GUI. Screens are drawn in the Screen Painter and the GUI status in the Menu Painter, so only the ABAP modules are shown here. Classic dynpros cannot be created in ABAP Cloud and the cheat sheet calls them outdated for application programs. The lab is a local model."),
    practice: t("In the lab, decide which module does each job, then check the rail: the screen fields, the OK field and the modules you placed."),
    code: `PROGRAM z_academy_screen.
DATA: gv_name    TYPE c LENGTH 30,
      gv_message TYPE string,
      ok_code    LIKE sy-ucomm,
      save_ok    LIKE ok_code.
MODULE pbo_9000 OUTPUT.
  SET PF-STATUS 'STATUS_9000'.
  SET TITLEBAR 'TITLE_9000'.
ENDMODULE.
MODULE pai_9000 INPUT.
  save_ok = ok_code.
  CLEAR ok_code.
  CASE save_ok.
    WHEN 'SHOW'.
      gv_message = |Hello { gv_name }|.
    WHEN 'BACK'.
      LEAVE TO SCREEN 0.
  ENDCASE.
ENDMODULE.`,
    groups: [
      g("screen-data", 1, 5, "Global data for the screen", "gv_name and gv_message have the same names as screen fields. ok_code is the OK field.", "Data moves from the screen to these variables at the start of PAI, and back to the screen at the end of the dialog step. The OK field is not tied to a screen element."),
      g("screen-pbo", 6, 9, "PBO: prepare the screen", "The OUTPUT module runs before screen 9000 is shown and sets its status and title.", "The names in quotes are GUI status and title objects created in the Menu Painter. PBO is also the place to pre-fill fields."),
      g("screen-pai-read", 10, 12, "PAI: read the function code", "After the user acts, the INPUT module copies the function code and clears the OK field.", "The cheat sheet recommends this pattern: keep the code in save_ok, clear ok_code, then decide with CASE."),
      g("screen-pai-act", 13, 19, "PAI: react", "SHOW builds a greeting from gv_name; BACK ends the screen sequence.", "LEAVE TO SCREEN 0 ends the current dynpro sequence. The message is shown after the next PBO moves gv_message to the screen."),
    ],
    artifacts: [
      a("screen", "Screen 9000", "The dynpro with fields GV_NAME, GV_MESSAGE and a SHOW and BACK button.", "dynpro 9000"),
      a("flow", "Flow logic", "Two calls in the Screen Painter: PBO calls pbo_9000, PAI calls pai_9000.", "PROCESS BEFORE OUTPUT. MODULE pbo_9000."),
      a("ok-field", "OK field", "Receives the function code of the pushed button.", "ok_code = 'SHOW'"),
      a("module", "Dialog module", "ABAP code between MODULE and ENDMODULE, called from the flow logic.", "MODULE pai_9000 INPUT."),
    ],
    relations: [r("flow", "module", "calls"), r("screen", "ok-field", "sends the function code to"), r("module", "screen", "fills fields of")],
    activityTitle: t("Wire up a greeting screen"), activityIntro: t("A clerk types a name and presses SHOW. Decide where each job belongs."),
    decisions: [
      d("screen-benefit", "A clerk must enter 20 employees one after another. Why does a module pool help?", [o("stays", "The screen stays open and answers back, so entries are quick"), o("list", "It prints all 20 employees as a list"), o("nodb", "It stores them without a database")], "stays", "A module pool gives the clerk one screen that stays open and reacts to each button press, which suits repeated entry.", ["Think about what the clerk does 20 times.", "A report asks once and prints a list."]),
      d("screen-where-title", "Where do you call SET TITLEBAR?", [o("pbo", "In a PBO (OUTPUT) module"), o("pai", "In a PAI (INPUT) module"), o("start", "In START-OF-SELECTION")], "pbo", "The title and status must be set before the screen is displayed, so they belong in PBO.", ["Does the screen exist yet when PBO runs?", "START-OF-SELECTION is a report event."]),
      d("screen-button", "The user presses SHOW. Where does the program learn which button it was?", [o("ok-code", "In the OK field, in the PAI module"), o("pbo-code", "In the PBO module before the screen"), o("title", "In the title bar")], "ok-code", "The button's function code is placed into the OK field during PAI. The program reads it there and decides with CASE.", ["The user acts after the screen is shown.", "Which variable is declared as LIKE sy-ucomm?"]),
      d("screen-leave", "The user presses BACK. How does the program close the screen?", [o("leave0", "It tells the system there is no next screen (screen 0)"), o("set9000", "It sets the next screen to the same screen 9000"), o("clear", "It clears the OK field")], "leave0", "Going to screen 0 ends the current screen sequence. Setting screen 9000 again would just show the same screen.", ["Which WHEN branch handles BACK?", "Screen 0 means: no next screen."]),
    ],
    quiz: t("When is data moved from the screen fields into the ABAP variables?"), options: [t("At the start of PAI"), t("At the end of PBO"), t("When the program is activated")], answer: 0,
    quizExplanation: t("Data moves from the dynpro to the program at the start of PAI, and from the program back to the dynpro at the end of the dialog step."),
  },
  {
    id: "applications-smart-forms", pathId: "applications", prerequisite: "applications-module-pool",
    title: t("Smart Forms: print a document"), subtitle: t("Find the generated function module and call it"),
    brief: t("A Smart Form designs a printed document such as an employee letter. When the form is activated, SAP generates a function module for it, with a different name in every system. The print program therefore asks SSF_FUNCTION_MODULE_NAME for that name first and then calls it, passing data through the form interface."),
    objectives: [t("Explain why the print program looks up the function module name"), t("Say what happens when the form is missing or not active"), t("Say when a form change needs a program change")],
    minutes: 18, xp: 180, difficulty: "intermediate", coveredTopics: ["Smart Forms"],
    references: ["https://help.sap.com/doc/saphelp_em92/9.2/en-US/4e/569e191c3e4f4ae10000000a42189e/content.htm"],
    boundary: t("Reference code for an SAP system. The form itself is designed in the Smart Forms Form Builder and is not shown here, only the program that calls it. Nothing is printed in the browser. Smart Forms are a classic SAP GUI tool and are not part of ABAP Cloud."),
    practice: t("In the lab, place each part of the call and then try two cases: a form that is not active, and a changed form interface."),
    code: `DATA: lv_fm_name  TYPE rs38l_fnam,
      ls_employee TYPE zaca_employee.
CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
  EXPORTING  formname = 'ZACA_EMPLOYEE_FORM'
  IMPORTING  fm_name  = lv_fm_name
  EXCEPTIONS no_form  = 1
             OTHERS   = 2.
IF sy-subrc <> 0.
  MESSAGE 'The form does not exist or is not active' TYPE 'E'.
ENDIF.
CALL FUNCTION lv_fm_name
  EXPORTING  is_employee = ls_employee
  EXCEPTIONS OTHERS      = 1.
IF sy-subrc <> 0.
  MESSAGE 'The form could not be printed' TYPE 'E'.
ENDIF.`,
    groups: [
      g("form-data", 1, 2, "Data for the form", "lv_fm_name will hold the generated function module name. ls_employee holds the employee to print.", "The form interface of ZACA_EMPLOYEE_FORM defines which data it accepts, here one employee in is_employee."),
      g("form-lookup", 3, 7, "Find the function module", "SSF_FUNCTION_MODULE_NAME returns the name of the function module generated for the form.", "The generated name, for example /1BCDWB/SF00000123, is different in every system. Never type it into the program."),
      g("form-check", 8, 10, "Check the lookup", "If the form is not active, the lookup raises NO_FORM and sy-subrc is not 0.", "A form only has a generated function module once it has been activated in that system, for example after a transport."),
      g("form-call", 11, 13, "Call the form", "CALL FUNCTION with the variable lv_fm_name runs the generated function module.", "Data goes in through the form interface. The call name is in a variable, so it is resolved when the program runs."),
      g("form-print-check", 14, 16, "Check the print", "If the call fails, the program reports it instead of continuing.", "If you change the form interface, adapt this call too. Other form changes need no program change once the form is activated again."),
    ],
    artifacts: [
      a("form", "Smart Form", "The designed document, with a form interface.", "ZACA_EMPLOYEE_FORM"),
      a("generated-fm", "Generated function module", "Created when the form is activated; its name depends on the system.", "/1BCDWB/SF00000123"),
      a("lookup", "Lookup function module", "Returns the generated name for a form name.", "SSF_FUNCTION_MODULE_NAME"),
      a("interface", "Form interface", "The data the form accepts.", "is_employee TYPE zaca_employee"),
    ],
    relations: [r("form", "generated-fm", "activation creates"), r("lookup", "generated-fm", "returns the name of"), r("interface", "form", "feeds")],
    activityTitle: t("Print an employee form"), activityIntro: t("Payroll wants a printed employee form from a program. Decide how the program finds and calls the form."),
    decisions: [
      d("form-benefit", "Marketing wants the logo moved to the other side of the letter. What does a Smart Form change about that job?", [o("designer", "A designer changes the form and the business program is not touched"), o("rewrite", "The business program must be rewritten"), o("auto", "The logo moves by itself")], "designer", "The layout lives in the form, not in the program. The program only hands over the data.", ["Where does the layout of a Smart Form live?", "What does the program hand over?"]),
      d("form-hardcode", "A colleague types the generated function module name /1BCDWB/SF00000123 into the program. What is the problem?", [o("per-system", "The generated name differs in every system, so it breaks after a transport"), o("too-long", "The name is too long for a variable"), o("nothing", "No problem, the name never changes")], "per-system", "SSF_FUNCTION_MODULE_NAME exists so the program gets the correct name in each system.", ["Think about a transport to production.", "Where does the name come from?"]),
      d("form-not-active", "The form was transported but not yet activated in production. What does the lookup do?", [o("no-form", "It raises NO_FORM, so sy-subrc is not 0"), o("prints", "It prints an empty page"), o("creates", "It activates the form automatically")], "no-form", "A form without an active generated function module raises NO_FORM. The program must check sy-subrc.", ["Which line follows the lookup call?", "What does EXCEPTIONS no_form = 1 do?"]),
      d("form-interface", "You add a new field to the form interface. What must you do?", [o("adapt", "Adapt the program's call to pass the new data"), o("nothing", "Nothing: the interface is read automatically"), o("rename", "Rename the form")], "adapt", "Only a change of the form interface requires a change in the application program. Layout changes do not.", ["Which part of the call passes data?", "The program and the form agree on the interface."]),
    ],
    quiz: t("What does CALL FUNCTION lv_fm_name use as the function module name?"), options: [t("The name returned by SSF_FUNCTION_MODULE_NAME"), t("The form name ZACA_EMPLOYEE_FORM"), t("The program name")], answer: 0,
    quizExplanation: t("The form name goes into the lookup. The returned generated name goes into CALL FUNCTION."),
  },
  {
    id: "applications-debugging", pathId: "applications", prerequisite: "applications-smart-forms",
    title: t("Debugging: watch a program run"), subtitle: t("Stop, step and watch variables change"),
    brief: t("The debugger stops a running program so you can see it line by line. A breakpoint stops at a line. F5 steps into a call, F6 steps over it, F7 returns to the caller and F8 continues to the next breakpoint. The variables view shows the values, and a watchpoint stops when a variable changes."),
    objectives: [t("Set a breakpoint and step through the loop with the right key"), t("Read variable values at each stop"), t("Choose between a breakpoint and a watchpoint")],
    minutes: 16, xp: 170, difficulty: "beginner", coveredTopics: ["Debugging"],
    references: ["https://learning.sap.com/courses/basic-abap-programming/debugging-an-abap-program_d070e545-efd5-4d87-8b75-20f18d7b7d3b"],
    boundary: t("The browser has no debugger. The lab is a local model that shows the values this small program would have at each stop. Function keys follow the classic SAP GUI debugger; ABAP Development Tools in Eclipse has the same ideas with its own shortcuts."),
    practice: t("Follow the stops, then in the lab choose the right key or breakpoint kind for each situation and watch the variables on the rail."),
    code: `DATA: lv_total TYPE i,
      lv_index TYPE i.
DO 3 TIMES.
  lv_index = sy-index.
  lv_total = lv_total + lv_index.
ENDDO.
WRITE / lv_total.`,
    groups: [
      g("debug-start", 1, 2, "Before anything runs", "Both variables start at 0. A breakpoint on the DO line would stop here.", "Without a breakpoint, or /h in the command field, the program runs without stopping."),
      g("debug-step", 3, 4, "Step into the loop", "F6 runs line 4: lv_index becomes 1.", "F5 and F6 behave the same on a plain assignment. They differ on a line that calls another routine."),
      g("debug-watch", 5, 5, "Watch the total", "After line 5 on the first pass, lv_total is 1. A watchpoint on lv_total stops here and on every change.", "A breakpoint stops at a line. A watchpoint stops when the value of a variable changes."),
      g("debug-end", 6, 7, "Continue to the end", "F8 runs on to the next stop. After three passes lv_total is 6 and WRITE shows 6.", "Passes: index 1 total 1, index 2 total 3, index 3 total 6."),
    ],
    artifacts: [
      a("breakpoint", "Breakpoint", "Stops the program at a chosen line.", "line 3: DO 3 TIMES."),
      a("keys", "Step keys", "F5 into, F6 over, F7 return, F8 continue.", "F5 F6 F7 F8"),
      a("variables", "Variables view", "Shows current values.", "lv_index = 1, lv_total = 1"),
      a("watchpoint", "Watchpoint", "Stops when a variable's value changes.", "watch lv_total"),
    ],
    relations: [r("breakpoint", "keys", "then you move with"), r("keys", "variables", "update"), r("watchpoint", "variables", "watches")],
    activityTitle: t("Find why the total is wrong"), activityIntro: t("A colleague says the total looks wrong. Decide how to look inside the running program."),
    decisions: [
      d("debug-benefit", "A total looks wrong but the code looks right. What does the debugger give you?", [o("values", "The real value of each variable at each stop"), o("fast", "A faster program"), o("fix", "Automatic fixes")], "values", "The debugger shows what the program really holds while it runs, so you can find where the value goes wrong.", ["Guessing is what the debugger replaces.", "It shows, it does not repair."]),
      d("debug-key-over", "You are on a line that calls a long routine you trust. Which key runs it as a single step?", [o("f6", "F6 (step over)"), o("f5", "F5 (step into)"), o("f7", "F7 (return)")], "f6", "F6 runs the whole call as one statement. F5 would enter the routine.", ["Which key skips the inside of a call?", "F7 leaves the routine you are already in."]),
      d("debug-watch-choice", "You want to stop whenever lv_total changes, anywhere in a long program. What do you set?", [o("watch", "A watchpoint on lv_total"), o("break", "A breakpoint on the first line"), o("write", "A WRITE after every line")], "watch", "A watchpoint stops when a variable's value changes, so you do not need to know the line.", ["Which tool reacts to a value, not a line?", "A breakpoint stops at one place only."]),
      d("debug-values", "After line 5 on the second pass, what are lv_index and lv_total?", [o("2-3", "lv_index = 2 and lv_total = 3"), o("2-2", "lv_index = 2 and lv_total = 2"), o("1-3", "lv_index = 1 and lv_total = 3")], "2-3", "Pass 2 sets lv_index to 2 and adds it to the earlier total 1, which gives 3.", ["Total after pass 1 is 1.", "Add the new index to the old total."]),
    ],
    quiz: t("Which key continues the program to the next breakpoint or watchpoint?"), options: [t("F8"), t("F5"), t("F7")], answer: 0,
    quizExplanation: t("F8 continues to the next breakpoint or watchpoint. F5 and F6 move one step, and F7 finishes the current routine."),
  },
  {
    id: "applications-transactions", pathId: "applications", prerequisite: "applications-debugging",
    title: t("SAP transactions: start a program with a code"), subtitle: t("Give a report or a screen its own transaction code"),
    brief: t("Users start SAP programs with transaction codes. In SE93 you create a custom code that starts either an executable report (usually on its selection screen 1000) or a module pool on an initial screen number. Custom codes start with Z or Y. Developers also use a few standard codes every day: SE38, SE80, SE11 and SE16."),
    objectives: [t("Tell a report transaction from a dialog transaction"), t("Choose the right start object and screen number"), t("Name the standard tools behind SE38, SE80, SE11 and SE16")],
    minutes: 15, xp: 160, difficulty: "beginner", coveredTopics: ["SAP transactions"],
    references: ["https://help.sap.com/doc/saphelp_scm700_ehp01/7.0.1/en-US/43/0f94d6c2086ff3e10000000a422035/content.htm"],
    boundary: t("SE93 is a SAP GUI form, so it is shown here as text and nothing is created. Names follow the lesson's running example. Check each field against your own release, since the form's wording can differ."),
    practice: t("In the lab, pick the start object and screen number for two transaction codes and see the finished SE93 entries on the rail."),
    code: `Transaction     ZACA_REPORT
Short text      Employee report
Start object    Program and selection screen (report transaction)
Program         Z_ACADEMY_REPORT
Screen number   1000
Transaction     ZACA_SCREEN
Short text      Employee dialog
Start object    Program and screen (dialog transaction)
Program         Z_ACADEMY_SCREEN
Screen number   9000`,
    groups: [
      g("tx-name", 1, 2, "Name the report transaction", "ZACA_REPORT is a custom code, so it starts with Z.", "Z and Y are the custom namespace. The short text is shown in menus and search."),
      g("tx-report", 3, 5, "Start an executable report", "The start object is a program and selection screen. The screen number 1000 is the report's default selection screen.", "Users enter ZACA_REPORT and land on the selection screen of Z_ACADEMY_REPORT."),
      g("tx-dialog-name", 6, 7, "Name the dialog transaction", "ZACA_SCREEN is a second custom code.", "One program can have more than one transaction code, but each code starts exactly one thing."),
      g("tx-dialog", 8, 10, "Start a module pool", "The start object is a program and screen. The screen number must exist in the program.", "9000 is the first screen of the module pool from the previous lesson."),
    ],
    artifacts: [
      a("tcode", "Transaction code", "The short name a user types in the command field.", "ZACA_REPORT"),
      a("report-tx", "Report transaction", "Starts an executable report on its selection screen, usually 1000.", "Z_ACADEMY_REPORT / 1000"),
      a("dialog-tx", "Dialog transaction", "Starts a module pool on a chosen initial screen.", "Z_ACADEMY_SCREEN / 9000"),
      a("tools", "Developer codes", "SE38 ABAP Editor, SE80 Object Navigator, SE11 ABAP Dictionary, SE16 Data Browser.", "SE38 SE80 SE11 SE16"),
    ],
    relations: [r("tcode", "report-tx", "can start a"), r("tcode", "dialog-tx", "can start a"), r("tools", "tcode", "are standard examples of")],
    activityTitle: t("Give each program a code"), activityIntro: t("Two programs need codes: an employee report and the greeting screen. Decide how each is started."),
    decisions: [
      d("tx-benefit", "Why give a report its own transaction code?", [o("short", "Users type a short code and the report opens, without knowing where the program is"), o("fast", "It makes the report run faster"), o("data", "It changes the data the report reads")], "short", "A transaction code is a short name that starts a program, so users do not need to find it.", ["What does the user type?", "A code starts a program. It does not change how it runs."]),
      d("tx-report-kind", "ZACA_REPORT must start the executable report Z_ACADEMY_REPORT. Which start object fits?", [o("report", "Program and selection screen (report transaction), screen 1000"), o("dialog", "Program and screen, screen 9000"), o("none", "No start object is needed")], "report", "An executable report starts on its selection screen, usually number 1000.", ["Which program type is a report?", "1000 is the standard selection screen."]),
      d("tx-dialog-kind", "ZACA_SCREEN must open the module pool on screen 9000. What do you enter?", [o("dialog", "Program Z_ACADEMY_SCREEN and screen number 9000"), o("report", "Program Z_ACADEMY_SCREEN and screen number 1000"), o("any", "Any screen number, the system picks one")], "dialog", "A dialog transaction links a module pool program with its initial screen number, which must exist in that program.", ["Screen 1000 is for reports.", "The module pool's screen is 9000."]),
      d("tx-tools", "You want to look at the contents of a table quickly. Which standard code fits?", [o("se16", "SE16, the Data Browser"), o("se11", "SE38, the ABAP Editor"), o("se80", "SE93, transaction maintenance")], "se16", "SE16 shows table contents. SE11 defines tables, SE38 edits programs and SE93 maintains transaction codes.", ["Which tool is for browsing data?", "SE11 is for definitions."]),
    ],
    quiz: t("Which first letters can a custom transaction code start with?"), options: [t("Z or Y"), t("A or B"), t("Only S")], answer: 0,
    quizExplanation: t("Custom development objects, including transaction codes, use the customer namespace that starts with Z or Y."),
  },
];
