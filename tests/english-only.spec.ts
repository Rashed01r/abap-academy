import { test, expect } from "@playwright/test";
import { educationLessonIds } from "../src/lib/education-quality";
import { conditionalLoopMission } from "../src/lib/conditional-loop-mission";
import { openLesson, tab, gradeAll, answerQuiz, completion } from "./academy-helpers";
import { matchAnatomy } from "./anatomy-helpers";
import { ui } from "../src/lib/i18n";

async function expectEnglish(page: import("@playwright/test").Page) {
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(page.locator("html")).toHaveAttribute("dir","ltr");
  await expect(page.locator("header .language")).toHaveCount(0);
  const arabic=await page.evaluate(()=>{
    const pattern=/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u;
    const text=document.body.innerText;
    const labels=Array.from(document.querySelectorAll("[aria-label],[title],[placeholder]")).flatMap(el=>[el.getAttribute("aria-label"),el.getAttribute("title"),el.getAttribute("placeholder")]);
    return [text,...labels].filter((s):s is string=>!!s && pattern.test(s));
  });
  expect(arabic).toEqual([]);
}

for(const theme of ["light","dark"] as const)test(`legacy Arabic preference: all lessons and tabs render English / ${theme}`,async({page},info)=>{
  test.setTimeout(240000);
  await page.addInitScript(theme=>{
    if(!sessionStorage.getItem("english-seeded")){
      localStorage.setItem("abap2-language","ar");localStorage.setItem("abap2-appearance",theme);
      localStorage.setItem("abap2-master-progress",JSON.stringify({version:2,labs:["orientation"],missions:["addition"],current:"addition",results:{addition:{attempts:3,passed:true}}}));
      localStorage.setItem("abap2-workspace:addition:visualize","WRITE 123.");
      sessionStorage.setItem("english-seeded","yes");
    }
  },theme);
  await page.goto("/");
  await expectEnglish(page);
  await page.locator("header .glossary summary").click();await expectEnglish(page);
  await page.locator("header .glossary summary").click();
  for(const id of educationLessonIds){
    await openLesson(page,id);
    for(const mode of ["learn","visualize","challenge"] as const){await tab(page,"en",mode);await expectEnglish(page);}
  }
  const saved=await page.evaluate(()=>({progress:JSON.parse(localStorage.getItem("abap2-master-progress")!),draft:localStorage.getItem("abap2-workspace:addition:visualize"),lang:localStorage.getItem("abap2-language"),theme:localStorage.getItem("abap2-appearance")}));
  expect(saved.progress.missions).toEqual(["addition"]);expect(saved.progress.labs).toEqual(["orientation"]);
  expect(saved.progress.results.addition).toEqual({attempts:3,passed:true});expect(saved.draft).toBe("WRITE 123.");expect(saved.lang).toBe("en");expect(saved.theme).toBe(theme);
  await page.reload();await expectEnglish(page);
  await page.goto("/?mission=data-conditional-loop");await expect(page.locator(".lesson-summary h1")).toHaveText(conditionalLoopMission.title.en);
  await page.screenshot({path:info.outputPath(`english-${theme}.png`),animations:"disabled"});
});

test("new English-only mission has a working assessment and once-only rewards",async({page})=>{
  await page.goto("/?mission=data-conditional-loop");
  const flow=page.locator(".educational-flowchart");
  await expect(flow).toHaveCount(1);
  const overlaps=await flow.evaluate(el=>{
    const nodes=Array.from(el.querySelectorAll<SVGGraphicsElement>(".flow-svg-node > rect,.flow-svg-node > polygon")).map(n=>n.getBBox());
    return Array.from(el.querySelectorAll<SVGGraphicsElement>(".flow-edge-label > rect")).some(label=>{
      const b=label.getBBox();
      return nodes.some(n=>b.x<n.x+n.width && b.x+b.width>n.x && b.y<n.y+n.height && b.y+b.height>n.y);
    });
  });
  expect(overlaps).toBe(false);
  await flow.locator('[data-flow-node="body"]').click();
  await expect(page.locator(".visual-classroom .trace-code-line.current")).toContainText("WRITE / ls_employee-name.");
  await matchAnatomy(page,"data-conditional-loop","en");
  await page.getByRole("button",{name:ui.en.syntaxDone,exact:true}).click();
  await gradeAll(page,conditionalLoopMission,"en","WRITE 14000.");
  await answerQuiz(page,conditionalLoopMission.answer);
  await completion(page,"en").click();
  await expect(page.locator(".header-xp")).toContainText("300");
  await page.reload();await expect(page.locator(".header-xp")).toContainText("300");
});

test("malformed settings and unavailable storage leave English usable",async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem("abap2-master-progress","{invalid");localStorage.setItem("abap2-language",'"ar"');localStorage.setItem("abap2-appearance","dark");});
  await page.goto("/?mission=structures");await expectEnglish(page);
  expect(await page.evaluate(()=>localStorage.getItem("abap2-master-progress"))).toBe("{invalid");
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
  await page.addInitScript(()=>{Object.defineProperty(window,"localStorage",{get(){throw new DOMException("Blocked","SecurityError");}});});
  await page.reload();await expectEnglish(page);await expect(page.locator(".lesson-summary h1")).toHaveText("Create a structure");
});

test("English migration preserves learner-authored Arabic in an existing code draft",async({page})=>{
  const draft="* "+String.fromCharCode(0x645,0x644,0x627,0x62d,0x638,0x629)+"\nWRITE 7.";
  const key="abap2-workspace:structures:visualize";
  await page.addInitScript(({draft,key})=>{localStorage.setItem("abap2-language","ar");localStorage.setItem(key,draft);},{draft,key});
  await page.goto("/?mission=structures");await tab(page,"en","visualize");
  await expect(page.locator(".monaco-editor").filter({visible:true})).toContainText(draft.split("\n")[0]);
  expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(draft);
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(page.locator("header .language")).toHaveCount(0);
});
