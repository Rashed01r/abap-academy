import { test, expect } from "@playwright/test";
import { missions } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";
import { openLesson, answerQuiz, edit, selectChallenge, completion } from "./academy-helpers";
import { matchAnatomy } from "./anatomy-helpers";
for (const lang of ["en", "ar"] as const)
    for (const theme of ["light", "dark"] as const)
        test(`${lang} ${theme}: existing foundation migrates into all three Conditions challenges`, async ({ page }, info) => {
            const t = ui[lang], m = missions.find(m => m.id === "conditions")!;
            const errors: string[] = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(({ lang, theme }) => { if (localStorage.getItem('phase2-test-seeded'))
                return; localStorage.setItem('phase2-test-seeded', 'yes'); localStorage.setItem('abap2-language', lang); localStorage.setItem('abap2-appearance', theme); localStorage.setItem('abap2-master-progress', JSON.stringify({ labs: ['orientation', 'addition', 'structures'], missions: ['addition', 'structures'], current: 'structures', results: { addition: { attempts: 2, passed: true } } })); }, { lang, theme });
            await page.goto('/');
            await expect(page.locator('.header-xp')).toContainText('275');
            await openLesson(page, m.id, lang);
            await expect(page.getByRole('button', { name: t.syntaxDone, exact: true })).toBeDisabled();
            await matchAnatomy(page, m.id, lang);
            await page.getByRole('button', { name: t.syntaxDone, exact: true }).click();
            await page.getByRole('button', { name: t.run, exact: true }).click();
            const controls = page.getByRole('tabpanel').locator('.execution-controls');
            await controls.getByRole('button', { name: t.next, exact: true }).click();
            await expect(page.getByRole('tabpanel').locator('.condition-card')).toContainText('1200 >= 1000 → TRUE');
            await expect(page.getByRole('tabpanel').locator('.execution-pointer')).toHaveCount(1);
            await controls.getByRole('button', { name: t.next, exact: true }).click();
            await expect(page.getByRole('tabpanel').getByTestId('output')).toHaveText('Needs approval');
            await controls.getByRole('button', { name: t.previous, exact: true }).click();
            await expect(page.getByRole('tabpanel').getByTestId('output')).toHaveText(t.noOutput);
            await edit(page, m.example.replace('1200', '999'));
            await page.getByRole('button', { name: t.run, exact: true }).click();
            await page.getByRole('tabpanel').locator('.timeline li>button').last().click();
            await expect(page.getByRole('tabpanel').getByTestId('output')).toHaveText('Automatically approved');
            for (const [i, ch] of m.challenges!.entries()) {
                await selectChallenge(page, m, i, lang);
                await expect(completion(page, lang)).toBeDisabled();
                await edit(page, ch.starter + `WRITE '${ch.expected}'.`);
                await page.getByRole('button', { name: t.check, exact: true }).click();
                await expect(page.locator('.feedback.warning').filter({ visible: true })).toBeVisible();
                await expect(completion(page, lang)).toBeDisabled();
                await edit(page, ch.solution);
                await page.getByRole('button', { name: t.check, exact: true }).click();
                await expect(page.locator('.feedback.success').filter({ visible: true })).toBeVisible();
                if (i === 2) {
                    await page.getByRole('tabpanel').locator('.timeline li>button').filter({ hasText: 'ELSEIF' }).click();
                    await expect(page.getByRole('tabpanel').locator('.condition-card')).toContainText('75 >= 50 → TRUE');
                    await expect(page.getByRole('tabpanel').locator('.editor-shell').filter({ visible: true })).toHaveAttribute('dir', 'ltr');
                    await page.screenshot({ path: info.outputPath('conditions.png') });
                }
            }
            await expect(completion(page, lang)).toBeDisabled();
            await answerQuiz(page, m.answer);
            await completion(page, lang).click();
            await expect(page.locator('.header-xp')).toContainText('475');
            await page.reload();
            await expect(page.locator('.header-xp')).toContainText('475');
            const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
            expect(saved.missions).toEqual(['addition', 'structures', 'conditions']);
            expect(saved.results.addition).toEqual({ attempts: 2, passed: true });
            expect(saved.results.conditions.attempts).toBe(6);
            expect(errors).toEqual([]);
        });
test("diagnostics give relevant bilingual advice and permit correction", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: ui.en.playground, exact: true }).click();
    await edit(page, "WRITE missing.");
    await page.getByRole("button", { name: ui.en.run, exact: true }).click();
    await expect(page.locator(".feedback.error")).toContainText("DATA");
    await expect(page.locator(".feedback.error")).toContainText("FIELD-SYMBOLS");
    await page.getByRole("button", { name: "العربية", exact: true }).click();
    await page.getByText(ui.ar.explainWhy, { exact: true }).click();
    await expect(page.locator(".feedback.error")).toContainText("قبل قراءة قيمته");
    await edit(page, "DATA missing TYPE i VALUE 7.\nWRITE missing.");
    await expect(page.locator(".feedback.error")).toHaveCount(0);
    await page.getByRole("button", { name: ui.ar.run, exact: true }).click();
    await page.locator(".timeline li>button").filter({ visible: true }).last().click();
    await expect(page.getByTestId("output").filter({ visible: true })).toHaveText("7");
});
