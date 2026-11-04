import { test, expect } from '@playwright/test';
import { missions, structureExample } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { treeCopy } from '../src/lib/tree-copy';
import { openLesson, tab, answerQuiz, edit, gradeAll, completion } from './academy-helpers';
import { matchAnatomy } from './anatomy-helpers';
for (const lang of ['en', 'ar'] as const)
    for (const theme of ['light', 'dark'] as const)
        test(`${lang} ${theme}: complete orientation, missions and persist rewards`, async ({ page }, info) => {
            const t = ui[lang], errors: string[] = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(({ lang, theme }) => { localStorage.setItem('abap2-language', lang); localStorage.setItem('abap2-appearance', theme); }, { lang, theme });
            await page.goto('/');
            await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
            await openLesson(page, 'structures', lang);
            await expect(page.locator('.lesson-summary h1')).toHaveText(missions[1].title[lang]);
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await openLesson(page, 'orientation', lang);
            await matchAnatomy(page, 'orientation', lang);
            await page.getByRole('button', { name: t.finishOrientation, exact: true }).click();
            await expect(page.locator('.header-xp')).toContainText('0');
            await tab(page, lang, 'challenge');
            await edit(page, 'WRITE 5.\nWRITE 8.');
            await page.getByRole('button', { name: t.check, exact: true }).click();
            await expect(page.locator('.feedback.success').filter({ visible: true })).toBeVisible();
            await answerQuiz(page, 0);
            await completion(page, lang).click();
            await expect(page.locator('.header-xp')).toContainText('25');
            for (const [i, m] of missions.slice(0, 2).entries()) {
                await openLesson(page, m.id, lang);
                await matchAnatomy(page, m.id, lang);
                await page.getByRole('button', { name: t.syntaxDone, exact: true }).click();
                await page.getByRole('button', { name: t.run, exact: true }).click();
                const active = page.getByRole('tabpanel');
                await expect(active.locator('.execution-pointer')).toHaveCount(1);
                await expect(active.locator('.active-statement')).toHaveAttribute('data-start-line', '1');
                if (i === 1)
                    await expect(active.locator('.active-statement')).toHaveAttribute('data-end-line', '4');
                await active.locator('.execution-controls').getByRole('button', { name: t.next, exact: true }).click();
                await expect(active.getByTestId('memory')).not.toContainText(t.noMemory);
                await page.getByRole('button', { name: t.reset, exact: true }).click();
                await expect(page.getByRole('dialog')).toBeVisible();
                await page.getByRole('button', { name: t.cancel, exact: true }).click();
                await gradeAll(page, m, lang, i === 0 ? 'WRITE 30.' : m.solution.replace('quantity = 12', 'quantity = 1'));
                await answerQuiz(page, m.answer);
                await completion(page, lang).click();
            }
            await expect(page.locator('.header-xp')).toContainText('275');
            const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
            expect(saved.labs).toEqual(expect.arrayContaining(['orientation', 'addition', 'structures']));
            expect(saved.missions).toEqual(['addition', 'structures']);
            await page.reload();
            await expect(page.locator('.header-xp')).toContainText('275');
            await expect(page.locator('html')).toHaveAttribute('lang', lang);
            await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
            await page.screenshot({ path: info.outputPath('academy.png') });
            expect(errors).toEqual([]);
        });
test("synchronized trace: next, previous, restart, play, edits, locale, and theme", async ({ page, }, info) => {
    await page.goto("/");
    await page
        .getByRole("button", { name: ui.en.playground, exact: true })
        .click();
    await page.getByRole("button", { name: ui.en.run, exact: true }).click();
    await expect(page.locator(".execution-pointer")).toHaveCount(1);
    const controls = page.locator(".execution-controls");
    for (let i = 0; i < 3; i++)
        await controls.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByTestId("memory")).toContainText("13");
    await controls.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(page.getByTestId("memory").locator(".memory-card").last()).toContainText("0");
    await page.getByRole("button", { name: "العربية", exact: true }).click();
    await expect(page.locator(".active-statement")).toHaveAttribute("data-start-line", "3");
    await expect(page.locator(".editor-shell")).toHaveAttribute("dir", "ltr");
    await page.getByLabel(ui.ar.appearance, { exact: true }).selectOption("dark");
    await expect(page.locator(".editor-shell")).toHaveAttribute("data-editor-theme", "dark");
    await expect(page.locator(".active-statement")).toHaveAttribute("data-start-line", "3");
    await controls
        .getByRole("button", { name: ui.ar.restart, exact: true })
        .click();
    await expect(page.locator(".active-statement")).toHaveAttribute("data-start-line", "1");
    await controls.getByRole("button", { name: ui.ar.play, exact: true }).click();
    await expect(page.locator(".active-statement")).toHaveAttribute("data-start-line", "2", { timeout: 4000 });
    await controls
        .getByRole("button", { name: ui.ar.pause, exact: true })
        .click();
    await edit(page, "DATA lv_age TYPE i\nlv_age = 25.");
    await expect(page.locator(".execution-pointer")).toHaveCount(0);
    await expect(page.locator(".timeline")).toHaveCount(0);
    await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
    await expect(page.locator(".feedback.error")).toContainText("النقطة");
    await expect(page.locator(".error-range")).not.toHaveCount(0);
    await edit(page, structureExample);
    await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
    await expect(page.locator(".active-statement")).toHaveAttribute("data-end-line", "4");
    await controls.getByRole("button", { name: ui.ar.next, exact: true }).click();
    await page
        .locator(".view-line")
        .filter({ hasText: "ls_employee-name = 'Ahmed'." })
        .click({ position: { x: 35, y: 8 } });
    await expect(page.locator(".selected-field")).toContainText("ls_employee-name");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({
        path: `test-results/${info.project.name}-workspace.png`,
        fullPage: true,
    });
});
test("conditional trace skips unchosen WRITE and displays condition", async ({ page, }) => {
    await page.goto("/");
    await page
        .getByRole("button", { name: ui.en.playground, exact: true })
        .click();
    await page
        .getByRole("button", { name: ui.en.conditionDemo, exact: true })
        .click();
    await page.getByRole("button", { name: ui.en.run, exact: true }).click();
    const next = page
        .locator(".execution-controls")
        .getByRole("button", { name: "Next", exact: true });
    await next.click();
    await expect(page.locator(".condition-card")).toContainText("1200 >= 1000 → TRUE");
    await expect(page.locator(".skipped-code")).not.toHaveCount(0);
    await next.click();
    await expect(page.getByTestId("output")).toHaveText("Approved");
    await next.click();
    await expect(page.locator(".active-statement")).toContainText("ENDIF.");
    await expect(page.locator(".timeline li")).toHaveCount(4);
    await expect(page.getByTestId("output")).toHaveText("Approved");
    await expect(page.locator(".timeline li>button").filter({ hasText: "WRITE 'Review'" })).toHaveCount(0);
});
test('system appearance follows OS and future topics have connected previews', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('[data-tree-id=projects]').click();
    await page.locator('.future-topic').first().click();
    await expect(page.locator('[data-lesson-node]')).toContainText(treeCopy.en.preview);
    await expect(page.getByRole('tab')).toHaveCount(0);
    await page.getByRole('button', { name: treeCopy.en.root, exact: true }).click();
    await expect(page.locator('[data-lesson-node]')).toHaveCount(0);
});
