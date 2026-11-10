// Explore code content for the SAP Application Development lessons: the idea and its benefits, not the syntax.
// Three teaching styles, mixed per lesson: A mock-up explorer, B before/after scenarios, C step-by-step walkthrough.
// Reference illustrations only: nothing runs in an SAP system. English only while ENABLE_ARABIC = false.
export type Point = { n: number; name: string; what: string; why: string; tech: string };
export type Side = { text: string; fit: boolean };
export type Step = { lane: number; title: string; say: string; tag?: string; state?: string };
type Base = { lead: string; benefits: [title: string, text: string][] };
export type Concept = Base & (
  | { style: "A"; mock: "screen" | "letter" | "command"; points: Record<string, Point> }
  | { style: "B"; left: string; right: string; scenarios: { q: string; left: Side; right: Side }[] }
  | { style: "C"; lanes: [string, string, string]; steps: Step[] }
);

export const applicationConcepts: Record<string, Concept> = {
  "applications-reports": {
    style: "C",
    lead: "A classical report is a program that asks the user a question on a screen it creates itself, checks the answer, and then prints a list. The runtime decides when each part runs.",
    benefits: [["The input screen is free", "Declaring an input makes the system build the selection screen."], ["Checks before work", "Wrong input is refused before anything is produced."], ["Simple output", "A plain list is enough when the question is one question."]],
    lanes: ["User", "Selection screen", "Report program"],
    steps: [
      { lane: 2, title: "Set the default", say: "Before the screen appears, the report puts the number 3 in the box.", tag: "INITIALIZATION" },
      { lane: 1, title: "The screen opens", say: "The user sees the box with 3 already in it." },
      { lane: 0, title: "Types 0 and presses Execute", say: "Zero is outside the allowed range, 1 to 5." },
      { lane: 2, title: "Check the input", say: "The report refuses 0 with an error. The user stays on the selection screen and can correct it.", tag: "AT SELECTION-SCREEN" },
      { lane: 0, title: "Types 3 and presses Execute", say: "This time the input is accepted." },
      { lane: 2, title: "Produce the list", say: "The main part of the report writes 1, 2 and 3.", tag: "START-OF-SELECTION" },
      { lane: 1, title: "The list is shown", say: "On this normal path the closing line Finished is added at the end.", tag: "END-OF-SELECTION" },
    ],
  },
  "applications-alv": {
    style: "B",
    lead: "ALV is the SAP List Viewer. It shows a table of data as a proper list with column headings and the standard list tools, instead of text you format yourself.",
    benefits: [["Standard list tools", "Users get the familiar toolbar, such as sorting and filtering, without extra code."], ["Headings defined once", "A field catalog names each column in one place."], ["Same look everywhere", "Different reports show their tables in a consistent way."]],
    left: "A list written with WRITE", right: "An ALV list",
    scenarios: [
      { q: "Users want to sort the employees by salary and filter by department.", left: { text: "A WRITE list is fixed text. Sorting and filtering would have to be programmed by hand.", fit: false }, right: { text: "The ALV list comes with sorting and filtering tools in its standard toolbar.", fit: true } },
      { q: "A developer wants to see three values quickly while testing.", left: { text: "One WRITE statement is the fastest way to see a value.", fit: true }, right: { text: "A field catalog and a function call are more setup than a quick check needs.", fit: false } },
      { q: "Every employee report must show the same column headings.", left: { text: "Each program formats its own headings, so they drift apart over time.", fit: false }, right: { text: "The field catalog names each column once, and the heading is shown the same way each time.", fit: true } },
    ],
  },
  "applications-module-pool": {
    style: "A", mock: "screen",
    lead: "A module pool is a program with a screen of its own: boxes to type in and buttons to press. The screen stays open and answers back, instead of asking once and printing a list.",
    benefits: [["Your own layout", "Design the screen around the job, such as entering one employee."], ["Checks as you go", "The program can react at every button press and warn at once."], ["One place to work", "The user stays on one screen for many entries, which is faster than starting a report each time."]],
    points: {
      title: { n: 1, name: "Title and buttons", what: "The window title and the buttons across the top are prepared just before the screen opens.", why: "Every user sees the right title and the right buttons, without the program drawing them.", tech: "before the screen appears (PBO)" },
      field: { n: 2, name: "Name box", what: "A box the user types in. What is typed is handed to the program automatically.", why: "No code is needed to read the keyboard: the box and the program variable share a name.", tech: "screen field = program variable" },
      button: { n: 3, name: "Show button", what: "Pressing it sends a short code, SHOW, to the program.", why: "One screen can hold many buttons. The code tells the program which one was pressed.", tech: "after the user acts (PAI)" },
      msg: { n: 4, name: "Answer area", what: "The program writes the greeting here and the same screen shows it again.", why: "The user gets an answer at once and stays on one screen, which suits entering many records.", tech: "output field" },
    },
  },
  "applications-smart-forms": {
    style: "A", mock: "letter",
    lead: "A Smart Form is a printed document, such as a letter or an invoice, designed on screen. The business program only hands over the data. The form decides how it looks.",
    benefits: [["Change the look, not the program", "Move a logo or reword a heading without touching business code."], ["One program, many layouts", "The same data can print as a letter, a badge or a copy for the file."], ["Pages handled for you", "Tables grow, pages break and page numbers appear on their own."]],
    points: {
      head: { n: 1, name: "Letterhead", what: "Fixed text and a logo, the same on every copy.", why: "The company look is defined once, in the form, and not in every program that prints.", tech: "fixed text in a window" },
      name: { n: 2, name: "Employee name", what: "A placeholder. When the form prints, the real value replaces it.", why: "One form prints a letter for any employee. Only the data changes.", tech: "variable" },
      table: { n: 3, name: "Details table", what: "One line is repeated for each row of data. The table grows and continues on the next page when needed.", why: "The program never counts lines or pages. The form does.", tech: "loop over rows" },
      foot: { n: 4, name: "Footer", what: "Page number and company details at the bottom of every page.", why: "Page numbering comes for free.", tech: "footer window" },
    },
  },
  "applications-debugging": {
    style: "C",
    lead: "The debugger lets you stop a running program and look inside it. You see the real value of every variable at that moment, so you find a wrong result by looking, not by guessing.",
    benefits: [["See the real values", "Read each variable as the program runs."], ["Go at your own pace", "Run one line at a time, or jump ahead to the next stop."], ["Catch the moment of change", "A watchpoint stops the program exactly when a value changes."]],
    lanes: ["You", "Debugger", "Program"],
    steps: [
      { lane: 0, title: "Set a breakpoint on the DO line", say: "You mark the line where the program should stop.", tag: "breakpoint", state: "nothing has run yet" },
      { lane: 2, title: "The program runs and stops", say: "It stops just before the marked line and passes control to the debugger.", state: "lv_index = 0 · lv_total = 0" },
      { lane: 1, title: "Show the variables", say: "The debugger lists each variable with its current value." },
      { lane: 0, title: "Press F6 three times", say: "F6 runs one line each time and steps over any call.", tag: "F6", state: "lv_index = 1 · lv_total = 1" },
      { lane: 1, title: "Set a watchpoint on lv_total", say: "From now on the debugger stops whenever lv_total changes.", tag: "watchpoint" },
      { lane: 0, title: "Press F8 to continue", say: "The program runs on until the next stop.", tag: "F8" },
      { lane: 1, title: "Stopped: lv_total changed", say: "After the second pass the total is 3. You can check the value instead of guessing.", state: "lv_index = 2 · lv_total = 3" },
    ],
  },
  "applications-transactions": {
    style: "A", mock: "command",
    lead: "A transaction code is a short name that starts a program. Users type the code instead of looking for the program, and each code starts exactly one thing: a report or a screen.",
    benefits: [["Easy to reach", "Users type ZACA_REPORT and do not need to know where the program lives."], ["The right start", "A report starts on its selection screen, a module pool on a chosen screen."], ["Easy to find", "Custom codes start with Z or Y, so they stand apart from standard ones."]],
    points: {
      cmd: { n: 1, name: "Command field", what: "The box where the user types a transaction code and presses Enter.", why: "A short, memorable name replaces a search for the program.", tech: "transaction code" },
      link: { n: 2, name: "The code's definition", what: "Each custom code is linked to what it starts: a program and, for a screen, its first screen number.", why: "One code starts exactly one thing, and the link is kept in one place.", tech: "maintained in SE93" },
      result: { n: 3, name: "What opens", what: "A report opens on its selection screen. A module pool opens on the first screen you named.", why: "The same habit of typing a code starts different kinds of programs.", tech: "report transaction · dialog transaction" },
      tools: { n: 4, name: "Daily developer codes", what: "SE38 is the ABAP Editor, SE80 the Object Navigator, SE11 the ABAP Dictionary and SE16 the Data Browser.", why: "A few codes cover most daily work, so they are worth knowing by heart.", tech: "SE38 · SE80 · SE11 · SE16" },
    },
  },
};
