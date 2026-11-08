import { localizedText } from "../src/lib/language-policy";
import { expect, type Page } from "@playwright/test";
import { missions, type Mission } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";
import { treeCopy } from "../src/lib/tree-copy";
import type { Locale } from "../src/lib/engine";
export async function openLesson(page: Page, id: string, lang: Locale = "en") {
    const title = id === "orientation" ? ui[lang].orientation : localizedText(missions.find(m => m.id === id)!.title, lang);
    await page.getByRole('searchbox').fill(title);
    await page.locator('.tree-search-results').getByRole('button', { name: title, exact: true }).click();
    await expect(page.locator('.lesson-summary h1')).toHaveText(title);
    const expand = page.getByRole('button', { name: treeCopy[lang].expandWorkspace, exact: true });
    // Mobile enters focus automatically; its initial Expand control can disappear
    // between counting and clicking as the responsive effect finishes.
    if ((page.viewportSize()?.width || 0) > 760 && await expand.count())
        await expand.click();
    await tab(page, lang, 'learn');
}
/** Lesson pictures (VisualClassroom and alternatives) live on Explore code, below the editor. */
export async function openPictures(page: Page, id: string) {
    if (id !== "addition") await tab(page, "en", "visualize");
}
export async function tab(page: Page, lang: Locale, name: 'learn' | 'visualize' | 'challenge') {
    await page.locator(`[role=tab][id$="-${name}-tab"]`).click();
}
export async function edit(page: Page, source: string) {
    const editor = page.getByRole('textbox').first();
    await expect(editor).toBeVisible();
    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.insertText(source);
}
export async function selectChallenge(page: Page, m: Mission, index: number, lang: Locale) {
    await tab(page, lang, 'challenge');
    if (m.challenges)
        await page.getByRole('group', { name: treeCopy[lang].challenge, exact: true }).getByRole('button').nth(index).click();
}
export async function answerQuiz(page: Page, answer: number) {
    // English challenges no longer have a quick check; completion needs only the challenge.
    if (!(await page.getByRole("tabpanel").locator(".quiz").count())) return;
    await page.getByRole('tabpanel').locator('.quiz .answer-options button').nth(answer).click();
}
export function completion(page: Page, lang: Locale) { return page.getByRole('button', { name: ui[lang].complete, exact: true }); }
export async function gradeAll(page: Page, m: Mission, lang: Locale, wrong?: string) {
    for (const [i, ch] of (m.challenges || [m]).entries()) {
        await selectChallenge(page, m, i, lang);
        await expect(completion(page, lang)).toBeDisabled();
        if (wrong) {
            await edit(page, wrong);
            await page.getByRole('button', { name: ui[lang].check, exact: true }).click();
            await expect(page.locator('.feedback.warning').filter({ visible: true })).toBeVisible();
            await expect(completion(page, lang)).toBeDisabled();
        }
        await edit(page, ch.solution);
        await page.getByRole('button', { name: ui[lang].check, exact: true }).click();
        await expect(page.locator('.feedback.success').filter({ visible: true })).toBeVisible();
    }
}
