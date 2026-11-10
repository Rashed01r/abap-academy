import type { Text } from "./curriculum";
import type { EducationSpec } from "./education-content";

// Essential concepts for the SAP Application Development lessons (English only while ENABLE_ARABIC = false).
// Learn targets are each lesson's reference groups and artifacts in guided-application-definitions.ts.
const t = (en: string): Text => ({ en });
type Concept = EducationSpec["concepts"][number];
const c = (id: string, name: string, explanation: string, misconception: string, objectives: number[], learn: string[], assess: string[]): Concept =>
  ({ id, name: t(name), explanation: t(explanation), misconception: t(misconception), objectives, learn, demonstrate: "guided", assess });

export const applicationEducation: Record<string, EducationSpec> = {
  "applications-alv": {
    what: t("ALV shows an internal table as a list. A field catalog describes the columns and a function module displays them."), why: t("Show employees to users with column headings and the ALV toolbar instead of a plain text list."),
    concepts: [
      c("alv-input", "Rows from an internal table", "SELECT fills lt_employees, restricted by the selection table s_id. ALV shows that table.", "ALV does not read the database table by itself, and it never writes back to it.", [0], ["group:alv-data", "group:alv-select", "artifact:selection", "artifact:table"], ["alv-write-back", "concept-check"]),
      c("alv-fieldcat", "The field catalog", "Each entry of lt_fieldcat names a column with FIELDNAME and its heading with SELTEXT_L; CLEAR prepares the next column.", "The SELECT alone does not tell ALV how to name the columns.", [1], ["group:alv-fieldcat", "artifact:fieldcat"], ["alv-first", "knowledge-check"]),
      c("alv-call", "Call and check", "REUSE_ALV_LIST_DISPLAY receives it_fieldcat and t_outtab; sy-subrc <> 0 means it raised an exception.", "Filling the tables does not show the list: the function module call does.", [2], ["group:alv-display", "group:alv-errors", "artifact:alv-fm"], ["alv-display-step", "knowledge-check"]),
    ],
  },
  "applications-module-pool": {
    what: t("A module pool is a program with its own screens. PBO modules prepare a screen and PAI modules react to the user."), why: t("Build a screen where a clerk types a name, presses a button and gets a response."),
    concepts: [
      c("screen-pbo-pai", "PBO before, PAI after", "PBO modules run before the screen is shown. PAI modules run after the user acts.", "Setting the title in PAI is too late: the screen has already been displayed.", [0], ["group:screen-pbo", "group:screen-pai-read", "artifact:flow", "artifact:module"], ["screen-benefit", "screen-where-title", "knowledge-check"]),
      c("screen-ok-field", "Fields and the OK field", "Screen fields share names with global variables; a button's function code lands in the OK field during PAI.", "The OK field is not a screen field the user types into.", [1], ["group:screen-data", "artifact:screen", "artifact:ok-field"], ["screen-button", "concept-check"]),
      c("screen-leave", "Leaving a screen", "LEAVE TO SCREEN 0 ends the current screen sequence; SET SCREEN n shows screen n next.", "SET SCREEN 9000 would not leave the screen, it would show it again.", [2], ["group:screen-pai-act"], ["screen-leave", "knowledge-check"]),
    ],
  },
  "applications-smart-forms": {
    what: t("A Smart Form is a designed document. Activation generates a function module that the print program calls."), why: t("Print an employee form from a program without hard-coding system-specific names."),
    concepts: [
      c("form-lookup", "Look up the generated name", "SSF_FUNCTION_MODULE_NAME returns the generated function module name for the form name.", "The generated name is different in every system, so it must not be typed into a program.", [0], ["group:form-lookup", "artifact:generated-fm", "artifact:lookup"], ["form-benefit", "form-hardcode", "knowledge-check"]),
      c("form-inactive", "Missing or inactive forms", "If the form is not active, the lookup raises NO_FORM and sy-subrc is not 0.", "Transporting a form does not mean it is already active in the target system.", [1], ["group:form-check", "group:form-call"], ["form-not-active", "concept-check"]),
      c("form-interface", "Interface changes", "The call passes data through the form interface; changing the interface means changing the call.", "Layout changes do not need a program change once the form is activated again.", [2], ["group:form-data", "group:form-print-check", "artifact:interface", "artifact:form"], ["form-interface", "knowledge-check"]),
    ],
  },
  "applications-debugging": {
    what: t("The debugger stops a program so you can step through it and watch variables change."), why: t("Find out why a total is wrong by looking inside the running program instead of guessing."),
    concepts: [
      c("debug-keys", "Breakpoint and step keys", "A breakpoint stops at a line. F5 steps into, F6 steps over, F7 returns and F8 continues.", "F6 does not skip the line: it runs a call as one statement.", [0], ["group:debug-start", "group:debug-step", "artifact:breakpoint", "artifact:keys"], ["debug-benefit", "debug-key-over", "knowledge-check"]),
      c("debug-variables", "Reading variable values", "The variables view shows the values at each stop: after pass 2, lv_index is 2 and lv_total is 3.", "A total adds the new index to the earlier total, it does not restart.", [1], ["group:debug-end", "artifact:variables"], ["debug-values", "concept-check"]),
      c("debug-watch", "Watchpoints", "A watchpoint stops when a variable's value changes, wherever that happens.", "A breakpoint stops at one line only.", [2], ["group:debug-watch", "artifact:watchpoint"], ["debug-watch-choice", "knowledge-check"]),
    ],
  },
  "applications-transactions": {
    what: t("A transaction code starts a program. SE93 links a code to a report or to a module pool screen."), why: t("Give users a short code for the report and the screen, and know the codes developers use daily."),
    concepts: [
      c("tx-kinds", "Report and dialog transactions", "A report transaction starts an executable report on its selection screen, usually 1000. A dialog transaction starts a module pool on a screen number.", "The screen number of a dialog transaction must exist in the program.", [0], ["group:tx-report", "group:tx-dialog", "artifact:report-tx", "artifact:dialog-tx"], ["tx-benefit", "tx-report-kind", "tx-dialog-kind", "knowledge-check"]),
      c("tx-naming", "Custom codes", "Custom transaction codes start with Z or Y, like other custom objects.", "A transaction code and its program are separate names.", [1], ["group:tx-name", "group:tx-dialog-name", "artifact:tcode"], ["concept-check"]),
      c("tx-tools", "Daily developer codes", "SE38 is the ABAP Editor, SE80 the Object Navigator, SE11 the ABAP Dictionary and SE16 the Data Browser.", "SE11 defines tables; SE16 shows their contents.", [2], ["artifact:tools"], ["tx-tools", "knowledge-check"]),
    ],
  },
};
