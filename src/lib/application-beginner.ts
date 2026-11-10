import type { BeginnerLesson } from "./beginner-lessons";

// Beginner Learn/Challenge copy for the SAP Application Development lessons (English only while ENABLE_ARABIC = false).
export const applicationBeginner: Record<string, Pick<BeginnerLesson, "ideas" | "mistakes" | "check" | "challenge">> = {
  "applications-alv": {
    ideas: [["ALV shows a table as a list.", "The rows come from an internal table."], ["A field catalog names the columns.", "FIELDNAME and SELTEXT_L for each column."], ["A function module shows it.", "REUSE_ALV_LIST_DISPLAY gets the catalog and the rows."]],
    mistakes: [
      { title: "Forgetting CLEAR between columns", wrong: "ls_fieldcat-fieldname = 'EMPLOYEE_ID'.\nAPPEND ls_fieldcat TO lt_fieldcat.\nls_fieldcat-fieldname = 'EMPLOYEE_NAME'.", right: "APPEND ls_fieldcat TO lt_fieldcat.\nCLEAR ls_fieldcat.\nls_fieldcat-fieldname = 'EMPLOYEE_NAME'.", why: "CLEAR stops the settings of one column carrying over to the next." },
      { title: "Never calling the function module", wrong: "SELECT … INTO TABLE lt_employees.\n\" the catalog is filled, so the list appears", right: "CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY'\n  EXPORTING it_fieldcat = lt_fieldcat\n  TABLES    t_outtab    = lt_employees.", why: "Preparing data does not show it. The call shows the list." },
      { title: "Expecting ALV to save changes", wrong: "\" the user sorted the list,\n\" so zaca_employee changed", right: "\" ALV shows lt_employees.\n\" Saving is separate code.", why: "ALV displays program data and never writes to the database by itself." },
    ],
    check: { question: "Which parameter of the function module carries the field catalog?", options: ["it_fieldcat", "t_outtab", "program_error"], answer: 0, explanation: "it_fieldcat carries the columns. t_outtab carries the rows and program_error is an exception." },
    challenge: { title: "Show the employees in an ALV list", must: ["Say what describes the columns.", "Say which call shows the list.", "Say whether ALV changes the database."], hints: ["Look at the ls_fieldcat lines.", "Building data is not showing it."] },
  },
  "applications-module-pool": {
    ideas: [["A screen has its own flow logic.", "PBO before it appears, PAI after the user acts."], ["Screen fields match variable names.", "GV_NAME on the screen is gv_name in ABAP."], ["A button sends a function code.", "The program reads it from the OK field."]],
    mistakes: [
      { title: "Setting the title in PAI", wrong: "MODULE pai_9000 INPUT.\n  SET TITLEBAR 'TITLE_9000'.", right: "MODULE pbo_9000 OUTPUT.\n  SET TITLEBAR 'TITLE_9000'.", why: "The title is needed before the screen is displayed, which is PBO." },
      { title: "Using the OK field without copying it", wrong: "CASE ok_code.\n  WHEN 'SHOW'.", right: "save_ok = ok_code.\nCLEAR ok_code.\nCASE save_ok.", why: "Keep the code in a copy and clear the OK field, so it is not processed twice." },
      { title: "Showing the same screen again", wrong: "WHEN 'BACK'.\n  SET SCREEN 9000.", right: "WHEN 'BACK'.\n  LEAVE TO SCREEN 0.", why: "Screen 0 ends the screen sequence." },
    ],
    check: { question: "Which module runs after the user pushes a button?", options: ["A PAI (INPUT) module", "A PBO (OUTPUT) module", "START-OF-SELECTION"], answer: 0, explanation: "PAI runs after the user acts. PBO runs before the screen is shown." },
    challenge: { title: "Wire up the greeting screen", must: ["Choose where the status and title are set.", "Choose where the pushed button is read.", "Choose the statement that leaves the screen."], hints: ["Does the screen exist yet in PBO?", "Screen 0 means no next screen."] },
  },
  "applications-smart-forms": {
    ideas: [["Activating a form generates a function module.", "Its name is different in every system."], ["The program looks the name up.", "SSF_FUNCTION_MODULE_NAME returns it."], ["Then it calls that function module.", "Data goes in through the form interface."]],
    mistakes: [
      { title: "Typing the generated name", wrong: "CALL FUNCTION '/1BCDWB/SF00000123'.", right: "CALL FUNCTION lv_fm_name.", why: "The generated name differs per system. Use the name returned by the lookup." },
      { title: "Not checking the lookup", wrong: "CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME' … .\nCALL FUNCTION lv_fm_name.", right: "… lookup …\nIF sy-subrc <> 0.\n  MESSAGE … TYPE 'E'.\nENDIF.", why: "An inactive form raises NO_FORM. Without the check, the next call has no name." },
      { title: "Ignoring an interface change", wrong: "\" a field was added to the form interface,\n\" the program is unchanged", right: "\" pass the new data in the call", why: "A changed form interface must be adapted in the program." },
    ],
    check: { question: "What does CALL FUNCTION lv_fm_name use as the name?", options: ["The name returned by SSF_FUNCTION_MODULE_NAME", "The form name", "The program name"], answer: 0, explanation: "The form name goes into the lookup. The returned generated name is called." },
    challenge: { title: "Print an employee form", must: ["Say why the name is looked up.", "Say what NO_FORM means.", "Say when the program must change."], hints: ["Think about a transport to production.", "Only the interface is shared with the program."] },
  },
  "applications-debugging": {
    ideas: [["A breakpoint stops the program.", "You choose the line."], ["Step keys move one step.", "F5 into, F6 over, F7 return, F8 continue."], ["A watchpoint reacts to a value.", "It stops when the variable changes."]],
    mistakes: [
      { title: "Stepping into a trusted call", wrong: "F5 on a call to a long routine", right: "F6 on the call", why: "F6 runs the call as one step. F5 enters the routine." },
      { title: "Using only breakpoints for a changing value", wrong: "\" a breakpoint on every line that might change lv_total", right: "\" one watchpoint on lv_total", why: "A watchpoint stops when the value changes, wherever it happens." },
      { title: "Guessing instead of looking", wrong: "\" the total should be 5", right: "\" check the variables view: pass 2 gives lv_total = 3", why: "Read the real values at each stop." },
    ],
    check: { question: "Which key continues to the next breakpoint or watchpoint?", options: ["F8", "F5", "F7"], answer: 0, explanation: "F8 continues. F5 and F6 move one step and F7 finishes the routine." },
    challenge: { title: "Find why the total is wrong", must: ["Choose the key to skip a call.", "Choose the tool that reacts to a value.", "Say the values after pass 2."], hints: ["F6 treats a call as one statement.", "Pass 2 adds 2 to the total 1."] },
  },
  "applications-transactions": {
    ideas: [["A transaction code starts a program.", "Users type it in the command field."], ["A report transaction starts a report.", "Usually on selection screen 1000."], ["A dialog transaction starts a module pool.", "On the screen number you choose."]],
    mistakes: [
      { title: "Using 1000 for a module pool", wrong: "Program Z_ACADEMY_SCREEN, screen 1000", right: "Program Z_ACADEMY_SCREEN, screen 9000", why: "1000 is the standard selection screen of a report. Use the module pool's first screen." },
      { title: "A screen number that does not exist", wrong: "Screen number 9999", right: "Screen number 9000", why: "The screen must exist in the program." },
      { title: "A code outside the custom namespace", wrong: "Transaction EMPLOYEE_REPORT", right: "Transaction ZACA_REPORT", why: "Custom codes start with Z or Y." },
    ],
    check: { question: "Which standard code shows the contents of a table?", options: ["SE16", "SE38", "SE93"], answer: 0, explanation: "SE16 is the Data Browser. SE38 edits programs and SE93 maintains transaction codes." },
    challenge: { title: "Give each program a code", must: ["Choose the start object for the report.", "Choose the screen number for the module pool.", "Choose the code that browses table data."], hints: ["Reports start on screen 1000.", "The module pool's screen is 9000."] },
  },
};
