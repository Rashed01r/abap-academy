import { test, expect, type Page } from "@playwright/test";
import { treeCopy } from "../src/lib/tree-copy";
import { panelLayoutKey } from "../src/lib/use-resizable-panel";
import { ui } from "../src/lib/i18n";

const panel = (page: Page) => page.locator('[data-lesson-node]');
async function size(page: Page) {
  return panel(page).evaluate(el => ({width:Number(el.getAttribute('data-panel-width')),height:Number(el.getAttribute('data-panel-height'))}));
}
async function drag(page: Page, edge: string, x: number, y: number) {
  const handle = page.locator(`[data-resize=${edge}]`);
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  const scroll = await page.locator('.tree-viewport').evaluate(el=>el.scrollLeft);
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();await page.mouse.move(box.x+box.width/2+x,box.y+box.height/2+y,{steps:5});await page.mouse.up();
  return scroll;
}
async function connected(page: Page, rtl = false) {
  await expect.poll(() => page.evaluate(rtl => {
    const p = document.querySelector('[data-lesson-node]')!.getBoundingClientRect();
    const t = document.querySelector('[data-topic-node][aria-pressed=true]')!.getBoundingClientRect();
    const graph = document.querySelector<HTMLElement>('.tree-canvas')!;
    const g = graph.getBoundingClientRect(), scale = g.width/graph.offsetWidth;
    const d = document.querySelector('[data-connector=lesson]')?.getAttribute('d') || '';
    const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    return numbers.length === 8 && Math.abs(p.top-t.top)<2 && Math.abs(numbers[6]-((rtl?p.right:p.left)-g.left)/scale)<2;
  },rtl)).toBeTruthy();
}

test('direct edge/corner resizing, cancellation, keyboard, persistence and adaptive content', async ({page}, info) => {
  if(info.project.name==='mobile')await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:1,width:1500,height:900,collapsed:false})),panelLayoutKey);
  await page.goto('/?mission=orientation');
  if (info.project.name === 'mobile') {
    await expect(page.locator('.lesson-focused')).toBeVisible();
    await expect(page.locator('[data-resize=both]')).toHaveCount(0);
    await expect(page.getByRole('button',{name:treeCopy.en.restore,exact:true})).toBeVisible();
    const documentSize = await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,w:innerWidth,h:innerHeight}));
    expect(documentSize.width).toBe(documentSize.w);expect(documentSize.height).toBe(documentSize.h);
    expect((await size(page)).width).toBeLessThanOrEqual(documentSize.w-48);
    return;
  }
  await expect(page.locator('input[type=range]')).toHaveCount(0);
  const before = await size(page);
  await expect(page.locator('[data-resize=width]')).toHaveCSS('cursor','ew-resize');
  const graphScroll = await drag(page,'width',-120,0);
  expect((await size(page)).width).toBe(before.width-120);
  expect(await page.locator('.tree-viewport').evaluate(el=>el.scrollLeft)).toBe(graphScroll);
  await connected(page);
  await drag(page,'height',0,-80);expect((await size(page)).height).toBe(before.height-80);
  await drag(page,'both',50,40);expect(await size(page)).toEqual({width:before.width-70,height:before.height-40});
  await connected(page);
  const saved = await size(page);
  const handle = page.locator('[data-resize=both]');
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x+10,box.y+10);await page.mouse.down();await page.mouse.move(box.x-30,box.y-30);
  await page.keyboard.press('Escape');await page.mouse.up();expect(await size(page)).toEqual(saved);
  expect(await page.evaluate(()=>document.body.style.userSelect)).toBe('');
  const cancelBox = (await handle.boundingBox())!;
  await page.mouse.move(cancelBox.x+10,cancelBox.y+10);await page.mouse.down();await page.mouse.move(cancelBox.x-20,cancelBox.y-20);
  await handle.evaluate(el=>el.releasePointerCapture(1));await page.mouse.up();
  await expect.poll(()=>size(page)).toEqual(saved);
  await handle.focus();await page.keyboard.press('Shift+ArrowLeft');await page.keyboard.press('ArrowDown');
  const keyboardSize = {width:saved.width-50,height:saved.height+10};
  expect(await size(page)).toEqual(keyboardSize);
  await page.reload();await expect.poll(()=>size(page)).toEqual(keyboardSize);
  await page.getByRole('button',{name:treeCopy.en.resizeWidth,exact:true}).focus();
  for(let i=0;i<30;i++)await page.keyboard.press('Shift+ArrowLeft');
  expect((await size(page)).width).toBe(440);
  await expect(page.locator('.anatomy-layout')).toHaveCSS('grid-template-columns',/^\d+(\.\d+)?px$/);
  await page.getByRole('button',{name:treeCopy.en.resetSize,exact:true}).click();
  expect((await size(page)).width).toBe(900);
  await page.getByRole('button',{name:treeCopy.en.collapsePanel,exact:true}).click();
  await page.reload();await expect(panel(page)).toHaveClass(/panel-collapsed/);
  await page.getByRole('button',{name:treeCopy.en.reopenPanel,exact:true}).click();
  expect((await size(page)).width).toBe(900);
  await page.screenshot({path:info.outputPath('resize-learn.png'),animations:'disabled'});
});

test('Monaco identity, cursor, undo, feedback and trace survive resize, maximize and collapse', async ({page},info) => {
  await page.goto('/?mission=orientation');
  if(info.project.name==='mobile')await page.getByRole('button',{name:treeCopy.en.restore,exact:true}).click();
  await page.getByRole('tab',{name:treeCopy.en.visualize,exact:true}).click();
  await page.getByRole('button',{name:ui.en.run,exact:true}).click();
  const statement = await page.locator('.active-statement').textContent();
  await page.getByRole('tab',{name:treeCopy.en.challenge,exact:true}).click();
  const editor = page.getByRole('tabpanel').getByRole('textbox');
  const source = Array.from({length:40},()=>'* Resize keeps editor position').join('\n')+'\nWRITE 5.\nWRITE 8.';
  await editor.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(source);
  await page.getByRole('button',{name:ui.en.check,exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  await editor.focus();await page.keyboard.press('ControlOrMeta+Home');
  const snapshot = await page.evaluate(source => {
    const monaco = (window as unknown as {monaco:{editor:{getEditors:()=>{getModel:()=>{getValue:()=>string};getPosition:()=>unknown;getSelection:()=>unknown;getScrollTop:()=>number;getDomNode:()=>HTMLElement}[]}}}).monaco;
    const e = monaco.editor.getEditors().find(e=>e.getModel()?.getValue()===source)!;
    e.getDomNode().dataset.resizeIdentity='retained';
    return {position:e.getPosition(),selection:e.getSelection(),scroll:e.getScrollTop()};
  },source);
  const custom = await size(page);
  if (info.project.name==='desktop') {await drag(page,'width',-100,0);await drag(page,'height',0,-40);}
  const editorHeight = (await page.locator('.monaco-editor[data-resize-identity=retained]').boundingBox())!.height;
  await page.getByRole('button',{name:treeCopy.en.expandWorkspace,exact:true}).click();
  await expect(page.locator('.feedback.success')).toBeVisible();
  expect((await page.locator('.monaco-editor[data-resize-identity=retained]').boundingBox())!.height).toBeGreaterThan(editorHeight);
  await page.getByRole('button',{name:treeCopy.en.restoreSize,exact:true}).click();
  expect(await size(page)).toEqual(info.project.name==='desktop'?{width:custom.width-100,height:custom.height-40}:custom);
  await page.getByRole('button',{name:treeCopy.en.collapsePanel,exact:true}).click();
  await expect(panel(page)).toHaveClass(/panel-collapsed/);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await page.getByRole('button',{name:treeCopy.en.reopenPanel,exact:true}).click();
  await expect(page.getByRole('tab',{name:treeCopy.en.challenge,exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.feedback.success')).toBeVisible();
  expect(await page.evaluate(() => {
    const editors = (window as unknown as {monaco:{editor:{getEditors:()=>{getPosition:()=>unknown;getSelection:()=>unknown;getScrollTop:()=>number;getDomNode:()=>HTMLElement}[]}}}).monaco.editor.getEditors();
    const e = editors.find(e=>e.getDomNode()?.dataset.resizeIdentity==='retained')!;
    return {position:e.getPosition(),selection:e.getSelection(),scroll:e.getScrollTop()};
  })).toEqual(snapshot);
  await editor.focus();await page.keyboard.press('ControlOrMeta+Z');
  await expect(page.locator('.monaco-editor[data-resize-identity=retained]')).not.toContainText('WRITE 8.');
  await page.getByRole('tab',{name:treeCopy.en.visualize,exact:true}).click();
  await expect(page.locator('.active-statement')).toHaveText(statement!);
  await page.screenshot({path:info.outputPath('resize-visualize.png'),animations:'disabled'});
});

test('English resize direction, readable graph zoom, viewport clamping and reduced motion', async ({page},info) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?mission=orientation');
  await expect(page.locator('header .language')).toHaveCount(0);
  if(info.project.name==='mobile')await page.getByRole('button',{name:treeCopy.en.restore,exact:true}).click();
  const before = await size(page);
  if(info.project.name==='desktop') {
    await expect(page.locator('[data-resize=both]')).toHaveCSS('cursor','nwse-resize');
    await drag(page,'width',-100,0);expect((await size(page)).width).toBe(before.width-100);
    await connected(page,false);
  }
  const width = (await panel(page).boundingBox())!.width;
  await page.getByRole('button',{name:treeCopy.en.zoomOut,exact:true}).click();
  expect(Math.abs((await panel(page).boundingBox())!.width-width)).toBeLessThan(2);
  await connected(page,false);
  if(info.project.name==='desktop') {
    const zoomed = await size(page);await drag(page,'width',-50,0);
    expect((await size(page)).width).toBe(zoomed.width-50);await connected(page,false);
  }
  await expect(page.locator('[data-resize=both]')).toHaveCSS('transition-duration','0s');
  await page.getByLabel(ui.en.appearance,{exact:true}).selectOption('dark');
  await page.screenshot({path:info.outputPath('resize-ar-dark.png'),animations:'disabled'});
  await page.setViewportSize({width:1000,height:750});
  await expect.poll(async()=> (await size(page)).width).toBeLessThanOrEqual(952);
  const maxHeight = await page.locator('.tree-viewport').evaluate(el=>el.clientHeight-48);
  await expect.poll(async()=> (await size(page)).height).toBeLessThanOrEqual(maxHeight);
});

test('invalid stored layout is ignored and tablet touch does not pan the canvas',async({page},info)=>{
  await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:1,width:-20,height:'bad',collapsed:true})),panelLayoutKey);
  await page.setViewportSize({width:1000,height:1000});
  await page.goto('/?mission=orientation');
  expect((await size(page)).width).toBe(900);
  await expect(panel(page)).not.toHaveClass(/panel-collapsed/);
  const handle=page.locator('[data-resize=both]');
  await handle.scrollIntoViewIfNeeded();const box=(await handle.boundingBox())!;
  const before=await size(page), scroll=await page.locator('.tree-viewport').evaluate(el=>el.scrollLeft);
  const client=await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+10,y:box.y+10}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x-50,y:box.y-30}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>size(page)).toEqual({width:before.width-60,height:before.height-40});
  expect(await page.locator('.tree-viewport').evaluate(el=>el.scrollLeft)).toBe(scroll);
  await connected(page);
  const committed = await size(page);
  const nextBox = (await handle.boundingBox())!;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:nextBox.x+10,y:nextBox.y+10}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:nextBox.x-30,y:nextBox.y-20}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await expect.poll(()=>size(page)).toEqual(committed);
  expect(await page.evaluate(()=>document.body.style.userSelect)).toBe('');
  await page.screenshot({path:info.outputPath('tablet-touch.png'),animations:'disabled'});
});
