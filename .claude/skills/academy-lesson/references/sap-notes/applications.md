# SAP Application Development: ALV, module pool, Smart Forms, debugging, transactions

Researched 2026-11-10 for `applications-alv`, `applications-module-pool`, `applications-smart-forms`,
`applications-debugging`, `applications-transactions` (and the classical-report lesson `applications-reports`).
help.sap.com pages render with JavaScript and come back empty from WebFetch; facts below come from the
SAP-samples cheat sheets (read in full) and search results (community/tutorial pages, labelled).

## Dynpros and module pools: `18_Dynpro.md`
https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/18_Dynpro.md
- A dynpro is a classic screen with a 4-digit number (1000 reserved); built in the Screen Painter; not
  possible in class pools; `sy-dynnr` holds the current number.
- Flow logic (Flow Logic tab): `PROCESS BEFORE OUTPUT.` calls `MODULE x OUTPUT` modules before display;
  `PROCESS AFTER INPUT.` calls `MODULE x INPUT` modules after a user action. POH / POV = F1 / F4 help.
- A screen field has a same-named global ABAP variable; data moves screen→program at the start of PAI and
  program→screen at the end of the dialog step (PBO).
- OK field (20 chars, named e.g. `ok_code`): a function code lands in it during PAI. Sheet advice: copy it
  to an auxiliary variable, `CLEAR` the OK field, then `CASE`.
- `CALL SCREEN n.` nests a new sequence; `SET SCREEN n.` takes effect at the end of PAI;
  `LEAVE TO SCREEN n.` = SET SCREEN + LEAVE SCREEN; `LEAVE TO SCREEN 0.` ends the sequence.
- `SET PF-STATUS 'name'.` and `SET TITLEBAR 'name'.` in PBO; names are GUI status/title objects (menu painter).
- ABAP Cloud: classic dynpros cannot be created; "outdated for application programs".

## Lists, selection screens, ALV: `20_Selection_Screens_Lists.md`
https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/20_Selection_Screens_Lists.md
- Classic list = `WRITE` into the list buffer; selection screens are generated from `PARAMETERS` /
  `SELECT-OPTIONS` (standard screen 1000 in executable programs).
- ALV with `CL_SALV_TABLE`: `cl_salv_table=>factory( IMPORTING r_salv_table = DATA(alv) CHANGING t_table = itab )`
  then `alv->display( )` (full screen by default); wrap in `TRY … CATCH cx_salv_msg`.
  Columns: `alv->get_columns( )->set_optimize( abap_true )`, `get_column( 'COL' )->set_visible( abap_false )`,
  titles via `set_long_text` etc.; `refresh( )` after data changes.
  "The older class CL_GUI_ALV_GRID should no longer be used directly for new developments."
- The sheet does not state ABAP Cloud release status of CL_SALV_TABLE: lessons do not claim it.
- `SUBMIT prog.` ends the caller; `SUBMIT … AND RETURN` runs it in a new internal session; S_PROGRAM check.
- Classic UIs "cannot be created in ABAP Cloud".

## Smart Forms (search results, SAP Library page saphelp_em92 "Integrating the Smart Form into the Application")
https://help.sap.com/doc/saphelp_em92/9.2/en-US/4e/569e191c3e4f4ae10000000a42189e/content.htm
- Activating a form generates a function module; its name differs per system (e.g. /1BCDWB/SF…), so the
  print program calls `SSF_FUNCTION_MODULE_NAME` with the form name to get it, then `CALL FUNCTION` with the
  returned name. If the form is not active: exception `NO_FORM`.
- If the form interface is unchanged, form changes need no program change; a changed interface must be adapted
  in the application program.
- Not verified from fetched pages: window/page structure details, so lessons keep to the call pattern.

## Debugger (search results; community/tutorial sources, no fetched help.sap.com page)
https://learning.sap.com/courses/basic-abap-programming/debugging-an-abap-program_d070e545-efd5-4d87-8b75-20f18d7b7d3b
- F5 step into, F6 step over (treats a call as one statement), F7 return (finish routine, back to caller),
  F8 continue to next breakpoint/watchpoint. `/h` in the command field starts the debugger for the next step.
- Breakpoint stops at a line; watchpoint stops when a variable's value changes (set from the Variables view).

## Transactions (search results; SAP Library "Dialog Transactions", SE93 guides)
https://help.sap.com/doc/saphelp_scm700_ehp01/7.0.1/en-US/43/0f94d6c2086ff3e10000000a422035/content.htm
- SE93 creates/maintains transaction codes. Dialog transaction = program + initial screen number;
  report transaction = executable report, selection screen usually 1000. Also creatable from SE80
  (right-click program → Create → Transaction). Custom codes start with Z or Y.
- Tools: SE38 ABAP Editor, SE80 Object Navigator, SE11 ABAP Dictionary, SE16 Data Browser (general SAP knowledge).

## Traditional ALV (added 2026-11-10, from a sample program the user supplied)
- `applications-alv` teaches the classic function-module way: field catalog (`slis_fieldcat_alv`, entries with
  `fieldname` and `seltext_l`, `APPEND` then `CLEAR`) and `CALL FUNCTION 'REUSE_ALV_LIST_DISPLAY'` with
  `it_fieldcat`, table `t_outtab`, `EXCEPTIONS program_error = 1 OTHERS = 2`; rows read with a classic
  `SELECT … WHERE key IN s_select` and `SELECT-OPTIONS`.
- Not fetched from help.sap.com: the lesson says so. The CL_SALV_TABLE approach above stays the "modern alternative"
  named by the cheat sheet; the lesson does not teach it any more.
