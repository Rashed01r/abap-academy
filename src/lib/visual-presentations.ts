export type VisualFamily = "trace" | "flow" | "categories" | "row-access" | "relationships" | "sql" | "objects" | "report" | "expressions";
/** Explicit inventory: adding a lesson requires choosing its actual presentation. */
export const visualPresentations: Record<string, VisualFamily> = {
  "data-conditional-loop": "flow",
  "data-table-expressions": "trace",
  "database-abap-sql": "trace", "database-select": "trace", "database-where": "trace", "database-joins": "trace", "database-aggregates": "trace", "database-sql-mutations": "trace",
  "dictionary-domains": "relationships", "dictionary-data-elements": "relationships", "dictionary-structures": "relationships",
  "dictionary-database-tables": "relationships", "dictionary-foreign-keys": "relationships", "dictionary-search-helps": "relationships",
  "data-table-performance": "trace",
  "data-employee-manager": "trace",
  orientation: "trace", addition: "trace", structures: "trace", conditions: "flow", do: "flow", while: "flow",
  tables: "trace", "loop-at": "flow", "loop-control": "flow", employees: "trace",
  "data-table-model": "trace", "data-table-categories": "categories", "data-keys": "trace",
  "data-work-areas-field-symbols": "row-access", "data-read-table": "trace", "data-table-mutations": "trace", "data-sorting-filtering": "trace",
  "dictionary-introduction": "relationships", "database-fundamentals": "sql", "oop-introduction": "objects",
  "applications-reports": "report", "modern-syntax": "expressions", "cloud-introduction": "relationships", "projects-employee-management": "relationships",
};
