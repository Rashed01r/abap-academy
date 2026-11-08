// Hand-written beginner content for every lesson, following the "Add two numbers" layout.
// English only while ENABLE_ARABIC = false. Experiment answers are never stored here:
// the page runs the learner's code before and after the change and shows the real screens.
export type BeginnerLesson = {
  goal?: { give: string; shows: string };
  ideas: [title: string, text: string][];
  mistakes: { title: string; wrong: string; right: string; why: string }[];
  check: { question: string; options: string[]; answer: number; explanation: string };
  /** `from` must be exact text of the lesson example; the page edits the learner's current code. */
  experiments?: { title: string; ask?: string; why: string; from: string; to: string }[];
  challenge: { title: string; must: string[]; hints: string[] };
};

export const beginnerLessons: Record<string, BeginnerLesson> = {
  orientation: {
    goal: { give: "WRITE 5.", shows: "5" },
    ideas: [["An instruction is one command.", "WRITE 5. tells the program to show 5."], ["A period ends it.", "An instruction can span lines. Only the period ends it."], ["A comment is a note.", "A line starting with * is for people. The program skips it."]],
    mistakes: [
      { title: "Forgetting the period", wrong: "WRITE 5", right: "WRITE 5.", why: "Every ABAP instruction ends with a period. A line break does not end it." },
      { title: "Two instructions, one period", wrong: "WRITE 5\nWRITE 8.", right: "WRITE 5.\nWRITE 8.", why: "Each WRITE is its own instruction, so each needs its own period." },
      { title: "A note without *", wrong: "My first ABAP statement\nWRITE 5.", right: "* My first ABAP statement\nWRITE 5.", why: "Without * at the start, the program tries to run the note as code." },
    ],
    check: { question: "Where does the WRITE instruction in the example end?", options: ["At the period after 5", "At the end of the WRITE line", "At the comment"], answer: 0, explanation: "The instruction spans two lines. It ends only at the period after 5." },
    experiments: [
      { title: "Change the number", why: "WRITE shows whatever value you give it.", from: "  5.", to: "  42." },
      { title: "Add a second instruction", why: "Each WRITE shows one value, in the order the lines run.", from: "  5.", to: "  5.\nWRITE 8." },
      { title: "Forget the period", ask: "Will the program still run?", why: "Without the period the instruction never ends, so the program cannot run.", from: "  5.", to: "  5" },
      { title: "Remove the * from the comment", ask: "Will the program still run?", why: "Without *, the note is read as code, and it is not valid ABAP.", from: "* My first ABAP statement", to: "My first ABAP statement" },
    ],
    challenge: { title: "Show 5, then 8", must: ["Keep the WRITE that shows 5.", "Add a second WRITE that shows 8.", "End each instruction with a period."], hints: ["The editor already shows 5. You need one more instruction below it.", "Add the line WRITE 8. under WRITE 5. and keep both periods."] },
  },
  structures: {
    goal: { give: "ID 101 and name Ahmed", shows: "Ahmed" },
    ideas: [["TYPES describes a shape.", "It lists the fields. No data exists yet."], ["DATA makes one record.", "The record gets every field of the shape."], ["A hyphen picks a field.", "ls_employee-name means the name field of the record."]],
    mistakes: [
      { title: "Filling the shape instead of the record", wrong: "ty_employee-name = 'Ahmed'.", right: "ls_employee-name = 'Ahmed'.", why: "ty_employee is only the shape. Values go into the record you created with DATA." },
      { title: "Forgetting a comma between fields", wrong: "TYPES: BEGIN OF ty_employee,\n  id TYPE i\n  name TYPE string,\nEND OF ty_employee.", right: "TYPES: BEGIN OF ty_employee,\n  id TYPE i,\n  name TYPE string,\nEND OF ty_employee.", why: "Inside TYPES: BEGIN OF … END OF, each line ends with a comma. Only the last line ends with a period." },
      { title: "Using a dot instead of a hyphen", wrong: "ls_employee.name = 'Ahmed'.", right: "ls_employee-name = 'Ahmed'.", why: "ABAP uses a hyphen to reach a field inside a record." },
    ],
    check: { question: "Right after DATA ls_employee TYPE ty_employee. runs, what is in ls_employee-name?", options: ["Ahmed", "Empty text", "It does not exist yet"], answer: 1, explanation: "DATA creates the record with every field at its starting value: 0 for id and empty text for name. Ahmed is stored later." },
    experiments: [
      { title: "Change the name", why: "WRITE shows whatever the name field holds when it runs.", from: "ls_employee-name = 'Ahmed'.", to: "ls_employee-name = 'Sara'." },
      { title: "Change the ID", why: "The new ID is stored, but only the name is written, so the screen stays the same. Press Build trace to see the ID change in memory.", from: "ls_employee-id = 101.", to: "ls_employee-id = 205." },
      { title: "Show the ID as well", why: "Each WRITE shows one field, in the order the lines run.", from: "WRITE ls_employee-name.", to: "WRITE ls_employee-name.\nWRITE ls_employee-id." },
      { title: "Forget a period", ask: "Will the program still run?", why: "Every instruction must end with a period. Without it the program cannot run.", from: "WRITE ls_employee-name.", to: "WRITE ls_employee-name" },
    ],
    challenge: { title: "A shop needs a product record: ID 501, Keyboard, 12 in stock", must: ["Describe a product shape with TYPES: id (TYPE i), name (TYPE string) and quantity (TYPE i).", "Create one record of that shape with DATA.", "Fill id = 501, name = 'Keyboard' and quantity = 12.", "Show only the name with WRITE. The screen shows Keyboard."], hints: ["Copy the employee example and rename it: ty_product and ls_product. Add a third field line for quantity.", "Fill the fields with ls_product-id = 501., ls_product-name = 'Keyboard'. and ls_product-quantity = 12., then WRITE ls_product-name."] },
  },
  conditions: {
    goal: { give: "an amount of 1200", shows: "Needs approval" },
    ideas: [["IF asks a yes/no question.", "lv_amount >= 1000 is either true or false."], ["Only one branch runs.", "True runs the IF lines. False runs the ELSE lines."], ["ENDIF closes the decision.", "The program continues after ENDIF either way."]],
    mistakes: [
      { title: "Forgetting the period after the condition", wrong: "IF lv_amount >= 1000\n  WRITE 'Needs approval'.\nENDIF.", right: "IF lv_amount >= 1000.\n  WRITE 'Needs approval'.\nENDIF.", why: "IF lv_amount >= 1000. is one instruction, so it needs its own period." },
      { title: "Forgetting ENDIF", wrong: "IF lv_amount >= 1000.\n  WRITE 'Needs approval'.\nELSE.\n  WRITE 'Automatically approved'.", right: "IF lv_amount >= 1000.\n  WRITE 'Needs approval'.\nELSE.\n  WRITE 'Automatically approved'.\nENDIF.", why: "Every IF needs an ENDIF to mark where the decision ends." },
      { title: "Using > when the limit itself should count", wrong: "IF lv_amount > 1000.", right: "IF lv_amount >= 1000.", why: "> leaves out exactly 1000. >= includes it." },
    ],
    check: { question: "lv_amount is exactly 1000. What does the program show?", options: ["Needs approval", "Automatically approved", "Both messages"], answer: 0, explanation: ">= means “at least”, so 1000 passes the check. Only the IF branch runs." },
    experiments: [
      { title: "Use a small amount", why: "500 is below 1000, so the condition is false and the ELSE branch runs.", from: "DATA lv_amount TYPE i VALUE 1200.", to: "DATA lv_amount TYPE i VALUE 500." },
      { title: "Hit the limit exactly", why: ">= includes the limit, so 1000 still needs approval.", from: "DATA lv_amount TYPE i VALUE 1200.", to: "DATA lv_amount TYPE i VALUE 1000." },
      { title: "Raise the limit", why: "1200 is now below the limit, so the ELSE branch runs.", from: "IF lv_amount >= 1000.", to: "IF lv_amount >= 2000." },
      { title: "Forget ENDIF", ask: "Will the program still run?", why: "A decision without ENDIF is incomplete, so the program cannot run.", from: "ENDIF.", to: "" },
    ],
    challenge: { title: "Three small decisions: positive numbers, bonuses and score levels", must: ["A · Show 'Positive' for numbers above 0, otherwise 'Not positive'. Zero is not positive.", "B · Show 'Bonus' when sales are at least 5000, otherwise 'No bonus'.", "C · Show 'High' for 80 or more, 'Medium' for 50 to 79 and 'Low' below 50.", "Keep the starting values. The checker also tries other numbers, including the limits."], hints: ["Each one is: IF condition. → WRITE → ELSE. → WRITE → ENDIF. Pick > or >= by asking: does the limit itself count?", "A uses lv_number > 0. B uses lv_sales >= 5000. C starts with IF lv_score >= 80., then ELSEIF lv_score >= 50., then ELSE."] },
  },
  do: {
    goal: { give: "DO 10 TIMES", shows: "1 to 10" },
    ideas: [["DO repeats a block.", "DO 10 TIMES runs the lines inside ten times."], ["A counter remembers the pass.", "lv_count goes up by one on every pass."], ["ENDDO closes the loop.", "After the last pass the program continues below ENDDO."]],
    mistakes: [
      { title: "Forgetting ENDDO", wrong: "DO 10 TIMES.\n  lv_count = lv_count + 1.\n  WRITE lv_count.", right: "DO 10 TIMES.\n  lv_count = lv_count + 1.\n  WRITE lv_count.\nENDDO.", why: "ENDDO marks where the repeated lines end." },
      { title: "Resetting the counter inside the loop", wrong: "DO 10 TIMES.\n  lv_count = 0.\n  lv_count = lv_count + 1.\n  WRITE lv_count.\nENDDO.", right: "DATA lv_count TYPE i VALUE 0.\nDO 10 TIMES.\n  lv_count = lv_count + 1.\n  WRITE lv_count.\nENDDO.", why: "Start the counter once, before DO. Setting it to 0 inside the loop shows 1 ten times." },
      { title: "Writing a total inside the loop", wrong: "DO 5 TIMES.\n  lv_total = lv_total + sy-index.\n  WRITE lv_total.\nENDDO.", right: "DO 5 TIMES.\n  lv_total = lv_total + sy-index.\nENDDO.\nWRITE lv_total.", why: "A WRITE inside the loop runs on every pass. Put it after ENDDO to show only the final total." },
    ],
    check: { question: "How many times does lv_count = lv_count + 1. run?", options: ["Once", "10 times", "11 times"], answer: 1, explanation: "DO 10 TIMES runs the lines between DO and ENDDO exactly ten times." },
    experiments: [
      { title: "Repeat fewer times", why: "The block now runs three times, so it counts 1 to 3.", from: "DO 10 TIMES.", to: "DO 3 TIMES." },
      { title: "Start the counter at 100", why: "The counter still adds one per pass, starting from 100.", from: "DATA lv_count TYPE i VALUE 0.", to: "DATA lv_count TYPE i VALUE 100." },
      { title: "Count by two", why: "Each pass adds 2, so the numbers go 2, 4, 6 … 20.", from: "lv_count = lv_count + 1.", to: "lv_count = lv_count + 2." },
      { title: "Move WRITE after ENDDO", why: "WRITE now runs once, after the loop, and shows only the final value.", from: "  WRITE lv_count.\nENDDO.", to: "ENDDO.\nWRITE lv_count." },
    ],
    challenge: { title: "Count from 1 to 10, then add up 1 to 5", must: ["Count: use DO 10 TIMES and a counter to show 1 to 10, one number per WRITE.", "Total: use DO 5 TIMES to add 1 + 2 + 3 + 4 + 5 into lv_total.", "Show only the final total, 15, after ENDDO."], hints: ["The count is the example program. For the total, keep a counter and lv_total, both starting at 0.", "Inside DO 5 TIMES: lv_count = lv_count + 1. then lv_total = lv_total + lv_count. Put WRITE lv_total. after ENDDO."] },
  },
  while: {
    goal: { give: "a counter starting at 1", shows: "1 to 8" },
    ideas: [["WHILE checks first.", "Before every pass it asks: is lv_count <= 8?"], ["The body must change the value.", "Adding 1 lets the condition become false."], ["A false check stops the loop.", "At 9 the check fails and the program goes past ENDWHILE."]],
    mistakes: [
      { title: "Never changing the counter", wrong: "WHILE lv_count <= 8.\n  WRITE lv_count.\nENDWHILE.", right: "WHILE lv_count <= 8.\n  WRITE lv_count.\n  lv_count = lv_count + 1.\nENDWHILE.", why: "If the value never changes, the condition stays true forever. The browser stops such loops for safety." },
      { title: "Using < when the last value should count", wrong: "WHILE lv_count < 8.", right: "WHILE lv_count <= 8.", why: "< 8 stops after 7. <= 8 includes 8." },
      { title: "Forgetting ENDWHILE", wrong: "WHILE lv_count <= 8.\n  WRITE lv_count.\n  lv_count = lv_count + 1.", right: "WHILE lv_count <= 8.\n  WRITE lv_count.\n  lv_count = lv_count + 1.\nENDWHILE.", why: "ENDWHILE marks the end of the repeated lines." },
    ],
    check: { question: "If lv_count starts at 10, how many numbers are shown?", options: ["None", "One: 10", "Eight"], answer: 0, explanation: "WHILE checks before the first pass. 10 <= 8 is false, so the body never runs." },
    experiments: [
      { title: "Start past the limit", why: "The check is false before the first pass, so nothing runs.", from: "DATA lv_count TYPE i VALUE 1.", to: "DATA lv_count TYPE i VALUE 10." },
      { title: "Lower the limit", why: "The loop stops once the counter passes 3.", from: "WHILE lv_count <= 8.", to: "WHILE lv_count <= 3." },
      { title: "Use < instead of <=", why: "< leaves out 8 itself, so the last number shown is 7.", from: "WHILE lv_count <= 8.", to: "WHILE lv_count < 8." },
      { title: "Forget to add one", ask: "Will the program finish?", why: "The counter never changes, so the condition stays true. The browser stops the endless loop with an error.", from: "lv_count = lv_count + 1.", to: "\" lv_count = lv_count + 1." },
    ],
    challenge: { title: "Count while a rule holds, then fix a loop that never stops", must: ["Count: use WHILE and lv_count to show 1 to 8, then stop.", "Repair: the starter keeps showing 1 because its counter never changes. Add the missing update so it shows 1 to 5 and stops."], hints: ["Start at 1, check lv_count <= 8, WRITE, then add one.", "In the repair, add lv_count = lv_count + 1. inside the WHILE block, after the WRITE."] },
  },
  tables: {
    goal: { give: "10, 20 and 30", shows: "Ready (3 rows stored)" },
    ideas: [["A table holds many rows.", "Every row has the same type, here a whole number."], ["APPEND adds a row at the end.", "Rows stay in the order you added them."], ["A table starts empty.", "DATA creates it with no rows."]],
    mistakes: [
      { title: "Forgetting TO", wrong: "APPEND 10 lt_numbers.", right: "APPEND 10 TO lt_numbers.", why: "APPEND needs TO before the table name." },
      { title: "Adding text to a number table", wrong: "APPEND 'ten' TO lt_numbers.", right: "APPEND 10 TO lt_numbers.", why: "This table holds whole numbers (TABLE OF i), so every row must be a number." },
      { title: "Using one variable for many values", wrong: "DATA lv_number TYPE i.\nlv_number = 10.\nlv_number = 20.", right: "DATA lt_numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nAPPEND 10 TO lt_numbers.\nAPPEND 20 TO lt_numbers.", why: "A variable keeps one value, so the second assignment replaces the first. A table keeps every row." },
    ],
    check: { question: "After the three APPEND lines, what is in row 1?", options: ["10", "30", "Nothing, APPEND replaces the table"], answer: 0, explanation: "APPEND adds at the end, so the first value added, 10, stays in row 1." },
    experiments: [
      { title: "Add a fourth row", ask: "What changes on the screen?", why: "The screen still shows only Ready. The new row is in memory: press Build trace to see four rows.", from: "APPEND 30 TO lt_numbers.", to: "APPEND 30 TO lt_numbers.\nAPPEND 40 TO lt_numbers." },
      { title: "Change the message", why: "WRITE shows exactly the text between the quotes.", from: "WRITE 'Ready'.", to: "WRITE 'Done'." },
      { title: "Forget a period", ask: "Will the program still run?", why: "Every instruction must end with a period. Without it the program cannot run.", from: "APPEND 20 TO lt_numbers.", to: "APPEND 20 TO lt_numbers" },
    ],
    challenge: { title: "Store three numbers, then store two employees", must: ["Numbers: create lt_numbers, append 10, 20 and 30 in that order, then WRITE 'Ready'.", "Employees: define ty_employee (id, name), create lt_employees and ls_employee.", "Append 101/Ahmed, then 102/Sara, and WRITE ls_employee-name after the second APPEND."], hints: ["The numbers part is the example program.", "For employees: fill ls_employee-id and ls_employee-name, APPEND ls_employee TO lt_employees., then fill it again for Sara and append again."] },
  },
  "loop-at": {
    goal: { give: "rows 10, 20 and 30", shows: "60" },
    ideas: [["LOOP AT visits every row.", "It starts at row 1 and stops after the last."], ["INTO copies the current row.", "lv_number holds one row's value at a time."], ["Show totals after ENDLOOP.", "A WRITE after the loop runs once."]],
    mistakes: [
      { title: "Writing the total inside the loop", wrong: "LOOP AT lt_numbers INTO lv_number.\n  lv_total = lv_total + lv_number.\n  WRITE lv_total.\nENDLOOP.", right: "LOOP AT lt_numbers INTO lv_number.\n  lv_total = lv_total + lv_number.\nENDLOOP.\nWRITE lv_total.", why: "Inside the loop it shows 10, 30, 60. After ENDLOOP it shows only 60." },
      { title: "Resetting the total in the loop", wrong: "LOOP AT lt_numbers INTO lv_number.\n  lv_total = 0.\n  lv_total = lv_total + lv_number.\nENDLOOP.", right: "lv_total = 0.\nLOOP AT lt_numbers INTO lv_number.\n  lv_total = lv_total + lv_number.\nENDLOOP.", why: "Start the total once, before the loop. Otherwise it forgets the earlier rows." },
      { title: "Forgetting INTO", wrong: "LOOP AT lt_numbers.\n  lv_total = lv_total + lv_number.\nENDLOOP.", right: "LOOP AT lt_numbers INTO lv_number.\n  lv_total = lv_total + lv_number.\nENDLOOP.", why: "Without INTO lv_number, nothing copies the row into lv_number." },
    ],
    check: { question: "How many times does lv_total = lv_total + lv_number. run?", options: ["Once", "3 times, once per row", "60 times"], answer: 1, explanation: "LOOP AT runs its body once for every row. The table has three rows." },
    experiments: [
      { title: "Change a row", why: "The total adds whatever the rows hold.", from: "APPEND 10 TO lt_numbers.", to: "APPEND 15 TO lt_numbers." },
      { title: "Add a row", why: "The loop visits every row, so the new row is added too.", from: "APPEND 30 TO lt_numbers.", to: "APPEND 30 TO lt_numbers.\nAPPEND 40 TO lt_numbers." },
      { title: "Write inside the loop", why: "WRITE now runs once per row and shows the running total.", from: "ENDLOOP.\nWRITE lv_total.", to: "  WRITE lv_total.\nENDLOOP." },
      { title: "Start the total at 100", why: "The rows are added on top of the starting value.", from: "DATA lv_total TYPE i VALUE 0.", to: "DATA lv_total TYPE i VALUE 100." },
    ],
    challenge: { title: "Total the numbers, then list the employees", must: ["Total: put 10, 20 and 30 in lt_numbers, add each row to lv_total with LOOP AT … INTO, and show 60 once after ENDLOOP.", "Names: store 101/Ahmed and 102/Sara, then LOOP AT INTO ls_employee and WRITE each name in table order."], hints: ["The total is the example program. Declare lv_number and lv_total VALUE 0 before the loop.", "For names: LOOP AT lt_employees INTO ls_employee. WRITE ls_employee-name. ENDLOOP."] },
  },
  "loop-control": {
    goal: { give: "the numbers 1 to 5", shows: "1, 2, 4, 5" },
    ideas: [["CONTINUE skips one pass.", "The rest of this pass is skipped. The loop goes on."], ["EXIT leaves the loop.", "No more passes run. The program continues after ENDDO."], ["Order matters.", "Count first, then decide, then WRITE."]],
    mistakes: [
      { title: "Using EXIT when you mean skip", wrong: "IF lv_count = 3.\n  EXIT.\nENDIF.", right: "IF lv_count = 3.\n  CONTINUE.\nENDIF.", why: "EXIT stops the whole loop, so 4 and 5 would never appear." },
      { title: "Writing before the check", wrong: "lv_count = lv_count + 1.\nWRITE lv_count.\nIF lv_count = 3.\n  CONTINUE.\nENDIF.", right: "lv_count = lv_count + 1.\nIF lv_count = 3.\n  CONTINUE.\nENDIF.\nWRITE lv_count.", why: "CONTINUE only skips the lines below it. The WRITE must come after the check." },
      { title: "Counting after the check", wrong: "IF lv_count = 3.\n  CONTINUE.\nENDIF.\nlv_count = lv_count + 1.", right: "lv_count = lv_count + 1.\nIF lv_count = 3.\n  CONTINUE.\nENDIF.", why: "Increase the counter first, so the check sees the current pass number." },
    ],
    check: { question: "If CONTINUE is replaced by EXIT, what does the screen show?", options: ["1, 2", "1, 2, 4, 5", "1, 2, 3"], answer: 0, explanation: "EXIT leaves the loop at 3, before WRITE, so only 1 and 2 were shown." },
    experiments: [
      { title: "Skip a different number", why: "Now the first pass is skipped instead of the third.", from: "IF lv_count = 3.", to: "IF lv_count = 1." },
      { title: "Stop instead of skip", why: "EXIT leaves the loop at 3, so only 1 and 2 appear.", from: "CONTINUE.", to: "EXIT." },
      { title: "Repeat more times", why: "Two more passes run, so 6 and 7 appear. 3 is still skipped.", from: "DO 5 TIMES.", to: "DO 7 TIMES." },
    ],
    challenge: { title: "Skip 3, then stop before 4", must: ["Skip: count 1 to 5 in DO and use IF with CONTINUE so 3 is skipped (1, 2, 4, 5).", "Stop: use DO 5 TIMES, but EXIT when the counter reaches 4, before WRITE (1, 2, 3)."], hints: ["Order inside DO: add 1, then IF … ENDIF, then WRITE.", "Skip uses IF lv_count = 3. CONTINUE. ENDIF. Stop uses IF lv_count = 4. EXIT. ENDIF."] },
  },
  employees: {
    goal: { give: "Ahmed 5000, Sara 7000, Omar 4000", shows: "Ahmed, Sara, 12000" },
    ideas: [["One structure describes an employee.", "id, name and salary travel together."], ["The table is the register.", "Each APPEND saves one employee."], ["The loop applies the rule.", "Only salaries of 5000 or more are shown and added."]],
    mistakes: [
      { title: "Adding before the check", wrong: "LOOP AT lt_employees INTO ls_employee.\n  lv_total = lv_total + ls_employee-salary.\n  IF ls_employee-salary >= 5000.\n    WRITE ls_employee-name.\n  ENDIF.\nENDLOOP.", right: "LOOP AT lt_employees INTO ls_employee.\n  IF ls_employee-salary >= 5000.\n    WRITE ls_employee-name.\n    lv_total = lv_total + ls_employee-salary.\n  ENDIF.\nENDLOOP.", why: "Outside the IF, Omar's 4000 is added too and the total becomes 16000." },
      { title: "Using > instead of >=", wrong: "IF ls_employee-salary > 5000.", right: "IF ls_employee-salary >= 5000.", why: "Ahmed earns exactly 5000. > leaves him out; >= includes him." },
      { title: "Forgetting to append", wrong: "ls_employee-id = 102.\nls_employee-name = 'Sara'.\nls_employee-salary = 7000.", right: "ls_employee-id = 102.\nls_employee-name = 'Sara'.\nls_employee-salary = 7000.\nAPPEND ls_employee TO lt_employees.", why: "Filling the work area does not save it. APPEND copies it into the table." },
    ],
    check: { question: "Why is Omar not in the report?", options: ["His salary, 4000, is below 5000", "He was never appended", "The loop stops after two rows"], answer: 0, explanation: "Omar is stored and visited, but the IF is false for 4000, so his name and salary are skipped." },
    experiments: [
      { title: "Give Omar a raise", why: "6000 passes the rule, so Omar is shown and added.", from: "ls_employee-salary = 4000.", to: "ls_employee-salary = 6000." },
      { title: "Lower the rule", why: "Everyone passes now, so all three names are shown and added.", from: "IF ls_employee-salary >= 5000.", to: "IF ls_employee-salary >= 3000." },
      { title: "Use > instead of >=", why: "Ahmed earns exactly 5000, so > leaves him out.", from: "IF ls_employee-salary >= 5000.", to: "IF ls_employee-salary > 5000." },
    ],
    challenge: { title: "Build the employee register, then the salary report", must: ["Register: define ty_employee (id, name, salary) and append 101/Ahmed/5000, 102/Sara/7000 and 103/Omar/4000. Show 'Ready'.", "Report: loop over the same employees, show each name with a salary of at least 5000 and add those salaries.", "Show the total after the loop: Ahmed, Sara, 12000. Omar must not count."], hints: ["Fill all three fields before every APPEND.", "Inside LOOP AT: IF ls_employee-salary >= 5000., WRITE the name and add the salary, ENDIF. Then WRITE lv_total. after ENDLOOP."] },
  },
  "data-table-model": {
    goal: { give: "Keyboard, appended twice", shows: "Keyboard, Keyboard" },
    ideas: [["TYPES is the blueprint.", "It describes one product row."], ["The table stores copies.", "APPEND saves a copy of the work area."], ["The work area is separate.", "Changing it later does not touch the saved rows."]],
    mistakes: [
      { title: "Expecting saved rows to follow the work area", wrong: "ls_product-name = 'Mouse'.\n\" expecting both saved rows to say Mouse", right: "ls_product-name = 'Mouse'.\nAPPEND ls_product TO lt_products.", why: "Saved rows only change when you save again, for example with another APPEND." },
      { title: "Appending before filling", wrong: "APPEND ls_product TO lt_products.\nls_product-id = 501.\nls_product-name = 'Keyboard'.", right: "ls_product-id = 501.\nls_product-name = 'Keyboard'.\nAPPEND ls_product TO lt_products.", why: "APPEND copies what the work area holds at that moment, here an empty product." },
      { title: "Appending to the type", wrong: "APPEND ls_product TO ty_product.", right: "APPEND ls_product TO lt_products.", why: "ty_product is only the blueprint. Rows go into the table created with DATA." },
    ],
    check: { question: "After ls_product-name = 'Mouse'., what do the two saved rows hold?", options: ["Keyboard and Keyboard", "Mouse and Mouse", "Keyboard and Mouse"], answer: 0, explanation: "Each APPEND saved a copy of Keyboard. Changing the work area afterwards does not change those copies." },
    experiments: [
      { title: "Save Mouse too", why: "Mouse is now saved as a third row, so the loop shows it too.", from: "ls_product-name = 'Mouse'.", to: "ls_product-name = 'Mouse'.\nAPPEND ls_product TO lt_products." },
      { title: "Append only once", why: "One APPEND saves one copy, so Keyboard is shown once.", from: "APPEND ls_product TO lt_products.\nAPPEND ls_product TO lt_products.", to: "APPEND ls_product TO lt_products." },
      { title: "Change the name before saving", why: "The saved copies hold whatever the work area held at APPEND time.", from: "ls_product-name = 'Keyboard'.", to: "ls_product-name = 'Monitor'." },
    ],
    challenge: { title: "Keep two Keyboard rows safe while the work area changes", must: ["Fill ls_product with 501 and Keyboard and append it twice to lt_products.", "Then change only the work-area name to Mouse, without appending.", "LOOP AT the table and WRITE each stored name: Keyboard, Keyboard."], hints: ["Fill both fields before the first APPEND. The second APPEND saves the same values again.", "Change ls_product-name to 'Mouse' after the APPENDs, then LOOP AT lt_products INTO ls_product. WRITE ls_product-name. ENDLOOP."] },
  },
  "data-table-categories": {
    goal: { give: "30, 10, 30", shows: "30, 10, 30" },
    ideas: [["STANDARD keeps your order.", "Rows stay as appended, duplicates allowed."], ["SORTED keeps key order.", "Rows are always sorted by the key."], ["HASHED needs a unique key.", "Fast lookups by the full key, but no row numbers."]],
    mistakes: [
      { title: "Expecting a standard table to sort itself", wrong: "APPEND 30 TO lt_ids.\nAPPEND 10 TO lt_ids.\n\" expecting 10 before 30", right: "APPEND 30 TO lt_ids.\nAPPEND 10 TO lt_ids.\nSORT lt_ids.", why: "A standard table keeps the order you appended. Sort it yourself, or choose a SORTED table." },
      { title: "A hashed table without a unique key", wrong: "DATA lt_ids TYPE HASHED TABLE OF i\n  WITH NON-UNIQUE KEY table_line.", right: "DATA lt_ids TYPE HASHED TABLE OF i\n  WITH UNIQUE KEY table_line.", why: "A hashed table always needs a unique key." },
      { title: "Reading a hashed table by row number", wrong: "READ TABLE lt_ids INTO lv_id INDEX 1.", right: "READ TABLE lt_ids INTO lv_id\n  WITH TABLE KEY table_line = 30.", why: "Hashed tables have no row numbers. Read them by key." },
    ],
    check: { question: "You must keep imported IDs in arrival order, duplicates included. Which table fits?", options: ["STANDARD", "SORTED with a unique key", "HASHED"], answer: 0, explanation: "Only a standard table keeps the arrival order and allows duplicates without a key rule." },
    experiments: [
      { title: "Change a value", why: "The standard table shows rows exactly as appended.", from: "APPEND 10 TO lt_ids.", to: "APPEND 50 TO lt_ids." },
      { title: "Add another duplicate", why: "A standard table keeps every duplicate.", from: "APPEND 10 TO lt_ids.", to: "APPEND 30 TO lt_ids.\nAPPEND 10 TO lt_ids." },
      { title: "Forget a period", ask: "Will the program still run?", why: "Every instruction must end with a period. Without it the program cannot run.", from: "APPEND 10 TO lt_ids.", to: "APPEND 10 TO lt_ids" },
    ],
    challenge: { title: "Pick the right table for each need, then keep imported IDs in order", must: ["Choose STANDARD, SORTED or HASHED for each of the three business needs.", "Create lt_ids as a standard integer table with an empty key.", "Append 30, 10 and 30 in that order, then LOOP AT INTO lv_id and WRITE lv_id: 30, 10, 30."], hints: ["Order and duplicates matter for the import, so a standard table fits.", "Three APPEND lines, then LOOP AT lt_ids INTO lv_id. WRITE lv_id. ENDLOOP."] },
  },
  "data-keys": {
    goal: { give: "search for IT and 101", shows: "Ahmed, Noura, 2" },
    ideas: [["A key says who a row is.", "Here department + ID identify an employee."], ["A row number is only a position.", "It changes when rows move; a key does not."], ["Check every match.", "An empty-key table can hold the same identity twice."]],
    mistakes: [
      { title: "Checking the ID only", wrong: "IF ls_employee-id = lv_id.", right: "IF ls_employee-department = lv_department.\n  IF ls_employee-id = lv_id.", why: "Sara in HR also has ID 101. Department and ID together identify the employee." },
      { title: "Stopping at the first match", wrong: "lv_matches = lv_matches + 1.\nEXIT.", right: "lv_matches = lv_matches + 1.", why: "An empty-key table can contain the same identity twice. EXIT would hide Noura." },
      { title: "Treating a row number as an ID", wrong: "READ TABLE lt_employees INTO ls_employee INDEX 101.", right: "READ TABLE lt_employees INTO ls_employee\n  WITH KEY department = 'IT' id = 101.", why: "INDEX 101 means row 101, not employee 101." },
    ],
    check: { question: "Sara is in HR with ID 101. Why is she not counted?", options: ["Her department is HR, not IT", "Her ID is different", "The loop stops before her row"], answer: 0, explanation: "The first IF compares the department. HR is not IT, so the ID check never runs for Sara." },
    experiments: [
      { title: "Search HR instead", why: "Only Sara is in HR with ID 101.", from: "DATA lv_department TYPE string VALUE 'IT'.", to: "DATA lv_department TYPE string VALUE 'HR'." },
      { title: "Search ID 102", why: "Only Omar is in IT with ID 102.", from: "DATA lv_id TYPE i VALUE 101.", to: "DATA lv_id TYPE i VALUE 102." },
      { title: "Stop at the first match", why: "EXIT leaves the loop after Ahmed, so Noura is never checked.", from: "      lv_matches = lv_matches + 1.", to: "      lv_matches = lv_matches + 1.\n      EXIT." },
    ],
    challenge: { title: "Find every IT employee with ID 101", must: ["Loop over lt_employees into ls_employee.", "Show a name only when both the department and the ID match.", "Count the matches in lv_matches and show the count after the loop: Ahmed, Noura, 2."], hints: ["Use two IFs inside the loop: department first, then ID.", "Inside both IFs: WRITE ls_employee-name. and lv_matches = lv_matches + 1. Do not use EXIT."] },
  },
  "data-work-areas-field-symbols": {
    goal: { give: "Ahmed, then Sara through <employee>", shows: "Ahmed, Sara, Ahmed" },
    ideas: [["A work area holds one record.", "ls_employee is your own copy of an employee."], ["APPEND saves a copy.", "The saved row does not follow later changes."], ["A field symbol is a second name.", "After ASSIGN, <employee> changes ls_employee itself."]],
    mistakes: [
      { title: "Using a field symbol before ASSIGN", wrong: "FIELD-SYMBOLS <employee> TYPE ty_employee.\n<employee>-name = 'Sara'.", right: "FIELD-SYMBOLS <employee> TYPE ty_employee.\nASSIGN ls_employee TO <employee>.\n<employee>-name = 'Sara'.", why: "A field symbol points nowhere until ASSIGN connects it." },
      { title: "Expecting the saved row to change", wrong: "<employee>-name = 'Sara'.\n\" expecting the table row to say Sara", right: "<employee>-name = 'Sara'.\nAPPEND ls_employee TO lt_employees.", why: "The field symbol changes ls_employee only. The table keeps its own copy until you save again." },
      { title: "Forgetting the angle brackets", wrong: "FIELD-SYMBOLS employee TYPE ty_employee.", right: "FIELD-SYMBOLS <employee> TYPE ty_employee.", why: "Field-symbol names are always written inside < >." },
    ],
    check: { question: "After <employee>-name = 'Sara'., what does the saved table row hold?", options: ["Ahmed", "Sara", "Nothing"], answer: 0, explanation: "APPEND saved a copy while the name was Ahmed. The field symbol changed only the work area." },
    experiments: [
      { title: "Change the name through the alias", why: "The field symbol changes ls_employee, so the second line changes. The saved row still says Ahmed.", from: "<employee>-name = 'Sara'.", to: "<employee>-name = 'Maha'." },
      { title: "Change the first name", why: "The first name is shown and saved, so the loop at the end shows it too.", from: "ls_employee-name = 'Ahmed'.", to: "ls_employee-name = 'Omar'." },
      { title: "Save after the change", why: "A second row is saved, so the loop at the end shows both saved names.", from: "<employee>-name = 'Sara'.", to: "<employee>-name = 'Sara'.\nAPPEND ls_employee TO lt_employees." },
    ],
    challenge: { title: "Create an employee work area, then change it through a field symbol", must: ["Record: define ty_employee (id, name, salary), create ls_employee, set 202, Maha and 6000, and WRITE the name.", "Alias: ASSIGN ls_employee to <employee> and change the name through <employee>-name using lv_new_name.", "Show ls_employee-name, then loop over the saved table and show its name: Sara, then Ahmed."], hints: ["TYPES first, then DATA ls_employee TYPE ty_employee., then fill each field with ls_employee-field = value.", "FIELD-SYMBOLS <employee> TYPE ty_employee. ASSIGN ls_employee TO <employee>. <employee>-name = lv_new_name. Do not append again."] },
  },
  "data-read-table": {
    goal: { give: "look for ID 102, then ID 999", shows: "Sara, Not found" },
    ideas: [["READ TABLE finds one row.", "WITH KEY id = lv_id compares the id field."], ["sy-subrc tells you if it worked.", "0 means found, 4 means not found."], ["Check right away.", "A failed read leaves the old values in ls_employee."]],
    mistakes: [
      { title: "Not checking sy-subrc", wrong: "READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nWRITE ls_employee-name.", right: "READ TABLE lt_employees INTO ls_employee WITH KEY id = lv_id.\nIF sy-subrc = 0.\n  WRITE ls_employee-name.\nENDIF.", why: "For ID 999 this would still show Sara, left over from the earlier read." },
      { title: "Using INDEX for an ID", wrong: "READ TABLE lt_employees INTO ls_employee INDEX 102.", right: "READ TABLE lt_employees INTO ls_employee WITH KEY id = 102.", why: "INDEX 102 means row 102, not the employee with ID 102." },
      { title: "Checking the name instead of sy-subrc", wrong: "IF ls_employee-name IS NOT INITIAL.", right: "IF sy-subrc = 0.", why: "The work area can still hold an old name after a failed read." },
    ],
    check: { question: "After the read for ID 999 fails, what is in ls_employee-name?", options: ["Sara, left from the last successful read", "Empty text", "Not found"], answer: 0, explanation: "A failed READ does not clear the work area. That is why the program checks sy-subrc before using it." },
    experiments: [
      { title: "Look for Ahmed", why: "ID 101 is Ahmed's row, so the first read shows Ahmed.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 101." },
      { title: "Make the second search succeed", why: "101 exists, so the second read finds Ahmed instead of Not found.", from: "lv_id = 999.", to: "lv_id = 101." },
      { title: "Look for a missing ID first", why: "No row has ID 500, so both reads show Not found.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 500." },
    ],
    challenge: { title: "Find an employee by ID, safely", must: ["Read lt_employees INTO ls_employee WITH KEY id = lv_id.", "Check sy-subrc right after the read.", "If it is 0, show ls_employee-name; otherwise show exactly Not found. With lv_id = 102 the screen shows Sara."], hints: ["Finding the row and using its values are two steps. READ TABLE does the first and sets sy-subrc.", "IF sy-subrc = 0. WRITE ls_employee-name. ELSE. WRITE 'Not found'. ENDIF. Do not test the name: it can be left over."] },
  },
  "data-table-mutations": {
    goal: { give: "Ahmed and Omar, then insert Sara", shows: "Sarah, Omar" },
    ideas: [["INSERT puts a row at a position.", "INDEX 2 places it before the current row 2."], ["MODIFY saves the work area.", "Editing ls_employee alone changes nothing in the table."], ["DELETE removes and shifts.", "Later rows move up one position."]],
    mistakes: [
      { title: "Editing the work area only", wrong: "ls_employee-name = lv_new_name.", right: "ls_employee-name = lv_new_name.\nMODIFY lt_employees FROM ls_employee INDEX 2.", why: "Only MODIFY copies the work area back into the table." },
      { title: "Adding at the wrong place", wrong: "APPEND ls_employee TO lt_employees.", right: "INSERT ls_employee INTO lt_employees INDEX 2.", why: "APPEND always adds at the end. INSERT … INDEX 2 places Sara between Ahmed and Omar." },
      { title: "Not checking sy-subrc", wrong: "MODIFY lt_employees FROM ls_employee INDEX 5.\nDELETE lt_employees INDEX 1.", right: "MODIFY lt_employees FROM ls_employee INDEX 2.\nIF sy-subrc = 0.\n  DELETE lt_employees INDEX 1.\nENDIF.", why: "If a change fails (there is no row 5), the next step should not run." },
    ],
    check: { question: "After INSERT … INDEX 2, which row is Omar in?", options: ["Row 2", "Row 3", "Row 1"], answer: 1, explanation: "Sara takes position 2, so Omar shifts down to row 3." },
    experiments: [
      { title: "Use a different new name", why: "MODIFY saves the new name, so the report shows it.", from: "DATA lv_new_name TYPE string VALUE 'Sarah'.", to: "DATA lv_new_name TYPE string VALUE 'Sally'." },
      { title: "Delete the last row instead", why: "Row 3 (Omar) is removed instead of Ahmed.", from: "DELETE lt_employees INDEX 1.", to: "DELETE lt_employees INDEX 3." },
      { title: "Delete a row that does not exist", why: "There is no row 9, so DELETE fails, sy-subrc is not 0 and the report never runs.", from: "DELETE lt_employees INDEX 1.", to: "DELETE lt_employees INDEX 9." },
    ],
    challenge: { title: "Update the employee list: insert, rename, delete", must: ["Fill ls_employee from lv_insert_id and lv_insert_name and INSERT it at INDEX 2.", "Change its name to lv_new_name and MODIFY row 2 from the work area.", "DELETE row 1, then loop and show each name: Sarah, Omar.", "Check sy-subrc after each change before going on."], hints: ["Inserting before row 2 moves Omar to row 3. Deleting row 1 later moves him back to row 2.", "Nest the steps: INSERT, then IF sy-subrc = 0. MODIFY …, then IF sy-subrc = 0. DELETE …, then IF sy-subrc = 0. LOOP and WRITE."] },
  },
  "data-sorting-filtering": {
    goal: { give: "Ahmed 5000, Sara 8000, Omar 6000", shows: "Sara, Omar" },
    ideas: [["SORT reorders whole rows.", "Each name stays with its own salary."], ["DESCENDING puts big values first.", "Sara 8000, Omar 6000, Ahmed 5000."], ["IF filters the output, not the table.", "Ahmed is skipped on screen but still stored."]],
    mistakes: [
      { title: "Sorting after the loop", wrong: "LOOP AT lt_employees INTO ls_employee.\n  WRITE / ls_employee-name.\nENDLOOP.\nSORT lt_employees BY salary DESCENDING.", right: "SORT lt_employees BY salary DESCENDING.\nLOOP AT lt_employees INTO ls_employee.\n  WRITE / ls_employee-name.\nENDLOOP.", why: "The report is already written by then. Sort first, then loop." },
      { title: "Forgetting DESCENDING", wrong: "SORT lt_employees BY salary.", right: "SORT lt_employees BY salary DESCENDING.", why: "Without DESCENDING, SORT puts the smallest salary first." },
      { title: "Deleting rows to filter a report", wrong: "DELETE lt_employees WHERE salary < lv_min_salary.", right: "IF ls_employee-salary >= lv_min_salary.\n  WRITE / ls_employee-name.\nENDIF.", why: "A report only needs to skip rows. DELETE removes them from the table." },
    ],
    check: { question: "After the report runs, how many rows does lt_employees hold?", options: ["3: Ahmed is skipped on screen but still stored", "2: Ahmed was removed", "1"], answer: 0, explanation: "SORT only reorders rows and IF only chooses what is written. No row is deleted." },
    experiments: [
      { title: "Sort smallest first", why: "ASCENDING puts the smaller salary first.", from: "SORT lt_employees BY salary DESCENDING.", to: "SORT lt_employees BY salary ASCENDING." },
      { title: "Raise the minimum", why: "Only salaries of at least 7000 pass the IF.", from: "DATA lv_min_salary TYPE i VALUE 6000.", to: "DATA lv_min_salary TYPE i VALUE 7000." },
      { title: "Lower the minimum", why: "Everyone passes now, still in salary order.", from: "DATA lv_min_salary TYPE i VALUE 6000.", to: "DATA lv_min_salary TYPE i VALUE 5000." },
    ],
    challenge: { title: "Build the salary report, highest salary first", must: ["Sort lt_employees by salary descending.", "Loop into ls_employee and show the name only when salary >= lv_min_salary.", "Expected: Sara, then Omar. Keep all three rows in the table."], hints: ["Place SORT lt_employees BY salary DESCENDING. before LOOP AT.", "Inside the loop: IF ls_employee-salary >= lv_min_salary. WRITE / ls_employee-name. ENDIF."] },
  },
  "data-conditional-loop": {
    goal: { give: "a minimum salary of 6000", shows: "Sara, Omar, 2, 14000" },
    ideas: [["WHERE chooses the rows.", "Only rows with salary >= 6000 enter the loop."], ["Other rows stay stored.", "WHERE skips Ahmed; it does not delete him."], ["Count inside, show after.", "The count and total are written once, after ENDLOOP."]],
    mistakes: [
      { title: "Writing the totals inside the loop", wrong: "  lv_total = lv_total + ls_employee-salary.\n  WRITE / lv_total.\nENDLOOP.", right: "  lv_total = lv_total + ls_employee-salary.\nENDLOOP.\nWRITE / lv_total.", why: "Inside the loop the total is written once per row. After ENDLOOP it is written once." },
      { title: "Using > when the minimum counts", wrong: "WHERE salary > lv_min_salary.", right: "WHERE salary >= lv_min_salary.", why: "Omar earns exactly 6000. > would leave him out." },
      { title: "Naming the work area in WHERE", wrong: "WHERE ls_employee-salary >= lv_min_salary.", right: "WHERE salary >= lv_min_salary.", why: "WHERE tests the table's row fields directly, by their field names." },
    ],
    check: { question: "The minimum changes to 9000. What does the report show?", options: ["0 and 0", "Ahmed, 1, 5000", "Sara, 1, 8000"], answer: 0, explanation: "No salary reaches 9000, so the loop body never runs and both totals stay 0." },
    experiments: [
      { title: "Raise the minimum", why: "Only Sara earns 7000 or more.", from: "DATA lv_min_salary TYPE i VALUE 6000.", to: "DATA lv_min_salary TYPE i VALUE 7000." },
      { title: "Lower the minimum", why: "All three employees qualify now.", from: "DATA lv_min_salary TYPE i VALUE 6000.", to: "DATA lv_min_salary TYPE i VALUE 5000." },
      { title: "Nobody qualifies", why: "No salary reaches 9000, so the loop body never runs and both totals stay 0.", from: "DATA lv_min_salary TYPE i VALUE 6000.", to: "DATA lv_min_salary TYPE i VALUE 9000." },
    ],
    challenge: { title: "Build the selected-employee report", must: ["LOOP AT lt_employees INTO ls_employee WHERE salary >= lv_min_salary.", "Inside: show the name, add 1 to lv_count and the salary to lv_total.", "After ENDLOOP, show the count, then the total: Sara, Omar, 2, 14000."], hints: ["WHERE chooses rows; it does not delete any. Use >= so exactly 6000 counts.", "WRITE / ls_employee-name. inside the loop. WRITE / lv_count. and WRITE / lv_total. after ENDLOOP."] },
  },
  "data-table-expressions": {
    goal: { give: "look for ID 102, then ID 999", shows: "Sara, 2 · then Not found, 0" },
    ideas: [["Brackets read one row.", "lt_employees[ 3 ] is a position; lt_employees[ id = lv_id ] searches by ID."], ["A miss is an exception, not sy-subrc.", "TRY … CATCH cx_sy_itab_line_not_found handles a missing ID."], ["Ask without reading.", "line_exists( ) answers yes or no; line_index( ) gives the position, or 0."]],
    mistakes: [
      { title: "Checking sy-subrc after a table expression", wrong: "ls_employee = lt_employees[ id = lv_id ].\nIF sy-subrc <> 0.\n  WRITE / 'Not found'.\nENDIF.", right: "TRY.\n    ls_employee = lt_employees[ id = lv_id ].\n  CATCH cx_sy_itab_line_not_found.\n    WRITE / 'Not found'.\nENDTRY.", why: "A table expression never sets sy-subrc. A missing ID raises an exception instead, and without TRY the program stops." },
      { title: "Putting the ID where a position goes", wrong: "ls_employee = lt_employees[ lv_id ].", right: "ls_employee = lt_employees[ id = lv_id ].", why: "[ lv_id ] asks for row 102. Name the field to search by ID." },
      { title: "Reading the same row twice", wrong: "IF line_exists( lt_employees[ id = lv_id ] ).\n  ls_employee = lt_employees[ id = lv_id ].\nENDIF.", right: "TRY.\n    ls_employee = lt_employees[ id = lv_id ].\n  CATCH cx_sy_itab_line_not_found.\nENDTRY.", why: "When you need the row, read it once inside TRY. line_exists( ) is for yes-or-no questions." },
    ],
    check: { question: "lv_id is 999. What does lv_position = line_index( lt_employees[ id = lv_id ] ). store?", options: ["0", "The program stops with an exception", "4"], answer: 0, explanation: "line_index( ) never raises the exception. It returns 0 when no row matches." },
    experiments: [
      { title: "Look for Ahmed", why: "ID 101 is at position 1, so the TRY block shows Ahmed and line_index( ) returns 1.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 101." },
      { title: "Look for a missing ID", why: "No row has ID 999. The TRY block jumps to CATCH and writes Not found; line_index( ) returns 0.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 999." },
      { title: "Read a different position", why: "[ 1 ] is the first row, so lv_name becomes Ahmed instead of Omar.", from: "lv_name = lt_employees[ 3 ]-name.", to: "lv_name = lt_employees[ 1 ]-name." },
    ],
    challenge: { title: "Look up an employee safely", must: ["Inside TRY: ls_employee = lt_employees[ id = lv_id ]. then show the name and the salary.", "CATCH cx_sy_itab_line_not_found and show exactly Not found.", "After ENDTRY: lv_position = line_index( lt_employees[ id = lv_id ] ). and show it. With lv_id = 102: Sara, 8000, 2."], hints: ["Search by key: lt_employees[ id = lv_id ]. A missing ID raises an exception, so the read goes inside TRY.", "Put both WRITE lines for the employee inside TRY, after the read. line_index( ) goes after ENDTRY and returns 0 for a missing ID."] },
  },
  "data-table-performance": {
    goal: { give: "16 IDs, newest first; find 101", shows: "16 checks one by one, 5 with BINARY SEARCH" },
    ideas: [["One by one checks every row.", "Finding 101 at the bottom of 16 rows takes 16 checks."], ["BINARY SEARCH halves the rows.", "Look at the middle, keep the right half, repeat: about 5 checks."], ["Sort first, by the same field.", "On an unsorted list BINARY SEARCH can miss a row that is there."]],
    mistakes: [
      { title: "BINARY SEARCH without SORT", wrong: "READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.", right: "SORT lt_ids BY table_line.\nREAD TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.", why: "The IDs are newest first. Without SORT, the search heads the wrong way and says Not found." },
      { title: "Sorting by a different field", wrong: "SORT lt_employees BY name.\nREAD TABLE lt_employees INTO ls_employee WITH KEY id = lv_id BINARY SEARCH.", right: "SORT lt_employees BY id.\nREAD TABLE lt_employees INTO ls_employee WITH KEY id = lv_id BINARY SEARCH.", why: "BINARY SEARCH needs the rows in order of the field you search, here id." },
      { title: "Sorting before every read", wrong: "SORT lt_ids BY table_line.\nREAD TABLE … BINARY SEARCH.\nSORT lt_ids BY table_line.\nREAD TABLE … BINARY SEARCH.", right: "SORT lt_ids BY table_line.\nREAD TABLE … BINARY SEARCH.\nREAD TABLE … BINARY SEARCH.", why: "Sorting is the expensive step. Do it once, then read as often as you need." },
    ],
    check: { question: "The sorted list grows from 16 to 32 IDs. How many more checks does BINARY SEARCH need?", options: ["About one more", "Twice as many", "Exactly the same"], answer: 0, explanation: "Doubling the rows adds just one halving step. A one-by-one search would need up to twice as many checks." },
    experiments: [
      { title: "Look for the newest ID", why: "116 is at the top, so the one-by-one search finds it at once and shows 1. After SORT it is the last row, so the binary search shows 16.", from: "DATA lv_search TYPE i VALUE 101.", to: "DATA lv_search TYPE i VALUE 116." },
      { title: "Forget to sort", why: "Without SORT the list is newest first, so BINARY SEARCH heads the wrong way and shows Not found, even though 101 is there.", from: "SORT lt_ids BY table_line.", to: "* SORT lt_ids BY table_line." },
      { title: "Double the list", why: "The one-by-one search now needs 32 checks and shows 32. The binary search needs only one more check and still shows 1.", from: "DO 16 TIMES.", to: "DO 32 TIMES." },
    ],
    challenge: { title: "Find an ID with BINARY SEARCH", must: ["SORT lt_ids BY table_line. once, before the read.", "READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.", "If sy-subrc = 0 show sy-tabix, otherwise show exactly Not found. With lv_search = 101 the screen shows 1."], hints: ["The IDs start newest first. BINARY SEARCH needs them sorted, so SORT comes first.", "BINARY SEARCH is the last part of the READ TABLE line. Then IF sy-subrc = 0. WRITE / sy-tabix. ELSE. WRITE / 'Not found'. ENDIF."] },
  },
  "data-employee-manager": {
    goal: { give: "a raise of 500 for Sara; remove Ahmed", shows: "8500, then Sara, Omar, 2, 14500" },
    ideas: [["Find the position first.", "line_index( ) gives the row number, or 0 when the ID is missing."], ["Change a copy, then MODIFY.", "The table only changes when MODIFY writes the copy back."], ["Report after the changes.", "DELETE first, then LOOP, so the count and total match the table."]],
    mistakes: [
      { title: "Forgetting MODIFY", wrong: "ls_employee-salary = ls_employee-salary + lv_raise.\nWRITE / ls_employee-salary.", right: "ls_employee-salary = ls_employee-salary + lv_raise.\nMODIFY lt_employees FROM ls_employee INDEX lv_position.", why: "Without MODIFY only the copy has the raise; the table keeps the old salary." },
      { title: "Using position 0", wrong: "lv_position = line_index( lt_employees[ id = lv_id ] ).\nDELETE lt_employees INDEX lv_position.", right: "lv_position = line_index( lt_employees[ id = lv_id ] ).\nIF lv_position > 0.\n  DELETE lt_employees INDEX lv_position.\nENDIF.", why: "0 means the employee is missing. Only change the table when the position is greater than 0." },
      { title: "Writing the totals inside the loop", wrong: "  lv_total = lv_total + ls_employee-salary.\n  WRITE / lv_total.\nENDLOOP.", right: "  lv_total = lv_total + ls_employee-salary.\nENDLOOP.\nWRITE / lv_total.", why: "Inside the loop the total is shown once per employee. After ENDLOOP it is shown once." },
    ],
    check: { question: "lv_id is 999. What happens to the table during the raise step?", options: ["Nothing changes; Not found is shown", "The first employee gets the raise", "The program stops"], answer: 0, explanation: "line_index( ) returns 0, so the IF skips the copy, the raise and the MODIFY." },
    experiments: [
      { title: "Raise Omar instead", why: "Omar is 103, so he gets the raise: 6500 is shown and the total becomes 14500 with Sara at 8000.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 103." },
      { title: "Use a missing ID", why: "No employee is 999, so Not found is shown, nobody gets a raise and the total is 14000.", from: "DATA lv_id TYPE i VALUE 102.", to: "DATA lv_id TYPE i VALUE 999." },
      { title: "Give a bigger raise", why: "Sara's salary becomes 9000 and the total grows to 15000.", from: "DATA lv_raise TYPE i VALUE 500.", to: "DATA lv_raise TYPE i VALUE 1000." },
    ],
    challenge: { title: "Run the Employee Data Manager", must: ["Challenge 1: find lv_id with line_index( ), copy the row, add lv_raise, MODIFY it back and show the new salary (Not found if missing). With lv_id = 102: 8500.", "Challenge 2: remove lv_id with DELETE … INDEX (Not found if missing), then LOOP to show each remaining name, the count and the total. With lv_id = 102: Ahmed, Omar, 2, 11000.", "Only change the table when the position is greater than 0."], hints: ["Both challenges start the same way: lv_position = line_index( lt_employees[ id = lv_id ] ). then IF lv_position > 0.", "Raise: ls_employee = lt_employees[ lv_position ]. add the raise, MODIFY … INDEX lv_position. Report: DELETE first, LOOP after, totals after ENDLOOP."] },
  },
  "dictionary-introduction": {
    ideas: [["A domain is the technical shape.", "Type, length and allowed values, defined once."], ["A data element gives meaning.", "Labels such as “Employee status” that users see."], ["A database table stores rows.", "Its key fields identify each row."]],
    mistakes: [
      { title: "Repeating raw types on every field", wrong: "status : abap.char(1);", right: "status : zaca_employee_status;", why: "A data element keeps the type and labels in one reusable place." },
      { title: "Using a name as the key", wrong: "key employee_name : abap.char(80) not null;", right: "key employee_id : zaca_employee_id not null;", why: "Names can change. A stable ID identifies the employee." },
      { title: "Expecting a table definition to contain data", wrong: "\" activated zaca_employee, so employees exist", right: "\" activated zaca_employee: an empty table exists\n\" a program inserts the rows later", why: "The definition creates the container. Rows are added by programs." },
    ],
    check: { question: "Where does the field label “Employee status” belong?", options: ["In the data element", "In the domain", "In the table key"], answer: 0, explanation: "The data element gives a field its business meaning and labels. The domain only holds the technical shape." },
    challenge: { title: "Two apps share employee status: decide where each rule lives", must: ["Decide what belongs in the domain: type, length and allowed values.", "Decide what belongs in the data element: meaning and labels.", "Decide what the table stores and how its key identifies a row."], hints: ["Separate how a value is stored from what users call it.", "Type, length and fixed values → domain. Labels → data element. Rows and key → database table."] },
  },
  "database-abap-sql": {
    goal: { give: "the ID 103", shows: "Omar, 9500" },
    ideas: [["ABAP SQL talks to the database.", "SELECT reads, INSERT/UPDATE/DELETE change."], ["@ marks program variables.", "WHERE employee_id = @lv_id uses the value of lv_id."], ["sy-subrc tells you if it worked.", "0 found, 4 not found."]],
    mistakes: [
      { title: "Forgetting the @", wrong: "WHERE employee_id = lv_id", right: "WHERE employee_id = @lv_id", why: "Without @ the database looks for a column called lv_id." },
      { title: "Using the work area without checking", wrong: "SELECT SINGLE … INTO @ls_employee.\nWRITE / ls_employee-employee_name.", right: "SELECT SINGLE … INTO @ls_employee.\nIF sy-subrc = 0.\n  WRITE / ls_employee-employee_name.\nENDIF.", why: "If nothing is found, the work area still holds old data." },
      { title: "INTO in the middle", wrong: "SELECT SINGLE FROM zaca_employee\n  INTO @ls_employee\n  WHERE employee_id = @lv_id.", right: "SELECT SINGLE FROM zaca_employee\n  FIELDS *\n  WHERE employee_id = @lv_id\n  INTO @ls_employee.", why: "In modern ABAP SQL, INTO comes last." },
    ],
    check: { question: "No employee has ID 999. What is sy-subrc after SELECT SINGLE?", options: ["4", "0", "999"], answer: 0, explanation: "4 means no row was found. The work area is not changed." },
    experiments: [
      { title: "Read another employee", why: "ID 101 is Ahmed, who earns 8000.", from: "DATA lv_id TYPE i VALUE 103.", to: "DATA lv_id TYPE i VALUE 101." },
      { title: "Look for a missing ID", why: "No row has ID 999, so sy-subrc is 4 and the screen shows Not found.", from: "DATA lv_id TYPE i VALUE 103.", to: "DATA lv_id TYPE i VALUE 999." },
      { title: "Show a different column", why: "The work area holds every column, so you can show the department instead of the salary: IT.", from: "  WRITE / ls_employee-salary.", to: "  WRITE / ls_employee-department." },
    ],
    challenge: { title: "Read one employee from the database", must: ["SELECT SINGLE FROM zaca_employee with WHERE employee_id = @lv_id INTO @ls_employee.", "If sy-subrc = 0, show the name and then the department.", "Otherwise show exactly Not found. With lv_id = 103: Omar, IT."], hints: ["Clause order: FROM, FIELDS, WHERE, INTO.", "Check sy-subrc right after the SELECT."] },
  },
  "database-select": {
    goal: { give: "the employee table", shows: "4, Ahmed, Huda, Omar, Sara" },
    ideas: [["Without SINGLE you get every matching row.", "INTO TABLE copies them into an internal table."], ["FIELDS picks the columns.", "The result only has what you asked for."], ["ORDER BY decides the order.", "sy-dbcnt says how many rows came back."]],
    mistakes: [
      { title: "INTO without TABLE for many rows", wrong: "INTO @DATA(lt_employees).", right: "INTO TABLE @DATA(lt_employees).", why: "Without TABLE, ABAP expects a single row." },
      { title: "Expecting a fixed order", wrong: "\" no ORDER BY: names come\n\" back alphabetically", right: "ORDER BY employee_name", why: "Only ORDER BY guarantees an order." },
      { title: "Selecting every column", wrong: "FIELDS *", right: "FIELDS employee_id, employee_name", why: "Read only what you use; less data travels from the database." },
    ],
    check: { question: "FIELDS employee_id, employee_name. How many components does the result row have?", options: ["2", "4", "1"], answer: 0, explanation: "One component per selected column." },
    experiments: [
      { title: "Sort by ID", why: "Now the order is Ahmed, Sara, Omar, Huda: by employee_id.", from: "  ORDER BY employee_name", to: "  ORDER BY employee_id" },
      { title: "Sort backwards", why: "DESCENDING reverses the order: Sara, Omar, Huda, Ahmed.", from: "  ORDER BY employee_name", to: "  ORDER BY employee_name DESCENDING" },
      { title: "Show the IDs", why: "lt_employees also holds employee_id, so you can show it instead of the name.", from: "  WRITE / ls_employee-employee_name.", to: "  WRITE / ls_employee-employee_id." },
    ],
    challenge: { title: "List salaries from high to low", must: ["Read employee_name and salary into a table, ORDER BY salary DESCENDING.", "LOOP and show each name, then its salary.", "After ENDLOOP show sy-dbcnt: Omar 9500 … Huda 6800, then 4."], hints: ["INTO TABLE @DATA(lt_employees) comes last.", "LOOP does not change sy-dbcnt, so you can show it after ENDLOOP."] },
  },
  "database-where": {
    goal: { give: "IT and a minimum of 9000", shows: "Omar" },
    ideas: [["WHERE keeps only matching rows.", "The database does the filtering."], ["AND needs both, OR needs one.", "IT AND at least 9000 leaves only Omar."], ["No match is normal.", "sy-subrc 4 and an empty table."]],
    mistakes: [
      { title: "A comma instead of AND", wrong: "WHERE department = @lv_department,\n  salary >= @lv_min_salary", right: "WHERE department = @lv_department\n  AND salary >= @lv_min_salary", why: "Conditions are joined with AND or OR." },
      { title: "Text without quotes", wrong: "WHERE department = IT", right: "WHERE department = 'IT'", why: "Text literals need quotes; IT alone is read as a column name." },
      { title: "Showing old data on no match", wrong: "LOOP AT lt_result INTO DATA(ls_result).\n  WRITE / ls_result-employee_name.\nENDLOOP.", right: "IF sy-subrc = 0.\n  LOOP …\nELSE.\n  WRITE / 'No match'.\nENDIF.", why: "Tell the user when nothing matched instead of showing nothing." },
    ],
    check: { question: "WHERE department = 'IT' OR salary >= 9000. Who comes back?", options: ["Ahmed and Omar", "Only Omar", "Everyone"], answer: 0, explanation: "OR keeps a row when either is true: Ahmed and Omar are in IT." },
    experiments: [
      { title: "Lower the minimum", why: "Ahmed earns 8000, so he now passes too: Ahmed and Omar.", from: "DATA lv_min_salary TYPE i VALUE 9000.", to: "DATA lv_min_salary TYPE i VALUE 5000." },
      { title: "A department with nobody", why: "Nobody works in LEGAL, so sy-subrc is 4 and the screen shows No match.", from: "DATA lv_department TYPE string VALUE 'IT'.", to: "DATA lv_department TYPE string VALUE 'LEGAL'." },
      { title: "Use OR instead of AND", why: "Now a row passes if it is in IT or earns at least 9000: Ahmed and Omar.", from: "    AND salary >= @lv_min_salary", to: "    OR salary >= @lv_min_salary" },
    ],
    challenge: { title: "Filter by department and salary", must: ["WHERE department = @lv_department AND salary >= @lv_min_salary.", "ORDER BY salary DESCENDING; show each name, then its salary.", "If nothing matches, show exactly No match. With IT and 9000: Omar, 9500."], hints: ["Both filter values are host variables, so they need @.", "Check sy-subrc after the SELECT to choose between the LOOP and No match."] },
  },
  "database-joins": {
    goal: { give: "departments and employees", shows: "Human resources Sara, Sales Huda, Technology Ahmed, Technology Omar" },
    ideas: [["A join reads two tables at once.", "ON says which columns must match."], ["Aliases name the tables.", "d~department_name comes from the department table."], ["INNER keeps pairs, LEFT OUTER keeps every left row.", "Legal has nobody, so only LEFT OUTER shows it."]],
    mistakes: [
      { title: "Columns without the alias", wrong: "FIELDS department_name, employee_name", right: "FIELDS d~department_name, e~employee_name", why: "In a join, say which table each column comes from." },
      { title: "A dot or dash instead of ~", wrong: "ON d-department = e-department", right: "ON d~department = e~department", why: "SQL uses ~ to pick a column of a table alias." },
      { title: "The wrong table on the left", wrong: "FROM zaca_employee AS e\n  LEFT OUTER JOIN zaca_department AS d …", right: "FROM zaca_department AS d\n  LEFT OUTER JOIN zaca_employee AS e …", why: "LEFT OUTER keeps every row of the left table. To keep every department, start from departments." },
    ],
    check: { question: "With INNER JOIN, why is Legal missing?", options: ["No employee matches it", "It is not in the department table", "ORDER BY removed it"], answer: 0, explanation: "INNER JOIN only returns matching pairs." },
    experiments: [
      { title: "Keep every department", why: "LEFT OUTER JOIN keeps Legal, with an empty employee name.", from: "  INNER JOIN zaca_employee AS e ON d~department = e~department", to: "  LEFT OUTER JOIN zaca_employee AS e ON d~department = e~department" },
      { title: "Sort by employee", why: "Now the rows are ordered by employee name: Ahmed, Huda, Omar, Sara.", from: "  ORDER BY d~department_name, e~employee_name", to: "  ORDER BY e~employee_name" },
      { title: "Only one department", why: "A WHERE on the joined rows keeps only IT: Technology with Ahmed and Omar.", from: "  ORDER BY d~department_name, e~employee_name", to: "  WHERE d~department = 'IT'\n  ORDER BY d~department_name, e~employee_name" },
    ],
    challenge: { title: "Report every department and its staff", must: ["FROM zaca_department AS d LEFT OUTER JOIN zaca_employee AS e ON d~department = e~department.", "FIELDS d~department_name, e~employee_name, ordered by both.", "Show each department name, then the employee name (empty for Legal)."], hints: ["Start from the departments so every department is kept.", "LEFT OUTER JOIN fills missing employee columns with empty values."] },
  },
  "database-aggregates": {
    goal: { give: "four employees", shows: "HR 1 7200, IT 2 17500, SALES 1 6800" },
    ideas: [["The database can count and add.", "COUNT(*), SUM( ), MIN( ), MAX( )."], ["GROUP BY makes one row per group.", "Here one row per department."], ["Name each result with AS.", "COUNT(*) AS headcount."]],
    mistakes: [
      { title: "Counting in a loop", wrong: "LOOP AT lt_employees INTO DATA(ls).\n  lv_count = lv_count + 1.\nENDLOOP.", right: "FIELDS COUNT(*) AS headcount", why: "Let the database count instead of loading every row." },
      { title: "A plain column missing from GROUP BY", wrong: "FIELDS department, COUNT(*) AS headcount", right: "FIELDS department, COUNT(*) AS headcount\n  GROUP BY department", why: "Each group needs one department value." },
      { title: "An aggregate without a name", wrong: "FIELDS department, COUNT(*)", right: "FIELDS department, COUNT(*) AS headcount", why: "The result table needs a component name for every column." },
    ],
    check: { question: "GROUP BY department for IT, IT, HR, SALES gives how many rows?", options: ["3", "4", "1"], answer: 0, explanation: "One row per distinct department." },
    experiments: [
      { title: "Find the lowest salary", why: "MIN( salary ) gives each department's lowest salary instead of the total: IT shows 8000.", from: "  FIELDS department, COUNT(*) AS headcount, SUM( salary ) AS total", to: "  FIELDS department, COUNT(*) AS headcount, MIN( salary ) AS total" },
      { title: "Biggest department first", why: "Sort by headcount, highest first: IT comes first with 2.", from: "  ORDER BY department", to: "  ORDER BY headcount DESCENDING" },
      { title: "Only well-paid employees", why: "WHERE runs before grouping, so only salaries of at least 7000 are counted: HR 1, IT 2.", from: "  GROUP BY department", to: "  WHERE salary >= 7000\n  GROUP BY department" },
    ],
    challenge: { title: "Summarize each department", must: ["FIELDS department, COUNT(*) AS headcount, MAX( salary ) AS top_salary.", "GROUP BY department, ORDER BY department.", "Show department, headcount, top_salary for each group: HR 1 7200, IT 2 9500, SALES 1 6800."], hints: ["MAX( salary ) needs spaces inside the brackets.", "department is not an aggregate, so list it in GROUP BY."] },
  },
  "database-sql-mutations": {
    goal: { give: "a new employee, a raise and a removal", shows: "0, 4, 2, 1" },
    ideas: [["INSERT adds, UPDATE changes, DELETE removes.", "MODIFY adds or overwrites."], ["A duplicate key is not added.", "sy-subrc becomes 4."], ["WHERE limits the change.", "sy-dbcnt says how many rows changed."]],
    mistakes: [
      { title: "UPDATE without WHERE", wrong: "UPDATE zaca_employee SET salary = salary + 500.", right: "UPDATE zaca_employee SET salary = salary + 500\n  WHERE department = 'IT'.", why: "Without WHERE every employee gets the raise." },
      { title: "Inserting an existing key", wrong: "INSERT zaca_employee FROM @ls_employee.\n\" Lina, 105, again", right: "MODIFY zaca_employee FROM @ls_employee.", why: "INSERT refuses a duplicate key (sy-subrc 4); MODIFY overwrites it." },
      { title: "Reading sy-dbcnt too late", wrong: "UPDATE … WHERE ….\nSELECT … INTO ….\nWRITE / sy-dbcnt.", right: "UPDATE … WHERE ….\nWRITE / sy-dbcnt.", why: "The next SQL statement overwrites sy-dbcnt." },
    ],
    check: { question: "DELETE FROM zaca_employee WHERE department = 'LEGAL'. Nobody is in LEGAL. sy-subrc?", options: ["4", "0", "1"], answer: 0, explanation: "No row was deleted, so sy-subrc is 4 and sy-dbcnt 0." },
    experiments: [
      { title: "Raise a department with nobody", why: "No employee is in LEGAL, so UPDATE changes 0 rows: the third line shows 0.", from: "UPDATE zaca_employee SET salary = salary + 500 WHERE department = 'IT'.", to: "UPDATE zaca_employee SET salary = salary + 500 WHERE department = 'LEGAL'." },
      { title: "Overwrite instead of insert", why: "MODIFY finds ID 105 and overwrites it, so the second line shows 0 instead of 4.", from: "WRITE / sy-subrc.\nINSERT zaca_employee FROM @ls_employee.", to: "WRITE / sy-subrc.\nMODIFY zaca_employee FROM @ls_employee." },
      { title: "Delete a whole department", why: "Both IT employees are removed, so the last line shows 2.", from: "DELETE FROM zaca_employee WHERE employee_id = 101.", to: "DELETE FROM zaca_employee WHERE department = 'IT'." },
    ],
    challenge: { title: "Give a department a raise", must: ["UPDATE zaca_employee SET salary = salary + @lv_raise WHERE department = @lv_department.", "Show sy-dbcnt right after the UPDATE.", "Read SUM( salary ) for the department INTO @lv_total and show it: 2, then 18500."], hints: ["Both the raise and the department are host variables, so they need @.", "A SELECT with only an aggregate returns one row, so INTO @lv_total works without SINGLE."] },
  },
  "dictionary-domains": {
    ideas: [["A domain is the shape of a value.", "Type CHAR, length 1, allowed values A and I."], ["Many data elements can share it.", "Employee status and supplier status use the same domain."], ["Fixed values guide screens.", "They do not stop a program from storing another value."]],
    mistakes: [
      { title: "Typing a variable with the domain", wrong: "DATA lv_status TYPE zaca_status_domain.", right: "DATA lv_status TYPE zaca_employee_status.", why: "Programs use data elements. A domain is only reused by data elements." },
      { title: "One domain per field", wrong: "ZACA_EMP_STATUS_DOMAIN: CHAR(1), A / I\nZACA_SUP_STATUS_DOMAIN: CHAR(1), A / I", right: "ZACA_STATUS_DOMAIN: CHAR(1), A / I\n(used by both data elements)", why: "The same shape twice means two places to change. Reuse one domain." },
      { title: "Trusting fixed values to protect data", wrong: "\" the domain allows A and I,\n\" so status can never be X", right: "\" check the value in the program\n\" before saving it", why: "Fixed values are not a database rule. A program can still store X." },
    ],
    check: { question: "Which object can type an ABAP variable?", options: ["A data element", "A domain", "A fixed value"], answer: 0, explanation: "DATA … TYPE uses data elements. Domains only give data elements their shape." },
    challenge: { title: "Design the status domain", must: ["Decide what the domain holds.", "Decide how supplier status reuses it.", "Decide what happens when a program stores an unlisted value."], hints: ["A domain is about shape: type, length, allowed values.", "Meanings and labels live in data elements; fixed values only guide screens."] },
  },
  "dictionary-data-elements": {
    ideas: [["A data element gives meaning.", "ZACA_EMPLOYEE_STATUS means the status of an employee."], ["Its type comes from a domain or is typed directly.", "With a domain, length and values are shared."], ["Labels have four sizes.", "10, 20, 40 and 55 characters."]],
    mistakes: [
      { title: "A short label that is too long", wrong: "Short label: Employee status", right: "Short label: Status", why: "The short label holds 10 characters. 15 characters are cut to “Employee s”." },
      { title: "Labels in every program", wrong: "WRITE: 'Employee status', lv_status.", right: "\" the field label comes from\n\" ZACA_EMPLOYEE_STATUS", why: "Keep the label in the data element so every screen shows the same text." },
      { title: "Typing with a raw built-in type", wrong: "DATA lv_status TYPE abap.char(1).", right: "DATA lv_status TYPE zaca_employee_status.", why: "abap.char is a Dictionary built-in type, not an ABAP type. Use the data element." },
    ],
    check: { question: "Where do the labels of the status column come from?", options: ["The data element", "The domain", "The table key"], answer: 0, explanation: "Field labels are part of the data element's meaning." },
    challenge: { title: "Describe the employee status field", must: ["Choose where the column header text is set.", "Pick a short label that fits 10 characters.", "Pick the correct ABAP declaration."], hints: ["Meaning and labels belong to the data element.", "Count characters, including spaces; programs type variables with the data element."] },
  },
  "dictionary-structures": {
    ideas: [["A structure is a record type.", "ZACA_ADDRESS groups street, city and country."], ["It stores no rows.", "DATA ls_address TYPE zaca_address makes one record in memory."], ["Names must be unique.", "Include another structure with a suffix if names repeat."]],
    mistakes: [
      { title: "Expecting rows in a structure", wrong: "SELECT * FROM zaca_address INTO TABLE @DATA(lt_addresses).", right: "DATA ls_address TYPE zaca_address.", why: "A structure is a type, not a table. Only database tables can be read with SELECT." },
      { title: "Including a repeated name", wrong: "city : abap.char(30);\ninclude zaca_address;", right: "city : abap.char(30);\ninclude zaca_address with suffix _home;", why: "Both have city. The suffix renames the included one to city_home." },
      { title: "Forgetting the semicolon", wrong: "street : abap.char(40)\ncity   : abap.char(30);", right: "street : abap.char(40);\ncity   : abap.char(30);", why: "Each component ends with a semicolon in define structure." },
    ],
    check: { question: "What does DATA ls_address TYPE zaca_address. create?", options: ["One empty address record in memory", "A database table of addresses", "A new structure"], answer: 0, explanation: "The structure is the type; DATA creates one variable of that type." },
    challenge: { title: "Reuse the address", must: ["Decide where addresses are stored.", "Fix a repeated component name.", "Create one address record in ABAP."], hints: ["A structure is a type, like TYPES … BEGIN OF.", "A suffix renames included components; DATA … TYPE creates a variable."] },
  },
  "dictionary-database-tables": {
    ideas: [["A database table keeps its rows.", "They are still there after the program ends."], ["Key fields come first.", "client + employee_id identify each employee."], ["Activation creates an empty table.", "Programs insert the rows later."]],
    mistakes: [
      { title: "Using the name as the key", wrong: "key name : abap.char(40) not null;", right: "key employee_id : zaca_employee_id not null;", why: "Names repeat and change. An assigned ID stays the same." },
      { title: "Key fields after normal fields", wrong: "name : abap.char(40);\nkey employee_id : zaca_employee_id not null;", right: "key employee_id : zaca_employee_id not null;\nname : abap.char(40);", why: "Key fields must come first in the table." },
      { title: "Inserting a changed row again", wrong: "\" insert Sara (1002) again\n\" with status I", right: "\" update Sara's existing row\n\" to status I", why: "The key 100/1002 already exists, so a second insert is refused." },
    ],
    check: { question: "Which fields should form the key of ZACA_EMPLOYEE?", options: ["client and employee_id", "client and name", "status"], answer: 0, explanation: "The client and the assigned employee ID identify each employee for good." },
    challenge: { title: "Design the employee table", must: ["Choose the primary key.", "Predict what happens to a duplicate key.", "Say what activation creates."], hints: ["A key must be unique and never change.", "Same key means the same row; activation creates the empty container."] },
  },
  "dictionary-foreign-keys": {
    ideas: [["A check table holds valid values.", "ZACA_DEPARTMENT lists HR, IT and SALES."], ["The foreign key links the field to it.", "Every key field of the check table gets a partner."], ["Screens check; the database does not.", "Programs must check values themselves."]],
    mistakes: [
      { title: "Swapping the two tables", wrong: "check table: ZACA_EMPLOYEE", right: "check table: ZACA_DEPARTMENT", why: "The check table is the one that holds the valid values." },
      { title: "Mapping only part of the key", wrong: "where department_id = zaca_employee.department", right: "where client = zaca_employee.client\n  and department_id = zaca_employee.department", why: "The check table key is client + department_id, so both need a partner." },
      { title: "Relying on the database to refuse bad values", wrong: "INSERT zaca_employee FROM @ls_employee.\n\" FIN will be refused", right: "\" read ZACA_DEPARTMENT first and\n\" stop if the department is missing", why: "The foreign key is not a database constraint. A program can save FIN." },
    ],
    check: { question: "A program saves department FIN, which is not in the check table. What happens?", options: ["It is saved", "The database refuses it", "FIN is added to the check table"], answer: 0, explanation: "Foreign keys stay in the ABAP Dictionary and only check classic screen input." },
    challenge: { title: "Link employees to departments", must: ["Name the check table.", "Predict what a program write does.", "Choose which fields the foreign key maps."], hints: ["The check table holds the valid departments.", "The database does not enforce foreign keys; map every check table key field."] },
  },
  "dictionary-search-helps": {
    ideas: [["F4 opens a list of valid values.", "Users pick instead of typing an ID."], ["The list comes from a selection method.", "Here the department table."], ["Only EXPORT values go back.", "The ID is copied; the name only helps choose."]],
    mistakes: [
      { title: "Exporting the name", wrong: "NAME  IMPORT yes  EXPORT yes", right: "DEPARTMENT_ID  EXPORT yes\nNAME           EXPORT no", why: "The field needs the ID. The name is shown, not copied." },
      { title: "A search help per program", wrong: "\" build the F4 list again\n\" in every program", right: "\" attach ZACA_SH_DEPARTMENT to the\n\" data element ZACA_DEPARTMENT_ID", why: "Attached to the data element, every field typed with it gets the list." },
      { title: "Using search helps in ABAP Cloud", wrong: "\" create search help ZACA_SH_DEPARTMENT\n\" for the Fiori app", right: "@Consumption.valueHelpDefinition: [{ entity: { name: 'ZACA_I_DEPARTMENT', element: 'DepartmentId' } }]", why: "ABAP Cloud has no search helps; CDS value helps replace them." },
    ],
    check: { question: "The user picks “IT · Information technology”. What lands in the field?", options: ["IT", "Information technology", "Both"], answer: 0, explanation: "Only DEPARTMENT_ID is an EXPORT parameter." },
    challenge: { title: "Help users pick a department", must: ["Say what is copied back to the field.", "Choose where to attach the search help.", "Choose the ABAP Cloud replacement."], hints: ["Look at which parameter is EXPORT.", "Attach to the shared data element; ABAP Cloud uses CDS value helps."] },
  },
  "database-fundamentals": {
    ideas: [["FROM picks the table.", "zaca_employee is where the rows live."], ["FIELDS picks columns.", "Only ID and name come back."], ["WHERE picks rows.", "Only IT employees come back."]],
    mistakes: [
      { title: "Reading every column", wrong: "SELECT * FROM zaca_employee\n  INTO TABLE @DATA(lt_employees).", right: "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name\n  WHERE department = @lv_department\n  INTO TABLE @DATA(lt_employees).", why: "Read only the columns and rows you need." },
      { title: "Forgetting @ before an ABAP variable", wrong: "WHERE department = lv_department", right: "WHERE department = @lv_department", why: "In modern ABAP SQL, @ marks a value that comes from the program." },
      { title: "Relying on the database's order", wrong: "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name\n  INTO TABLE @DATA(lt_employees).", right: "SELECT FROM zaca_employee\n  FIELDS employee_id, employee_name\n  ORDER BY employee_id\n  INTO TABLE @DATA(lt_employees).", why: "Without ORDER BY the database may return rows in any order." },
    ],
    check: { question: "You change a row of lt_employees after the SELECT. What happens in the database?", options: ["Nothing: lt_employees is a local copy", "The database row changes too", "The SELECT runs again"], answer: 0, explanation: "INTO TABLE copies the result into program memory. Changing it does not write back to the database." },
    challenge: { title: "The directory needs only the IDs and names of IT employees", must: ["Choose which columns to read (FIELDS).", "Choose which rows to read (WHERE).", "Explain what happens to the database table when you change the result."], hints: ["Columns and rows are two separate choices.", "FIELDS employee_id, employee_name and WHERE department = @lv_department. The source table is not changed."] },
  },
  "oop-introduction": {
    ideas: [["A class is a blueprint.", "It defines data and methods."], ["NEW creates an object.", "Each NEW makes a separate counter."], ["Methods work on one object.", "increment adds 1 to that object's own value."]],
    mistakes: [
      { title: "Expecting one object to change another", wrong: "lo_first->increment( ).\n\" expecting lo_second to show 1", right: "lo_first->increment( ).\n\" only lo_first changed; lo_second still shows 0", why: "Each object keeps its own mv_value." },
      { title: "Changing private data from outside", wrong: "lo_first->mv_value = 5.", right: "lo_first->increment( ).", why: "mv_value is PRIVATE. Callers use the public methods." },
      { title: "Thinking assignment copies an object", wrong: "DATA(lo_copy) = lo_first. \" a new counter?", right: "DATA(lo_copy) = NEW lcl_counter( ).", why: "Assigning a reference points to the same object. Only NEW creates another one." },
    ],
    check: { question: "After lo_first->increment( ), what do the two WRITEs show?", options: ["1 then 0", "1 then 1", "0 then 0"], answer: 0, explanation: "Only lo_first was incremented. lo_second is a separate object that still holds 0." },
    challenge: { title: "Predict identity, state and access for two counters", must: ["Count how many objects exist.", "Predict each object's value after the method calls.", "Decide which data callers may change directly."], hints: ["Count the NEW expressions.", "Two NEWs make two objects. increment changes only the object it is called on. Private data changes only through methods."] },
  },
  "applications-reports": {
    ideas: [["PARAMETERS asks for input.", "p_count appears on the selection screen."], ["Events run in a fixed order.", "INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION, END-OF-SELECTION."], ["Validation can stop the run.", "An error message keeps the user on the selection screen."]],
    mistakes: [
      { title: "Checking input too late", wrong: "START-OF-SELECTION.\n  IF p_count < 1.\n    MESSAGE 'Choose a count from 1 to 5' TYPE 'E'.\n  ENDIF.", right: "AT SELECTION-SCREEN.\n  IF p_count < 1.\n    MESSAGE 'Choose a count from 1 to 5' TYPE 'E'.\n  ENDIF.", why: "Check input in AT SELECTION-SCREEN, so the user can correct it before processing starts." },
      { title: "Setting the default too late", wrong: "START-OF-SELECTION.\n  p_count = 3.", right: "INITIALIZATION.\n  p_count = 3.", why: "INITIALIZATION runs before the selection screen appears, so the user sees the default." },
      { title: "Treating END-OF-SELECTION as cleanup", wrong: "END-OF-SELECTION.\n  \" expecting this to run after every error", right: "END-OF-SELECTION.\n  \" runs only at the end of the normal flow", why: "It is not a guaranteed cleanup block after every error." },
    ],
    check: { question: "The user enters 0. What happens?", options: ["An error message; START-OF-SELECTION does not run", "The loop runs 0 times and Finished is shown", "The report shows 1, 2, 3"], answer: 0, explanation: "AT SELECTION-SCREEN rejects 0 with an error message, so main processing never starts." },
    challenge: { title: "Put each report behavior in the right event", must: ["Decide which event sets the default value.", "Decide which event checks the input.", "Decide which event produces the main list."], hints: ["Find the lower bound in the IF condition.", "Default → INITIALIZATION. Check → AT SELECTION-SCREEN. Main list → START-OF-SELECTION."] },
  },
  "modern-syntax": {
    ideas: [["VALUE # builds a table.", "The # takes the type from lt_items."], ["lt_items[ id = 10 ] reads a row.", "If no row matches, it raises an exception."], ["DATA( ) declares inline.", "The type comes from the expression on the right."]],
    mistakes: [
      { title: "Not handling a missing row", wrong: "DATA(ls_item) = lt_items[ id = 99 ].", right: "TRY.\n    DATA(ls_item) = lt_items[ id = 99 ].\n  CATCH cx_sy_itab_line_not_found.\n    WRITE / 'No matching item'.\nENDTRY.", why: "A table expression with no match raises an exception. Catch it." },
      { title: "Expecting VALUE # to append", wrong: "lt_items = VALUE #( ( id = 30 name = 'Pen' ) ).\n\" expecting 3 rows", right: "APPEND VALUE #( id = 30 name = 'Pen' ) TO lt_items.", why: "Assigning VALUE # replaces the whole table. APPEND adds one row." },
      { title: "Using # without a known type", wrong: "DATA(lt_new) = VALUE #( ( id = 10 ) ).", right: "DATA(lt_new) = VALUE ty_items( ( id = 10 ) ).", why: "# needs a known target type. An inline DATA( ) has none, so name the type." },
    ],
    check: { question: "lt_items has 3 rows. After lt_items = VALUE #( ( id = 10 name = 'Pen' ) ), how many rows does it have?", options: ["1", "4", "3"], answer: 0, explanation: "The assignment replaces the whole table with the new value, which has one row." },
    challenge: { title: "Review a modern-syntax refactor before accepting it", must: ["Check that every # has a known type.", "Check what happens when a row is missing.", "Check that the target SAP release supports each expression."], hints: ["Read the declaration right before the assignment.", "# needs a typed target, a missing row raises CX_SY_ITAB_LINE_NOT_FOUND, and each addition has a minimum release."] },
  },
  "cloud-introduction": {
    ideas: [["ABAP Cloud is a contract.", "A restricted language and released APIs only."], ["RAP builds a service in layers.", "Table → CDS → behavior → projection → service."], ["A binding publishes it.", "It chooses the protocol, such as OData V4."]],
    mistakes: [
      { title: "Using any SAP object you can call", wrong: "\" it compiles, so it is allowed", right: "\" check its release state and contract first", why: "Only released APIs are supported in ABAP Cloud." },
      { title: "Expecting the service definition to add rules", wrong: "define service ZUI_AcademyEmployee {\n  expose ZC_AcademyEmployee as Employees;\n} \" validates names?", right: "define service ZUI_AcademyEmployee {\n  expose ZC_AcademyEmployee as Employees;\n} \" exposes only; rules live in behavior", why: "A service definition only chooses what to expose." },
      { title: "Skipping the binding", wrong: "\" service definition done, so the endpoint is live", right: "\" create a service binding (OData V4) to publish it", why: "Without a binding there is no protocol and no endpoint." },
    ],
    check: { question: "Which object chooses the protocol, such as OData V4?", options: ["The service binding", "The service definition", "The CDS view"], answer: 0, explanation: "The service definition chooses what is exposed. The separate binding chooses how." },
    challenge: { title: "Make four architecture decisions for a cloud service", must: ["Choose the development contract.", "Decide where the data, the model and the rules live.", "Decide how the service is exposed and published."], hints: ["Check the dependency boundary before the syntax.", "Data → table, meaning → CDS, rules → behavior, consumer view → projection, protocol → binding."] },
  },
  "projects-employee-management": {
    ideas: [["A UUID is the identity.", "The name can change; the UUID never does."], ["Behavior declares the rules.", "create, update and name validation."], ["Projection and service expose it.", "Only the operations the app needs."]],
    mistakes: [
      { title: "Using the name as the key", wrong: "key employee_name : abap.char(80) not null;", right: "key employee_uuid : sysuuid_x16 not null;", why: "Names change. A UUID identifies the employee for good." },
      { title: "Declaring a validation without code", wrong: "validation validateName on save { create; field EmployeeName; }\n\" done", right: "validation validateName on save { create; field EmployeeName; }\n\" + implement validateName in zbp_i_academyemployee", why: "A declaration only names the rule. The behavior class must implement it." },
      { title: "Forgetting use update", wrong: "define behavior for ZC_AcademyEmployee alias Employee\n{\n  use create;\n}", right: "define behavior for ZC_AcademyEmployee alias Employee\n{\n  use create;\n  use update;\n}", why: "Users can only edit through the service if the projection reuses update." },
    ],
    check: { question: "What proves this project stage is done?", options: ["Tests in a real SAP system: allowed writes, rejected bad data, denied access", "A successful service preview", "The code compiles"], answer: 0, explanation: "A preview is one observation. Acceptance needs real create and update, rejected invalid data and denied access." },
    challenge: { title: "Resolve the project review findings", must: ["Fix the data identity.", "Fix the validation and the missing update operation.", "Fix security and define the acceptance tests."], hints: ["Names can change without changing the person.", "UUID key, implemented validation, use update in the projection, separate read and write authorization, then real SAP tests."] },
  },
};

/** The top of each challenge, like the Add two numbers warehouse brief. A string in `boxes` is a separator such as "→". */
export type ChallengeBrief = { intro: string; boxes?: (readonly [label: string, value: string] | string)[]; start: string };
export const challengeBriefs: Record<string, ChallengeBrief> = {
  orientation: { intro: "Write a program that shows two numbers, one after the other: first 5, then 8.", boxes: [["First WRITE", "5"], ["Second WRITE", "8"], "→", ["Screen shows", "5, then 8"]], start: "The editor already shows 5. Add one more instruction below it." },
  structures: { intro: "A shop keeps one record per product. Describe the product's shape, create one record and fill it. When it works, the screen shows Keyboard.", boxes: [["ID", "501"], ["Name", "Keyboard"], ["Quantity", "12"], "→", ["Screen shows", "Keyboard"]], start: "The editor only has two comment lines that list the fields. Write the TYPES block below them." },
  conditions: { intro: "Three small programs, each making one decision. Pick a challenge with the buttons below. The checker also tries other numbers, including the limits.", boxes: [["Number 4", "Positive"], ["Sales 6000", "Bonus"], ["Score 75", "Medium"]], start: "Each starter already declares its number. Write the IF block below the comment." },
  do: { intro: "Two counting programs: first show 1 to 10, then add 1 to 5 and show only the total.", boxes: [["DO 10 TIMES", "1 … 10"], ["DO 5 TIMES", "15"]], start: "The editor is empty. Start with DATA lv_count TYPE i VALUE 0." },
  while: { intro: "First count while a rule holds. Then repair a loop that never ends because its counter never changes.", boxes: [["Count", "1 … 8"], ["Repair", "1 … 5"]], start: "In the repair, the starter already has the loop. Only one line is missing inside it." },
  tables: { intro: "Store three numbers in a table, then store two employee records.", boxes: [["APPEND", "10, 20, 30"], "→", ["Screen shows", "Ready"]], start: "The editor is empty. Start with the DATA line that creates the table." },
  "loop-at": { intro: "Add up the rows of a number table, then list employee names row by row.", boxes: [["Rows", "10 + 20 + 30"], "→", ["Screen shows", "60"]], start: "The editor is empty. Create and fill the table first, then write the loop." },
  "loop-control": { intro: "Count from 1 to 5 twice: once skipping 3, once stopping before 4.", boxes: [["Skip 3", "1, 2, 4, 5"], ["Stop at 4", "1, 2, 3"]], start: "The editor is empty. Start with a counter and DO 5 TIMES." },
  employees: { intro: "Build a small employee register, then report who earns at least 5000 and their total salary.", boxes: [["Ahmed", "5000"], ["Sara", "7000"], ["Omar", "4000"], "→", ["Screen shows", "Ahmed, Sara, 12000"]], start: "In the report challenge the employees are already loaded. Only the loop and the total are missing." },
  "data-table-model": { intro: "Save the same product twice, then change the work area. The two saved rows must still say Keyboard.", boxes: [["Saved twice", "Keyboard"], ["Work area later", "Mouse"], "→", ["Screen shows", "Keyboard, Keyboard"]], start: "The type, table and work area already exist. Fill, append twice, change, then loop." },
  "data-table-categories": { intro: "Choose the right table category for three needs, then keep imported IDs in their arrival order.", boxes: [["Imported", "30, 10, 30"], "→", ["Screen shows", "30, 10, 30"]], start: "lt_ids and lv_id already exist. Add three APPEND lines and a loop." },
  "data-keys": { intro: "An imported list can contain the same employee twice. Find every IT employee with ID 101 and count them.", boxes: [["Search", "IT + 101"], "→", ["Screen shows", "Ahmed, Noura, 2"]], start: "All four employees are already loaded. Only the loop with the two checks is missing." },
  "data-work-areas-field-symbols": { intro: "Create an employee work area, then change it through a field symbol while the saved row keeps its old name.", boxes: [["Challenge 1", "Maha"], ["Challenge 2", "Sara, Ahmed"]], start: "In the alias challenge, Ahmed is already saved in the table. Declare the field symbol and ASSIGN it." },
  "data-read-table": { intro: "Find an employee by ID. If the ID does not exist, say so instead of showing an old name.", boxes: [["lv_id", "102"], "→", ["Screen shows", "Sara"]], start: "Both employees and lv_id are ready. Add the READ TABLE line and the sy-subrc check." },
  "data-table-mutations": { intro: "Update an employee list in three steps: insert Sara, rename her to Sarah, then remove Ahmed.", boxes: [["Start", "Ahmed, Omar"], "→", ["Screen shows", "Sarah, Omar"]], start: "The two employees and the three input values are ready. Add INSERT, MODIFY, DELETE and the loop." },
  "data-sorting-filtering": { intro: "Show the employees who earn at least 6000, highest salary first, without deleting anyone.", boxes: [["Minimum", "6000"], "→", ["Screen shows", "Sara, Omar"]], start: "The three employees and lv_min_salary are ready. Add SORT, then the loop with IF." },
  "database-abap-sql": { intro: "Read one employee from the database by ID. If the ID does not exist, say so.", boxes: [["lv_id", "103"], "→", ["Screen shows", "Omar, IT"]], start: "lv_id and a work area typed like the table are ready. Add SELECT SINGLE and the sy-subrc check." },
  "database-select": { intro: "Read every employee's name and salary from the database, highest salary first, then show how many rows you read.", boxes: [["Database", "4 employees"], "→", ["Screen shows", "Omar 9500 … Huda 6800, 4"]], start: "The editor is empty: write the SELECT, the LOOP and the final WRITE." },
  "database-where": { intro: "Read only the employees of one department who earn at least a minimum salary, highest first.", boxes: [["IT, at least 9000", ""], "→", ["Screen shows", "Omar, 9500"]], start: "lv_department and lv_min_salary are ready. Add the SELECT with WHERE, ORDER BY and the No match branch." },
  "database-joins": { intro: "List every department with its employees, and keep departments that have nobody yet.", boxes: [["4 departments", "4 employees"], "→", ["Screen shows", "Legal with an empty name too"]], start: "The editor is empty: write one SELECT with a LEFT OUTER JOIN and a LOOP." },
  "database-aggregates": { intro: "Let the database count the employees and find the highest salary in each department.", boxes: [["4 employees", ""], "→", ["Screen shows", "HR 1 7200, IT 2 9500, SALES 1 6800"]], start: "The editor is empty: write one SELECT with COUNT(*), MAX( ) and GROUP BY, then a LOOP." },
  "database-sql-mutations": { intro: "Give one department a raise with a single UPDATE, then read the department's new total salary.", boxes: [["IT, raise 500", ""], "→", ["Screen shows", "2, 18500"]], start: "lv_department, lv_raise and lv_total are ready. Add UPDATE … SET … WHERE, then a SELECT with SUM." },
  "data-table-performance": { intro: "Find one ID in a list of 16 using as few checks as possible: sort the list once, then use BINARY SEARCH.", boxes: [["lv_search", "101"], "→", ["Screen shows", "1"]], start: "The 16 IDs are stored newest first and lv_search is ready. Add SORT, the BINARY SEARCH read and the sy-subrc check." },
  "data-employee-manager": { intro: "Run the two jobs of an employee manager: give one employee a raise, then remove one and report who is left.", boxes: [["Challenge 1", "8500"], ["Challenge 2", "Ahmed, Omar, 2, 11000"]], start: "Ahmed, Sara and Omar, lv_id and lv_raise are ready. Start each challenge by finding the position with line_index( )." },
  "data-table-expressions": { intro: "Find an employee by ID with a table expression. If the ID does not exist, say Not found instead of stopping, then report the row position.", boxes: [["lv_id", "102"], "→", ["Screen shows", "Sara, 8000, 2"]], start: "The employees, lv_id and lv_position are ready. Add TRY … CATCH around the read, then line_index( )." },
  "data-conditional-loop": { intro: "Report only the employees earning at least 6000, then show how many there are and their total salary.", boxes: [["Minimum", "6000"], "→", ["Screen shows", "Sara, Omar, 2, 14000"]], start: "The employees and the zeroed counters are ready. Add LOOP … WHERE and the final WRITE lines." },
};
