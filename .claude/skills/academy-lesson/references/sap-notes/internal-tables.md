# SAP notes: table expressions, existence/index checks, categories and performance

Researched 2026-11-08. Sources:
- SAP-samples ABAP cheat sheet `01_Internal_Tables.md`, sections "Accessing Single Table Lines via
  Table Expressions", "Checking the Existence of a Line", "Checking the Index of a Line",
  "BINARY SEARCH Addition", "Table Keys … and Table Indexes", "Exploring Read Access Performance".
  https://github.com/SAP-samples/abap-cheat-sheets/blob/main/01_Internal_Tables.md
- SAP Clean ABAP, "Tables" chapter. https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#tables
- Cite in `references`: https://help.sap.com/docs/abap-cloud/abap-keyword/table-expression ,
  https://help.sap.com/docs/abap-cloud/abap-keyword/rel-exp-line-exists ,
  https://help.sap.com/docs/abap-cloud/abap-keyword/itab-func-line-index ,
  https://help.sap.com/docs/abap-cloud/abap-keyword/read-table-itab

## Table expressions (`itab[ … ]`), for mission data-table-expressions
- A short form of `READ TABLE` usable in operand positions: `DATA(row) = itab[ 2 ].`
- Forms: index `itab[ 2 ]`; free key `itab[ id = lv_id ]` (components need not be a table key);
  table key `itab[ TABLE KEY primary_key COMPONENTS … ]` (all key components, no others; `COMPONENTS` optional).
- Index access needs an index table (standard/sorted). A hashed table has no primary index.
- Chaining: `itab[ id = 102 ]-name` reads one component directly.
- **Not found → catchable exception `CX_SY_ITAB_LINE_NOT_FOUND`**. Not sy-subrc.
  ```abap
  TRY.
      DATA(row) = lt_employees[ id = lv_id ].
    CATCH cx_sy_itab_line_not_found.
      WRITE 'Not found'.
  ENDTRY.
  ```
- **Table expressions do not set `sy-subrc` or `sy-tabix`** (exception: `ASSIGN itab[ … ] TO <fs>`
  sets sy-subrc 0/4, or 8 at the end of a sorted binary search, and sy-tabix, and raises no exception).
  Teaching trap: checking `sy-subrc` after `itab[ … ]` reads a stale value from an earlier statement.
- `VALUE #( itab[ … ] OPTIONAL )` → type-initial row on miss (no exception).
  `VALUE #( itab[ … ] DEFAULT fallback )` → fallback (may be another table expression) on miss.
  Both also work with `REF #( … )`.
- Write access: `itab[ id = 102 ]-salary = 9000.` changes the stored row directly (not a copy).
- `BINARY SEARCH` cannot be forced in a table expression; key access is optimized automatically
  when the key allows it. No performance difference vs. READ TABLE for the same access.

## Existence and position
- `line_exists( itab[ … ] )` is a predicate that is true if a matching row exists. Clean ABAP prefers it to
  `READ TABLE … TRANSPORTING NO FIELDS` + `sy-subrc` and to a `LOOP … EXIT`.
- `line_index( itab[ … ] )` returns the one-based row number, or 0 if not found (−1 for a hashed
  table's primary key, which has no index).
- Clean ABAP "Avoid unnecessary table reads": if you *expect* the row, read once inside TRY/CATCH rather than
  `line_exists` followed by a second read (double search).

## Table categories and access cost, for mission data-table-performance
| Category | Primary key | Key access | Index access |
|---|---|---|---|
| STANDARD | always non-unique (or empty) | linear search, grows with size; cheapest to maintain | yes |
| SORTED | unique or non-unique, kept sorted | binary search for the full or left-aligned partial key, logarithmic | yes |
| HASHED | always unique, full key required | hash, roughly constant | no (only via sorted secondary key) |
- Index access is fastest (position known, no search).
- A free key on a standard table is linear. Partial or non-left-aligned keys on sorted/hashed fall back to linear.
- `READ TABLE … WITH KEY … BINARY SEARCH` works on standard tables **only if sorted ascending by
  the searched fields**; if they are unsorted, the result is wrong without an error. SAP recommends sorted
  tables or secondary keys instead. Sorting before *each* read is an anti-pattern.
- Secondary keys (`WITH UNIQUE HASHED KEY … COMPONENTS …` / `NON-UNIQUE SORTED KEY`) give optimized
  access on any category but must be named explicitly (`USING KEY`, `KEY name` in expressions).
  Non-unique sorted secondary keys update lazily (on first use); unique ones update on every change.
  Avoid them for small or frequently changed tables.
- Clean ABAP guidance: HASHED for large tables filled once, never modified, read often by full key;
  SORTED for large tables that must stay ordered or are filled bit by bit and read by full/partial key;
  STANDARD for small tables and arrays. "These are only rough guidelines."
- Avoid `WITH DEFAULT KEY`. Use an explicit key or `EMPTY KEY`.
- SAP's own performance example says that measurements vary by system and are for exploration only.
  **The academy must not show measured timings. Teach comparison counts from a labelled model.**

## Teaching implications
- data-table-expressions: contrast `READ TABLE … INTO` + `sy-subrc` (taught in `data-read-table`)
  with `itab[ … ]` + TRY/CATCH, `line_exists`, `line_index`, `VALUE #( … OPTIONAL/DEFAULT )`.
  Main trap: the stale `sy-subrc`. Second trap: double read (`line_exists` then `itab[ ]`).
  The grader should vary IDs, including a missing ID such as 999.
- data-table-performance: a controlled "comparisons counted" model (linear = up to n,
  binary ≈ log2 n, hash ≈ 1, index = 0 search), plus the BINARY SEARCH-on-unsorted wrong-result trap.
  It needs sorted/hashed declarations in the simulator, or a guided/reference model clearly labelled.
- data-employee-manager: capstone combining add (APPEND/INSERT), find (expression/READ), change
  (MODIFY / write via expression), delete, WHERE report; the grader varies all of the data.
