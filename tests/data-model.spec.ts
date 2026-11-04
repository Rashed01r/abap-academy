import { test, expect } from '@playwright/test';
import { missions } from '../src/lib/curriculum';
import { ui } from '../src/lib/i18n';
import { openLesson, edit, gradeAll, answerQuiz, completion } from './academy-helpers';
import { matchAnatomy } from './anatomy-helpers';
for (const lang of ['en', 'ar'] as const)
    test(`${lang}: returning learner completes the data table model and retains results`, async ({ page }) => {
        const t = ui[lang], errors: string[] = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.addInitScript(({ lang }) => {
            if (localStorage.getItem("fundamentals-seeded"))
                return;
            localStorage.setItem("fundamentals-seeded", "yes");
            localStorage.setItem("abap2-language", lang);
            localStorage.setItem("abap2-appearance", "dark");
            localStorage.setItem("abap2-master-progress", JSON.stringify({ labs: ["orientation", "addition", "structures", "conditions", "do", "while", "tables", "loop-at", "loop-control", "employees"], missions: ["addition", "structures", "conditions", "do", "while", "tables", "loop-at", "loop-control", "employees"], current: "employees", results: { addition: { attempts: 2, passed: true } } }));
        }, { lang });
        await page.goto('/');
        await expect(page.locator('.header-xp')).toContainText('1995');
        const m = missions.find(m => m.id === 'data-table-model')!;
        await openLesson(page, m.id, lang);
        await matchAnatomy(page, m.id, lang);
        await page.getByRole('button', { name: t.syntaxDone, exact: true }).click();
        await edit(page, m.example);
        await page.getByRole('button', { name: t.run, exact: true }).click();
        const controls = page.getByRole('tabpanel').locator('.execution-controls');
        await controls.getByRole('button', { name: t.next, exact: true }).click();
        await expect(page.getByRole('tabpanel').locator('.execution-pointer')).toHaveCount(1);
        await page.getByRole('tabpanel').locator('.timeline li>button').last().click();
        await controls.getByRole('button', { name: t.previous, exact: true }).click();
        await expect(page.getByRole('tabpanel').locator('.active-statement')).toBeVisible();
        await expect(page.getByRole('tabpanel').locator('.editor-shell')).toHaveAttribute('dir', 'ltr');
        await gradeAll(page, m, lang, "WRITE 'Keyboard'. WRITE 'Keyboard'.");
        await expect(completion(page, lang)).toBeDisabled();
        await answerQuiz(page, m.answer);
        await completion(page, lang).click();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
        expect(saved.missions).toEqual(missions.slice(0, 10).map(m => m.id));
        expect(saved.results.addition).toEqual({ attempts: 2, passed: true });
        await expect(page.locator('.header-xp')).toContainText('2215');
        const xp = await page.locator('.header-xp').textContent();
        await page.reload();
        await expect(page.locator('.header-xp')).toHaveText(xp!);
        expect(errors).toEqual([]);
    });
