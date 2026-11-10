import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import { test, expect } from '@playwright/test';
import { missions } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { openLesson, tab, answerQuiz, edit, gradeAll, completion, openPath, roadmapNode } from './academy-helpers';
import { matchAnatomy, finishLearn } from './anatomy-helpers';
for (const lang of enabledLocales)
    for (const theme of ['light', 'dark'] as const)
        test(`${lang} ${theme}: complete orientation, missions and persist rewards`, async ({ page }, info) => {
            const t = ui[lang], errors: string[] = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(({ lang, theme }) => { localStorage.setItem('abap2-language', lang); localStorage.setItem('abap2-appearance', theme); }, { lang, theme });
            await page.goto('/');
            await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
            await openLesson(page, 'structures', lang);
            await expect(page.locator('.lesson-summary h1')).toHaveText(localizedText(missions[1].title, lang));
            await expect(page.getByRole('dialog')).toHaveCount(0);
            await openLesson(page, 'orientation', lang);
            await matchAnatomy(page, 'orientation', lang);
            await finishLearn(page, lang);
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
                // The English addition pilot has no code-anatomy lab; its sandbox is on Explore code.
                if (m.id === 'addition' && lang === 'en') await page.getByRole('tab', { name: 'Explore code', exact: true }).click();
                else {
                    await matchAnatomy(page, m.id, lang);
                    await finishLearn(page, lang);
                }
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
            // English lessons teach the code with the Learn runner, which has no optional lab tick.
            expect(saved.labs).toEqual(expect.arrayContaining(lang === 'en' ? ['orientation'] : ['orientation', 'structures']));
            expect(saved.missions).toEqual(['addition', 'structures']);
            await page.reload();
            await expect(page.locator('.header-xp')).toContainText('275');
            await expect(page.locator('html')).toHaveAttribute('lang', lang);
            await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
            await page.screenshot({ path: info.outputPath('academy.png') });
            expect(errors).toEqual([]);
        });
test('system appearance follows OS and the roadmap collapses from its root', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await openPath(page, 'cloud');
    await expect(page.getByRole('tab')).toHaveCount(0);
    await roadmapNode(page, 'abap').click();
    await expect(page.locator('[data-drawer].open')).toHaveCount(0);
    await expect(roadmapNode(page, 'learn')).toHaveAttribute('aria-expanded', 'false');
});
