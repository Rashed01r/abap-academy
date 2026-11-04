import { test, expect } from '@playwright/test';
import { missions, paths } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { treeCopy } from '../src/lib/tree-copy';
import { openLesson, tab, answerQuiz, edit, selectChallenge, completion } from './academy-helpers';
for (const lang of ['en', 'ar'] as const)
    for (const theme of ['light', 'dark'] as const)
        test(`${lang} ${theme}: explore freely, skip labs, earn assessed XP once`, async ({ page }) => {
            const t = ui[lang], c = treeCopy[lang], m = missions.find(m => m.id === 'while')!;
            const errors: string[] = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(({ lang, theme }) => { localStorage.setItem('abap2-language', lang); localStorage.setItem('abap2-appearance', theme); }, { lang, theme });
            await page.goto('/');
            await expect(page.locator('.tree-paths>button')).toHaveCount(paths.length);
            await expect(page.locator('.header-xp')).toContainText('0');
            await openLesson(page, m.id, lang);
            await page.locator('.lesson-summary details summary').click();
            await expect(page.locator('.lesson-summary details')).toContainText(t.recommendedFirst);
            await tab(page, lang, 'challenge');
            const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
            expect((await state()).viewed).toContain(m.id);
            expect((await state()).labs).toEqual([]);
            expect((await state()).missions).toEqual([]);
            await answerQuiz(page, m.answer);
            await expect(completion(page, lang)).toBeDisabled();
            for (const ch of [...m.challenges!].reverse()) {
                await selectChallenge(page, m, m.challenges!.findIndex(c => c.id === ch.id), lang);
                await edit(page, ch.solution);
                await page.getByRole('button', { name: t.check, exact: true }).click();
                await expect(page.locator('.feedback.success').filter({ visible: true })).toBeVisible();
            }
            expect((await state()).missions).toEqual([]);
            await completion(page, lang).click();
            await expect(page.locator('.header-xp')).toContainText(String(m.xp));
            expect((await state()).labs).toEqual([]);
            expect((await state()).missions).toEqual([m.id]);
            await page.getByRole('button', { name: t.completed, exact: true }).click();
            await expect(page.locator('.header-xp')).toContainText(String(m.xp));
            await page.reload();
            await expect(page.locator('.header-xp')).toContainText(String(m.xp));
            await openLesson(page, 'data-table-model', lang);
            await tab(page, lang, 'visualize');
            await page.getByRole('button', { name: t.run, exact: true }).click();
            await expect(page.getByRole('tabpanel').locator('.timeline li')).not.toHaveCount(0);
            await page.getByRole('button', { name: t.path, exact: true }).click();
            await page.locator('[data-tree-id=cloud]').click();
            await page.locator('.future-topic').first().click();
            await expect(page.locator('[data-lesson-node]')).toContainText(c.preview);
            await expect(page.getByRole('tab')).toHaveCount(0);
            await openLesson(page, 'addition', lang);
            await expect(page.locator('.lesson-summary h1')).toHaveText(missions[0].title[lang]);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
            expect(errors).toEqual([]);
        });
