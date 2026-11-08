import type { LocalizedText } from "@/lib/language-policy";

/**
 * Important transaction codes for SAP developers, shown on the
 * "Transaction Codes" path of the home roadmap.
 *
 * Language phase: English only while ENABLE_ARABIC = false. Every text field is a
 * LocalizedText, so Arabic can be added later as `ar` without changing the shape.
 * Do not copy English into `ar` to simulate coverage.
 */

/** 3 = used daily, 2 = used often, 1 = used sometimes. */
export type TCodeFrequency = 1 | 2 | 3;

export type TCode = {
  /** Stable id, stored in learner progress. Never rename. */
  id: string;
  /** What the developer types in the command field (without /n). */
  code: string;
  title: LocalizedText;
  /** What it does. */
  what: LocalizedText;
  /** A practical developer tip. */
  tip: LocalizedText;
  frequency: TCodeFrequency;
  /**
   * Mostly replaced by ABAP Development Tools (ADT, Eclipse) in ABAP Cloud and
   * SAP S/4HANA Cloud. Still common in on-premise systems.
   */
  classic?: boolean;
  /** Extra search words that do not appear in the visible text. */
  keywords?: string[];
};

export type TCodeGroup = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  codes: TCode[];
};

const en = (value: string): LocalizedText => ({ en: value });

const tcode = (
  code: string,
  title: string,
  what: string,
  tip: string,
  frequency: TCodeFrequency,
  extra: Pick<TCode, "classic" | "keywords"> = {},
): TCode => ({
  id: `tcode-${code.replace(/[^a-z0-9]/gi, "").toLowerCase()}`,
  code,
  title: en(title),
  what: en(what),
  tip: en(tip),
  frequency,
  ...extra,
});

export const tcodeGroups: TCodeGroup[] = [
  {
    id: "dev",
    title: en("Development Tools"),
    summary: en("Where you build and change ABAP objects."),
    codes: [
      tcode("SE80", "Object Navigator", "One workbench for programs, classes, packages and screens.", "Browse by package to see everything a project owns.", 3, { classic: true, keywords: ["workbench", "package"] }),
      tcode("SE38", "ABAP Editor", "Create, edit and run reports.", "F8 runs the program, Ctrl+F2 checks syntax.", 3, { classic: true, keywords: ["report", "program", "editor"] }),
      tcode("SE11", "ABAP Dictionary", "Define tables, structures, data elements and views.", "Activate (Ctrl+F3) after every change, or nothing updates.", 3, { classic: true, keywords: ["ddic", "table", "domain", "data element"] }),
      tcode("SE24", "Class Builder", "Create and test global classes and interfaces.", "F8 lets you test a single method without a caller program.", 2, { classic: true, keywords: ["class", "oop", "interface"] }),
      tcode("SE37", "Function Builder", "Maintain and test function modules.", "Use F8 to test with sample input before wiring it in.", 2, { classic: true, keywords: ["function module", "bapi"] }),
      tcode("SE93", "Maintain Transaction", "Give your report its own T-code.", "Create one so business users never need SE38.", 1),
    ],
  },
  {
    id: "dbg",
    title: en("Debug & Analysis"),
    summary: en("Find out what broke and why it is slow."),
    codes: [
      tcode("/H", "Debugger switch", "Type /h in the command field to start the debugger on the next step.", "Ctrl+Shift+F12 in the editor sets a session breakpoint on a line.", 3, { keywords: ["debug", "breakpoint"] }),
      tcode("ST22", "ABAP Dump Analysis", "Read short dumps: what crashed, where, and which values were involved.", "Open the source code extract: the failing line is marked with >>>>>.", 3, { keywords: ["dump", "crash", "short dump"] }),
      tcode("SAT", "Runtime Analysis", "Measure which parts of a program take the time.", "Measure first, then optimize. Guessing wastes hours.", 2, { keywords: ["performance", "se30"] }),
      tcode("ST05", "Performance Trace", "Trace SQL statements and see what hits the database.", "Switch the trace on, run your step, switch it off, then read the list.", 2, { keywords: ["sql trace", "performance"] }),
      tcode("SCI", "Code Inspector", "Run static checks for errors, performance and style. Its modern successor is the ABAP Test Cockpit (ATC), which runs the same kind of checks centrally.", "Run it before releasing a transport.", 2, { keywords: ["atc", "static check", "quality"] }),
      tcode("SLIN", "Extended Program Check", "Catch hidden problems the normal syntax check misses.", "Clean this up first. Warnings here often become bugs later.", 1),
    ],
  },
  {
    id: "tab",
    title: en("Data & Tables"),
    summary: en("Look at and maintain table content."),
    codes: [
      tcode("SE16", "Data Browser", "View table content with a selection screen.", "Use the Number of entries button to count rows quickly.", 3, { keywords: ["table content", "data"] }),
      tcode("SE16N", "General Table Display", "A friendlier grid with more filters and technical names.", "Handy for checking test data after your program runs.", 3, { keywords: ["table content", "data"] }),
      tcode("SQVI", "QuickViewer", "Build a quick report from tables without coding.", "Join two tables for a fast check. QuickViews are personal and cannot be transported, so use SAP Query (SQ01) for reports others need.", 2, { keywords: ["join", "query", "report"] }),
      tcode("SM30", "Table Maintenance", "Edit customizing or custom table entries through a generated screen.", "Generate it from SE11 under Utilities, Table Maintenance Generator.", 2, { keywords: ["maintenance view", "customizing"] }),
      tcode("SE14", "Database Utility", "Adjust or rebuild a table in the database after changes.", "Be careful with options that delete data.", 1, { keywords: ["activate and adjust", "convert"] }),
    ],
  },
  {
    id: "trn",
    title: en("Transports"),
    summary: en("Move your changes between systems."),
    codes: [
      tcode("SE09", "Transport Organizer", "See and release your change requests.", "Check the request is yours and contains everything before releasing.", 3, { keywords: ["transport", "change request", "release"] }),
      tcode("SE10", "Transport Organizer", "Opens the same Transport Organizer as SE09 in current releases. Many developers use the two codes interchangeably.", "Use the request filters (by user, status or type) to find an old request someone forgot to release.", 2, { keywords: ["transport", "change request"] }),
      tcode("STMS", "Transport Management", "Import transports into other systems. Usually the Basis team.", "Know it exists so you can talk to Basis in the same language.", 1, { keywords: ["import", "basis"] }),
      tcode("SE03", "Transport Tools", "Search for objects across requests.", "Use Search for Objects in Requests/Tasks to find which request has an object locked.", 1, { keywords: ["transport", "object lock"] }),
    ],
  },
  {
    id: "mon",
    title: en("Monitoring & Jobs"),
    summary: en("Watch what the system is doing."),
    codes: [
      tcode("SM37", "Job Overview", "Check background jobs: status, start time and job log.", "Filter by user and date, then open the job log for errors.", 3, { keywords: ["background job", "batch"] }),
      tcode("SM36", "Define Background Job", "Schedule a program to run automatically.", "Use a variant so the job runs with the same inputs every time.", 2, { keywords: ["background job", "schedule", "batch"] }),
      tcode("SM50", "Process Overview", "See running work processes and what they are doing.", "Spot a long-running program that is blocking others.", 2, { keywords: ["work process"] }),
      tcode("SLG1", "Application Log", "Read logs that your programs write.", "Log meaningful messages in your own code so you can find them here.", 2, { keywords: ["log", "bal"] }),
      tcode("SM21", "System Log", "Look up system-level errors and events.", "Narrow the time window to the moment the problem happened.", 1, { keywords: ["log"] }),
      tcode("SM12", "Lock Entries", "See and release stuck locks.", "Find out who holds the lock before you delete it.", 1, { keywords: ["enqueue", "lock"] }),
    ],
  },
  {
    id: "sec",
    title: en("Security & Users"),
    summary: en("Authorizations and user troubleshooting."),
    codes: [
      tcode("SU53", "Display Authorization Check", "Shows the failed check after a no-authorization error.", "Run it right after the error, in the same session.", 2, { keywords: ["authorization", "missing authorization"] }),
      tcode("SU01", "User Maintenance", "Create and change users. Usually an admin task.", "Check a test user has the right role before debugging your code.", 1, { keywords: ["user"] }),
      tcode("PFCG", "Role Maintenance", "Build roles and their authorizations.", "Pair it with SU53 to see exactly which object is missing.", 1, { keywords: ["role", "authorization"] }),
      tcode("SUIM", "User Information System", "Report on users, roles and authorizations.", "Search which roles contain a given authorization object.", 1, { keywords: ["authorization", "report"] }),
    ],
  },
  {
    id: "frm",
    title: en("Forms & Screens"),
    summary: en("Printed output and classic screens."),
    codes: [
      tcode("SE91", "Message Maintenance", "Create reusable message texts.", "Store texts here instead of hard-coding them in your program.", 2, { keywords: ["message class", "text"] }),
      tcode("SMARTFORMS", "Smart Forms", "Design printed documents like invoices.", "Test the form on its own before connecting the print program.", 1, { keywords: ["form", "print"] }),
      tcode("SFP", "Form Builder", "Design PDF-based forms (SAP Interactive Forms by Adobe).", "PDF output needs Adobe Document Services (ADS). If the preview fails, ask Basis whether ADS is configured.", 1, { keywords: ["adobe", "pdf", "form"] }),
      tcode("SE51", "Screen Painter", "Build classic dynpro screens.", "Good to read old code, even if you build new apps with RAP.", 1, { keywords: ["dynpro", "module pool"] }),
      tcode("SE41", "Menu Painter", "Set toolbar buttons and menus for a screen.", "Copy the standard GUI status and change only what you need.", 1, { keywords: ["gui status", "pf-status"] }),
    ],
  },
];

export const allTCodes: TCode[] = tcodeGroups.flatMap(group => group.codes);
export const tcodeIds: string[] = allTCodes.map(t => t.id);

/** XP for marking one transaction code as learned. */
export const TCODE_XP = 10;

/**
 * Review log: every change made to the prototype's T-code text (2026-11-08).
 * Kept so a reviewer can check each correction against SAP documentation.
 */
export const tcodeReviewLog: { code: string; change: string; reason: string }[] = [
  { code: "SE10", change: "Title \"Transport Organizer (Extended)\" → \"Transport Organizer\"; description now says it opens the same tool as SE09.", reason: "In current releases SE09 and SE10 start the same Transport Organizer; SE10 is not an extended version." },
  { code: "SE10", change: "Tip now names the request filters (user, status, type).", reason: "Follows the corrected description; the old tip relied on SE10 having extra filters." },
  { code: "SE03", change: "Tip \"see who holds a lock\" → \"find which request has an object locked\".", reason: "SE03 shows object locks held by transport requests, not user enqueue locks (that is SM12)." },
  { code: "SCI", change: "Description adds that ATC (ABAP Test Cockpit) is the modern successor.", reason: "ATC is SAP's current central tool for static checks; SCI check variants run inside it." },
  { code: "SQVI", change: "Tip no longer suggests sharing the view; says QuickViews are personal and points to SAP Query (SQ01).", reason: "QuickViews are user-specific and cannot be transported or shared with other users." },
  { code: "SFP", change: "Description names SAP Interactive Forms by Adobe; tip now mentions Adobe Document Services (ADS).", reason: "The old tip was vague; ADS is the practical prerequisite developers run into." },
  { code: "SE38, SE80, SE11, SE24, SE37", change: "Added classic: true.", reason: "Mostly replaced by ABAP Development Tools (Eclipse) in ABAP Cloud and SAP S/4HANA Cloud." },
];
