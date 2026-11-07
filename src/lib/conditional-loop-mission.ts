import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";

const t = (en: string): Text => ({ en });
export const conditionalLoopSetup = `TYPES: BEGIN OF ty_employee,
  id TYPE i,
  name TYPE string,
  salary TYPE i,
END OF ty_employee.
DATA lt_employees TYPE STANDARD TABLE OF ty_employee WITH EMPTY KEY.
DATA ls_employee TYPE ty_employee.
DATA lv_min_salary TYPE i VALUE 6000.
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
export const conditionalLoopExample = `${conditionalLoopSetup}
LOOP AT lt_employees INTO ls_employee WHERE salary >= lv_min_salary.
  WRITE / ls_employee-name.
  lv_count = lv_count + 1.
  lv_total = lv_total + ls_employee-salary.
ENDLOOP.
WRITE / lv_count.
WRITE / lv_total.`;
const whereToken: SyntaxToken = {
  id: "loop-where", label: "LOOP AT ... WHERE",
  meaning: t("WHERE selects which stored rows enter the loop body. Here salary is a component of each candidate row; lv_min_salary is the comparison value."),
  why: t("Build a report from qualifying employees while retaining every employee in the source table."),
  write: t("Put WHERE salary >= lv_min_salary after INTO ls_employee. Use the row component salary, not ls_employee-salary, on the left. End the opening statement with a period and close the body with ENDLOOP."),
  correct: "LOOP AT lt_employees INTO ls_employee WHERE salary >= lv_min_salary.\n  WRITE / ls_employee-name.\nENDLOOP.",
  mistake: "LOOP AT lt_employees INTO ls_employee WHERE ls_employee-salary >= lv_min_salary.\nENDLOOP.",
  question: t("At minimum salary 6000, which stored salaries enter the body?"),
  options: [t("8000 and 6000"), t("Only 8000")], answer: 0,
  explanation: t(">= includes equality, so Omar's 6000 qualifies alongside Sara's 8000; Ahmed's 5000 stays stored but is not copied into the work area by this loop."),
};
const sumToken: SyntaxToken = {
  id: "selected-total", label: "Count and total selected rows",
  meaning: t("A counter adds one for each selected employee; an accumulator adds that employee's salary to a running total."),
  why: t("A report needs the number and combined salaries of qualifying employees, rather than the size and total of the whole source table."),
  write: t("Start lv_count and lv_total at zero. Inside the conditional loop add 1 to lv_count and ls_employee-salary to lv_total. Display the totals after ENDLOOP."),
  correct: "lv_count = lv_count + 1.\nlv_total = lv_total + ls_employee-salary.",
  mistake: "lv_count = 2.\nlv_total = 14000.",
  question: t("If no salary reaches the minimum, what are the selected count and total?"),
  options: [t("Both remain zero"), t("They include the last stored employee")], answer: 0,
  explanation: t("No matching row means the body never runs, so the initial zero values remain unchanged."),
};
const goal = t("Keep the supplied identifiers, employees and lv_min_salary. Use LOOP AT ... INTO ... WHERE salary >= lv_min_salary to display each qualifying employee's current name in source order. Count qualifying rows in lv_count and sum their salaries in lv_total. After ENDLOOP display the count, then total, on separate lines. Preserve all source rows. The checker changes names, salaries and thresholds, including a threshold with no matches.");
const hints = [t("WHERE selects processing; it does not delete any row. Test salary against the supplied minimum with >= so equality qualifies."), t("Put both additions inside the loop: add 1 to lv_count and ls_employee-salary to lv_total. Keep the counters initialized to zero."), t("WRITE ls_employee-name inside the loop; WRITE lv_count then lv_total after ENDLOOP. With no matches the output is 0 then 0.")];
const starter = `${conditionalLoopSetup}\n* Select matching employees, then display their count and total.\n`;
export const conditionalLoopMission: Mission = {
  id: "data-conditional-loop", pathId: "data", prerequisite: "data-sorting-filtering",
  title: t("Process only matching rows"), subtitle: t("Select employees with WHERE and build an accurate report"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "loop",
  coveredTopics: ["Conditional LOOP AT"],
  brief: t("A standard table stores Ahmed at salary 5000, Sara at 8000 and Omar at 6000. The minimum is 6000. WHERE tests each candidate before copying it into the work area: Sara and Omar enter the body, Ahmed does not. The body displays each selected name, counts two employees and totals 14000. All three source rows remain. Unlike LOOP with an IF inside, a nonmatching row never enters this body or replaces its work area. With no matches, a declared work area keeps its previous contents; do not mistake that old value for a selected result."),
  objectives: [t("Select rows with an inclusive WHERE comparison without deleting them"), t("Count and total the selected rows, including an empty result")],
  references: ["https://help.sap.com/docs/abap-cloud/abap-keyword/loop-at-itab-basic-form", "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md"],
  tokens: [whereToken, sumToken], example: conditionalLoopExample,
  visual: t("Step through each WHERE test and compare its actual salary with 6000. A false result leaves the work area unchanged and skips the body. A true result copies the selected row, then changes the count and total. The selected positions are 2 and 3 in the original table; WHERE does not renumber or delete rows. Change the minimum to 9000 to see no body execution and zero totals."),
  practice: t("Explore minimums 5000, 6000, 8000 and 9000. Predict each name, count and total before running. The browser supports one typed comparison on a row component or elementary table_line; compound conditions, secondary keys and LOOP ASSIGNING are outside this executable subset. Changing the actively looped table is unsupported. No optimization or SAP performance claim is made."),
  goal, hint: hints[0], hints, starter, solution: conditionalLoopExample, expected: "Sara\nOmar\n2\n14000",
  challenges: [{id:"data-conditional-report",title:t("Build the selected employee report"),goal,hint:hints[2],starter,solution:conditionalLoopExample,expected:"Sara\nOmar\n2\n14000"}],
  quiz: t("The minimum changes to 9000. Which result is correct after the loop?"),
  options: [t("No names, count 0 and total 0; all three source rows remain"), t("The table becomes empty"), t("Omar is processed because he was already in the work area")], answer: 0,
  quizExplanation: t("Every candidate salary is below 9000, so no body instruction runs. The initialized count and total stay zero; selection never deletes rows or processes a retained work-area value."),
};

function group(id:string, lines:[number,number], title:string, explanation:string, syntaxRefs:string[]=[]): AnatomyGroupSpec {
  return {id,lines,title:t(title),explanation:t(explanation),practice:t(`Which source section ${explanation[0].toLowerCase()+explanation.slice(1)}`),syntaxRefs,visualizer:{kind:"snapshot",line:lines[1]}};
}
export const conditionalLoopGroups: AnatomyGroupSpec[] = [
  group("row",[1,5],"Describe an employee","Defines integer ID, text name and integer salary fields without creating a row."),
  group("storage",[6,10],"Create the report storage","Creates the standard table, work area, minimum 6000 and zero count and total."),
  group("first",[11,14],"Store Ahmed","Stores an independent copy of Ahmed with salary 5000 at position 1."),
  group("second",[15,18],"Store Sara","Stores Sara with salary 8000 at position 2."),
  group("third",[19,22],"Store Omar","Stores Omar with salary 6000 at position 3; all three rows remain available."),
  group("select",[23,23],"Select matching rows","Tests salary >= lv_min_salary before copying a matching row into ls_employee.",["loop-where"]),
  group("name",[24,24],"Display the selected name","Displays the name copied from the current selected row, Sara then Omar."),
  group("aggregate",[25,26],"Update the count and total","Adds one and the selected salary only when a row enters the body.",["selected-total"]),
  group("repeat",[27,27],"Continue the search","Returns to examine the next candidate until the source table has been traversed."),
  group("report",[28,29],"Display report totals","Displays count 2 and total 14000 after selection; no matches would leave both at zero.",["selected-total"]),
];
export const conditionalLoopEducation: EducationSpec = {
  what:t("WHERE checks a stored row before the loop body runs; only a match is copied into the work area."),
  why:t("Report eligible employees without losing other employees, and calculate totals that still work when nobody qualifies."),
  concepts:[
    {id:"selection",name:t("Selection preserves rows"),explanation:t("The minimum 6000 accepts Sara at 8000 and Omar at 6000. Ahmed remains stored at 5000. WHERE uses the candidate's salary, not an old work-area salary."),misconception:t("Skipping processing does not delete a row. A declared work area can retain an old value after no matches; that value was not processed."),objectives:[0],learn:["group:select","token:loop-where"],demonstrate:"trace",assess:["data-conditional-report","knowledge-check"]},
    {id:"aggregate",name:t("Selected count and total"),explanation:t("The two selected rows increase count to 2 and total to 14000. With no matching row, neither addition runs and both values remain zero."),misconception:t("Initialize outside the loop, update inside it and display totals after ENDLOOP. Fixed totals cannot handle changed data."),objectives:[1],learn:["group:aggregate","group:report","token:selected-total"],demonstrate:"trace",assess:["data-conditional-report","concept-check"]},
  ],
};
