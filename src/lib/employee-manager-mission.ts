import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";

// Capstone of the Working with Data path. It only combines statements taught earlier in the path:
// APPEND, table expressions with line_index( ), MODIFY/DELETE … INDEX and LOOP AT with a running total.
const t = (en: string): Text => ({ en });
export const employeeManagerSetup = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
  salary TYPE i,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
DATA lv_id TYPE i VALUE 102.
DATA lv_raise TYPE i VALUE 500.
DATA lv_position TYPE i.
DATA lv_count TYPE i VALUE 0.
DATA lv_total TYPE i VALUE 0.
ls_employee-id = 101.
ls_employee-name = 'Ahmed'.
ls_employee-salary = 5000.
APPEND ls_employee TO lt_employees.
ls_employee-id = 102.
ls_employee-name = 'Sara'.
ls_employee-salary = 8000.
APPEND ls_employee TO lt_employees.
ls_employee-id = 103.
ls_employee-name = 'Omar'.
ls_employee-salary = 6000.
APPEND ls_employee TO lt_employees.`;
const raiseBlock = `lv_position = line_index( lt_employees[ id = lv_id ] ).
IF lv_position > 0.
  ls_employee = lt_employees[ lv_position ].
  ls_employee-salary = ls_employee-salary + lv_raise.
  MODIFY lt_employees FROM ls_employee INDEX lv_position.
  WRITE / ls_employee-salary.
ELSE.
  WRITE / 'Not found'.
ENDIF.`;
const removeReportBlock = `lv_position = line_index( lt_employees[ id = lv_id ] ).
IF lv_position > 0.
  DELETE lt_employees INDEX lv_position.
ELSE.
  WRITE / 'Not found'.
ENDIF.
LOOP AT lt_employees INTO ls_employee.
  WRITE / ls_employee-name.
  lv_count = lv_count + 1.
  lv_total = lv_total + ls_employee-salary.
ENDLOOP.
WRITE / lv_count.
WRITE / lv_total.`;
export const employeeManagerExample = `${employeeManagerSetup}
${raiseBlock}
lv_position = line_index( lt_employees[ id = 101 ] ).
IF lv_position > 0.
  DELETE lt_employees INDEX lv_position.
ENDIF.
LOOP AT lt_employees INTO ls_employee.
  WRITE / ls_employee-name.
  lv_count = lv_count + 1.
  lv_total = lv_total + ls_employee-salary.
ENDLOOP.
WRITE / lv_count.
WRITE / lv_total.`;
export const employeeManagerOutput = "8500\nSara\nOmar\n2\n14500";

const updateToken: SyntaxToken = {
  id: "find-change-save", label: "Find, change, save",
  meaning: t("To change one employee: line_index( ) finds the row position, the table expression copies that row into the work area, you change the copy, and MODIFY … INDEX writes the copy back to the same position."),
  why: t("A raise must change the stored employee. Changing only the work area changes a copy and the table keeps the old salary."),
  write: t("Store the position first. Only when it is greater than 0: copy the row, change the field, then MODIFY lt_employees FROM ls_employee INDEX lv_position."),
  correct: "ls_employee = lt_employees[ lv_position ].\nls_employee-salary = ls_employee-salary + lv_raise.\nMODIFY lt_employees FROM ls_employee INDEX lv_position.",
  mistake: "ls_employee = lt_employees[ lv_position ].\nls_employee-salary = ls_employee-salary + lv_raise.",
  question: t("You add the raise to ls_employee but forget MODIFY. What does the table hold?"),
  options: [t("The old salary"), t("The new salary")], answer: 0,
  explanation: t("ls_employee is a copy. Only MODIFY copies it back into the table row."),
};
const removeToken: SyntaxToken = {
  id: "remove-report", label: "Remove, then report",
  meaning: t("DELETE lt_employees INDEX lv_position removes one row; the rows after it move up. A LOOP afterwards visits only the employees that remain, so the count and total match the current table."),
  why: t("A manager report must reflect the staff list as it is now, not as it was before someone left."),
  write: t("Find the position with line_index( ). If it is 0, write Not found and delete nothing. Run the report LOOP after the DELETE, and write the count and total after ENDLOOP."),
  correct: "IF lv_position > 0.\n  DELETE lt_employees INDEX lv_position.\nENDIF.",
  mistake: "DELETE lt_employees INDEX lv_position.",
  question: t("lv_id is 999, so lv_position is 0. Why must the DELETE be inside IF lv_position > 0?"),
  options: [t("INDEX 0 is not a valid row; nothing should be deleted"), t("DELETE would remove the first employee")], answer: 0,
  explanation: t("Positions start at 1. Guarding the DELETE keeps the table unchanged when the ID does not exist."),
};
const raiseGoal = t("Keep the supplied employees, lv_id and lv_raise. Find the position of the employee whose id equals lv_id with line_index( ). If it is greater than 0, copy that row into ls_employee, add lv_raise to its salary, save it back with MODIFY … INDEX, and display the new salary. Otherwise display 'Not found' and change nothing. The checker changes IDs, salaries, lv_id and lv_raise, including an ID that does not exist.");
const reportGoal = t("Keep the supplied employees and lv_id. Remove the employee whose id equals lv_id (display 'Not found' if there is none). Then LOOP over the remaining employees: display each name, count them in lv_count and add their salaries to lv_total. After ENDLOOP display lv_count, then lv_total. The checker changes the employees and lv_id, including an ID that does not exist.");
const raiseHints = [
  t("Step 1: lv_position = line_index( lt_employees[ id = lv_id ] ). It is 0 when the ID is missing."),
  t("Step 2, inside IF lv_position > 0: ls_employee = lt_employees[ lv_position ]. then add lv_raise to ls_employee-salary."),
  t("Step 3: MODIFY lt_employees FROM ls_employee INDEX lv_position. then WRITE / ls_employee-salary. Put WRITE / 'Not found'. in the ELSE branch."),
];
const reportHints = [
  t("Find the position with line_index( ), then DELETE lt_employees INDEX lv_position only when it is greater than 0."),
  t("After ENDIF: LOOP AT lt_employees INTO ls_employee. Inside, WRITE / ls_employee-name and add to lv_count and lv_total."),
  t("After ENDLOOP: WRITE / lv_count. and WRITE / lv_total. With lv_id = 102 the screen shows Ahmed, Omar, 2, 11000."),
];
const raiseStarter = `${employeeManagerSetup}\n* Give employee lv_id a raise of lv_raise and save it in the table.\n`;
const reportStarter = `${employeeManagerSetup}\n* Remove employee lv_id, then report the remaining employees.\n`;
export const employeeManagerRaiseSolution = `${employeeManagerSetup}\n${raiseBlock}`;
export const employeeManagerReportSolution = `${employeeManagerSetup}\n${removeReportBlock}`;
export const employeeManagerMission: Mission = {
  id: "data-employee-manager", pathId: "data", prerequisite: "data-table-performance",
  title: t("Build the Employee Data Manager"), subtitle: t("Find, update, remove and report employees in one small program"),
  minutes: 40, xp: 400, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "project",
  coveredTopics: ["Employee Data Manager"],
  brief: t("This project puts the whole path together, using only statements you already know. The program stores Ahmed, Sara and Omar. It finds Sara with line_index( ), copies her row, adds a raise of 500 and saves it back with MODIFY, so her salary becomes 8500. It finds Ahmed and removes him with DELETE. Finally a LOOP reports the employees who remain, Sara and Omar, with their count 2 and total 14500. Each step checks that the employee exists first, so a wrong ID changes nothing."),
  objectives: [t("Find an employee by ID, change a copy of the row and save it back with MODIFY"), t("Remove an employee safely, then report the remaining count and total with LOOP")],
  references: [
    "https://help.sap.com/docs/abap-cloud/abap-keyword/itab-func-line-index",
    "https://help.sap.com/docs/abap-cloud/abap-keyword/modify-itab-single",
    "https://help.sap.com/docs/abap-cloud/abap-keyword/delete-itab-line",
    "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md",
  ],
  tokens: [updateToken, removeToken], example: employeeManagerExample,
  visual: t("Step through the four parts. Watch Sara's row: the work area gets 8500 first, and the table only changes at MODIFY. At DELETE, Ahmed's row disappears and Sara moves up to position 1. In the LOOP, the count and total grow once per remaining employee. Change lv_id to 999 to see Not found and an unchanged table."),
  practice: t("Try lv_id 101, 103 and 999 and lv_raise 0 and 1000. Predict the new salary and the final report before running. Every change happens in program memory only; nothing is saved to a database. The browser runs the same supported subset as the earlier lessons in this path."),
  goal: raiseGoal, hint: raiseHints[0], hints: raiseHints, starter: raiseStarter, solution: employeeManagerRaiseSolution, expected: "8500",
  challenges: [
    { id: "data-manager-raise", title: t("Give an employee a raise"), goal: raiseGoal, hint: raiseHints[2], starter: raiseStarter, solution: employeeManagerRaiseSolution, expected: "8500" },
    { id: "data-manager-report", title: t("Remove an employee and report the rest"), goal: reportGoal, hint: reportHints[2], starter: reportStarter, solution: employeeManagerReportSolution, expected: "Ahmed\nOmar\n2\n11000" },
  ],
  quiz: t("lv_id changes to 999 in the example. What happens?"),
  options: [
    t("Not found is shown, nobody gets a raise, and the report still shows Sara, Omar, 2 and 14000"),
    t("The first employee gets the raise instead"),
    t("The program stops because ID 999 does not exist"),
  ], answer: 0,
  quizExplanation: t("line_index( ) returns 0 for 999, so the IF skips the raise and writes Not found. Ahmed is still removed by his own ID 101, so the report lists Sara at 8000 and Omar at 6000: count 2, total 14000. line_index( ) never stops the program."),
};

function group(id: string, lines: [number, number], title: string, explanation: string, syntaxRefs: string[] = []): AnatomyGroupSpec {
  return { id, lines, title: t(title), explanation: t(explanation), practice: t(`Which source section ${explanation[0].toLowerCase() + explanation.slice(1)}`), syntaxRefs, visualizer: { kind: "snapshot", line: lines[1] } };
}
export const employeeManagerGroups: AnatomyGroupSpec[] = [
  group("row", [1, 5], "Describe an employee", "Defines integer ID, text name and integer salary fields without creating a row."),
  group("storage", [6, 12], "Create the manager's storage", "Creates the table, the work area, the ID to change (102), the raise (500), a position and zero count and total."),
  group("add", [13, 24], "Add three employees", "Appends Ahmed 101, Sara 102 and Omar 103 at positions 1, 2 and 3."),
  group("find", [25, 26], "Find the employee", "Stores Sara's position, 2, and continues only because it is greater than 0.", ["find-change-save"]),
  group("raise", [27, 30], "Change and save the salary", "Copies Sara's row, raises the copy to 8500, writes it back to position 2 and displays 8500.", ["find-change-save"]),
  group("missing", [31, 33], "Handle a missing ID", "Would display Not found and change nothing if the ID did not exist."),
  group("remove", [34, 37], "Remove an employee", "Finds Ahmed at position 1 and deletes that row; Sara and Omar move up.", ["remove-report"]),
  group("report", [38, 42], "Report the remaining staff", "Visits Sara and Omar, displaying each name and adding to the count and total.", ["remove-report"]),
  group("totals", [43, 44], "Display count and total", "Displays 2 employees and a total salary of 14500 after the loop.", ["remove-report"]),
];
export const employeeManagerEducation: EducationSpec = {
  what: t("A small manager program that finds, updates, removes and reports employees stored in an internal table."),
  why: t("Real programs combine these steps. Doing them in the right order, and only when the employee exists, keeps the data correct."),
  concepts: [
    { id: "find-first", name: t("Find before you change"), explanation: t("line_index( lt_employees[ id = lv_id ] ) returns Sara's position, 2. The IF lets the update run only for a position greater than 0."), misconception: t("A position of 0 means the employee is missing. Never use it as a row number."), objectives: [0], learn: ["group:find", "group:missing", "token:find-change-save"], demonstrate: "trace", assess: ["data-manager-raise", "knowledge-check"] },
    { id: "copy-save", name: t("Change a copy, then save it"), explanation: t("The table expression copies Sara's row into ls_employee. Adding the raise changes only the copy until MODIFY … INDEX 2 writes it back."), misconception: t("Forgetting MODIFY leaves the old salary in the table, even though the work area shows the new one."), objectives: [0], learn: ["group:raise", "token:find-change-save"], demonstrate: "trace", assess: ["data-manager-raise", "concept-check"] },
    { id: "remove-shift", name: t("Delete moves later rows up"), explanation: t("Deleting Ahmed at position 1 moves Sara to 1 and Omar to 2. Find a position again after a DELETE instead of reusing an old one."), misconception: t("DELETE with position 0 is not a safe no-op. Guard it with IF lv_position > 0."), objectives: [1], learn: ["group:remove", "token:remove-report"], demonstrate: "trace", assess: ["data-manager-report", "concept-check"] },
    { id: "report-current", name: t("Report what is left"), explanation: t("The LOOP after the DELETE visits Sara and Omar only, so the count is 2 and the total 14500. The totals are written once, after ENDLOOP."), misconception: t("A report written before the changes, or totals typed in by hand, no longer match the table."), objectives: [1], learn: ["group:report", "group:totals", "token:remove-report"], demonstrate: "trace", assess: ["data-manager-report", "knowledge-check"] },
  ],
};
