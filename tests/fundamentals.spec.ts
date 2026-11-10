import { enabledLocales } from "../src/lib/language-policy";
import { test, expect } from '@playwright/test';
import { missions } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { openLesson, answerQuiz, edit, gradeAll, completion } from './academy-helpers';
import { matchAnatomy, finishLearn } from './anatomy-helpers';
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
            await finishLearn(page, lang);
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
            // English challenges have no quick check: passing the challenge alone enables completion.
            await expect(completion(page, lang)).toBeEnabled();
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
