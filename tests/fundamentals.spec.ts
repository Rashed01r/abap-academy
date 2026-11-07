import { enabledLocales } from "../src/lib/language-policy";
import { test, expect } from '@playwright/test';
import { missions } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { openLesson, answerQuiz, edit, gradeAll, completion } from './academy-helpers';
import { matchAnatomy } from './anatomy-helpers';
for (const lang of enabledLocales)
    test(`${lang}: returning learner completes Missions 04-09 and retains results`, async ({ page }) => {
        const t = ui[lang], errors: string[] = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.addInitScript(lang => { if (localStorage.getItem('fundamentals-seeded'))
            return; localStorage.setItem('fundamentals-seeded', 'yes'); localStorage.setItem('abap2-language', lang); localStorage.setItem('abap2-master-progress', JSON.stringify({ labs: ['orientation', 'addition', 'structures', 'conditions'], missions: ['addition', 'structures', 'conditions'], current: 'conditions', results: { addition: { attempts: 2, passed: true } } })); }, lang);
        await page.goto('/');
        await expect(page.locator('.header-xp')).toContainText('475');
        for (const m of missions.slice(3, 9)) {
            await openLesson(page, m.id, lang);
            await matchAnatomy(page, m.id, lang);
            await page.getByRole('button', { name: t.syntaxDone, exact: true }).click();
            await page.getByRole('button', { name: t.run, exact: true }).click();
            await page.getByRole('tabpanel').locator('.execution-controls').getByRole('button', { name: t.next, exact: true }).click();
            await expect(page.getByRole('tabpanel').locator('.execution-pointer')).toHaveCount(1);
            await page.getByRole('tabpanel').locator('.timeline li>button').last().click();
            await page.getByRole('tabpanel').locator('.execution-controls').getByRole('button', { name: t.previous, exact: true }).click();
            await expect(page.getByRole('tabpanel').locator('.active-statement')).toBeVisible();
            await edit(page, m.example);
            await page.getByRole('button', { name: t.run, exact: true }).click();
            await page.getByRole('tabpanel').locator('.timeline li>button').last().click();
            await expect(page.getByRole('tabpanel').locator('.editor-shell')).toHaveAttribute('dir', 'ltr');
            await gradeAll(page, m, lang);
            await expect(completion(page, lang)).toBeDisabled();
            await answerQuiz(page, m.answer);
            await completion(page, lang).click();
        }
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
        expect(saved.missions).toEqual(missions.slice(0, 9).map(m => m.id));
        expect(saved.results.addition).toEqual({ attempts: 2, passed: true });
        const xp = await page.locator('.header-xp').textContent();
        await page.reload();
        await expect(page.locator('.header-xp')).toHaveText(xp!);
        expect(errors).toEqual([]);
    });
test("table row pointer, backward stepping, restart and stale trace invalidation", async ({ page }) => {
    const t = ui.en;
    await page.goto("/");
    await page.getByRole("button", { name: t.playground, exact: true }).click();
    const source = "DATA values TYPE STANDARD TABLE OF i WITH EMPTY KEY. DATA value TYPE i VALUE 4. APPEND value TO values. value = 9. APPEND value TO values. LOOP AT values INTO value. WRITE value. ENDLOOP.";
    await edit(page, source);
    await page.getByRole("button", { name: t.run, exact: true }).click();
    const writes = page.locator(".timeline li>button").filter({ visible: true }).filter({ hasText: "WRITE value" });
    await writes.nth(0).click();
    await expect(page.getByTestId("table-memory").locator("tr.active-row")).toContainText("4");
    await expect(page.getByTestId("output").filter({ visible: true })).toHaveText("4");
    await writes.nth(1).click();
    await expect(page.getByTestId("table-memory").locator("tr.active-row")).toContainText("9");
    await expect(page.getByTestId("output").filter({ visible: true })).toHaveText("4\n9");
    const controls = page.locator(".execution-controls");
    await controls.getByRole("button", { name: t.previous, exact: true }).click();
    await expect(page.getByTestId("output").filter({ visible: true })).toHaveText("4");
    await controls.getByRole("button", { name: t.restart, exact: true }).click();
    await expect(page.getByTestId("output").filter({ visible: true })).toHaveText(t.noOutput);
    await edit(page, "WRITE 7.");
    await expect(page.locator(".timeline li")).toHaveCount(0);
    await expect(page.locator(".execution-pointer").filter({ visible: true })).toHaveCount(0);
});
for (const theme of ["light", "dark"] as const) {
    test(`Saved Arabic preference / English ${theme}: table and loop visual styling is loaded`, async ({ page }, info) => {
        await page.addInitScript(({ theme }) => {
            localStorage.setItem("abap2-language", "ar");
            localStorage.setItem("abap2-appearance", theme);
        }, { theme });
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await page.getByRole("button", { name: ui.en.playground, exact: true }).click();
        await edit(page, "DATA lt_numbers TYPE STANDARD TABLE OF i WITH EMPTY KEY.\nAPPEND 10 TO lt_numbers.\nAPPEND 20 TO lt_numbers.\nDATA lv_number TYPE i.\nLOOP AT lt_numbers INTO lv_number.\n  WRITE lv_number.\nENDLOOP.");
        await page.getByRole("button", { name: ui.en.run, exact: true }).click();
        await page.locator(".timeline li>button").filter({ visible: true }).filter({ hasText: "WRITE lv_number" }).nth(1).click();
        await expect(page.locator(".execution-pointer").filter({ visible: true })).toHaveCount(1);
        const table = page.getByTestId("table-memory");
        await expect(table.locator("tr.active-row")).toContainText("20");
        const styles = await table.locator("tr.active-row").evaluate(row => ({
            padding: parseFloat(getComputedStyle(row.querySelector("td")!).paddingTop),
            outline: getComputedStyle(row).outlineWidth,
        }));
        expect(styles.padding).toBeGreaterThanOrEqual(9);
        expect(styles.outline).toBe("2px");
        await expect(page.getByTestId("loop-counter")).toContainText("2");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        await table.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `test-results/${info.project.name}-ar-table-${theme}.png`, fullPage: true });
        await page.getByTestId("loop-counter").screenshot({ path: `test-results/${info.project.name}-ar-loop-counter-${theme}.png` });
    });
}
