import { enabledLocales } from "../src/lib/language-policy";
import { test,expect } from "@playwright/test";
import { educationLessonIds } from "../src/lib/education-quality";
import { visualPresentations } from "../src/lib/visual-presentations";
import { openLesson,tab } from "./academy-helpers";
test.use({actionTimeout:10000});

for(const [lang,theme] of enabledLocales.flatMap(lang => (["light","dark"] as const).map(theme => [lang,theme] as const))) test(`${lang}/${theme}: every implemented topic opens a visible, interactive primary illustration`,async({page},info)=>{
 test.setTimeout(180000);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(({lang,theme})=>{localStorage.setItem("abap2-language",lang);localStorage.setItem("abap2-appearance",theme);},{lang,theme});
 await page.goto("/");
 for(const id of educationLessonIds){
   await openLesson(page,id,lang);
   const classroom=page.locator(".visual-classroom"),diagram=classroom.locator("[data-primary-diagram]").first();
   await expect(classroom).toHaveAttribute("data-visual-family",visualPresentations[id]);await expect(diagram).toBeVisible();
   expect(await diagram.evaluate(el=>!el.closest("details:not([open])"))).toBe(true);
   await page.locator(".panel-body").evaluate(el=>el.scrollTop=0);
   if(info.project.name === "desktop") {
     const box=await diagram.boundingBox();expect(box!.y).toBeLessThan(850);
   }
   const trace=classroom.locator(".trace-classroom");
   if(await trace.count()){
     const next=trace.getByRole("button",{name:lang === "en" ? "Next" : "التالي",exact:true});
     if(await next.isEnabled())await next.click();else await trace.getByRole("button",{name:lang === "en" ? "Restart" : "البداية",exact:true}).click();
     await expect(page.locator('.syntax-lab .anatomy-group[aria-pressed="true"]')).toHaveCount(1);
     if(visualPresentations[id] === "flow") await expect(trace.locator(".educational-flowchart path[marker-end]")).toHaveCount(id === "data-conditional-loop" ? 7 : id === "loop-control" ? 6 : 5);
   } else if(visualPresentations[id] === "relationships") {
     const nodes=classroom.locator(".architecture-node");await nodes.last().click();
     await expect(nodes.last()).toHaveAttribute("aria-pressed","true");
     await expect(classroom.locator(".architecture-connections > path.active").first()).toBeAttached();
     await expect(page.locator('.primary-code-anatomy .anatomy-group[aria-pressed="true"]')).toHaveCount(1);
   } else if(id === "database-fundamentals") {
     await classroom.locator("select").filter({has:page.locator('option[value="LEGAL"]')}).selectOption("LEGAL");
     await expect(classroom.locator(".sql-visual-stage")).toContainText(lang === "en" ? "No matching rows" : "لا توجد صفوف مطابقة");
     await expect(page.locator('.primary-code-anatomy [data-group="sql-filter"]')).toHaveAttribute("aria-pressed","true");
   } else if(id === "modern-syntax") {
     await classroom.getByRole("combobox").selectOption("99");
     await expect(classroom.locator('[role="status"]')).toContainText("No matching item");
     await expect(page.locator('.primary-code-anatomy [data-group="modern-missing"]')).toHaveAttribute("aria-pressed","true");
   } else if(id === "oop-introduction") {
     await classroom.getByRole("button",{name:lang === "en" ? "Increment through object A" : "زِد القيمة عبر الكائن A",exact:true}).click();
     await expect(page.locator('.primary-code-anatomy [data-group="counter-implementation"]')).toHaveAttribute("aria-pressed","true");
   } else if(id === "applications-reports") {
     await classroom.getByRole("button",{name:lang === "en" ? "Rejected zero input" : "رفض إدخال صفر",exact:true}).click();
     await expect(page.locator('.primary-code-anatomy [data-group="report-validation"]')).toHaveAttribute("aria-pressed","true");
   }
   await tab(page,lang,"visualize");await expect(page.getByRole("tabpanel")).toBeVisible();
   await tab(page,lang,"challenge");await expect(page.getByRole("tabpanel").locator(".quiz")).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));expect(saved.missions).toEqual([]);expect(saved.labs).toEqual([]);expect(saved.passedChallenges).toEqual([]);expect(errors).toEqual([]);
});

for(const lang of enabledLocales)test(`${lang}: category insertion, unique policy, lookup and linked reference anatomy change together`,async({page})=>{
 await page.addInitScript(lang=>localStorage.setItem("abap2-language",lang),lang);await page.goto("/");await openLesson(page,"data-table-categories",lang);
 const scene=page.locator(".category-classroom");await expect(scene.locator(".category-model")).toHaveCount(3);
 await scene.getByRole("button",{name:lang === "en" ? "Insert 30 / Omar" : "أدرج 30 / Omar",exact:true}).click();
 const cards=scene.locator(".category-model");await expect(cards.nth(0).locator("tbody tr")).toHaveCount(3);await expect(cards.nth(1).locator("tbody tr")).toHaveCount(3);await expect(cards.nth(2).locator(".key-record-map > div")).toHaveCount(2);
 await cards.nth(1).locator(".category-model-title").click();
 await scene.getByRole("combobox").selectOption("30");await scene.getByRole("button",{name:lang === "en" ? "Look up key" : "ابحث بالمفتاح",exact:true}).click();
 await expect(cards.nth(1).locator(".selected-row")).toHaveCount(1);await expect(cards.nth(1).locator(".selected-row")).toContainText("Omar");
 await scene.getByRole("checkbox").check();
 await expect(cards.nth(1).locator("tbody tr")).toHaveCount(2);await expect(scene.locator('.connected-reference-anatomy .anatomy-code')).toContainText("WITH UNIQUE KEY id");
 await scene.getByRole("combobox").selectOption("999");await scene.getByRole("button",{name:lang === "en" ? "Look up key" : "ابحث بالمفتاح",exact:true}).click();
 await expect(scene.locator('[role="status"]').first()).toContainText(lang === "en" ? "Not found" : "لم يُعثر عليه");
 await expect(scene.locator('[data-group="lookup"]')).toHaveAttribute("aria-pressed","true");
 await scene.locator('[data-group="category"]').click();await expect(scene.locator('[data-group="category"]')).toHaveAttribute("aria-pressed","true");
});

for(const lang of enabledLocales)test(`${lang}: row edits distinguish copying, explicit write-back and assigning the original row`,async({page})=>{
 await page.addInitScript(lang=>localStorage.setItem("abap2-language",lang),lang);await page.goto("/");await openLesson(page,"data-work-areas-field-symbols",lang);
 const scene=page.locator(".row-access-classroom");await scene.getByRole("textbox").fill("O'Neil");await scene.getByRole("button",{name:lang === "en" ? "Change the name" : "غيّر الاسم",exact:true}).click();
 await expect(scene.locator(".row-source")).toContainText("Ahmed");await expect(scene.locator(".row-target")).toContainText("O'Neil");
 await scene.getByRole("button",{name:lang === "en" ? "Save copy with MODIFY" : "احفظ النسخة باستخدام MODIFY",exact:true}).click();await expect(scene.locator(".row-source")).toContainText("O'Neil");
 await scene.locator(".comparison-selector button").nth(1).click();await scene.getByRole("button",{name:lang === "en" ? "Change the name" : "غيّر الاسم",exact:true}).click();
 await expect(scene.locator(".row-source")).toContainText("O'Neil");await expect(scene.locator(".row-target")).toContainText("<employee>");await expect(scene.locator(".anatomy-code")).toContainText("LOOP AT lt_employees ASSIGNING <employee>");
 await expect(scene.locator('[data-group="edit"]')).toHaveAttribute("aria-pressed","true");await scene.locator('[data-group="source"]').click();await expect(scene.locator(".row-source")).toContainText("Ahmed");
 await scene.locator('[data-group="edit"]').click();await expect(scene.locator(".row-source")).toContainText("O'Neil");
 await tab(page,lang,"visualize");await expect(page.getByRole("tabpanel").locator(".row-access-classroom .row-source")).toContainText("O'Neil");
 await tab(page,lang,"learn");await expect(scene.locator(".row-source")).toContainText("O'Neil");
});
