import { test, expect, type Page } from "@playwright/test";
import { missions, paths } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";
import { roadmapCopy, treeCopy } from "../src/lib/tree-copy";
import { earnedXP } from "../src/lib/progress";
import { allTCodes, tcodeGroups } from "../src/features/roadmap/data/tcodes";
import { openLesson, openPath, roadmapNode, roadmapSearch } from "./academy-helpers";

const c = roadmapCopy("en");
const drawer = (page: Page) => page.locator("[data-drawer]");
const isMobile = (page: Page) => (page.viewportSize()?.width || 0) <= 820;
const progress = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("abap2-master-progress")!));

async function edit(page: Page, code: string) {
  const editor = page.getByRole("tabpanel").getByRole("textbox");
  await expect(editor).toBeVisible();
  await editor.focus(); await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.insertText(code);
}
/** Lesson view → Back to roadmap → the drawer shows the same lesson → Open lesson. */
async function leaveAndReturn(page: Page) {
  await page.getByRole("button", { name: c.backToRoadmap, exact: true }).click();
  await expect(drawer(page)).toHaveClass(/open/);
  await drawer(page).getByRole("button", { name: /Open lesson/ }).click();
}

test("home: ABAP root with two paths, accordion, tint, breadcrumb and no page overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await expect(roadmapNode(page, "abap")).toHaveAccessibleName(`ABAP, ${c.hub}`);
  await expect(roadmapNode(page, "learn")).toContainText(`${missions.length + 1} ${c.lessons}`);
  await expect(roadmapNode(page, "tcodes")).toContainText(`${allTCodes.length} ${c.tcodes}`);
  await expect(page.locator(".tree-paths, .knowledge-tree")).toHaveCount(0);

  await roadmapNode(page, "learn").click();
  await expect(page.locator('[data-node^="path:"] .card, [data-mobile-node^="path:"]').filter({ visible: true })).toHaveCount(paths.length);
  await expect(page.locator(".crumb nav")).toHaveText(/ABAP\s*→\s*Learning/);

  // Accordion: opening Transaction Codes closes Learning, and the tint turns amber.
  await roadmapNode(page, "tcodes").click();
  await expect(roadmapNode(page, "learn")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-node^="tgroup:"] .card, [data-mobile-node^="tgroup:"]').filter({ visible: true })).toHaveCount(tcodeGroups.length);
  await expect.poll(() => page.locator(".roadmap-home").evaluate(el => el.style.getPropertyValue("--tint"))).toBe("245,185,74");

  // The breadcrumb jumps back to the root, which collapses everything.
  await page.locator(".crumb nav").getByRole("button", { name: "ABAP", exact: true }).click();
  await expect(roadmapNode(page, "tcodes")).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.locator(".roadmap-home").evaluate(el => el.style.getPropertyValue("--tint"))).toBe("94,234,177");

  const size = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight, ih: innerHeight }));
  expect(size.w).toBe(size.iw);
  expect(size.h).toBe(size.ih);
  if (isMobile(page)) await expect(page.locator(".stage")).toHaveCount(0);
  else await expect(page.locator(".mobile-roadmap")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("T-code drawer: details, Classic tag, frequency label, command simulation, Escape, once-only XP", async ({ page }) => {
  await page.goto("/");
  await roadmapNode(page, "tcodes").click();
  await roadmapNode(page, "tgroup:dbg").click();
  const st22 = roadmapNode(page, "tcode-st22");
  await expect(st22).toHaveAccessibleName("ST22, ABAP Dump Analysis");
  await expect(st22.locator(".dots")).toHaveAttribute("aria-label", c.daily);
  await st22.click();
  await expect(drawer(page)).toHaveClass(/open/);
  await expect(drawer(page).locator(".big")).toHaveText("ST22");
  await expect(drawer(page)).toContainText(c.whatItDoes);
  await expect(drawer(page)).toContainText(c.devTip);
  await expect(drawer(page).locator(".tag.classic")).toHaveCount(0);
  await drawer(page).getByRole("button", { name: /Run/ }).click();
  await expect(drawer(page).locator(".cmd")).toHaveText("/nST22");
  await expect(drawer(page).getByRole("status")).toHaveText("✓ Transaction ST22 started");

  // Escape closes the drawer and returns focus to the card.
  await page.keyboard.press("Escape");
  await expect(drawer(page)).not.toHaveClass(/open/);
  await expect(st22).toBeFocused();

  const before = earnedXP(await progress(page));
  await st22.click();
  await drawer(page).getByRole("button", { name: `${c.markLearned} · +10 ${c.xp}` }).click();
  await expect(drawer(page).getByRole("button", { name: `${c.learned} ✓` })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".toast")).toHaveText("+10 XP");
  await expect.poll(async () => (await progress(page)).tcodes).toEqual(["tcode-st22"]);
  expect(earnedXP(await progress(page))).toBe(before + 10);
  await expect(page.locator(".header-xp")).toContainText(String(before + 10));
  await drawer(page).getByRole("button", { name: `${c.learned} ✓` }).click();
  expect(earnedXP(await progress(page))).toBe(before + 10);
  await expect(st22).toHaveAccessibleName(`ST22, ABAP Dump Analysis, ${c.learned}`);

  await page.reload();
  await expect.poll(async () => (await progress(page)).tcodes).toEqual(["tcode-st22"]);
  await expect(page.locator(".header-xp")).toContainText(String(before + 10));

  // Classic T-codes say so.
  await roadmapSearch(page).fill("SE38");
  await page.keyboard.press("Enter");
  await expect(drawer(page).locator(".big")).toHaveText("SE38");
  await expect(drawer(page).locator(".tag.classic")).toHaveText(c.classic);
  await expect(drawer(page)).toContainText("ABAP Development Tools");
});

test("search finds topics, lessons, T-codes and keywords and jumps to the node", async ({ page }) => {
  await page.goto("/");
  const results = page.locator("#roadmap-search-results");
  await roadmapSearch(page).fill("dump");
  await expect(results.locator('[data-result="tcode-st22"]')).toBeVisible();
  await roadmapSearch(page).fill("SELECT");
  await expect(results.locator('[data-result="lesson:database-select"]')).toBeVisible();
  await roadmapSearch(page).fill("ABAP Dictionary");
  await expect(results.locator('[data-result="path:dictionary"]')).toBeVisible();
  await roadmapSearch(page).fill("zzz-nothing");
  await expect(results).toContainText(c.noResults);

  // Keyboard: arrow into the list, Enter on a result expands its path and opens the drawer.
  await roadmapSearch(page).fill("joins");
  await page.keyboard.press("ArrowDown");
  await expect(results.locator("button").first()).toBeFocused();
  await results.locator('[data-result="lesson:database-joins"]').click();
  await expect(roadmapNode(page, "path:database")).toHaveAttribute("aria-expanded", "true");
  await expect(roadmapNode(page, "lesson:database-joins")).toHaveAttribute(isMobile(page) ? "class" : "aria-pressed", isMobile(page) ? /act/ : "true");
  await expect(drawer(page).locator("h2")).toHaveText(missions.find(m => m.id === "database-joins")!.title.en);
  await expect(page.locator(".crumb nav")).toContainText("Database Development");

  // Searching a group expands it without opening the drawer.
  await roadmapSearch(page).fill("Transports");
  await page.locator('[data-result="tgroup:trn"]').click();
  await expect(roadmapNode(page, "tgroup:trn")).toHaveAttribute("aria-expanded", "true");
  await expect(drawer(page)).not.toHaveClass(/open/);
});

test("lessons open full width from the drawer and Back to roadmap reveals them again", async ({ page }) => {
  await page.goto("/");
  await openPath(page, "database");
  await roadmapNode(page, "lesson:database-joins").click();
  await expect(drawer(page)).toContainText(c.notStarted);
  await drawer(page).getByRole("button", { name: c.openLesson, exact: true }).click();
  await expect(page).toHaveURL(/mission=database-joins/);
  await expect(page.locator(".lesson-summary h1")).toHaveText("Joins: combine two tables");
  await expect(page.locator(".roadmap-home")).toHaveCount(0);
  await expect(page.getByRole("button", { name: c.backToRoadmap, exact: true })).toBeFocused();
  await page.getByRole("button", { name: c.backToRoadmap, exact: true }).click();
  await expect(page).not.toHaveURL(/mission=/);
  await expect(drawer(page).locator("h2")).toHaveText("Joins: combine two tables");
  await expect(drawer(page)).toContainText(c.notStarted); // "In progress" starts with the first challenge attempt
  await expect(roadmapNode(page, "path:database")).toHaveAttribute("aria-expanded", "true");
  // Planned topics show their status but cannot be opened.
  await openPath(page, "oop");
  await page.locator('[data-node^="planned:oop:"] .card, [data-mobile-node^="planned:oop:"]').first().click();
  await expect(drawer(page)).toContainText(c.plannedText);
  await expect(drawer(page).getByRole("button", { name: /Open lesson/ })).toHaveCount(0);
});

test("desktop view controls: zoom buttons, wheel zoom, drag to pan, Fit and Back to ABAP", async ({ page }) => {
  test.skip(isMobile(page), "The mobile accordion has no canvas");
  await page.goto("/");
  const zoom = page.getByLabel(c.zoomLevel);
  const world = page.locator(".world");
  await expect(zoom).toHaveText(/\d+%/);
  const start = await zoom.textContent();
  await page.getByRole("button", { name: c.zoomIn, exact: true }).click();
  await expect(zoom).not.toHaveText(start!);
  const zoomed = await zoom.textContent();
  const box = (await page.locator(".stage").boundingBox())!;
  await page.mouse.move(box.x + 80, box.y + 80);
  await page.mouse.wheel(0, 400);
  await expect(zoom).not.toHaveText(zoomed!);
  const before = await world.evaluate(el => el.style.transform);
  await page.mouse.move(box.x + 60, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + 260, box.y + box.height / 2 + 40, { steps: 6 }); await page.mouse.up();
  await expect.poll(() => world.evaluate(el => el.style.transform)).not.toBe(before);
  await page.getByRole("button", { name: c.fit, exact: true }).click();
  await roadmapNode(page, "learn").click();
  await page.getByRole("toolbar", { name: c.viewControls }).getByRole("button", { name: c.back, exact: true }).click();
  await expect(roadmapNode(page, "learn")).toHaveAttribute("aria-expanded", "false");
  // Hidden nodes are inert, so Tab never lands on them.
  await expect(page.locator('[data-node="path:fundamentals"]')).toHaveJSProperty("inert", true);
});

test("effects panel: modes and toggles apply, are saved per device, and start off for reduced motion", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: c.effects, exact: true }).click();
  const panel = page.getByRole("dialog", { name: c.effectsTitle });
  await expect(panel).toBeVisible();
  await expect(panel.getByLabel(c.network)).toBeChecked();
  await panel.getByText(c.codeRain, { exact: true }).click();
  await panel.getByLabel(c.aurora).uncheck();
  await panel.getByLabel(c.flow).uncheck();
  await expect(page.locator(".roadmap-home")).toHaveClass(/noaur/);
  await expect(page.locator(".roadmap-home")).toHaveClass(/noflow/);
  if (!isMobile(page)) await expect(page.locator(".flow").first()).toHaveCSS("display", "none");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await page.reload();
  await page.getByRole("button", { name: c.effects, exact: true }).click();
  await expect(page.getByRole("dialog", { name: c.effectsTitle }).getByLabel(c.codeRain)).toBeChecked();
  await expect(page.locator(".roadmap-home")).toHaveClass(/noaur/);

  const reduced = await page.context().newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.evaluate(() => localStorage.removeItem("abap2-roadmap-effects")).catch(() => {});
  await reduced.goto("/");
  await reduced.evaluate(() => localStorage.removeItem("abap2-roadmap-effects"));
  await reduced.reload();
  await reduced.getByRole("button", { name: c.effects, exact: true }).click();
  await expect(reduced.getByRole("dialog", { name: c.effectsTitle }).getByLabel(c.none)).toBeChecked();
  for (const name of ["noaur", "nogrid", "noflow"]) await expect(reduced.locator(".roadmap-home")).toHaveClass(new RegExp(name));
});

test("old list links open the lesson view; history, reload and saved progress are kept", async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem("abap2-master-progress")) localStorage.setItem("abap2-master-progress", JSON.stringify({ version: 2, missions: ["structures"], labs: ["orientation"], results: { structures: { attempts: 2, passed: true } } })); });
  await page.goto("/?layout=list&mission=structures&keep=value");
  await expect(page.locator(".lesson-summary h1")).toHaveText("Create a structure");
  await expect.poll(() => new URL(page.url()).searchParams.has("layout")).toBe(false);
  expect(new URL(page.url()).searchParams.get("keep")).toBe("value");
  await expect(page.getByRole("button", { name: /^(List view|عرض القائمة)$/ })).toHaveCount(0);
  await page.getByRole("button", { name: ui.en.home, exact: true }).click();
  await expect(roadmapNode(page, "learn")).toBeVisible();
  await page.goBack(); await expect(page.locator(".lesson-summary h1")).toHaveText("Create a structure");
  await page.reload(); await expect(page.locator(".lesson-summary h1")).toHaveText("Create a structure");
  const saved = await progress(page);
  expect(saved.missions).toEqual(["structures"]); expect(saved.results.structures).toEqual({ attempts: 2, passed: true });
  await expect(page.locator("header .language")).toHaveCount(0);
});

test("lesson return restores active tab and execution step", async ({ page }) => {
  await page.goto("/?mission=structures");
  await page.getByRole("tab", { name: "Explore code", exact: true }).click();
  await page.getByRole("button", { name: ui.en.run, exact: true }).click();
  await page.locator(".execution-controls").getByRole("button", { name: ui.en.next, exact: true }).click();
  const statement = await page.locator(".active-statement").textContent();
  await leaveAndReturn(page);
  await expect(page.getByRole("tab", { name: "Explore code", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".active-statement")).toHaveText(statement!);
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  await leaveAndReturn(page);
  await expect(page.getByRole("tab", { name: "Challenge", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("guided assessment restores partial predictions and feedback after lesson return", async ({ page }) => {
  await page.goto("/?mission=data-keys");
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  await page.locator(".key-explorer").getByRole("button", { name: "Check identity design", exact: true }).click();
  const feedback = await page.locator(".key-explorer [role=status]").last().textContent();
  await leaveAndReturn(page);
  await expect(page.getByRole("tab", { name: "Challenge", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".key-explorer [role=status]").last()).toHaveText(feedback!);
});

test("lesson completion keeps legacy rewards, requires assessment and avoids duplicate XP", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("abap2-master-progress", JSON.stringify({ version: 2, labs: ["orientation"], missions: ["structures"], results: { structures: { attempts: 2, passed: true } }, current: "structures" })));
  await page.goto("/?mission=addition");
  const m = missions.find(m => m.id === "addition")!;
  const before = earnedXP(await progress(page));
  expect(before).toBe(175);
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  await expect(page.getByRole("button", { name: ui.en.complete, exact: true })).toBeDisabled();
  await edit(page, "WRITE 30.");
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await expect(page.locator(".feedback.warning")).toBeVisible();
  await edit(page, m.solution);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await page.getByRole("button", { name: ui.en.complete, exact: true }).click();
  await expect.poll(async () => earnedXP(await progress(page))).toBe(before + m.xp);
  await page.getByRole("button", { name: ui.en.completed, exact: true }).click();
  const after = await progress(page);
  expect(after.missions).toEqual(["structures", "addition"]);
  expect(earnedXP(after)).toBe(before + m.xp);
  expect(after.results.structures.attempts).toBe(2);
  // The roadmap marks the completed lesson.
  await page.getByRole("button", { name: c.backToRoadmap, exact: true }).click();
  await expect(roadmapNode(page, "lesson:addition")).toHaveAccessibleName(new RegExp(`, ${c.completed}$`));
});

test("orientation: tabs, simulation, Monaco draft, assessment, reload and once-only XP", async ({ page }) => {
  const tc = treeCopy.en, t = ui.en, errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?mission=orientation");
  await expect(page.getByRole("tab")).toHaveCount(3);
  await page.getByRole("tab", { name: tc.learn, exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: tc.visualize, exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: tc.learn, exact: true })).toBeFocused();
  const runner = page.locator("[data-lesson-runner]");
  await runner.getByRole("button", { name: "Run next line", exact: true }).click();
  await expect(runner.locator(".add-progress")).toContainText("Line 1 of 1");
  await page.getByRole("tab", { name: tc.visualize, exact: true }).click();
  await page.getByRole("button", { name: t.run, exact: true }).click();
  await expect(page.locator(".active-statement")).toBeVisible();
  await page.getByRole("tab", { name: tc.challenge, exact: true }).click();
  await edit(page, "WRITE 5.\nWRITE 8.");
  await page.getByRole("button", { name: t.check, exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await page.getByRole("tab", { name: tc.learn, exact: true }).click();
  await expect(runner.locator(".add-progress")).toContainText("Line 1 of 1");
  await page.getByRole("tab", { name: tc.challenge, exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await page.getByRole("button", { name: t.complete, exact: true }).click();
  await expect.poll(async () => (await progress(page)).labs).toContain("orientation");
  await page.evaluate(() => localStorage.setItem("abap2-language", "ar"));
  await page.reload();
  await page.getByRole("tab", { name: tc.challenge, exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".monaco-editor").filter({ visible: true })).toContainText("WRITE 8.");
  expect((await progress(page)).labs.filter((id: string) => id === "orientation")).toHaveLength(1);
  expect(errors).toEqual([]);
});

for (const id of ["structures", "conditions", "do", "data-table-model", "data-keys"]) test(`${id}: anatomy, visualization and semantic challenges preserve drafts`, async ({ page }) => {
  const m = missions.find(m => m.id === id);
  test.skip(!m, "Only existing implemented mission IDs are accepted");
  await page.goto(`/?mission=${id}`);
  await expect(page.locator(".lesson-summary h1")).toHaveText(m!.title.en);
  await page.getByRole("tab", { name: "Explore code", exact: true }).click();
  await page.getByRole("button", { name: ui.en.run, exact: true }).click();
  await expect(page.locator(".active-statement")).toBeVisible();
  if (id === "structures") {
    const next = page.locator(".execution-controls").getByRole("button", { name: ui.en.next, exact: true });
    await next.click(); await next.click(); await next.click();
    await expect(page.getByTestId("memory")).toContainText("Ahmed");
    await page.locator(".execution-controls").getByRole("button", { name: ui.en.previous, exact: true }).click();
    await expect(page.getByTestId("memory")).not.toContainText("Ahmed");
    await page.locator(".timeline li button").last().click();
    await expect(page.locator(".output-card")).toContainText("Ahmed");
  }
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  const challenge = m!.challenges?.[0] || m!;
  await edit(page, challenge.solution);
  await page.getByRole("button", { name: ui.en.check, exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await page.getByRole("tab", { name: "Learn", exact: true }).click();
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await openLesson(page, id);
  await page.getByRole("tab", { name: "Challenge", exact: true }).click();
  await expect(page.locator(".feedback.success")).toBeVisible();
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), `abap2-workspace:${id}:challenge:${challenge.id}`)).toBe(challenge.solution);
  expect((await progress(page)).missions).not.toContain(id);
});
