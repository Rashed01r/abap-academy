import { enabledLocales } from "../src/lib/language-policy";
import { localizedText } from "../src/lib/language-policy";
import {openLesson,tab} from "./academy-helpers";
import {test,expect} from "@playwright/test";
import {workAreaMission as m, workAreaExample} from "../src/lib/work-area-mission";
import {missions} from "../src/lib/curriculum";
import {ui} from "../src/lib/i18n";
import {matchAnatomy, finishLearn, runnerTo } from "./anatomy-helpers";

for(const lang of enabledLocales) for(const theme of ["light","dark"] as const) {
  test(`${lang}/${theme}: work-area fields, live aliases, diagnostics and both persisted assessments`,async({page})=>{
    const t=ui[lang];
    const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
    await page.addInitScript(({lang,theme})=>{
      localStorage.setItem("abap2-language",lang);localStorage.setItem("abap2-appearance",theme);
      if(!localStorage.getItem("abap2-master-progress")) localStorage.setItem("abap2-master-progress",JSON.stringify({version:2,missions:["data-keys"],labs:["structures"],current:"data-keys",results:{while:{attempts:4,passed:false}}}));
    },{lang,theme});
    await page.goto("/");
    await expect(page.locator(".header-xp")).toContainText("260");
    await page.locator('[data-tree-id="data"]').click();
    const future = await page.locator('.future-topic').allTextContents();
    expect(future.join(' ')).not.toContain(lang==='en'?'Work areas':'مناطق العمل');
    expect(future.join(' ')).not.toContain(lang==='en'?'Field symbols':'رموز الحقول');
    expect(future.join(' ')).not.toContain(lang==='en'?'Table operations':'عمليات الجداول');
    // Since 2026-11-08 every Working with Data topic is a lesson, so the path shows no previews.
    expect(future.join(' ')).not.toContain('Table expressions');
    expect(future).toEqual([]);
    await openLesson(page,m.id,lang);
    await expect(page).toHaveURL(new RegExp(`mission=${m.id}`));
    await page.reload();
    await expect(page.locator(".lesson-summary h1")).toHaveText(localizedText(m.title, lang));
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!).missions)).toEqual(["data-keys"]);
    if(lang === "en") {
      // The runner shows the alias changing the work area while the saved row keeps Ahmed.
      let run=await runnerTo(page,"Assign Values to the Fields");
      await expect(run.locator(".add-box").filter({hasText:"ls_employee"})).toContainText("101");
      run=await runnerTo(page,"Change the Assigned Employee");
      await expect(run.locator(".add-box").filter({hasText:"ls_employee"})).toContainText("Sara");
      await expect(run.locator(".add-box").filter({hasText:"lt_employees"})).toContainText("Ahmed");
    } else {
      const code=page.locator(".syntax-lab .anatomy-code"), panel=page.locator(".syntax-lab .anatomy-explanation");
      await code.locator('[data-group="fill"]').click();
      await expect(code.locator(".anatomy-selected-line")).toHaveCount(2);
      await expect(panel.locator(".anatomy-field-active")).toHaveCount(2);
      await expect(panel).toContainText("Ahmed");
      await code.locator('[data-group="declare"]').click();
      await expect(panel.locator(".alias-connection")).toHaveText("<employee>→∅");
      await code.locator('[data-group="bind"]').focus();await page.keyboard.press("Enter");
      await expect(panel.locator(".alias-connection")).toHaveText("<employee>→ls_employee");
      await code.locator('[data-group="change"]').click();
      await expect(panel.getByTestId("alias-value")).toContainText("Sara");
      await expect(panel.locator(".anatomy-memory-card").filter({hasText:"lt_employees"})).toContainText("Ahmed");
      await expect(panel.locator(".alias-values")).toContainText("Ahmed");
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    if(lang === "ar") await page.locator(".syntax-lab .anatomy-layout").screenshot({path:test.info().outputPath(`aliases-anatomy-ar-${theme}.png`)});
    await matchAnatomy(page,m.id,lang);
    await finishLearn(page, lang);
    await tab(page,lang,"visualize");
    await page.getByRole("button",{name:t.run,exact:true}).click();
    const timeline=page.getByRole("tabpanel").locator(".timeline");
    await timeline.getByRole("button").filter({hasText:"<employee>-name = 'Sara'."}).click();
    await expect(page.getByRole("tabpanel").locator(".alias-memory").getByTestId("alias-value")).toContainText("Sara");
    await expect(page.locator(".execution-pointer").filter({visible:true})).toHaveCount(1);
    await timeline.getByRole("button").filter({hasText:"ASSIGN ls_employee TO <employee>."}).click();
    await expect(page.getByRole("tabpanel").locator(".alias-memory").getByTestId("alias-value")).toContainText("Ahmed");
    await timeline.getByRole("button").last().click();
    await expect(page.getByTestId("output").filter({visible:true})).toHaveText("Ahmed\nSara\nAhmed");
    if(lang === "ar") await page.screenshot({path:test.info().outputPath(`aliases-trace-ar-${theme}.png`),fullPage:true});
    const editor=page.locator(".monaco-editor").filter({visible:true}).first().getByRole("textbox");
    async function replace(source:string) {await editor.focus();await page.keyboard.press("ControlOrMeta+A");await page.keyboard.insertText(source);}
    await replace(workAreaExample.replace("ASSIGN ls_employee TO <employee>.","* Removed ASSIGN"));
    await expect(page.getByRole("tabpanel").locator(".alias-memory")).toHaveCount(0);
    await expect(page.locator(".execution-pointer").filter({visible:true})).toHaveCount(0);
    await page.getByRole("button",{name:t.run,exact:true}).click();
    await expect(page.getByRole("tabpanel").locator(".feedback.error")).toContainText(lang === "en" ? "unassigned" : "غير مرتبط");
    await expect(page.getByRole("tabpanel").locator(".feedback.error")).toContainText("ASSIGN");
    await replace(workAreaExample.replace("FIELD-SYMBOLS <employee> TYPE ty_employee.","* Removed declaration"));
    await page.getByRole("button",{name:t.run,exact:true}).click();
    await expect(page.getByRole("tabpanel").locator(".feedback.error")).toContainText("FIELD-SYMBOLS");
    await expect(page.getByRole("tabpanel").locator(".feedback.error")).toContainText("DATA");
    await tab(page,lang,"challenge");
    // Browsing or completing the lab does not pass either mission assessment.
    await tab(page,lang,"challenge");
    await expect(page.getByRole("button",{name:t.complete,exact:true})).toBeDisabled();
    await tab(page,lang,"challenge");
    for(const [i,challenge] of m.challenges!.entries()) {
      await page.getByRole("tabpanel").getByRole("group").getByRole("button").nth(i).click();
      await replace(challenge.solution);
      await page.getByRole("button",{name:t.check,exact:true}).click();
      await expect(page.locator(".feedback.success").filter({visible:true})).toBeVisible();
      if(i === 0) {
        await tab(page,lang,"challenge");
        await expect(page.getByRole("button",{name:t.complete,exact:true})).toBeDisabled();
        await tab(page,lang,"challenge");
      }
    }
    await tab(page,lang,"challenge");
    await page.getByRole("button",{name:t.complete,exact:true}).click();
    await expect(page.locator(".header-xp")).toContainText("540");
    await expect(page.locator(".lesson-summary .pill")).toHaveText(t.completed.charAt(0).toUpperCase() + t.completed.slice(1));
    const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(progress.version).toBe(2);expect(progress.missions).toEqual(["data-keys",m.id]);
    expect(progress.labs).toEqual(lang==="en"?["structures"]:["structures",m.id]);expect(progress.results.while).toEqual({attempts:4,passed:false});
    expect(progress.passedChallenges).toEqual(expect.arrayContaining(m.challenges!.map(c=>c.id)));
    await page.goto(`/?mission=${m.id}`);
    await expect(page.locator(".lesson-summary h1")).toHaveText(localizedText(m.title, lang));
    await tab(page,lang,"challenge");
    await page.getByRole("button",{name:t.completed,exact:true}).click();
    await expect(page.locator(".header-xp")).toContainText("540");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
test("valid lesson deep links are freely accessible; unknown and preview IDs do not fabricate lessons",async({page})=>{
  for(const id of ["data-work-areas-field-symbols","data-keys","structures","data-read-table","data-table-expressions","data-table-performance","data-employee-manager"]) {
    await page.goto(`/?mission=${id}`);
    await expect(page.locator(".lesson-summary h1")).toHaveText(missions.find(m=>m.id === id)!.title.en);
    const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(progress.missions).toEqual([]);expect(progress.labs).toEqual([]);expect(progress.started).toEqual([]);expect(progress.passedChallenges).toEqual([]);
  }
  for(const id of ["dictionary-domains","not-a-lesson"]) {
    await page.goto(`/?mission=${id}`);
    await expect(page.locator("[data-tree-id=root]")).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(0);
  }
});
