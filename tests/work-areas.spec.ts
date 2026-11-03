import {test,expect} from "@playwright/test";
import {workAreaMission as m, workAreaExample} from "../src/lib/work-area-mission";
import {missions} from "../src/lib/curriculum";
import {ui} from "../src/lib/i18n";
import {matchAnatomy} from "./anatomy-helpers";

for(const lang of ["en","ar"] as const) for(const theme of ["light","dark"] as const) {
  test(`${lang}/${theme}: work-area fields, live aliases, diagnostics and both persisted assessments`,async({page})=>{
    const t=ui[lang];
    const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
    await page.addInitScript(({lang,theme})=>{
      localStorage.setItem("abap2-language",lang);localStorage.setItem("abap2-appearance",theme);
      if(!localStorage.getItem("abap2-master-progress")) localStorage.setItem("abap2-master-progress",JSON.stringify({version:2,missions:["data-keys"],labs:["structures"],current:"data-keys",results:{while:{attempts:4,passed:false}}}));
    },{lang,theme});
    await page.goto("/");
    await expect(page.locator(".xp-row")).toContainText("260");
    const path=page.locator('[data-path="data"]');
    await expect(path.locator(".future-concepts")).not.toContainText(lang === "en" ? "Work areas" : "مناطق العمل");
    await expect(path.locator(".future-concepts")).not.toContainText(lang === "en" ? "Field symbols" : "رموز الحقول");
    await expect(path.locator(".future-concepts")).toContainText(lang === "en" ? "Table operations" : "عمليات الجداول");
    await path.locator(`[data-mission="${m.id}"] .node-card`).click();
    await expect(page).toHaveURL(new RegExp(`mission=${m.id}`));
    await page.reload();
    await expect(page.locator(".mission-title h1")).toHaveText(m.title[lang]);
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!).missions)).toEqual(["data-keys"]);
    const code=page.locator(".anatomy-code"), panel=page.locator(".anatomy-explanation");
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
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    if(lang === "ar") await page.locator(".anatomy-layout").screenshot({path:test.info().outputPath(`aliases-anatomy-ar-${theme}.png`)});
    await matchAnatomy(page,m.id,lang);
    await page.getByRole("button",{name:t.syntaxDone,exact:true}).click();
    await page.getByRole("button",{name:t.reviewExample,exact:true}).click();
    await page.getByRole("button",{name:t.run,exact:true}).click();
    const timeline=page.locator(".timeline");
    await timeline.getByRole("button").filter({hasText:"<employee>-name = 'Sara'."}).click();
    await expect(page.locator(".alias-memory").getByTestId("alias-value")).toContainText("Sara");
    await expect(page.locator(".execution-pointer")).toHaveCount(1);
    await timeline.getByRole("button").filter({hasText:"ASSIGN ls_employee TO <employee>."}).click();
    await expect(page.locator(".alias-memory").getByTestId("alias-value")).toContainText("Ahmed");
    await timeline.getByRole("button").last().click();
    await expect(page.getByTestId("output")).toHaveText("Ahmed\nSara\nAhmed");
    if(lang === "ar") await page.screenshot({path:test.info().outputPath(`aliases-trace-ar-${theme}.png`),fullPage:true});
    const editor=page.getByRole("textbox").first();
    async function replace(source:string) {await editor.focus();await page.keyboard.press("ControlOrMeta+A");await page.keyboard.insertText(source);}
    await replace(workAreaExample.replace("ASSIGN ls_employee TO <employee>.","* Removed ASSIGN"));
    await expect(page.locator(".alias-memory")).toHaveCount(0);
    await expect(page.locator(".execution-pointer")).toHaveCount(0);
    await page.getByRole("button",{name:t.run,exact:true}).click();
    await expect(page.locator(".feedback.error")).toContainText(lang === "en" ? "unassigned" : "غير مرتبط");
    await expect(page.locator(".feedback.error")).toContainText("ASSIGN");
    await replace(workAreaExample.replace("FIELD-SYMBOLS <employee> TYPE ty_employee.","* Removed declaration"));
    await page.getByRole("button",{name:t.run,exact:true}).click();
    await expect(page.locator(".feedback.error")).toContainText("FIELD-SYMBOLS");
    await expect(page.locator(".feedback.error")).toContainText("DATA");
    await page.getByRole("button",{name:t.startChallenge,exact:true}).click();
    // Browsing or completing the lab does not pass either mission assessment.
    await page.locator(".stages button").nth(5).click();
    await page.locator(".completion-card .answer-options button").nth(m.answer).click();
    await expect(page.getByRole("button",{name:t.complete,exact:true})).toBeDisabled();
    await page.getByRole("button",{name:t.startChallenge,exact:true}).click();
    for(const [i,challenge] of m.challenges!.entries()) {
      await page.getByRole("group",{name:t.challenge,exact:true}).getByRole("button").nth(i).click();
      await replace(challenge.solution);
      await page.getByRole("button",{name:t.check,exact:true}).click();
      await expect(page.locator(".feedback.success")).toBeVisible();
      if(i === 0) {
        await page.locator(".stages button").nth(5).click();
        await expect(page.getByRole("button",{name:t.complete,exact:true})).toBeDisabled();
        await page.getByRole("button",{name:t.startChallenge,exact:true}).click();
      }
    }
    await page.locator(".stages button").nth(5).click();
    await page.getByRole("button",{name:t.complete,exact:true}).click();
    await expect(page.locator(".xp-row")).toContainText("540");
    await expect(page.locator(`[data-mission="${m.id}"] .node-status`)).toHaveText(t.completed);
    const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(progress.version).toBe(2);expect(progress.missions).toEqual(["data-keys",m.id]);
    expect(progress.labs).toEqual(["structures",m.id]);expect(progress.results.while).toEqual({attempts:4,passed:false});
    expect(progress.passedChallenges).toEqual(expect.arrayContaining(m.challenges!.map(c=>c.id)));
    await page.goto(`/?mission=${m.id}`);
    await expect(page.locator(".mission-title h1")).toHaveText(m.title[lang]);
    await page.locator(".stages button").nth(5).click();
    await page.locator(".completion-card .answer-options button").nth(m.answer).click();
    await page.getByRole("button",{name:t.complete,exact:true}).click();
    await expect(page.locator(".xp-row")).toContainText("540");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
test("valid lesson deep links are freely accessible; unknown and preview IDs do not fabricate lessons",async({page})=>{
  for(const id of ["data-work-areas-field-symbols","data-keys","structures"]) {
    await page.goto(`/?mission=${id}`);
    await expect(page.locator(".mission-title h1")).toHaveText(missions.find(m=>m.id === id)!.title.en);
    const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));
    expect(progress.missions).toEqual([]);expect(progress.labs).toEqual([]);expect(progress.started).toEqual([]);expect(progress.passedChallenges).toEqual([]);
  }
  for(const id of ["data-read-table","not-a-lesson"]) {
    await page.goto(`/?mission=${id}`);
    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".mission-engine")).toHaveCount(0);
  }
});
