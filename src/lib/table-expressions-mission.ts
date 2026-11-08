import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";

// Sources: SAP-samples ABAP cheat sheet 01_Internal_Tables ("Accessing Single Table Lines via Table
// Expressions", "Checking the Existence/Index of a Line") and SAP Clean ABAP "Tables". See
// .claude/skills/academy-lesson/references/sap-notes/internal-tables.md.
const t = (en: string): Text => ({ en });
export const tableExpressionsSetup = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
  salary TYPE i,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
DATA lv_id TYPE i VALUE 102.
DATA lv_name TYPE string.
DATA lv_position TYPE i.
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
export const tableExpressionsExample = `${tableExpressionsSetup}
lv_name = lt_employees[ 3 ]-name.
WRITE / lv_name.
TRY.
    ls_employee = lt_employees[ id = lv_id ].
    WRITE / ls_employee-name.
  CATCH cx_sy_itab_line_not_found.
    WRITE / 'Not found'.
ENDTRY.
lv_position = line_index( lt_employees[ id = lv_id ] ).
WRITE / lv_position.
IF line_exists( lt_employees[ id = 999 ] ).
  WRITE / 'Employee 999 exists'.
ELSE.
  WRITE / 'No employee 999'.
ENDIF.
ls_employee = VALUE #( lt_employees[ id = 999 ] OPTIONAL ).
WRITE / ls_employee-id.`;
export const tableExpressionsOutput = "Omar\nSara\n2\nNo employee 999\n0";

const expressionToken: SyntaxToken = {
  id: "table-expression", label: "itab[ … ] table expression",
  meaning: t("A table expression reads one row of an internal table inside another statement. Square brackets hold either a position, such as [ 3 ], or key = value pairs, such as [ id = lv_id ]. Adding -name after the closing bracket reads just that field."),
  why: t("Fetch one employee, or one employee's name, in a single line, without a separate READ TABLE statement and work area."),
  write: t("Write the table name directly followed by [. Leave a space after [ and before ]. A plain number is a position; name the component to search by key: lt_employees[ id = lv_id ]. Put -name directly after ] to read one field."),
  correct: "lv_name = lt_employees[ id = lv_id ]-name.",
  mistake: "lv_name = lt_employees[ lv_id ]-name.",
  question: t("lv_id is 102. Which row does lt_employees[ lv_id ] address?"),
  options: [t("Position 102, which does not exist"), t("The row whose id is 102")], answer: 0,
  explanation: t("A value on its own inside the brackets is a row position. Only id = lv_id searches the id component. Position 102 does not exist in a three-row table, so the read fails."),
};
const notFoundToken: SyntaxToken = {
  id: "line-not-found", label: "TRY … CATCH cx_sy_itab_line_not_found",
  meaning: t("When no row matches, a table expression does not set sy-subrc. It raises the exception CX_SY_ITAB_LINE_NOT_FOUND. TRY marks the statements to protect; CATCH names the exception and holds the statements that run instead."),
  why: t("An unknown employee ID is normal input. Catching the exception lets the program answer 'Not found' instead of stopping with a runtime error."),
  write: t("Put the read and every statement that uses its result between TRY. and CATCH cx_sy_itab_line_not_found. Put the fallback after CATCH and close the block with ENDTRY."),
  correct: "TRY.\n    ls_employee = lt_employees[ id = lv_id ].\n    WRITE / ls_employee-name.\n  CATCH cx_sy_itab_line_not_found.\n    WRITE / 'Not found'.\nENDTRY.",
  mistake: "ls_employee = lt_employees[ id = lv_id ].\nIF sy-subrc <> 0.\n  WRITE / 'Not found'.\nENDIF.",
  question: t("lv_id is 999 inside the TRY block. What happens to WRITE / ls_employee-name?"),
  options: [t("It is skipped; the CATCH block writes 'Not found'"), t("It writes the name from the previous row")], answer: 0,
  explanation: t("The failed read raises the exception immediately. The remaining TRY statements are skipped and the CATCH block runs, so no old name is shown."),
};
const goal = t("Keep the supplied employees, lv_id and lv_position. Inside TRY, read the row whose id equals lv_id into ls_employee with a table expression, then display its name and then its salary on separate lines. CATCH cx_sy_itab_line_not_found and display 'Not found'. After ENDTRY, store line_index( lt_employees[ id = lv_id ] ) in lv_position and display it. Do not use READ TABLE or LOOP. The checker changes IDs, names, salaries and lv_id, including an ID that does not exist.");
const hints = [
  t("Search by key, not position: lt_employees[ id = lv_id ]. A table expression that finds nothing raises CX_SY_ITAB_LINE_NOT_FOUND, so the read belongs inside TRY."),
  t("Both WRITE statements for the found employee go inside TRY, after the read. If the read fails they are skipped, and the CATCH block writes 'Not found'."),
  t("After ENDTRY: lv_position = line_index( lt_employees[ id = lv_id ] ). then WRITE / lv_position. line_index returns 0 when no row matches, so a missing ID shows Not found, then 0."),
];
const starter = `${tableExpressionsSetup}\n* Look up lv_id with a table expression, then report its position.\n`;
export const tableExpressionsSolution = `${tableExpressionsSetup}
TRY.
    ls_employee = lt_employees[ id = lv_id ].
    WRITE / ls_employee-name.
    WRITE / ls_employee-salary.
  CATCH cx_sy_itab_line_not_found.
    WRITE / 'Not found'.
ENDTRY.
lv_position = line_index( lt_employees[ id = lv_id ] ).
WRITE / lv_position.`;
export const tableExpressionsMission: Mission = {
  id: "data-table-expressions", pathId: "data", prerequisite: "data-conditional-loop",
  title: t("Read rows with table expressions"), subtitle: t("Find an employee by ID in one line and handle a missing ID safely"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Table expressions"],
  brief: t("A standard table stores Ahmed 101, Sara 102 and Omar 103. lt_employees[ 3 ]-name reads Omar by position. lt_employees[ id = lv_id ] finds Sara by ID and copies her row into ls_employee. line_index( ) reports her position, 2, and line_exists( ) answers whether ID 999 exists. Unlike READ TABLE, a table expression never sets sy-subrc. When no row matches, it raises the exception CX_SY_ITAB_LINE_NOT_FOUND, so wrap the read in TRY … CATCH or use VALUE #( … OPTIONAL ). Checking sy-subrc after a table expression reads a value left over from an earlier statement."),
  objectives: [t("Read one row or one field by position or by key with a table expression"), t("Handle a missing row with TRY … CATCH, line_exists( ), line_index( ) or OPTIONAL instead of sy-subrc")],
  references: [
    "https://help.sap.com/docs/abap-cloud/abap-keyword/table-expression",
    "https://help.sap.com/docs/abap-cloud/abap-keyword/rel-exp-line-exists",
    "https://help.sap.com/docs/abap-cloud/abap-keyword/itab-func-line-index",
    "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md",
    "https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-line_exists-to-read-table-or-loop-at",
  ],
  tokens: [expressionToken, notFoundToken], example: tableExpressionsExample,
  visual: t("Step through the program and watch the highlighted row. [ 3 ] jumps straight to position 3. [ id = lv_id ] searches until id 102 matches at position 2, then copies the row. line_index( ) returns that position, while line_exists( ) only answers true or false. sy-subrc never changes during these steps. Change lv_id to 999 to see the TRY block jump to CATCH and line_index( ) return 0."),
  practice: t("Try lv_id values 101, 103 and 999 and predict the output before running. Replace [ 3 ] with [ 4 ] outside TRY to see the runtime error a missing row causes. The browser supports itab[ position ], itab[ component = value … ] on standard tables, one -component after the bracket, line_exists( ) in IF/ELSEIF (also with NOT), line_index( ), VALUE #( itab[ … ] OPTIONAL | DEFAULT … ) and TRY … CATCH cx_sy_itab_line_not_found … ENDTRY. Writing through an expression (itab[ 1 ]-salary = …), KEY/TABLE KEY additions, chained brackets, other exception classes and loops inside TRY are outside this executable subset. No performance claim is made."),
  goal, hint: hints[0], hints, starter, solution: tableExpressionsSolution, expected: "Sara\n8000\n2",
  challenges: [{ id: "data-expression-lookup", title: t("Look up an employee safely"), goal, hint: hints[2], starter, solution: tableExpressionsSolution, expected: "Sara\n8000\n2" }],
  quiz: t("lv_id changes to 999 in the example. Which statement is correct?"),
  options: [
    t("The CATCH block writes 'Not found' and line_index( ) returns 0; neither expression changes sy-subrc"),
    t("sy-subrc becomes 4 and the TRY block continues with the old name"),
    t("The program stops, because line_index( ) raises CX_SY_ITAB_LINE_NOT_FOUND"),
  ], answer: 0,
  quizExplanation: t("Only a plain table expression raises CX_SY_ITAB_LINE_NOT_FOUND; TRY catches it and skips the rest of the block. line_index( ) and line_exists( ) never raise it: they return 0 or false. Table expressions leave sy-subrc and sy-tabix unchanged."),
};

function group(id: string, lines: [number, number], title: string, explanation: string, syntaxRefs: string[] = []): AnatomyGroupSpec {
  return { id, lines, title: t(title), explanation: t(explanation), practice: t(`Which source section ${explanation[0].toLowerCase() + explanation.slice(1)}`), syntaxRefs, visualizer: { kind: "snapshot", line: lines[1] } };
}
export const tableExpressionsGroups: AnatomyGroupSpec[] = [
  group("row", [1, 5], "Describe an employee", "Defines integer ID, text name and integer salary fields without creating a row."),
  group("storage", [6, 10], "Create the lookup storage", "Creates the table, the work area, the search ID 102, and empty name and position variables."),
  group("first", [11, 14], "Store Ahmed", "Stores Ahmed, ID 101, at position 1."),
  group("second", [15, 18], "Store Sara", "Stores Sara, ID 102, at position 2."),
  group("third", [19, 22], "Store Omar", "Stores Omar, ID 103, at position 3."),
  group("by-position", [23, 24], "Read one field by position", "Reads only the name of row 3, Omar, into lv_name and displays it.", ["table-expression"]),
  group("by-key", [25, 30], "Read a row by key, safely", "Searches id = 102, copies Sara's row into ls_employee and displays her name; a missing ID would jump to CATCH.", ["table-expression", "line-not-found"]),
  group("position", [31, 32], "Ask for the row position", "Stores the position of ID 102, which is 2, without copying the row.", ["table-expression"]),
  group("exists", [33, 37], "Ask whether a row exists", "Tests whether ID 999 exists; it does not, so the ELSE branch writes No employee 999.", ["line-not-found"]),
  group("optional", [38, 39], "Accept a missing row", "Reads ID 999 with OPTIONAL, which returns an initial row, so ls_employee-id becomes 0 instead of raising an exception.", ["line-not-found"]),
];
export const tableExpressionsEducation: EducationSpec = {
  what: t("A table expression, lt_employees[ … ], reads one row by position or by key inside another statement."),
  why: t("Look up one employee or one field in a single line, and decide explicitly what happens when the ID does not exist."),
  concepts: [
    { id: "expression-read", name: t("Position or key in brackets"), explanation: t("[ 3 ] reads position 3, Omar. [ id = lv_id ] searches the id component and finds Sara at position 2. Adding -name reads only that field. The result is a copy; changing ls_employee does not change the table."), misconception: t("[ lv_id ] is a position, not an ID search. With lv_id = 102 it asks for row 102 and fails."), objectives: [0], learn: ["group:by-position", "group:by-key", "token:table-expression"], demonstrate: "trace", assess: ["data-expression-lookup", "concept-check"] },
    { id: "not-found", name: t("A miss raises an exception"), explanation: t("When no row matches, the expression raises CX_SY_ITAB_LINE_NOT_FOUND. TRY skips its remaining statements and runs CATCH. Without TRY, the program stops with a runtime error."), misconception: t("A table expression never sets sy-subrc or sy-tabix. After it, sy-subrc still holds whatever an earlier READ TABLE or loop left there."), objectives: [1], learn: ["group:by-key", "token:line-not-found"], demonstrate: "trace", assess: ["data-expression-lookup", "knowledge-check"] },
    { id: "exists-index", name: t("Existence and position checks"), explanation: t("line_exists( lt_employees[ id = 999 ] ) is false, so ELSE runs. line_index( lt_employees[ id = lv_id ] ) returns 2. Neither copies a row or raises an exception; line_index( ) returns 0 for a miss."), misconception: t("Do not test line_exists( ) and then read the same row again. When you need the row, read it once inside TRY."), objectives: [1], learn: ["group:position", "group:exists"], demonstrate: "trace", assess: ["data-expression-lookup", "knowledge-check"] },
    { id: "optional-default", name: t("OPTIONAL and DEFAULT"), explanation: t("VALUE #( lt_employees[ id = 999 ] OPTIONAL ) returns an initial row (id 0, empty name) instead of raising. DEFAULT returns a fallback you choose, such as lt_employees[ 1 ]."), misconception: t("An initial row is not a real employee. Use OPTIONAL only when an empty result is an acceptable answer."), objectives: [1], learn: ["group:optional"], demonstrate: "trace", assess: ["concept-check"] },
  ],
};
