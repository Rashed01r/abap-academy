// Data for the SAP Application Development lessons: the Learn side panel (the Explore code content is in application-concepts.ts).
// Reference teaching models: nothing is created, run or activated in an SAP system. English only while ENABLE_ARABIC = false.
import { isModernLesson } from "./modern-lessons";
import { cloudLessons } from "./cloud-content";
export type Choice = { text: string; ok: boolean; why: string };
export type TryIt = { title: string; question: string; options: Choice[] };
export type LabStep = { name: string; hint: string; title: string; intro: string; question: string; options: Choice[]; adds: string };
export type ApplicationLesson = {
  panelTitle: string;
  /** [stage, label, value]: a row appears once the learner reaches its stage (a Learn "part"). */
  rows: [number, string, string][];
  /** One small try-it per stage. */
  tries: Record<number, TryIt>;
  /** Optional question-by-question Explore lab (used by the ALV lesson). */
  lab?: { label: string; startTitle: string; start: string; steps: LabStep[] };
};
const c = (text: string, ok: boolean, why: string): Choice => ({ text, ok, why });

export const applicationLessons: Record<string, ApplicationLesson> = {
  "applications-reports": {
    panelTitle: "The report · Z_ACADEMY_REPORT",
    rows: [
      [0, "Program type", "Executable report with one input, p_count"],
      [1, "INITIALIZATION", "Sets the default p_count = 3 before the screen appears"],
      [2, "AT SELECTION-SCREEN", "Rejects a count outside 1 to 5 with an error message"],
      [3, "START-OF-SELECTION", "Writes 1, 2, 3 after valid input"],
      [4, "END-OF-SELECTION", "Writes Finished on the normal path only"],
    ],
    tries: {
      1: { title: "Where does the default belong?", question: "The user should already see 3 in the field.", options: [
        c("INITIALIZATION", true, "It runs before the selection screen is shown, so the user sees the default."),
        c("START-OF-SELECTION", false, "That runs after the user pressed Execute: too late for a default."),
        c("END-OF-SELECTION", false, "That is the final event of the normal flow.")] },
      2: { title: "The user enters 0", question: "Which event stops this input?", options: [
        c("AT SELECTION-SCREEN", true, "The error message keeps the user on the selection screen."),
        c("START-OF-SELECTION", false, "Main processing has not started when input is validated."),
        c("END-OF-SELECTION", false, "That comes after the list has been produced.")] },
    },
  },
  "applications-alv": {
    panelTitle: "The ALV program · employees",
    rows: [
      [0, "Declarations", "ty_employee, lt_employees, lt_fieldcat and the selection table s_id"],
      [1, "Read", "SELECT … WHERE employee_id IN s_id fills lt_employees"],
      [2, "Field catalog", "One entry per column: FIELDNAME and SELTEXT_L"],
      [3, "Display", "REUSE_ALV_LIST_DISPLAY gets it_fieldcat and t_outtab"],
      [4, "Check", "sy-subrc <> 0 means the list could not be shown"],
    ],
    tries: {
      1: { title: "Which employees are read?", question: "Which part restricts the rows to the IDs the user selected?", options: [
        c("WHERE employee_id IN s_id", true, "s_id is the selection table. An empty selection means all employees."), c("APPEND ls_fieldcat TO lt_fieldcat", false, "That adds a column description, not rows."), c("CLEAR ls_fieldcat", false, "That only empties the work area.")] },
      2: { title: "After each column", question: "Why is ls_fieldcat cleared after each APPEND?", options: [
        c("So one column's settings do not carry over to the next", true, "APPEND copied the entry already, so the work area can start fresh."), c("To delete the column from the list", false, "The catalog entry was already copied by APPEND."), c("To save the data", false, "CLEAR changes nothing in the database.")] },
      3: { title: "Press display", question: "The program never calls the function module. What does the user see?", options: [
        c("No ALV list", true, "The list appears only when the function module call runs."), c("The ALV list", false, "Filling tables only prepares data."), c("A WRITE list", false, "No WRITE statement ran.")] },
    },
    lab: { label: "ALV lab", startTitle: "Program so far", start: "TYPES: BEGIN OF ty_employee, … END OF ty_employee.\nDATA: lt_employees TYPE TABLE OF ty_employee,\n      lt_fieldcat  TYPE TABLE OF slis_fieldcat_alv,\n      ls_fieldcat  TYPE slis_fieldcat_alv.\nSELECT-OPTIONS s_id FOR lv_id.\nSTART-OF-SELECTION.", steps: [
      { name: "Read", hint: "read", title: "Read the selected rows", intro: "The user chooses employee IDs on the selection screen.", question: "How do you restrict the rows to the selected IDs?", adds: "  SELECT employee_id employee_name department\n    FROM zaca_employee\n    INTO TABLE lt_employees\n    WHERE employee_id IN s_id.", options: [
        c("WHERE employee_id IN s_id", true, "The selection table filters the rows."), c("APPEND ls_fieldcat TO lt_fieldcat", false, "That describes a column."), c("CLEAR lt_employees", false, "That would empty the rows.")] },
      { name: "Columns", hint: "catalog", title: "Describe a column", intro: "ALV needs a field catalog entry for each column.", question: "How do you describe one column?", adds: "  ls_fieldcat-fieldname = 'EMPLOYEE_ID'.\n  ls_fieldcat-seltext_l = 'Employee ID'.\n  APPEND ls_fieldcat TO lt_fieldcat.\n  CLEAR ls_fieldcat.", options: [
        c("Fill ls_fieldcat, APPEND it to lt_fieldcat, then CLEAR it", true, "FIELDNAME names the column and SELTEXT_L is its heading."), c("Write the heading inside the SELECT", false, "SELECT only reads values."), c("Call the function module twice", false, "One call shows the whole list.")] },
      { name: "Display", hint: "display", title: "Show the list", intro: "Nothing appears until the function module is called.", question: "Which call shows the list?", adds: "  CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY'\n    EXPORTING  it_fieldcat   = lt_fieldcat\n    TABLES     t_outtab      = lt_employees\n    EXCEPTIONS program_error = 1\n               OTHERS        = 2.", options: [
        c("CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY'", true, "The columns go in it_fieldcat and the rows in t_outtab."), c("SELECT … INTO TABLE", false, "That only fills the table."), c("APPEND ls_fieldcat", false, "That only builds the catalog.")] },
      { name: "Check", hint: "errors", title: "Check the result", intro: "The function module can raise exceptions.", question: "What do you test after the call?", adds: "  IF sy-subrc <> 0.\n    MESSAGE 'The list could not be displayed' TYPE 'E'.\n  ENDIF.", options: [
        c("sy-subrc", true, "EXCEPTIONS turns an exception into a non-zero sy-subrc."), c("Nothing, ALV never fails", false, "The function module can raise exceptions."), c("COMMIT WORK", false, "ALV does not change the database.")] },
    ] },
  },
  "applications-module-pool": {
    panelTitle: "The module pool · screen 9000",
    rows: [
      [0, "Screen fields", "GV_NAME and GV_MESSAGE, same names as the variables"],
      [0, "OK field", "ok_code receives the function code of a button"],
      [1, "PBO", "pbo_9000 OUTPUT sets the status and title before display"],
      [2, "PAI start", "pai_9000 INPUT copies ok_code to save_ok, then clears it"],
      [3, "PAI action", "SHOW builds the greeting; BACK leaves to screen 0"],
    ],
    tries: {
      1: { title: "PBO or PAI?", question: "Where do you call SET TITLEBAR?", options: [
        c("PBO", true, "The title is set before the screen is displayed."), c("PAI", false, "PAI runs after the user acted."), c("Neither", false, "The title object is used in PBO.")] },
      2: { title: "Which button?", question: "Where does the program read the pushed button?", options: [
        c("The OK field", true, "The function code lands in the OK field during PAI."), c("The title bar", false, "The title is only text for the user."), c("gv_message", false, "That is an output field.")] },
    },
  },
  "applications-smart-forms": {
    panelTitle: "The print program · ZACA_EMPLOYEE_FORM",
    rows: [
      [0, "Form interface", "is_employee TYPE zaca_employee"],
      [1, "Lookup", "SSF_FUNCTION_MODULE_NAME returns the generated function module name"],
      [2, "Lookup check", "NO_FORM means the form does not exist or is not active"],
      [3, "Call", "CALL FUNCTION lv_fm_name passes the employee"],
      [4, "Print check", "sy-subrc <> 0 means the print failed"],
    ],
    tries: {
      1: { title: "Why a lookup?", question: "Why not type /1BCDWB/SF00000123 into the program?", options: [
        c("The generated name differs in every system", true, "Typing it breaks after a transport."), c("It is too long", false, "Length is not the problem."), c("It cannot be typed", false, "It can, but it would be wrong elsewhere.")] },
      2: { title: "Form not active", question: "What does the lookup do for an inactive form?", options: [
        c("Raises NO_FORM", true, "The program checks sy-subrc after the lookup."), c("Prints an empty page", false, "Nothing is printed by the lookup."), c("Activates it", false, "Activation is a separate step.")] },
    },
  },
  "applications-debugging": {
    panelTitle: "The debugger · variables",
    rows: [
      [0, "Before the loop", "lv_index = 0, lv_total = 0 (breakpoint on DO)"],
      [1, "After F6 on line 4", "lv_index = 1, lv_total = 0"],
      [2, "After line 5, pass 1", "lv_index = 1, lv_total = 1 (a watchpoint on lv_total stops here)"],
      [3, "After F8, loop done", "lv_index = 3, lv_total = 6, WRITE shows 6"],
    ],
    tries: {
      1: { title: "Which key?", question: "You want to run a trusted call as one step.", options: [
        c("F6, step over", true, "F6 treats the call as a single statement."), c("F5, step into", false, "F5 enters the called routine."), c("F7, return", false, "F7 finishes the routine you are in.")] },
      2: { title: "Breakpoint or watchpoint?", question: "You want to stop whenever lv_total changes.", options: [
        c("A watchpoint", true, "It stops when a variable's value changes."), c("A breakpoint", false, "It stops at one chosen line."), c("F8", false, "F8 continues to the next stop.")] },
    },
  },
  "applications-transactions": {
    panelTitle: "The transaction codes · SE93",
    rows: [
      [0, "ZACA_REPORT", "A custom code (starts with Z)"],
      [1, "Report start object", "Program and selection screen: Z_ACADEMY_REPORT, screen 1000"],
      [2, "ZACA_SCREEN", "A second custom code"],
      [3, "Dialog start object", "Program and screen: Z_ACADEMY_SCREEN, screen 9000"],
    ],
    tries: {
      1: { title: "Which screen number?", question: "Which screen number does a report usually start with?", options: [
        c("1000", true, "1000 is the default selection screen of an executable program."), c("9000", false, "That is the module pool's first screen in this lesson."), c("0", false, "Screen 0 ends a sequence.")] },
      3: { title: "Dialog transaction", question: "What must match for a dialog transaction?", options: [
        c("The screen number must exist in the program", true, "The initial screen belongs to the module pool."), c("The code must equal the program name", false, "Codes and programs have separate names."), c("Nothing must match", false, "A wrong screen number fails at start.")] },
    },
  },
};
/** Lessons taught idea-first (concept explorer on Learn, code on Explore code). ALV keeps its original code-first design. */
export const isConceptLesson = (id: string) => id in applicationLessons && id !== "applications-alv";
export const isApplicationLesson = (id: string) => id in applicationLessons;
/** Reference lessons delivered with step-by-step Explore labs and the one-decision-at-a-time Challenge. */
export const isStepLesson = (id: string) => isModernLesson(id) || id.startsWith("dictionary-") || isApplicationLesson(id) || id === "database-fundamentals" || id === "oop-introduction" || id in cloudLessons;
