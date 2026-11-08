import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";

// Sources: SAP-samples ABAP cheat sheet 01_Internal_Tables ("BINARY SEARCH Addition", "Exploring Read Access
// Performance") and SAP Clean ABAP "Use the right table type". Counts shown in the trace are rows examined by
// the teaching model, never SAP runtimes. See .claude/skills/academy-lesson/references/sap-notes/internal-tables.md.
const t = (en: string): Text => ({ en });
export const tablePerformanceSetup = `DATA lt_ids TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA lv_id TYPE i VALUE 100.
DATA lv_search TYPE i VALUE 101.
DATA lv_found TYPE i.
DO 16 TIMES.
  lv_id = lv_id + 1.
  INSERT lv_id INTO lt_ids INDEX 1.
ENDDO.`;
export const tablePerformanceExample = `${tablePerformanceSetup}
READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search.
WRITE / sy-tabix.
SORT lt_ids BY table_line.
READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.
IF sy-subrc = 0.
  WRITE / sy-tabix.
ELSE.
  WRITE / 'Not found'.
ENDIF.`;
export const tablePerformanceOutput = "16\n1";

const binaryToken: SyntaxToken = {
  id: "binary-search", label: "READ TABLE … BINARY SEARCH",
  meaning: t("A normal READ TABLE … WITH KEY checks rows one by one from the top. Adding BINARY SEARCH looks at the middle row, keeps only the half that can contain the key, and repeats. 16 rows need at most 5 checks instead of 16."),
  why: t("When a program looks up many IDs in a large table, checking every row each time wastes work. Halving the rows keeps each lookup short."),
  write: t("Put BINARY SEARCH at the end of READ TABLE … WITH KEY …, before the period. Check sy-subrc afterwards, exactly as for a normal READ TABLE."),
  correct: "READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.",
  mistake: "READ TABLE lt_ids INTO lv_found BINARY SEARCH WITH KEY table_line = lv_search.",
  question: t("The sorted table has 16 rows. At most how many rows does BINARY SEARCH check?"),
  options: [t("About 5"), t("All 16")], answer: 0,
  explanation: t("Each check halves the rows still possible: 16, 8, 4, 2, 1. That is about 5 checks, while a one-by-one search may need all 16."),
};
const sortToken: SyntaxToken = {
  id: "sort-first", label: "SORT … BY key before BINARY SEARCH",
  meaning: t("BINARY SEARCH only works if the rows are sorted ascending by the field you search. SORT lt_ids BY table_line puts the IDs in order 101, 102, … 116."),
  why: t("On an unsorted table, BINARY SEARCH can answer Not found for an ID that is there. ABAP shows no error, so the mistake is easy to miss."),
  write: t("SORT the table once, by the same field you search, before the BINARY SEARCH reads. Do not sort again before every read."),
  correct: "SORT lt_ids BY table_line.\nREAD TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.",
  mistake: "READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.\nSORT lt_ids BY table_line.",
  question: t("The IDs are stored newest first (116 … 101) and you forget SORT. What can BINARY SEARCH for 101 report?"),
  options: [t("Not found, even though 101 is in the table"), t("A runtime error")], answer: 0,
  explanation: t("BINARY SEARCH trusts the order. In a newest-first list it heads the wrong way and misses 101 without any error."),
};
const goal = t("Keep the supplied IDs and lv_search. Sort lt_ids once by table_line. Then READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH. If sy-subrc = 0 display sy-tabix, otherwise display 'Not found'. The checker changes how many IDs are stored and which ID you look for, including IDs that are not in the table.");
const hints = [
  t("BINARY SEARCH needs the rows in ascending order of the search field. The IDs start newest first, so SORT lt_ids BY table_line. must come before the read."),
  t("Write the read as READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH. — BINARY SEARCH goes last, just before the period."),
  t("After the read: IF sy-subrc = 0. WRITE / sy-tabix. ELSE. WRITE / 'Not found'. ENDIF. With 16 IDs and lv_search = 101 the screen shows 1."),
];
const starter = `${tablePerformanceSetup}\n* Sort the IDs, then find lv_search with BINARY SEARCH.\n`;
export const tablePerformanceSolution = `${tablePerformanceSetup}
SORT lt_ids BY table_line.
READ TABLE lt_ids INTO lv_found WITH KEY table_line = lv_search BINARY SEARCH.
IF sy-subrc = 0.
  WRITE / sy-tabix.
ELSE.
  WRITE / 'Not found'.
ENDIF.`;
export const tablePerformanceMission: Mission = {
  id: "data-table-performance", pathId: "data", prerequisite: "data-table-expressions",
  title: t("Find rows with fewer checks"), subtitle: t("Compare a one-by-one search with BINARY SEARCH on a sorted table"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "table",
  coveredTopics: ["Internal table performance"],
  brief: t("A list holds 16 employee IDs, newest first: 116 down to 101. Looking for 101 with a normal READ TABLE checks the rows one by one and needs all 16 checks. After SORT puts the IDs in order, READ TABLE … BINARY SEARCH looks at the middle, throws away the half that cannot contain 101, and finds it in 5 checks. The catch: BINARY SEARCH only works on a table sorted by the search field. On an unsorted table it can say Not found for an ID that is there, with no error. Sorted and hashed tables keep their key order for you, so they suit large tables that are read often."),
  objectives: [t("Compare how many rows a one-by-one search and a binary search check"), t("Sort by the search field before BINARY SEARCH, and know when sorted or hashed tables are the better choice")],
  references: [
    "https://help.sap.com/docs/abap-cloud/abap-keyword/read-table-itab",
    "https://help.sap.com/docs/abap-cloud/abap-keyword/sort-itab",
    "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md",
    "https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-the-right-table-type",
  ],
  tokens: [binaryToken, sortToken], example: tablePerformanceExample,
  visual: t("Step to each READ TABLE and look at the rows checked. The first read walks positions 1 to 16 before it reaches 101 at the bottom. After SORT, the binary search checks positions 9, 5, 3, 2 and 1, then stops at 101. Change lv_search to 116 to see the one-by-one search win, because 116 is at the top. Then put a * in front of SORT and see BINARY SEARCH miss an ID that exists."),
  practice: t("Try lv_search 101, 108, 116 and 200, and DO 16 TIMES changed to 32 TIMES. Predict the rows checked before running: one by one grows with the table, binary search grows only by one check each time the table doubles. The browser counts rows examined by its own model; it does not measure SAP runtime. It runs READ TABLE … WITH KEY … BINARY SEARCH on standard tables. Sorted and hashed tables, secondary keys and real timings are explained, not executed."),
  goal, hint: hints[0], hints, starter, solution: tablePerformanceSolution, expected: "1",
  challenges: [{ id: "data-performance-lookup", title: t("Find an ID with BINARY SEARCH"), goal, hint: hints[2], starter, solution: tablePerformanceSolution, expected: "1" }],
  quiz: t("A table of 1,000 employee IDs is read many times by ID. Which choice is best?"),
  options: [
    t("A sorted or hashed table with ID as the key, or SORT once and use BINARY SEARCH"),
    t("A standard table read one by one; table size does not matter"),
    t("SORT the table again before every single read"),
  ], answer: 0,
  quizExplanation: t("A one-by-one search may check all 1,000 rows each time. A binary search needs about 10 checks, and a hashed table finds a full unique key almost directly. Sorting before every read repeats expensive work; sort once, or let a sorted table keep its order."),
};

function group(id: string, lines: [number, number], title: string, explanation: string, syntaxRefs: string[] = []): AnatomyGroupSpec {
  return { id, lines, title: t(title), explanation: t(explanation), practice: t(`Which source section ${explanation[0].toLowerCase() + explanation.slice(1)}`), syntaxRefs, visualizer: { kind: "snapshot", line: lines[1] } };
}
export const tablePerformanceGroups: AnatomyGroupSpec[] = [
  group("storage", [1, 4], "Create the ID list", "Creates an empty list of IDs, a counter starting at 100, the ID to find (101) and a place for the result."),
  group("fill", [5, 8], "Store 16 IDs, newest first", "Adds IDs 101 to 116, always at position 1, so the list ends up 116, 115, … 101."),
  group("linear", [9, 10], "Search one by one", "Checks rows from the top until it reaches 101 at position 16, then shows 16.", ["binary-search"]),
  group("sort", [11, 11], "Sort by the search field", "Puts the IDs in ascending order, 101 to 116, so a binary search can work.", ["sort-first"]),
  group("binary", [12, 17], "Search by halving", "Checks the middle rows (9, 5, 3, 2, 1), finds 101 at position 1 and shows 1; a miss would show Not found.", ["binary-search", "sort-first"]),
];
export const tablePerformanceEducation: EducationSpec = {
  what: t("How many rows a lookup checks depends on how it searches: one by one, or by halving a sorted table."),
  why: t("Keep lookups in large tables short, and avoid the silent wrong answer of BINARY SEARCH on unsorted data."),
  concepts: [
    { id: "linear-search", name: t("One by one from the top"), explanation: t("READ TABLE … WITH KEY on a standard table checks position 1, then 2, and so on. Finding 101 at position 16 takes 16 checks. Twice as many rows means up to twice as many checks."), misconception: t("A row near the top is found quickly, so a small test can hide the cost. The worst case still checks every row."), objectives: [0], learn: ["group:linear", "token:binary-search"], demonstrate: "trace", assess: ["data-performance-lookup", "concept-check"] },
    { id: "binary-search", name: t("Halving a sorted table"), explanation: t("BINARY SEARCH looks at the middle row and keeps the half that can contain the key. 16 rows need about 5 checks; 1,000 rows about 10."), misconception: t("BINARY SEARCH does not sort anything. It only makes sense after the table is sorted by the search field."), objectives: [0], learn: ["group:binary", "token:binary-search"], demonstrate: "trace", assess: ["data-performance-lookup", "knowledge-check"] },
    { id: "sort-first", name: t("Sort once, by the search field"), explanation: t("SORT lt_ids BY table_line orders the IDs 101 to 116. Without it, BINARY SEARCH on the newest-first list misses 101 and reports Not found, with no error."), misconception: t("Sorting before every read repeats the most expensive step. Sort once, then read many times."), objectives: [1], learn: ["group:sort", "token:sort-first"], demonstrate: "trace", assess: ["data-performance-lookup", "knowledge-check"] },
    { id: "choose-category", name: t("Let the table type do it"), explanation: t("A sorted table keeps its rows in key order, so key reads use a binary search automatically. A hashed table finds a full unique key almost directly. A standard table is fine for small lists."), misconception: t("Hashed is not always best: it needs the full key and costs more to change. Pick by table size and how it is read."), objectives: [1], learn: ["token:sort-first"], demonstrate: "trace", assess: ["knowledge-check"] },
  ],
};
