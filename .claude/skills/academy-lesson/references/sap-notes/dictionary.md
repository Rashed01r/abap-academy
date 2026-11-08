# SAP notes: ABAP Dictionary (domains, data elements, structures, tables, foreign keys, search helps)

Researched 2026-11-08. Sources:
- SAP-samples ABAP cheat sheet `26_ABAP_Dictionary.md` (Introduction, Built-in types, Data elements, Domains,
  Structures, Database tables). https://github.com/SAP-samples/abap-cheat-sheets/blob/main/26_ABAP_Dictionary.md
- ABAP Keyword Documentation, DDIC DDL foreign keys:
  https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenddicddl_define_table_forkey.htm
- SAP Learning, "Defining Relationships Between Database Tables":
  https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/defining-relationships-between-database-tables_e55dbd61-6083-4747-bb5d-905ba29ab662
- SAP Library (classic), Cardinality / Semantic attributes of foreign keys (help.sap.com saphelp_snc70).
- Cite in `references`: https://help.sap.com/docs/abap-cloud/abap-keyword/ddic-database-tables ,
  https://help.sap.com/docs/abap-cloud/abap-keyword/ddic-ddl-define-structure ,
  https://help.sap.com/docs/abap-cloud/abap-keyword/ddic-foreign-keys

## Built-in types
`abap.char(n)` → ABAP `c`; `abap.numc(n)` → `n` (digits only, stored as text); `abap.int4` → `i`;
`abap.string(n)` → `string` (cannot be a table key field); `abap.clnt` → client (special CHAR 3);
`datn`/`timn` preferred over `dats`/`tims`. Built-in dictionary types are not used directly after TYPE in ABAP.

## Domains
- Standalone objects holding technical properties (type, length, decimals, output length) and semantic
  value ranges (fixed values or intervals). Created form-based in ADT (no DDL source).
- Reused by data elements only; **a domain cannot be used after TYPE/DATA in ABAP**.
- Fixed values: used for input checks on classic UIs (not ABAP Cloud) and value helps; **no effect in ABAP
  statements** and not a database constraint. Modern alternative: CDS enumerated types.
- Changing a shared domain changes every dependent data element/field (impact check needed).

## Data elements
- Elementary or reference types with technical + semantic properties. Category: predefined type (technical
  attributes directly) or domain (inherits them). Form-based in ADT.
- Semantic properties: field labels short/medium/long/heading (max lengths 10/20/40/55); medium label is
  exposed to OData; documentation. **Usable after TYPE in ABAP**: `DATA lv TYPE zaca_employee_status.`
- Successor in modern ABAP: CDS simple types.

## Structures
- `define structure name { comp : type; ... }` with annotations `@EndUserText.label`,
  `@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE`. Components: data elements, `abap.type(len)`,
  other structures, table types, references, `include struct [with suffix xyz];`.
- A structure is a **type**: no rows, no database table. `DATA ls TYPE zaca_address.` creates one record.
- Including a structure that repeats a component name is an error unless `with suffix` renames its components.

## Database tables
- `define table` with `@AbapCatalog.tableCategory : #TRANSPARENT`, `deliveryClass : #A` (application data),
  `dataMaintenance`, enhancement category, label. Activation creates the physical table.
- Key fields first; every table needs a primary key; key fields are always NOT NULL; key fields cannot be
  `string`/`rawstring`. First key field typically `client : abap.clnt` (client-dependent).
- Fields: unique names, no references/table types/nested structures; flat structures can be `include`d.
- A table is also a structured type in ABAP (`DATA ls TYPE zaca_employee.`); rows come from programs (ABAP SQL).

## Foreign keys
- Defined on a field (foreign key field) of the **foreign key table**, pointing to the primary key of the
  **check table**: `field : dtel with foreign key [0..*,1] check_table where check_f1 = tab.f1 and ...;`
- `@AbapCatalog.foreignKey.screenCheck : true|false` enables the input check on dynpros/Web Dynpro.
  SAP recommends false unless building classic UIs. `@AbapCatalog.foreignKey.label` describes it.
- **Not passed to the database**: a program can still insert a value that is not in the check table.
- Cardinality `[n,m]` is documentation (used only for maintenance/help views), not checked.
- Check table key values are offered as input help (F4) for the field.

## Search helps (classic)
- Classic DDIC objects for F4 value lists on dynpros; **not available in ABAP Cloud** (use CDS value helps,
  `@Consumption.valueHelpDefinition`).
- Elementary search help: selection method (table/view), dialog type (display values immediately / dialog with
  value restriction / dependent on number of values), parameters with IMPORT/EXPORT flags and list positions.
  Collective search helps bundle several elementary ones.
- Attachment: to a data element, a table field, or a check table. Commonly cited priority (community source, verify
  per release): program-specific help → search help on the field → check table → data element → domain fixed values.

## Teaching implications
- Keep one running example: ZACA_STATUS_DOMAIN → ZACA_EMPLOYEE_STATUS → ZACA_ADDRESS structure →
  ZACA_EMPLOYEE table → ZACA_DEPARTMENT check table → ZACA_SH_DEPARTMENT search help.
- Domains/data elements/search helps are form-based: show the form as labelled text, say so in the boundary.
- Always state what is classic-only (fixed-value screen checks, foreign key screen checks, search helps) and the
  modern replacement (CDS enumerations, CDS value helps).
