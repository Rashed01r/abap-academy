export type VisualFamily = "trace" | "flow" | "categories" | "row-access" | "relationships" | "sql" | "objects" | "report" | "expressions";
/** Explicit inventory: adding a lesson requires choosing its actual presentation. */
export const visualPresentations: Record<string, VisualFamily> = {
  "data-conditional-loop": "flow",
  "data-table-expressions": "trace",
  "database-abap-sql": "trace", "database-select": "trace", "database-where": "trace", "database-joins": "trace", "database-aggregates": "trace", "database-sql-mutations": "trace",
  "oop-classes-objects": "trace", "oop-objects": "trace", "oop-attributes": "trace", "oop-instance-methods": "trace", "oop-constructors": "trace", "oop-inheritance": "trace", "oop-interfaces": "trace", "oop-exceptions": "trace",
  "dictionary-domains": "relationships", "dictionary-data-elements": "relationships", "dictionary-structures": "relationships",
  "dictionary-database-tables": "relationships", "dictionary-foreign-keys": "relationships", "dictionary-search-helps": "relationships",
  "data-table-performance": "trace",
  "data-employee-manager": "trace",
  orientation: "trace", addition: "trace", structures: "trace", conditions: "flow", do: "flow", while: "flow",
  tables: "trace", "loop-at": "flow", "loop-control": "flow", employees: "trace",
  "data-table-model": "trace", "data-table-categories": "categories", "data-keys": "trace",
  "data-work-areas-field-symbols": "row-access", "data-read-table": "trace", "data-table-mutations": "trace", "data-sorting-filtering": "trace",
  "dictionary-introduction": "relationships", "database-fundamentals": "sql", "oop-introduction": "objects",
  "applications-alv": "relationships", "applications-module-pool": "relationships", "applications-smart-forms": "relationships", "applications-debugging": "relationships", "applications-transactions": "relationships",
"modern-abap-syntax": "relationships", "modern-cds-views": "relationships", "modern-cds-associations": "relationships", "modern-dcl": "relationships", "modern-amdp": "relationships", "modern-performance": "relationships",
  "applications-reports": "report", "modern-syntax": "expressions", "cloud-introduction": "relationships", "cloud-adt": "relationships", "cloud-rap-bo": "relationships", "cloud-behavior": "relationships", "cloud-eml": "relationships", "cloud-service-bindings": "relationships", "cloud-btp": "relationships",
};
