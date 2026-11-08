import type { Text } from "./curriculum";
import type { EducationSpec } from "./education-content";

// Essential concepts for the ABAP Dictionary lessons (English only while ENABLE_ARABIC = false).
// Learn targets are each lesson's reference groups and artifacts in guided-dictionary-definitions.ts.
const t = (en: string): Text => ({ en });
type Concept = EducationSpec["concepts"][number];
const c = (id: string, name: string, explanation: string, misconception: string, objectives: number[], learn: string[], assess: string[]): Concept =>
  ({ id, name: t(name), explanation: t(explanation), misconception: t(misconception), objectives, learn, demonstrate: "guided", assess });

export const dictionaryEducation: Record<string, EducationSpec> = {
  "dictionary-domains": {
    what: t("A domain defines the technical shape of a value once: data type, length and allowed values."), why: t("Reuse one shape for several fields, so employee and supplier status always look the same."),
    concepts: [
      c("domain-shape", "Type, length and fixed values", "ZACA_STATUS_DOMAIN is CHAR with length 1 and the fixed values A and I.", "Labels such as “Employee status” do not belong in a domain; they belong to data elements.", [0], ["group:technical", "group:fixed", "artifact:domain"], ["domain-content", "concept-check"]),
      c("domain-reuse", "One domain, many data elements", "ZACA_EMPLOYEE_STATUS and ZACA_SUPPLIER_STATUS both point to the domain and share its shape.", "A domain cannot type an ABAP variable; programs use the data element.", [1], ["group:reuse", "artifact:employee-element", "artifact:supplier-element"], ["domain-reuse", "knowledge-check"]),
      c("domain-fixed-limit", "What fixed values check", "Fixed values guide classic screens and value lists.", "They are not a database rule: an ABAP program can still store X.", [1], ["group:fixed"], ["domain-program", "concept-check"]),
    ],
  },
  "dictionary-data-elements": {
    what: t("A data element gives a field its business meaning and screen labels, on top of a technical type."), why: t("Every screen, report and program shows and types the employee status the same way."),
    concepts: [
      c("element-type-source", "Domain or predefined type", "With category Domain, the data element inherits type, length and fixed values; with a predefined type it is typed directly.", "Changing a label never changes the stored type.", [0], ["group:type", "artifact:domain", "artifact:element"], ["element-abap", "knowledge-check"]),
      c("element-labels", "Four field labels", "Short (10), medium (20), long (40) and heading (55) labels let each screen choose one that fits.", "A label longer than its box is cut off, for example “Employee s”.", [1], ["group:labels", "artifact:element"], ["element-labels", "element-short"]),
      c("element-in-abap", "Typing ABAP variables", "DATA lv_status TYPE zaca_employee_status. uses the data element as a type.", "DATA … TYPE zaca_status_domain is not allowed: domains are not ABAP types.", [1], ["group:abap", "artifact:variable"], ["element-abap", "concept-check"]),
    ],
  },
  "dictionary-structures": {
    what: t("A Dictionary structure is a global record type: a named group of fields."), why: t("Reuse the same address fields in programs, other structures and tables."),
    concepts: [
      c("structure-type", "A structure is only a type", "ZACA_ADDRESS describes street, city and country. DATA ls_address TYPE zaca_address creates one record in memory.", "A structure stores no rows; only database tables do.", [0], ["group:define", "group:components", "group:abap", "artifact:record"], ["structure-storage", "structure-abap"]),
      c("structure-include", "Include with a suffix", "include zaca_address with suffix _home adds street_home, city_home and country_home.", "Including a structure that repeats a component name fails activation until you add a suffix.", [1], ["artifact:including", "artifact:table"], ["structure-duplicate", "knowledge-check"]),
      c("structure-annotations", "Label and extensibility", "@EndUserText.label describes the structure; #NOT_EXTENSIBLE stops later enhancements.", "Annotations describe the object; they do not add components.", [0], ["group:annotations"], ["concept-check"]),
    ],
  },
  "dictionary-database-tables": {
    what: t("A database table stores rows permanently, identified by its primary key."), why: t("Employees must survive after the program ends, and each one must be found by a stable ID."),
    concepts: [
      c("table-parts", "Settings, keys, fields", "define table zaca_employee lists settings, then key fields, then the other fields.", "Activation creates an empty table; programs add the rows.", [0], ["group:settings", "group:define", "group:fields", "artifact:table"], ["table-activation", "concept-check"]),
      c("table-primary-key", "Primary key", "client + employee_id identifies each row; a second row with the same key is refused.", "Names and status can change or repeat, so they are poor key fields.", [1], ["group:keys", "artifact:key"], ["table-key", "table-duplicate", "knowledge-check"]),
      c("table-reuse", "Reusing data elements and structures", "status uses ZACA_EMPLOYEE_STATUS and include zaca_address adds the address columns.", "Typing every field with raw abap.char loses labels and shared rules.", [0], ["artifact:element", "artifact:structure"], ["concept-check"]),
    ],
  },
  "dictionary-foreign-keys": {
    what: t("A foreign key links a field to the key of a check table, which holds the valid values."), why: t("Keep departments consistent: employees should only point to departments that exist."),
    concepts: [
      c("fk-parts", "Check table and foreign key table", "ZACA_DEPARTMENT is the check table; ZACA_EMPLOYEE holds the foreign key field department.", "The check table is the one with the valid values, not the one with the foreign key.", [0], ["group:check-table", "group:employee", "artifact:check-table", "artifact:fk-table"], ["fk-check-table", "knowledge-check"]),
      c("fk-mapping", "Mapping every key field", "client = zaca_employee.client and department_id = zaca_employee.department give each check table key field a partner.", "[0..*,1] documents the relationship; it is not checked.", [0], ["group:field", "group:foreign-key", "artifact:fk-field"], ["fk-mapping", "concept-check"]),
      c("fk-where-checked", "Screens check, the database does not", "Classic screens reject a department that is not in the check table.", "The database does not enforce the foreign key, so programs must validate their own data.", [1], ["artifact:screen"], ["fk-program", "knowledge-check"]),
    ],
  },
  "dictionary-search-helps": {
    what: t("A search help shows an F4 list of valid values and copies the chosen value into the field."), why: t("Users pick a department from a list instead of remembering IDs."),
    concepts: [
      c("sh-parts", "Selection method, dialog, parameters", "ZACA_SH_DEPARTMENT reads ZACA_DEPARTMENT, shows the list at once and lists DEPARTMENT_ID and NAME.", "The selection method is the data source, not the field being filled.", [0], ["group:source", "group:dialog", "group:parameters", "artifact:search-help", "artifact:selection"], ["sh-export", "knowledge-check"]),
      c("sh-attach", "Where it is attached", "Attached to the data element ZACA_DEPARTMENT_ID, every field typed with it gets the list.", "Without any search help, a check table still offers its keys as a simple list.", [1], ["group:attach", "artifact:element"], ["sh-attach", "concept-check"]),
      c("sh-cloud", "ABAP Cloud value helps", "In ABAP Cloud, @Consumption.valueHelpDefinition points a field to a CDS entity with the values.", "Classic search helps do not exist in ABAP Cloud.", [1], ["group:cloud", "artifact:value-help"], ["sh-cloud", "knowledge-check"]),
    ],
  },
};
