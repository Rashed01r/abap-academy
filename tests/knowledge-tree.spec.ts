import { enabledLocales } from "../src/lib/language-policy";
import { test, expect, type Page } from "@playwright/test";
import { missions } from "../src/lib/curriculum";
import { ui } from "../src/lib/i18n";
import { treeCopy } from "../src/lib/tree-copy";
import { earnedXP } from "../src/lib/progress";

async function edit(page: Page, code: string) {
  const editor = page.getByRole("tabpanel").getByRole("textbox");
  await expect(editor).toBeVisible();
  await editor.focus();await page.keyboard.press("ControlOrMeta+A");await page.keyboard.insertText(code);
}
async function geometry(page: Page, rtl = false) {
  await expect(page.locator('[data-connector="lesson"]')).toHaveCount(1);
  const result = await page.evaluate(() => {
    const topic = document.querySelector('[data-topic-node][aria-pressed="true"]')!.getBoundingClientRect();
    const lesson = document.querySelector('[data-lesson-node]')!.getBoundingClientRect();
    const d = document.querySelector('[data-connector="lesson"]')!.getAttribute("d")!;
    const canvas = document.querySelector<HTMLElement>('.tree-canvas')!;
    const box = canvas.getBoundingClientRect(), scale = box.width / canvas.offsetWidth;
    return {topic: {left:topic.left,right:topic.right,top:topic.top,bottom:topic.bottom}, lesson:{left:lesson.left,right:lesson.right,top:lesson.top}, d, box:{left:box.left,top:box.top}, scale};
  });
  expect(rtl ? result.lesson.right < result.topic.left : result.lesson.left > result.topic.right).toBeTruthy();
  expect(Math.abs(result.lesson.top - result.topic.top)).toBeLessThan(10);
  expect(result.d).not.toContain("NaN");
  const coordinates = result.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  // Check rendered pixels: low zoom amplifies subpixel DOM rounding in graph units.
  expect(Math.abs(coordinates[0] * result.scale - ((rtl ? result.topic.left : result.topic.right) - result.box.left))).toBeLessThan(2);
  expect(Math.abs(coordinates[1] * result.scale - ((result.topic.top + result.topic.bottom) / 2 - result.box.top))).toBeLessThan(2);
  expect(Math.abs(coordinates[6] * result.scale - ((rtl ? result.lesson.right : result.lesson.left) - result.box.left))).toBeLessThan(2);
}

test("Knowledge Tree is the only learning layout, including old list links and browser history", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('abap2-master-progress',JSON.stringify({version:2,missions:['structures'],labs:['orientation'],results:{structures:{attempts:2,passed:true}}})));
  await page.goto('/?layout=list&mission=structures&keep=value');
  await expect(page.locator('.knowledge-tree')).toBeVisible();
  await expect(page.locator('.lesson-summary h1')).toHaveText('Create a structure');
  await expect.poll(()=>new URL(page.url()).searchParams.has('layout')).toBe(false);
  expect(new URL(page.url()).searchParams.get('keep')).toBe('value');
  await expect(page.getByRole('button',{name:/^(List view|عرض القائمة)$/})).toHaveCount(0);
  await expect(page.locator('.roadmap,.mission-engine,.hero')).toHaveCount(0);
  await page.getByRole('button',{name:ui.en.home,exact:true}).click();
  await expect(page.locator('.tree-paths>button')).toHaveCount(9);
  await page.goBack();await expect(page.locator('.lesson-summary h1')).toHaveText('Create a structure');
  await page.reload();await expect(page.locator('.knowledge-tree')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('abap2-master-progress')!));
  expect(saved.missions).toEqual(['structures']);expect(saved.results.structures).toEqual({attempts:2,passed:true});
  await expect(page.locator('header .language')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/^(List view|عرض القائمة)$/})).toHaveCount(0);
});

test("viewport workspace anchors header search while graph moves in enabled languages", async ({page}, info) => {
  await page.goto('/?mission=orientation');
  if (info.project.name === 'mobile') await page.getByRole('button', {name:treeCopy.en.restore, exact:true}).first().click();
  for (const lang of enabledLocales) {
    if (lang === 'ar') await page.getByRole('button', {name:'العربية', exact:true}).click();
    const header = page.locator('.immersive-academy > header');
    await expect(header.getByRole('searchbox')).toBeVisible();
    const before = await header.boundingBox();
    expect(before!.height).toBeLessThan(info.project.name === 'desktop' ? 90 : 190);
    await header.locator('.glossary summary').click();
    const glossary = await header.locator('.glossary dl').boundingBox();
    expect(glossary!.x).toBeGreaterThanOrEqual(0);
    expect(glossary!.x + glossary!.width).toBeLessThanOrEqual(info.project.name === 'desktop' ? 1440 : 390);
    expect(await header.boundingBox()).toEqual(before);
    await header.locator('.glossary summary').click();
    await page.getByRole('button', {name:treeCopy[lang].zoomOut, exact:true}).click();
    await page.locator('.tree-viewport').evaluate(el => {el.scrollLeft += 150; el.scrollTop += 100;});
    expect(await header.boundingBox()).toEqual(before);
    const sizes = await page.evaluate(() => {
      const tree = document.querySelector('.tree-viewport')!.getBoundingClientRect();
      return {bottom:tree.bottom, width:tree.width, height:innerHeight, screenWidth:innerWidth, documentHeight:document.documentElement.scrollHeight, documentWidth:document.documentElement.scrollWidth};
    });
    expect(Math.abs(sizes.bottom - sizes.height)).toBeLessThan(2);
    expect(sizes.width).toBe(sizes.screenWidth);
    expect(sizes.documentHeight).toBe(sizes.height);
    expect(sizes.documentWidth).toBe(sizes.screenWidth);
    await page.getByRole('button', {name:treeCopy[lang].center, exact:true}).click();
    await geometry(page, lang === 'ar');
    await page.getByLabel(ui[lang].appearance, {exact:true}).selectOption(lang === 'en' ? 'light' : 'dark');
    await page.screenshot({path:`test-results/immersive-${lang}-${info.project.name}.png`, animations:'disabled'});
  }
});

// The English Learn tab no longer has a selectable code anatomy, so only the tab and execution step are restored.
test("topic return restores active tab and execution step", async ({page}) => {
  await page.goto('/?mission=structures');
  await page.getByRole('tab', {name:'Explore code', exact:true}).click();
  await page.getByRole('button', {name:ui.en.run, exact:true}).click();
  await page.locator('.execution-controls').getByRole('button', {name:ui.en.next, exact:true}).click();
  const statement = await page.locator('.active-statement').textContent();
  await page.getByPlaceholder(treeCopy.en.search).fill('Syntax Orientation');
  await page.locator('.tree-search-results button').first().click();
  await page.goBack();
  await expect(page.getByRole('tab', {name:'Explore code', exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.active-statement')).toHaveText(statement!);
  await page.getByRole('tab', {name:'Challenge', exact:true}).click();
  await page.getByPlaceholder(treeCopy.en.search).fill('Syntax Orientation');
  await page.locator('.tree-search-results button').first().click();
  await page.goBack();
  await expect(page.getByRole('tab', {name:'Challenge', exact:true})).toHaveAttribute('aria-selected','true');
});

test("guided assessment restores partial predictions and feedback after topic return", async ({page}) => {
  await page.goto('/?mission=data-keys');
  await page.getByRole('tab', {name:'Challenge', exact:true}).click();
  await page.locator('.key-explorer').getByRole('button', {name:'Check identity design', exact:true}).click();
  const feedback = await page.locator('.key-explorer [role=status]').last().textContent();
  await page.getByPlaceholder(treeCopy.en.search).fill('Syntax Orientation');
  await page.locator('.tree-search-results button').first().click();
  await page.goBack();
  await expect(page.getByRole('tab', {name:'Challenge', exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.key-explorer [role=status]').last()).toHaveText(feedback!);
});

test("root, nine paths, expansion, search, geometry, zoom, history and honest previews", async ({page}, info) => {
  await page.goto("/");
  await expect(page.locator('[data-tree-id="root"]')).toHaveText(/SAP ABAP/);
  await expect(page.locator('.tree-paths > button')).toHaveCount(9);
  await expect(page.locator('[data-connector]')).toHaveCount(9);
  await page.locator('[data-tree-id="fundamentals"]').click();
  await page.locator('[data-tree-id="orientation"]').click();
  if (info.project.name === "mobile") await page.getByRole("button", {name: treeCopy.en.restore, exact:true}).first().click();
  await geometry(page);
  await page.getByRole("button", {name: treeCopy.en.zoomOut, exact:true}).click();
  await geometry(page);
  await page.getByRole("button", {name: treeCopy.en.fit, exact:true}).click();
  await geometry(page);
  await page.getByRole("button", {name: treeCopy.en.reset, exact:true}).click();
  if (info.project.name === 'desktop') {
    await page.getByRole('button', {name:treeCopy.en.resizeWidth, exact:true}).focus();
    for (let i=0;i<4;i++) await page.keyboard.press('Shift+ArrowRight');
    await expect(page.locator('[data-lesson-node]')).toHaveCSS('width', '1100px');
    await geometry(page);
    const gap = await page.evaluate(() => {
      const node = document.querySelector('[data-topic-node][aria-pressed=true]')!.getBoundingClientRect();
      const view = document.querySelector('.tree-viewport')!.getBoundingClientRect();
      return {x:node.right+35, y:view.top+20, scroll:document.querySelector('.tree-viewport')!.scrollLeft};
    });
    await page.mouse.move(gap.x, gap.y);await page.mouse.down();await page.mouse.move(gap.x-100, gap.y);await page.mouse.up();
    expect(await page.locator('.tree-viewport').evaluate(el => el.scrollLeft)).toBeGreaterThan(gap.scroll);
  }
  await page.locator('[data-tree-id="orientation"]').focus();
  await page.keyboard.press('ArrowDown');await expect(page.locator('[data-tree-id="addition"]')).toBeFocused();
  await page.getByPlaceholder(treeCopy.en.search).fill("Create a structure");
  await page.locator('.tree-search-results').getByRole("button", {name: "Create a structure", exact:true}).click();
  await expect(page).toHaveURL(/mission=structures/);
  await page.goBack();await expect(page).toHaveURL(/mission=orientation/);
  await expect(page.locator('.lesson-summary h1')).toHaveText(ui.en.orientation);
  await page.goForward();await expect(page.locator('.lesson-summary h1')).toHaveText("Create a structure");
  await page.getByRole("button", {name: treeCopy.en.root, exact:true}).click();
  await page.locator('[data-tree-id="cloud"]').click();
  await page.locator('.future-topic').first().click();
  await expect(page.locator('[data-lesson-node]')).toContainText(treeCopy.en.preview);
  await expect(page.getByRole("tab")).toHaveCount(0);
  await page.getByPlaceholder(treeCopy.en.search).fill('CDS Associations');
  await page.locator('.tree-search-results').getByRole('button', {name:`CDS Associations · ${ui.en.comingSoon}`, exact:true}).click();
  await expect(page.locator('[data-lesson-node] h2')).toHaveText('CDS Associations');
  await expect(page.getByRole('tab')).toHaveCount(0);
  await page.locator('.tree-viewport').evaluate(el => {el.scrollLeft = el.scrollWidth;});
  await page.getByPlaceholder(treeCopy.en.search).fill('ABAP Dictionary');
  await page.locator('.tree-search-results .tree-path-result').filter({has:page.getByText('ABAP Dictionary', {exact:true})}).click();
  await expect(page.locator('[data-tree-id="dictionary"]')).toHaveAttribute('aria-expanded','true');
  await expect.poll(() => page.locator('[data-tree-id="dictionary"]').evaluate(el => {
    const node = el.getBoundingClientRect(), viewport = document.querySelector('.tree-viewport')!.getBoundingClientRect();
    return node.left >= viewport.left && node.right <= viewport.right;
  })).toBeTruthy();
});

test("tree completion retains legacy rewards, requires assessment and avoids duplicate XP", async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('abap2-master-progress', JSON.stringify({version:2,labs:['orientation'],missions:['structures'],results:{structures:{attempts:2,passed:true}},current:'structures'})));
  await page.goto('/?mission=addition');
  const m = missions.find(m => m.id === 'addition')!;
  const readProgress = () => page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
  const before = earnedXP(await readProgress());
  expect(before).toBe(175);
  await page.getByRole('tab', {name:'Challenge', exact:true}).click();
  await expect(page.getByRole('button', {name:ui.en.complete, exact:true})).toBeDisabled();
  await edit(page, "WRITE 30.");
  await page.getByRole('button', {name:ui.en.check, exact:true}).click();
  await expect(page.locator('.feedback.warning')).toBeVisible();
  await edit(page, m.solution);
  await page.getByRole('button', {name:ui.en.check, exact:true}).click();
  await page.getByRole('button', {name:ui.en.complete, exact:true}).click();
  await expect.poll(async () => earnedXP(await readProgress())).toBe(before + m.xp);
  await page.getByRole('button', {name:ui.en.completed, exact:true}).click();
  const after = await readProgress();
  expect(after.missions).toEqual(['structures','addition']);
  expect(earnedXP(after)).toBe(before + m.xp);
  expect(after.results.structures.attempts).toBe(2);
});

for (const lang of enabledLocales) test(`${lang}: orientation tabs, simulation, Monaco draft, assessment, theme, reload and once-only XP`, async ({page}, info) => {
  const c = treeCopy[lang], t = ui[lang], errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?mission=orientation");
  if (lang === "ar") await page.getByRole("button", {name:"العربية", exact:true}).click();
  if (info.project.name === "desktop") await geometry(page, lang === "ar");
  await expect(page.getByRole("tab")).toHaveCount(3);
  await page.getByRole('tab', {name:c.learn, exact:true}).focus();
  await page.keyboard.press(lang === 'ar' ? 'ArrowLeft' : 'ArrowRight');
  await expect(page.getByRole('tab', {name:c.visualize, exact:true})).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', {name:c.learn, exact:true})).toBeFocused();
  // Learn's runner keeps its position while the learner visits the other tabs.
  const runner = page.locator('[data-lesson-runner]');
  await runner.getByRole('button', {name:'Run next line', exact:true}).click();
  await expect(runner.locator('.add-progress')).toContainText('Line 1 of 1');
  await page.getByRole("tab", {name:c.visualize, exact:true}).click();
  await page.getByRole("button", {name:t.run, exact:true}).click();
  await expect(page.locator('.active-statement')).toBeVisible();
  await page.getByRole("tab", {name:c.challenge, exact:true}).click();
  await edit(page, "WRITE 5.\nWRITE 8.");
  await page.getByRole("button", {name:t.check, exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await page.getByRole("tab", {name:c.learn, exact:true}).click();
  await expect(runner.locator('.add-progress')).toContainText('Line 1 of 1');
  await page.getByRole("tab", {name:c.challenge, exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await page.getByRole("button", {name:t.complete, exact:true}).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!).labs)).toContain("orientation");
  await page.getByLabel(t.appearance, {exact:true}).selectOption('dark');
  await expect(page.locator("header .language")).toHaveCount(0);
  await page.evaluate(()=>localStorage.setItem("abap2-language","ar"));
  await expect(page.locator('.feedback.success')).toBeVisible();
  await page.reload();
  await page.getByRole("tab", {name:treeCopy[lang].challenge, exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(page.locator('.monaco-editor').filter({visible:true})).toContainText('WRITE 8.');
  const p = await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!));
  expect(p.labs.filter((id:string) => id === 'orientation')).toHaveLength(1);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/tree-${lang}-${info.project.name}.png`, fullPage:true});
});

for (const id of ["structures", "conditions", "do", "data-table-model", "data-keys"]) test(`${id}: integrated anatomy, visualization and semantic challenges preserve drafts`, async ({page}, info) => {
  const m = missions.find(m => m.id === id);
  test.skip(!m, "Only existing implemented mission IDs are accepted");
  await page.goto(`/?mission=${id}`);
  await expect(page.locator('.lesson-summary h1')).toHaveText(m!.title.en);
  if (info.project.name === 'desktop') await geometry(page);
  await page.getByRole("tab", {name:'Explore code', exact:true}).click();
  await page.getByRole("button", {name:ui.en.run, exact:true}).click();
  await expect(page.locator('.active-statement')).toBeVisible();
  if (id === 'structures') {
    const next = page.locator('.execution-controls').getByRole('button', {name:ui.en.next, exact:true});
    await next.click();await next.click();await next.click();
    await expect(page.getByTestId('memory')).toContainText('Ahmed');
    await page.locator('.execution-controls').getByRole('button', {name:ui.en.previous, exact:true}).click();
    await expect(page.getByTestId('memory')).not.toContainText('Ahmed');
    await page.locator('.timeline li button').last().click();
    await expect(page.locator('.output-card')).toContainText('Ahmed');
  }
  await page.getByRole("tab", {name:'Challenge', exact:true}).click();
  const challenge = m!.challenges?.[0] || m!;
  await edit(page, challenge.solution);
  await page.getByRole("button", {name:ui.en.check, exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await page.getByRole("tab", {name:'Learn', exact:true}).click();
  await page.getByRole("tab", {name:'Challenge', exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await page.getByRole("button", {name:treeCopy.en.root, exact:true}).click();
  await page.getByPlaceholder(treeCopy.en.search).fill(m!.title.en);
  await page.locator('.tree-search-results').getByRole("button", {name:m!.title.en, exact:true}).click();
  await page.getByRole("tab", {name:'Challenge', exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), `abap2-workspace:${id}:challenge:${challenge.id}`)).toBe(challenge.solution);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('abap2-master-progress')!).missions)).not.toContain(id);
});
