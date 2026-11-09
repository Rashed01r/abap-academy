import { test, expect, type Locator, type Page } from "@playwright/test";
import { openLesson, tab, openPath } from "./academy-helpers";

async function lab(page: Page, id: string, name: string) {
  await page.goto(`/?mission=${id}`);
  await openLesson(page, id);
  await tab(page, "en", "visualize");
  const region = page.getByRole("region", { name, exact: true });
  await expect(region).toBeVisible();
  return region;
}

test("Dictionary labs react to real input", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));

  const step = (region: Locator, name: string) => region.getByRole("button", { name: new RegExp("^" + name) }).click();

  const domain = await lab(page, "dictionary-domains", "Domain lab");
  await step(domain, "Test a value");
  await domain.getByLabel("Value", { exact: true }).fill("X");
  await expect(domain).toContainText("Not one of the fixed values.");
  await domain.getByLabel("Value", { exact: true }).fill("I");
  await expect(domain).toContainText("Accepted by the domain's rules.");

  const element = await lab(page, "dictionary-data-elements", "Data element lab");
  await step(element, "Field labels");
  await element.getByLabel("Short label (max 10)").fill("Employee status");
  await expect(element).toContainText("Too long: screens show “Employee s”");

  const structure = await lab(page, "dictionary-structures", "Structure lab");
  await expect(structure).toContainText("the component city appears twice");
  await step(structure, "Fix name clashes");
  await structure.getByLabel("with suffix _home").check();
  await expect(structure).toContainText("All 6 component names are unique.");

  const keys = await lab(page, "dictionary-database-tables", "Table key lab");
  await step(keys, "Insert four rows");
  await expect(keys.getByRole("table", { name: "Rows to insert" }).locator("tr").nth(4)).toContainText("Rejected: duplicate key");
  await step(keys, "Choose the key");
  await keys.getByLabel("client", { exact: true }).uncheck();
  await expect(keys).toContainText("client is the first key field");

  const fk = await lab(page, "dictionary-foreign-keys", "Foreign key lab");
  await step(fk, "Save a department");
  await fk.getByLabel("Department", { exact: true }).fill("FIN");
  await expect(fk).toContainText("The screen check rejects the entry.");
  await fk.getByLabel("Saved by an ABAP program").check();
  await expect(fk).toContainText("the database has no foreign key constraint");

  const sh = await lab(page, "dictionary-search-helps", "Search help lab");
  await sh.getByRole("button", { name: "F4", exact: true }).click();
  await step(sh, "Restrict and choose");
  await sh.getByLabel("Restrict by name").fill("S*");
  await expect(sh).toContainText("1 of 3 departments");
  await sh.getByRole("button", { name: "Choose SALES", exact: true }).click();
  await step(sh, "Press F4");
  await expect(sh.getByLabel("Department", { exact: true })).toHaveValue("SALES");

  expect(errors).toEqual([]);
});

test("the ABAP Dictionary path shows every planned topic as a lesson", async ({ page }) => {
  await page.goto("/");
  await openPath(page, "dictionary");
  for (const title of ["Domains: define a value's shape once", "Data elements: give a field its meaning", "Structures: group fields into one type", "Database tables: store rows for good", "Foreign keys: link a field to a check table", "Search helps: offer a list of valid values"])
    await expect(page.locator('[data-node^="lesson:dictionary-"] .card, [data-mobile-node^="lesson:dictionary-"]').filter({ visible: true }).filter({ hasText: title })).toHaveCount(1);
  await expect(page.locator('[data-node^="planned:dictionary:"], [data-mobile-node^="planned:dictionary:"]')).toHaveCount(0);
});
