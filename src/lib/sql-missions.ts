import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";
import type { Database, Node, Primitive } from "./engine";

// Database Development path: runnable ABAP SQL against the simulator's demo database (ZACA_EMPLOYEE and
// ZACA_DEPARTMENT, reset on every run). English only while ENABLE_ARABIC = false.
// Facts: SAP-samples cheat sheet 03_ABAP_SQL (SELECT clauses, joins, aggregates, INSERT/UPDATE/MODIFY/DELETE,
// sy-subrc/sy-dbcnt). See .claude/skills/academy-lesson/references/sap-notes/abap-sql.md
const t = (en: string): Text => ({ en });
const sqlSheet = "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/03_ABAP_SQL.md";
const tok = (id: string, label: string, meaning: string, why: string, write: string, correct: string, mistake: string, question: string, options: [string, string], explanation: string): SyntaxToken =>
  ({ id, label, meaning: t(meaning), why: t(why), write: t(write), correct, mistake, question: t(question), options: [t(options[0]), t(options[1])], answer: 0, explanation: t(explanation) });
const group = (id: string, lines: [number, number], title: string, explanation: string, syntaxRefs: string[] = []): AnatomyGroupSpec =>
  ({ id, lines, title: t(title), explanation: t(explanation), practice: t(`Which source section ${explanation[0].toLowerCase() + explanation.slice(1)}`), syntaxRefs, visualizer: { kind: "snapshot", line: lines[1] } });
type Concept = EducationSpec["concepts"][number];
const concept = (id: string, name: string, explanation: string, misconception: string, objectives: number[], learn: string[], assess: string[]): Concept =>
  ({ id, name: t(name), explanation: t(explanation), misconception: t(misconception), objectives, learn, demonstrate: "trace", assess });
const boundary = "The browser runs a modern ABAP SQL subset against a small demo database (ZACA_EMPLOYEE, ZACA_DEPARTMENT) that is reset on every run. Client handling, authorizations, buffering and real database performance are outside this model.";

// ---------- 1. ABAP SQL: SELECT SINGLE ----------
const singleSetup = `DATA lv_id TYPE i VALUE 103.
DATA ls_employee TYPE zaca_employee.`;
export const sqlSingleExample = `${singleSetup}
SELECT SINGLE FROM zaca_employee
  FIELDS *
  WHERE employee_id = @lv_id
  INTO @ls_employee.
IF sy-subrc = 0.
  WRITE / ls_employee-employee_name.
  WRITE / ls_employee-salary.
ELSE.
  WRITE / 'Not found'.
ENDIF.`;
export const sqlSingleSolution = `${singleSetup}
SELECT SINGLE FROM zaca_employee
  FIELDS *
  WHERE employee_id = @lv_id
  INTO @ls_employee.
IF sy-subrc = 0.
  WRITE / ls_employee-employee_name.
  WRITE / ls_employee-department.
ELSE.
  WRITE / 'Not found'.
ENDIF.`;
const singleGoal = t("Keep lv_id and ls_employee. Read the employee whose employee_id equals lv_id with SELECT SINGLE … INTO @ls_employee. If sy-subrc = 0, display the employee's name and then the department on separate lines; otherwise display 'Not found'. The checker changes the stored employees and lv_id, including an ID that does not exist.");
const singleHints = [t("Start with SELECT SINGLE FROM zaca_employee, then FIELDS *, then WHERE employee_id = @lv_id, then INTO @ls_employee."), t("The @ marks lv_id and ls_employee as ABAP variables. Without @ the database would look for a column called lv_id."), t("After the SELECT: IF sy-subrc = 0. WRITE / ls_employee-employee_name. WRITE / ls_employee-department. ELSE. WRITE / 'Not found'. ENDIF.")];
export const sqlSingleMission: Mission = {
  id: "database-abap-sql", pathId: "database", prerequisite: "database-fundamentals",
  title: t("ABAP SQL: read one row from the database"), subtitle: t("Use SELECT SINGLE with a host variable and check sy-subrc"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Open SQL"],
  brief: t("ABAP SQL (formerly called Open SQL) is how an ABAP program talks to database tables. The database interface turns each statement into SQL for whatever database SAP runs on. SELECT SINGLE reads one row: here the employee whose ID is 103, Omar, is copied into the work area ls_employee. The @ in front of lv_id and ls_employee marks them as ABAP variables, called host variables. sy-subrc is 0 when a row was found and 4 when none was, so always check it before using the work area."),
  objectives: [t("Read one database row with SELECT SINGLE … FIELDS … WHERE … INTO @work_area"), t("Mark ABAP variables with @ and use sy-subrc to tell a found row from a missing one")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/sql", "https://help.sap.com/docs/abap-cloud/abap-keyword/host-variable"],
  tokens: [
    tok("select-single", "SELECT SINGLE … INTO @wa", "SELECT SINGLE reads at most one row from a database table and copies it into a work area. FIELDS * takes every column.", "Show one employee's details without loading the whole table.", "Write SELECT SINGLE FROM table, then FIELDS, then WHERE with the key, then INTO @work_area last.", "SELECT SINGLE FROM zaca_employee\n  FIELDS *\n  WHERE employee_id = @lv_id\n  INTO @ls_employee.", "SELECT SINGLE FROM zaca_employee\n  INTO @ls_employee\n  WHERE employee_id = @lv_id.", "Where does INTO go in a modern SELECT?", ["Last, after the other clauses", "Right after FROM"], "SAP recommends putting INTO after all other clauses; the simulator follows that order."),
    tok("host-variable", "@ host variable", "A host variable is an ABAP variable used inside an SQL statement. The @ tells the database interface: take this value from the program.", "The ID to look for comes from the program, not from the database.", "Put @ directly in front of every ABAP variable in the statement: WHERE employee_id = @lv_id and INTO @ls_employee.", "WHERE employee_id = @lv_id", "WHERE employee_id = lv_id", "What happens without @ in WHERE employee_id = lv_id?", ["lv_id is treated as a column name, which does not exist", "It works the same"], "Without @ the name is read as a column of the table. The table has no column lv_id, so the statement fails."),
  ],
  example: sqlSingleExample,
  visual: t("Step to the SELECT and look at the database table: row 3, Omar, is the match and is copied into ls_employee. sy-subrc becomes 0 and sy-dbcnt 1. Change lv_id to 999 to see sy-subrc 4, an unchanged work area and the ELSE branch."),
  practice: t(`Try lv_id 101, 104 and 999 and predict the output first. ${boundary}`),
  goal: singleGoal, hint: singleHints[0], hints: singleHints, starter: `${singleSetup}\n* Read employee lv_id and show the name and department.\n`, solution: sqlSingleSolution, expected: "Omar\nIT",
  challenges: [{ id: "database-single-read", title: t("Read one employee from the database"), goal: singleGoal, hint: singleHints[2], starter: `${singleSetup}\n* Read employee lv_id and show the name and department.\n`, solution: sqlSingleSolution, expected: "Omar\nIT" }],
  quiz: t("lv_id is 999 and no employee has that ID. What is true after the SELECT SINGLE?"),
  options: [t("sy-subrc is 4 and ls_employee keeps its previous content"), t("sy-subrc is 0 and ls_employee is empty"), t("The program stops with a runtime error")], answer: 0,
  quizExplanation: t("A SELECT that finds nothing is not an error: sy-subrc becomes 4 and the target is not changed. That is why the program checks sy-subrc before using ls_employee."),
};
export const sqlSingleGroups = [
  group("storage", [1, 2], "Prepare the variables", "Stores the ID 103 and creates a work area typed like the database table."),
  group("select", [3, 4], "Choose table and columns", "Reads from ZACA_EMPLOYEE and takes every column with FIELDS *.", ["select-single"]),
  group("where", [5, 5], "Pick the row", "Keeps only the row whose employee_id equals the host variable lv_id.", ["host-variable"]),
  group("into", [6, 6], "Copy into the work area", "Copies the found row, Omar, into ls_employee.", ["select-single", "host-variable"]),
  group("found", [7, 9], "Use the row if found", "Checks sy-subrc = 0, then displays Omar and 9500."),
  group("missing", [10, 12], "Handle a missing ID", "Would display Not found when sy-subrc is 4."),
];

// ---------- 2. SELECT many rows ----------
export const sqlSelectExample = `SELECT FROM zaca_employee
  FIELDS employee_id, employee_name
  ORDER BY employee_name
  INTO TABLE @DATA(lt_employees).
WRITE / sy-dbcnt.
LOOP AT lt_employees INTO DATA(ls_employee).
  WRITE / ls_employee-employee_name.
ENDLOOP.`;
export const sqlSelectSolution = `SELECT FROM zaca_employee
  FIELDS employee_name, salary
  ORDER BY salary DESCENDING
  INTO TABLE @DATA(lt_employees).
LOOP AT lt_employees INTO DATA(ls_employee).
  WRITE / ls_employee-employee_name.
  WRITE / ls_employee-salary.
ENDLOOP.
WRITE / sy-dbcnt.`;
const selectGoal = t("Read every employee's name and salary from ZACA_EMPLOYEE into an internal table, highest salary first. LOOP over the result and display each name and then its salary. After ENDLOOP display sy-dbcnt. The checker changes the stored employees, including an empty table.");
const selectHints = [t("Use FIELDS employee_name, salary and ORDER BY salary DESCENDING."), t("INTO TABLE @DATA(lt_employees) declares the result table for you. Put INTO last."), t("Read sy-dbcnt right after ENDLOOP: LOOP does not change sy-dbcnt, so it still holds the number of rows read.")];
export const sqlSelectMission: Mission = {
  id: "database-select", pathId: "database", prerequisite: "database-abap-sql",
  title: t("SELECT: read many rows into a table"), subtitle: t("Choose columns with FIELDS, sort with ORDER BY and read into an internal table"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["SELECT"],
  brief: t("Without SINGLE, SELECT reads every matching row. INTO TABLE copies them into an internal table, and @DATA(lt_employees) declares that table with exactly the selected columns. FIELDS chooses the columns, so the result only holds what you need. ORDER BY sets the order; without it, the database may return rows in any order. sy-dbcnt tells you how many rows were read: 4 here."),
  objectives: [t("Read several rows into an internal table with FIELDS and INTO TABLE @DATA( )"), t("Sort the result with ORDER BY and count it with sy-dbcnt")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/select-into-target"],
  tokens: [
    tok("select-into-table", "INTO TABLE @DATA( )", "INTO TABLE copies all result rows into an internal table. @DATA(name) declares that table inline, with one component per selected column.", "Load a list of employees once, then work with it in the program.", "End the SELECT with INTO TABLE @DATA(lt_name). Read it afterwards with LOOP AT lt_name INTO DATA(ls_name).", "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name\n  INTO TABLE @DATA(lt_employees).", "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name\n  INTO @DATA(lt_employees).", "Which components does lt_employees get?", ["employee_id and employee_name, the selected columns", "All four columns of the table"], "An inline declaration takes its shape from FIELDS: two columns selected, two components."),
    tok("order-by", "ORDER BY", "ORDER BY sorts the result by one or more columns, ascending unless you write DESCENDING.", "Users expect lists in a predictable order, such as by name.", "Put ORDER BY after WHERE and before INTO. Add DESCENDING after a column for highest first.", "ORDER BY employee_name", "\" no ORDER BY: rely on the stored order", "Without ORDER BY, what order do the rows come in?", ["Any order the database chooses", "Always the order they were inserted"], "Only ORDER BY guarantees an order. The simulator happens to keep storage order, a real database does not promise it."),
  ],
  example: sqlSelectExample,
  visual: t("Step to the SELECT and compare the database table (4 rows) with lt_employees: same 4 employees, but only two columns, sorted by name. sy-dbcnt is 4. Then follow the LOOP through the result table."),
  practice: t(`Change ORDER BY employee_name to ORDER BY employee_id, then add DESCENDING. Remove employee_id from FIELDS and see the result table lose that column. ${boundary}`),
  goal: selectGoal, hint: selectHints[0], hints: selectHints, starter: "* Read every employee's name and salary, highest salary first.\n", solution: sqlSelectSolution, expected: "Omar\n9500\nAhmed\n8000\nSara\n7200\nHuda\n6800\n4",
  challenges: [{ id: "database-salary-list", title: t("List salaries from high to low"), goal: selectGoal, hint: selectHints[2], starter: "* Read every employee's name and salary, highest salary first.\n", solution: sqlSelectSolution, expected: "Omar\n9500\nAhmed\n8000\nSara\n7200\nHuda\n6800\n4" }],
  quiz: t("You need only the names of employees. Which FIELDS is best?"),
  options: [t("FIELDS employee_name"), t("FIELDS *, then ignore the other columns"), t("FIELDS employee_name, salary, department")], answer: 0,
  quizExplanation: t("Select only the columns you use. FIELDS * moves data you never read from the database to the program."),
};
export const sqlSelectGroups = [
  group("from", [1, 1], "Choose the table", "Reads from the database table ZACA_EMPLOYEE.", ["select-into-table"]),
  group("fields", [2, 2], "Choose the columns", "Takes only employee_id and employee_name.", ["select-into-table"]),
  group("order", [3, 3], "Sort the result", "Sorts the rows by name: Ahmed, Huda, Omar, Sara.", ["order-by"]),
  group("into", [4, 4], "Read into a table", "Copies the four rows into the new internal table lt_employees.", ["select-into-table"]),
  group("count", [5, 5], "Count the rows", "Displays sy-dbcnt, the number of rows read: 4."),
  group("loop", [6, 8], "Show each name", "Loops over the result and displays each name."),
];

// ---------- 3. WHERE ----------
const whereSetup = `DATA lv_department TYPE string VALUE 'IT'.
DATA lv_min_salary TYPE i VALUE 9000.`;
export const sqlWhereExample = `${whereSetup}
SELECT FROM zaca_employee
  FIELDS employee_name, salary
  WHERE department = @lv_department
    AND salary >= @lv_min_salary
  INTO TABLE @DATA(lt_result).
IF sy-subrc = 0.
  LOOP AT lt_result INTO DATA(ls_result).
    WRITE / ls_result-employee_name.
  ENDLOOP.
ELSE.
  WRITE / 'No match'.
ENDIF.`;
export const sqlWhereSolution = `${whereSetup}
SELECT FROM zaca_employee
  FIELDS employee_name, salary
  WHERE department = @lv_department
    AND salary >= @lv_min_salary
  ORDER BY salary DESCENDING
  INTO TABLE @DATA(lt_result).
IF sy-subrc = 0.
  LOOP AT lt_result INTO DATA(ls_result).
    WRITE / ls_result-employee_name.
    WRITE / ls_result-salary.
  ENDLOOP.
ELSE.
  WRITE / 'No match'.
ENDIF.`;
const whereGoal = t("Keep lv_department and lv_min_salary. Read the name and salary of employees in lv_department who earn at least lv_min_salary, highest salary first. Display each name and then its salary. If nothing matches, display 'No match'. The checker changes the employees, the department and the minimum, including filters that match nobody.");
const whereHints = [t("Two conditions joined by AND: WHERE department = @lv_department AND salary >= @lv_min_salary."), t("Add ORDER BY salary DESCENDING before INTO TABLE."), t("Check sy-subrc after the SELECT: 0 means rows were found, 4 means the result table is empty.")];
export const sqlWhereMission: Mission = {
  id: "database-where", pathId: "database", prerequisite: "database-select",
  title: t("WHERE: read only the rows you need"), subtitle: t("Filter with host variables, AND and OR, and handle an empty result"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["WHERE"],
  brief: t("WHERE makes the database send only the rows you need. Here two conditions must both be true: department IT AND salary of at least 9000. Ahmed is in IT but earns 8000, so only Omar comes back. Values from the program are host variables with @. OR keeps a row when either condition is true, BETWEEN tests a range and LIKE matches text patterns such as 'H%'. When nothing matches, sy-subrc is 4 and the result table is empty."),
  objectives: [t("Filter rows with WHERE, host variables and AND/OR"), t("Detect and handle an empty result with sy-subrc")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/abenwhere-logexp"],
  tokens: [
    tok("where-host", "WHERE column = @variable", "WHERE compares a column of each row with a value. A program value needs @.", "The department to report on comes from the user, so it must be a variable.", "Write the column on the left and the value on the right: WHERE department = @lv_department. Text literals use quotes: 'IT'.", "WHERE department = @lv_department", "WHERE @lv_department = department_name", "Which rows does WHERE department = @lv_department keep when lv_department is 'IT'?", ["Ahmed and Omar", "All rows"], "Only rows whose department column equals IT pass the filter."),
    tok("and-or", "AND / OR / BETWEEN / LIKE", "AND needs both conditions; OR needs at least one. BETWEEN a AND b tests a range including both ends; LIKE 'H%' matches text starting with H.", "Real filters combine several rules, such as a department and a minimum salary.", "Join conditions with AND or OR. Use parentheses when you mix them: ( a OR b ) AND c.", "WHERE department = @lv_department\n  AND salary >= @lv_min_salary", "WHERE department = @lv_department,\n  salary >= @lv_min_salary", "IT and minimum 9000 with AND: who is returned?", ["Only Omar", "Ahmed and Omar"], "Ahmed passes the department test but fails the salary test. AND needs both."),
  ],
  example: sqlWhereExample,
  visual: t("Step to the SELECT. In the database table only row 3, Omar, is highlighted: both conditions are true for him. Change lv_min_salary to 5000 to see Ahmed join him, and change lv_department to 'LEGAL' to see sy-subrc 4 and No match."),
  practice: t(`Replace AND with OR and predict who comes back. Try WHERE salary BETWEEN 7000 AND 9000 and WHERE employee_name LIKE 'S%'. ${boundary}`),
  goal: whereGoal, hint: whereHints[0], hints: whereHints, starter: `${whereSetup}\n* Read matching names and salaries, highest salary first.\n`, solution: sqlWhereSolution, expected: "Omar\n9500",
  challenges: [{ id: "database-where-filter", title: t("Filter by department and salary"), goal: whereGoal, hint: whereHints[2], starter: `${whereSetup}\n* Read matching names and salaries, highest salary first.\n`, solution: sqlWhereSolution, expected: "Omar\n9500" }],
  quiz: t("lv_department is 'LEGAL' and no employee works there. What happens?"),
  options: [t("The result table is empty and sy-subrc is 4"), t("The program stops with an error"), t("All employees are returned")], answer: 0,
  quizExplanation: t("An empty result is a normal outcome. INTO TABLE leaves an empty table and sy-subrc is 4, so the program can show No match."),
};
export const sqlWhereGroups = [
  group("storage", [1, 2], "Prepare the filter values", "Stores the department IT and the minimum salary 9000."),
  group("select", [3, 4], "Choose table and columns", "Reads the name and salary columns of ZACA_EMPLOYEE."),
  group("where", [5, 6], "Filter the rows", "Keeps rows in IT AND with a salary of at least 9000: only Omar.", ["where-host", "and-or"]),
  group("into", [7, 7], "Read into a table", "Copies the matching rows into lt_result."),
  group("found", [8, 11], "Show the matches", "Checks sy-subrc and displays each matching name: Omar."),
  group("empty", [12, 14], "Handle no matches", "Would display No match when nothing passes the filter."),
];

// ---------- 4. Joins ----------
export const sqlJoinExample = `SELECT FROM zaca_department AS d
  INNER JOIN zaca_employee AS e ON d~department = e~department
  FIELDS d~department_name, e~employee_name
  ORDER BY d~department_name, e~employee_name
  INTO TABLE @DATA(lt_staff).
LOOP AT lt_staff INTO DATA(ls_staff).
  WRITE / ls_staff-department_name.
  WRITE / ls_staff-employee_name.
ENDLOOP.`;
export const sqlJoinSolution = sqlJoinExample.replace("INNER JOIN", "LEFT OUTER JOIN");
const joinGoal = t("List every department name with its employees, ordered by department name and then employee name. Departments without employees must still appear, with an empty employee name. Display the department name and then the employee name for each result row. The checker changes the departments and employees.");
const joinHints = [t("Start from zaca_department so every department is on the left side."), t("INNER JOIN drops departments without employees. LEFT OUTER JOIN keeps them and fills the employee columns with initial values."), t("Use the aliases: FIELDS d~department_name, e~employee_name and ORDER BY d~department_name, e~employee_name.")];
export const sqlJoinMission: Mission = {
  id: "database-joins", pathId: "database", prerequisite: "database-where",
  title: t("Joins: combine two tables"), subtitle: t("Read employees with their department names using INNER and LEFT OUTER JOIN"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Joins"],
  brief: t("Employee rows store only a department code such as IT; the readable name Technology lives in ZACA_DEPARTMENT. A join reads both tables in one SELECT. ON says which columns must match: d~department = e~department. The aliases d and e, with the column selector ~, say which table each column comes from. INNER JOIN returns only pairs that match, so the Legal department, which has no employees, is left out. LEFT OUTER JOIN keeps every department from the left table and fills the missing employee columns with initial values."),
  objectives: [t("Combine two tables with INNER JOIN, aliases and the ~ column selector"), t("Use LEFT OUTER JOIN to keep rows that have no match")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/inner-join", "https://help.sap.com/docs/abap-cloud/abap-keyword/left-outer-join"],
  tokens: [
    tok("inner-join", "INNER JOIN … ON", "INNER JOIN pairs each row of the left table with every row of the right table for which the ON condition is true. Rows without a partner are dropped.", "Show each employee with a readable department name instead of a code.", "After FROM table AS a, write INNER JOIN table2 AS b ON a~col = b~col. Use alias~column everywhere in a join.", "FROM zaca_department AS d\n  INNER JOIN zaca_employee AS e ON d~department = e~department", "FROM zaca_department\n  INNER JOIN zaca_employee ON department = department", "How many rows does the INNER JOIN return for 4 departments and 4 employees, when Legal has no employees?", ["4, one per employee", "4 departments × 4 employees = 16"], "Each employee matches exactly one department. Legal has no partner and is dropped."),
    tok("left-outer-join", "LEFT OUTER JOIN", "LEFT OUTER JOIN keeps every row of the left table. When no right row matches, the right columns get initial values: empty text and 0.", "A department overview must also list departments that have no staff yet.", "Replace INNER JOIN with LEFT OUTER JOIN. Put the table you want to keep completely on the left, after FROM.", "FROM zaca_department AS d\n  LEFT OUTER JOIN zaca_employee AS e ON d~department = e~department", "FROM zaca_employee AS e\n  LEFT OUTER JOIN zaca_department AS d ON d~department = e~department", "With LEFT OUTER JOIN, what does Legal show as its employee name?", ["An empty name", "The first employee"], "Legal has no matching employee, so the employee columns are initial: an empty name."),
  ],
  example: sqlJoinExample,
  visual: t("Step to the SELECT and compare: four departments, four employees, four result rows. Legal is missing because nobody works there. Change INNER JOIN to LEFT OUTER JOIN and run again: Legal appears with an empty employee name."),
  practice: t(`Change the ORDER BY to e~employee_name only. Add e~salary to FIELDS and display it. ${boundary} This subset supports one INNER JOIN or LEFT OUTER JOIN per SELECT.`),
  goal: joinGoal, hint: joinHints[0], hints: joinHints, starter: "* List every department with its employees, including departments without employees.\n", solution: sqlJoinSolution, expected: "Human resources\nSara\nLegal\n\nSales\nHuda\nTechnology\nAhmed\nTechnology\nOmar",
  challenges: [{ id: "database-join-report", title: t("Report every department and its staff"), goal: joinGoal, hint: joinHints[1], starter: "* List every department with its employees, including departments without employees.\n", solution: sqlJoinSolution, expected: "Human resources\nSara\nLegal\n\nSales\nHuda\nTechnology\nAhmed\nTechnology\nOmar" }],
  quiz: t("Why does the INNER JOIN example not list the Legal department?"),
  options: [t("No employee row matches Legal, and INNER JOIN drops rows without a partner"), t("Legal is not stored in ZACA_DEPARTMENT"), t("ORDER BY removes it")], answer: 0,
  quizExplanation: t("INNER JOIN only returns matching pairs. Use LEFT OUTER JOIN from the department table to keep every department."),
};
export const sqlJoinGroups = [
  group("from", [1, 1], "Left table and alias", "Starts from ZACA_DEPARTMENT and names it d.", ["inner-join"]),
  group("join", [2, 2], "Join the employees", "Pairs each department with the employees whose department code matches.", ["inner-join", "left-outer-join"]),
  group("fields", [3, 3], "Columns from both tables", "Takes the department name from d and the employee name from e."),
  group("order", [4, 4], "Sort the pairs", "Sorts by department name, then employee name."),
  group("into", [5, 5], "Read into a table", "Copies the four matching pairs into lt_staff."),
  group("loop", [6, 9], "Show each pair", "Displays each department name followed by its employee."),
];

// ---------- 5. Aggregations ----------
export const sqlAggregateExample = `SELECT FROM zaca_employee
  FIELDS department, COUNT(*) AS headcount, SUM( salary ) AS total
  GROUP BY department
  ORDER BY department
  INTO TABLE @DATA(lt_summary).
LOOP AT lt_summary INTO DATA(ls_summary).
  WRITE / ls_summary-department.
  WRITE / ls_summary-headcount.
  WRITE / ls_summary-total.
ENDLOOP.`;
export const sqlAggregateSolution = `SELECT FROM zaca_employee
  FIELDS department, COUNT(*) AS headcount, MAX( salary ) AS top_salary
  GROUP BY department
  ORDER BY department
  INTO TABLE @DATA(lt_summary).
LOOP AT lt_summary INTO DATA(ls_summary).
  WRITE / ls_summary-department.
  WRITE / ls_summary-headcount.
  WRITE / ls_summary-top_salary.
ENDLOOP.`;
const aggregateGoal = t("For each department in ZACA_EMPLOYEE, read the department code, the number of employees as headcount and the highest salary as top_salary, ordered by department. Display department, headcount and top_salary for each group. Let the database do the counting: the checker changes the stored employees.");
const aggregateHints = [t("COUNT(*) AS headcount counts rows; MAX( salary ) AS top_salary finds the highest salary."), t("department is not an aggregate, so it must be listed in GROUP BY department."), t("ORDER BY department goes after GROUP BY and before INTO TABLE.")];
export const sqlAggregateMission: Mission = {
  id: "database-aggregates", pathId: "database", prerequisite: "database-joins",
  title: t("Aggregations: count and total in the database"), subtitle: t("Use COUNT, SUM and MAX with GROUP BY"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Aggregations"],
  brief: t("Instead of loading every employee and adding up in a loop, let the database calculate. GROUP BY department puts rows with the same department into one group. For each group, COUNT(*) counts the rows and SUM( salary ) adds the salaries; MIN and MAX find the smallest and largest. IT has two employees earning 17500 together, HR and SALES one each. Every column in FIELDS that is not an aggregate must also be listed in GROUP BY. Give each aggregate a name with AS."),
  objectives: [t("Calculate COUNT, SUM, MIN and MAX in the database with named result columns"), t("Group rows with GROUP BY and list every non-aggregated column there")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/select-group-by", "https://help.sap.com/docs/abap-cloud/abap-keyword/aggregate-function"],
  tokens: [
    tok("aggregate-functions", "COUNT(*) / SUM( ) / MAX( ) AS name", "Aggregate functions turn many rows into one value: COUNT(*) counts rows, SUM adds, MIN and MAX find extremes. AS names the result column.", "A department report needs totals, not every single salary.", "Write the function in FIELDS with spaces inside the brackets for columns: SUM( salary ) AS total. COUNT(*) needs no column.", "FIELDS COUNT(*) AS headcount, SUM( salary ) AS total", "FIELDS COUNT(*), SUM( salary )", "With four employees and no WHERE, what is COUNT(*)?", ["4", "1"], "COUNT(*) counts every row that reaches it: 4."),
    tok("group-by", "GROUP BY", "GROUP BY makes one result row per distinct value, here per department. Aggregates are then calculated for each group.", "Get one line per department instead of one line for the whole company.", "Add GROUP BY after WHERE. Every FIELDS column that is not an aggregate must appear in GROUP BY.", "FIELDS department, COUNT(*) AS headcount\n  GROUP BY department", "FIELDS department, employee_name, COUNT(*) AS headcount\n  GROUP BY department", "How many result rows does GROUP BY department give for IT, IT, HR, SALES?", ["3", "4"], "Rows with the same department fall into one group: IT, HR and SALES."),
  ],
  example: sqlAggregateExample,
  visual: t("Step to the SELECT: four employee rows become three result rows. IT combines Ahmed and Omar into headcount 2 and total 17500. Then follow the LOOP through the summary table."),
  practice: t(`Replace SUM( salary ) AS total with MIN( salary ) AS lowest and display it. Remove department from GROUP BY and read the error. ${boundary} AVG and HAVING are outside this subset.`),
  goal: aggregateGoal, hint: aggregateHints[0], hints: aggregateHints, starter: "* Count employees and find the top salary per department.\n", solution: sqlAggregateSolution, expected: "HR\n1\n7200\nIT\n2\n9500\nSALES\n1\n6800",
  challenges: [{ id: "database-department-summary", title: t("Summarize each department"), goal: aggregateGoal, hint: aggregateHints[1], starter: "* Count employees and find the top salary per department.\n", solution: sqlAggregateSolution, expected: "HR\n1\n7200\nIT\n2\n9500\nSALES\n1\n6800" }],
  quiz: t("Why must department be listed in GROUP BY in the example?"),
  options: [t("It is in FIELDS but is not an aggregate, so each group needs one department value"), t("GROUP BY sorts the result"), t("COUNT(*) only works on key fields")], answer: 0,
  quizExplanation: t("Each result row stands for one group. A plain column only has one value per group if the rows were grouped by it. GROUP BY does not guarantee an order; ORDER BY does."),
};
export const sqlAggregateGroups = [
  group("from", [1, 1], "Choose the table", "Reads from ZACA_EMPLOYEE."),
  group("fields", [2, 2], "Columns and aggregates", "Takes the department, counts rows as headcount and adds salaries as total.", ["aggregate-functions"]),
  group("group", [3, 3], "One row per department", "Groups the rows: IT, HR and SALES.", ["group-by"]),
  group("order", [4, 4], "Sort the groups", "Sorts the three summary rows by department."),
  group("into", [5, 5], "Read the summary", "Copies the three summary rows into lt_summary."),
  group("loop", [6, 10], "Show each summary", "Displays department, headcount and total for each group."),
];

// ---------- 6. Data modifications ----------
const changeSetup = `DATA ls_employee TYPE zaca_employee.
ls_employee-employee_id = 105.
ls_employee-employee_name = 'Lina'.
ls_employee-department = 'SALES'.
ls_employee-salary = 6000.`;
export const sqlChangeExample = `${changeSetup}
INSERT zaca_employee FROM @ls_employee.
WRITE / sy-subrc.
INSERT zaca_employee FROM @ls_employee.
WRITE / sy-subrc.
UPDATE zaca_employee SET salary = salary + 500 WHERE department = 'IT'.
WRITE / sy-dbcnt.
DELETE FROM zaca_employee WHERE employee_id = 101.
WRITE / sy-dbcnt.`;
const raiseSetup = `DATA lv_department TYPE string VALUE 'IT'.
DATA lv_raise TYPE i VALUE 500.
DATA lv_total TYPE i.`;
export const sqlChangeSolution = `${raiseSetup}
UPDATE zaca_employee SET salary = salary + @lv_raise WHERE department = @lv_department.
WRITE / sy-dbcnt.
SELECT FROM zaca_employee
  FIELDS SUM( salary ) AS total
  WHERE department = @lv_department
  INTO @lv_total.
WRITE / lv_total.`;
const changeGoal = t("Keep lv_department, lv_raise and lv_total. Give every employee in lv_department a raise of lv_raise with one UPDATE … SET … WHERE statement and display sy-dbcnt. Then read the new total salary of that department with SUM into lv_total and display it. The checker changes the employees, the department and the raise, including a department with nobody in it.");
const changeHints = [t("UPDATE zaca_employee SET salary = salary + @lv_raise WHERE department = @lv_department. changes every matching row at once."), t("sy-dbcnt after UPDATE is the number of changed rows; display it before the next SQL statement changes it."), t("SELECT FROM zaca_employee FIELDS SUM( salary ) AS total WHERE department = @lv_department INTO @lv_total. A SELECT with only aggregates returns one row, so no SINGLE is needed.")];
export const sqlChangeMission: Mission = {
  id: "database-sql-mutations", pathId: "database", prerequisite: "database-aggregates",
  title: t("Change data with INSERT, UPDATE and DELETE"), subtitle: t("Add, change and remove database rows and check sy-subrc and sy-dbcnt"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Data modifications"],
  brief: t("INSERT adds a row from a work area. The first INSERT of Lina, ID 105, works and sy-subrc is 0; the second one finds that ID 105 already exists and adds nothing, so sy-subrc is 4. UPDATE … SET … WHERE changes every matching row at once: both IT salaries rise by 500, and sy-dbcnt is 2. DELETE FROM … WHERE removes matching rows: Ahmed goes, sy-dbcnt 1. MODIFY inserts a row or overwrites the one with the same key. Always check sy-subrc and sy-dbcnt after a change."),
  objectives: [t("Insert, update and delete database rows with ABAP SQL"), t("Use sy-subrc and sy-dbcnt to see whether, and how many, rows were changed")],
  references: [sqlSheet, "https://help.sap.com/docs/abap-cloud/abap-keyword/insert-writable-obj", "https://help.sap.com/docs/abap-cloud/abap-keyword/update-writable-obj", "https://help.sap.com/docs/abap-cloud/abap-keyword/delete-writable-obj"],
  tokens: [
    tok("insert-db", "INSERT table FROM @wa", "INSERT adds one row from a work area. If a row with the same primary key exists, nothing is added and sy-subrc is 4.", "Store a new employee permanently.", "Fill every field of a work area typed like the table, then INSERT zaca_employee FROM @ls_employee.", "INSERT zaca_employee FROM @ls_employee.\nIF sy-subrc <> 0.\n  WRITE / 'ID already exists'.\nENDIF.", "INSERT zaca_employee FROM ls_employee.", "Lina, ID 105, is inserted twice. What is sy-subrc after the second INSERT?", ["4", "0"], "The key 105 already exists, so the second INSERT adds nothing and sets sy-subrc to 4."),
    tok("update-delete-where", "UPDATE … SET … WHERE / DELETE FROM … WHERE", "UPDATE … SET changes columns in every row that matches WHERE. DELETE FROM … WHERE removes every matching row. sy-dbcnt counts the rows.", "Give a whole department a raise, or remove one employee, without reading the rows first.", "Always write a WHERE: without it, UPDATE changes and DELETE removes every row of the table.", "UPDATE zaca_employee SET salary = salary + 500 WHERE department = 'IT'.", "UPDATE zaca_employee SET salary = salary + 500.", "How many rows does UPDATE … WHERE department = 'IT' change in the demo table?", ["2", "4"], "Ahmed and Omar are in IT, so two rows change and sy-dbcnt is 2."),
  ],
  example: sqlChangeExample,
  visual: t("Step through the changes and watch the database table: Lina appears as row 5, the duplicate INSERT changes nothing, both IT salaries grow by 500, and Ahmed's row disappears. Compare sy-subrc and sy-dbcnt after each statement."),
  practice: t(`Change the UPDATE's WHERE to department = 'LEGAL' and predict sy-dbcnt. Replace the second INSERT with MODIFY and see it overwrite Lina instead of failing. ${boundary} In SAP, database changes belong to a logical unit of work and become permanent with COMMIT WORK; here every run starts from the original demo data. INSERT … FROM TABLE and other mass forms are outside this subset.`),
  goal: changeGoal, hint: changeHints[0], hints: changeHints, starter: `${raiseSetup}\n* Raise salaries in lv_department, then show the new department total.\n`, solution: sqlChangeSolution, expected: "2\n18500",
  challenges: [{ id: "database-raise", title: t("Give a department a raise"), goal: changeGoal, hint: changeHints[2], starter: `${raiseSetup}\n* Raise salaries in lv_department, then show the new department total.\n`, solution: sqlChangeSolution, expected: "2\n18500" }],
  quiz: t("You run UPDATE zaca_employee SET salary = 0. without a WHERE. What happens?"),
  options: [t("Every employee's salary becomes 0"), t("Nothing, because WHERE is required"), t("Only the first row changes")], answer: 0,
  quizExplanation: t("Without WHERE, UPDATE changes every row of the table. Always check your WHERE before changing data."),
};
export const sqlChangeGroups = [
  group("prepare", [1, 5], "Prepare the new employee", "Fills a work area typed like the table with Lina, ID 105."),
  group("insert", [6, 7], "Insert a row", "Adds Lina to the table; sy-subrc 0.", ["insert-db"]),
  group("duplicate", [8, 9], "Insert the same key again", "Finds that ID 105 exists and adds nothing; sy-subrc 4.", ["insert-db"]),
  group("update", [10, 11], "Update many rows", "Raises both IT salaries by 500; sy-dbcnt 2.", ["update-delete-where"]),
  group("delete", [12, 13], "Delete a row", "Removes Ahmed, ID 101; sy-dbcnt 1.", ["update-delete-where"]),
];

export const sqlMissions: Mission[] = [sqlSingleMission, sqlSelectMission, sqlWhereMission, sqlJoinMission, sqlAggregateMission, sqlChangeMission];
export const sqlAnatomy: Record<string, AnatomyGroupSpec[]> = {
  "database-abap-sql": sqlSingleGroups, "database-select": sqlSelectGroups, "database-where": sqlWhereGroups,
  "database-joins": sqlJoinGroups, "database-aggregates": sqlAggregateGroups, "database-sql-mutations": sqlChangeGroups,
};

export const sqlEducation: Record<string, EducationSpec> = {
  "database-abap-sql": {
    what: t("ABAP SQL statements read and change database tables; SELECT SINGLE reads one row into a work area."), why: t("Show one stored employee in a program and react correctly when the ID does not exist."),
    concepts: [
      concept("sql-single", "Reading one row", "SELECT SINGLE … WHERE employee_id = @lv_id INTO @ls_employee copies Omar's row into the work area.", "FIELDS * copies every column; select only what you need when the table is wide.", [0], ["group:select", "group:into", "token:select-single"], ["database-single-read", "concept-check"]),
      concept("sql-host", "Host variables", "@lv_id and @ls_employee mark program variables inside the SQL statement.", "Without @, lv_id is read as a column name and the statement fails.", [1], ["group:where", "token:host-variable"], ["database-single-read", "knowledge-check"]),
      concept("sql-subrc", "Found or not found", "sy-subrc 0 means a row was copied; 4 means none matched and the work area kept its old content.", "A missing row is not an error: check sy-subrc instead of trusting the work area.", [1], ["group:found", "group:missing"], ["database-single-read", "knowledge-check"]),
    ],
  },
  "database-select": {
    what: t("SELECT without SINGLE reads all matching rows into an internal table."), why: t("Load a sorted list of employees once and process it in the program."),
    concepts: [
      concept("select-table", "Rows into an internal table", "INTO TABLE @DATA(lt_employees) receives every row; its components are the FIELDS columns.", "INTO without TABLE expects a single row; use SELECT SINGLE for that.", [0], ["group:fields", "group:into", "token:select-into-table"], ["database-salary-list", "knowledge-check"]),
      concept("select-order", "Sorting and counting", "ORDER BY employee_name returns Ahmed, Huda, Omar, Sara; sy-dbcnt is 4.", "Without ORDER BY the database order is not guaranteed.", [1], ["group:order", "group:count", "token:order-by"], ["database-salary-list", "concept-check"]),
    ],
  },
  "database-where": {
    what: t("WHERE makes the database return only rows that meet your conditions."), why: t("Send less data to the program and report exactly the employees that match."),
    concepts: [
      concept("where-filter", "Conditions with host variables", "department = @lv_department AND salary >= @lv_min_salary keeps only Omar.", "AND needs both conditions; OR needs one. Mixing them needs parentheses.", [0], ["group:where", "token:where-host", "token:and-or"], ["database-where-filter", "concept-check"]),
      concept("where-empty", "Empty results", "When no row matches, the result table is empty and sy-subrc is 4.", "An empty result is normal, not an error; show a message such as No match.", [1], ["group:found", "group:empty"], ["database-where-filter", "knowledge-check"]),
    ],
  },
  "database-joins": {
    what: t("A join reads matching rows from two tables in one SELECT."), why: t("Show readable department names next to employees without a second query per row."),
    concepts: [
      concept("join-inner", "INNER JOIN", "ON d~department = e~department pairs each department with its employees; Legal has none and is dropped.", "Columns in a join need alias~column so the source table is clear.", [0], ["group:from", "group:join", "group:fields", "token:inner-join"], ["database-join-report", "knowledge-check"]),
      concept("join-left", "LEFT OUTER JOIN", "LEFT OUTER JOIN keeps every department; Legal appears with an empty employee name.", "Which table is on the left decides which rows are always kept.", [1], ["group:join", "token:left-outer-join"], ["database-join-report", "concept-check"]),
    ],
  },
  "database-aggregates": {
    what: t("Aggregate functions let the database count and total rows, per group with GROUP BY."), why: t("Build a department summary without loading and adding up every employee."),
    concepts: [
      concept("agg-functions", "COUNT, SUM, MIN, MAX", "COUNT(*) AS headcount and SUM( salary ) AS total give 2 and 17500 for IT.", "Name every aggregate with AS so the result table has a component for it.", [0], ["group:fields", "token:aggregate-functions"], ["database-department-summary", "concept-check"]),
      concept("agg-group", "GROUP BY", "GROUP BY department makes one row each for HR, IT and SALES.", "Every plain column in FIELDS must be in GROUP BY. GROUP BY does not sort; use ORDER BY.", [1], ["group:group", "group:order", "token:group-by"], ["database-department-summary", "knowledge-check"]),
    ],
  },
  "database-sql-mutations": {
    what: t("INSERT, UPDATE, MODIFY and DELETE change rows in a database table."), why: t("Store new employees, give raises and remove leavers, and know whether it worked."),
    concepts: [
      concept("change-insert", "INSERT and duplicate keys", "The first INSERT of ID 105 works (sy-subrc 0); the second finds the key and adds nothing (sy-subrc 4).", "INSERT never overwrites; MODIFY inserts or overwrites by key.", [0], ["group:prepare", "group:insert", "group:duplicate", "token:insert-db"], ["concept-check"]),
      concept("change-where", "UPDATE and DELETE with WHERE", "UPDATE … SET salary = salary + 500 WHERE department = 'IT' changes 2 rows; DELETE FROM … WHERE employee_id = 101 removes 1.", "Without WHERE, every row is updated or deleted.", [0], ["group:update", "group:delete", "token:update-delete-where"], ["database-raise", "knowledge-check"]),
      concept("change-status", "sy-subrc and sy-dbcnt", "sy-subrc says whether rows changed; sy-dbcnt says how many.", "Read them right after the statement; the next SQL statement overwrites them.", [1], ["group:duplicate", "group:update"], ["database-raise", "knowledge-check"]),
    ],
  },
};

// ---------- Behavioral graders: the learner's program and the reference solution run on the same probes ----------
const probeA: Database = {
  zaca_employee: [
    { employee_id: 201, employee_name: "Ava", department: "IT", salary: 5000 },
    { employee_id: 202, employee_name: "Ben", department: "IT", salary: 5500 },
    { employee_id: 203, employee_name: "Chen", department: "HR", salary: 9100 },
    { employee_id: 204, employee_name: "Dana", department: "LEGAL", salary: 9200 },
  ],
  zaca_department: [
    { department: "IT", department_name: "Tech" }, { department: "HR", department_name: "People" },
    { department: "LEGAL", department_name: "Law" }, { department: "OPS", department_name: "Operations" },
  ],
};
const probeEmpty: Database = { zaca_employee: [], zaca_department: [{ department: "IT", department_name: "Technology" }] };
const probeOne: Database = {
  zaca_employee: [{ employee_id: 301, employee_name: "Eli", department: "SALES", salary: 0 }],
  zaca_department: [{ department: "SALES", department_name: "Sales" }, { department: "HR", department_name: "Human resources" }],
};
type Probe = { database?: Database; inputs?: Record<string, Primitive> };
export type SqlChallengeSpec = { solution: string; inputs: string[]; probes: Probe[]; requires: (all: Node[]) => boolean };
type Select = Extract<Node, { kind: "select" }>;
const selects = (all: Node[]) => all.filter((n): n is Select => n.kind === "select");
const usesHost = (n: Select, column: string, host: string) => JSON.stringify(n.where ?? null).includes(`"field":"${column}"},"op"`) && JSON.stringify(n.where ?? null).includes(`"name":"${host}"`);
export const sqlChallengeSpecs: Record<string, SqlChallengeSpec> = {
  "database-single-read": {
    solution: sqlSingleSolution, inputs: ["lv_id"],
    probes: [{ inputs: { lv_id: 103 } }, { inputs: { lv_id: 101 } }, { inputs: { lv_id: 999 } }, { database: probeA, inputs: { lv_id: 204 } }, { database: probeEmpty, inputs: { lv_id: 103 } }, { database: probeOne, inputs: { lv_id: 301 } }],
    requires: all => selects(all).some(n => n.single && usesHost(n, "employee_id", "lv_id")),
  },
  "database-salary-list": {
    solution: sqlSelectSolution, inputs: [],
    probes: [{}, { database: probeA }, { database: probeEmpty }, { database: probeOne }],
    requires: all => selects(all).some(n => n.into.table && !n.where && n.orderBy?.[0]?.col.field === "salary" && n.orderBy[0].direction === "descending"),
  },
  "database-where-filter": {
    solution: sqlWhereSolution, inputs: ["lv_department", "lv_min_salary"],
    probes: [{}, { inputs: { lv_department: "IT", lv_min_salary: 5000 } }, { inputs: { lv_department: "LEGAL", lv_min_salary: 0 } }, { database: probeA, inputs: { lv_department: "IT", lv_min_salary: 5500 } }, { database: probeA, inputs: { lv_department: "HR", lv_min_salary: 9200 } }, { database: probeOne, inputs: { lv_department: "SALES", lv_min_salary: 0 } }],
    requires: all => selects(all).some(n => usesHost(n, "department", "lv_department") && usesHost(n, "salary", "lv_min_salary")),
  },
  "database-join-report": {
    solution: sqlJoinSolution, inputs: [],
    probes: [{}, { database: probeA }, { database: probeEmpty }, { database: probeOne }],
    requires: all => selects(all).some(n => n.join?.type === "left"),
  },
  "database-department-summary": {
    solution: sqlAggregateSolution, inputs: [],
    probes: [{}, { database: probeA }, { database: probeEmpty }, { database: probeOne }],
    requires: all => selects(all).some(n => !!n.groupBy && Array.isArray(n.fields) && n.fields.some(f => f.kind === "agg" && f.fn === "count") && n.fields.some(f => f.kind === "agg" && f.fn === "max")),
  },
  "database-raise": {
    solution: sqlChangeSolution, inputs: ["lv_department", "lv_raise"],
    probes: [{}, { inputs: { lv_department: "SALES", lv_raise: 1000 } }, { inputs: { lv_department: "LEGAL", lv_raise: 500 } }, { database: probeA, inputs: { lv_department: "IT", lv_raise: 250 } }, { database: probeOne, inputs: { lv_department: "SALES", lv_raise: 7 } }],
    requires: all => all.some(n => n.kind === "dbupdate" && !!n.set && !!n.where) && selects(all).some(n => Array.isArray(n.fields) && n.fields.some(f => f.kind === "agg" && f.fn === "sum")),
  },
};
