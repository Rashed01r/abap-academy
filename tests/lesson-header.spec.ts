import { test, expect } from "@playwright/test";
import { missions, paths } from "../src/lib/curriculum";
import { educationLessonIds } from "../src/lib/education-quality";
import { ui } from "../src/lib/i18n";
import { treeCopy } from "../src/lib/tree-copy";
import { openLesson, tab } from "./academy-helpers";

test("every lesson uses the shared header, real metadata and accessible objectives",async({page},info)=>{
  test.setTimeout(180000);
  await page.goto("/");
  for(const id of educationLessonIds){
    const lesson=missions.find(m=>m.id===id);
    await openLesson(page,id);
    const header=page.locator(".lesson-header");
    await expect(header).toHaveCount(1);
    await expect(header).toHaveAttribute("data-lesson-header",id);
    await expect(header.locator("h1")).toHaveText(lesson?.title.en || ui.en.orientation);
    await expect(header.locator(".lesson-header-subtitle")).toHaveText(lesson?.subtitle.en || treeCopy.en.orientationIntro);
    await expect(header.locator(".lesson-header-context")).toHaveText(paths.find(p=>p.id===(lesson?.pathId || paths[0].id))!.title.en);
    await expect(header.locator(".lesson-header-status")).toHaveText("Not started");
    await expect(header.locator('[data-stat="time"] dd')).toHaveText(`${lesson?.minutes ?? 4} min`);
    await expect(header.locator('[data-stat="reward"] dd')).toHaveText(`${lesson?.xp ?? 25} XP`);
    await expect(header.locator('[data-stat="level"] dd')).toHaveText(ui.en[lesson?.difficulty || "beginner"]);
    await expect(header.locator('.lesson-level-dots [data-filled="true"]')).toHaveCount({beginner:1,intermediate:2,advanced:3}[lesson?.difficulty || "beginner"]);
    // Every English lesson shows its objectives openly, as "What you'll learn" (no collapsible toggle).
    await expect(header.locator(".lesson-header-objectives li")).toHaveText(lesson?.objectives.map(o=>o.en) || [treeCopy.en.orientationObjective]);
    await expect(header.getByRole("heading",{name:"What you’ll learn"})).toBeVisible();
    await expect(header.locator(".lesson-header-objectives ul")).toBeVisible();
    await expect(header.getByRole("button",{name:treeCopy.en.objectives,exact:true})).toHaveCount(0);
    expect(await header.evaluate(el=>getComputedStyle(el).position)).toBe("static");
    expect(await header.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    // Open objectives add one line each: Add two numbers (2 objectives) fits in 330px.
    if(info.project.name==="desktop") expect((await header.boundingBox())!.height).toBeLessThanOrEqual(250+40*(lesson?.objectives.length ?? 1));
    await tab(page,"en","visualize");await expect(header).toHaveCount(1);
    await tab(page,"en","challenge");await expect(header).toHaveCount(1);
  }
  await openLesson(page,"structures");
  await page.reload();
  await expect(page.locator(".lesson-header-objectives ul")).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("abap2-master-progress")!));
  expect(saved.missions).toEqual([]);expect(saved.labs).toEqual([]);expect(saved.passedChallenges).toEqual([]);
  await page.screenshot({path:info.outputPath("shared-header.png"),animations:"disabled"});
});

test("statuses, earned reward and recommended-first navigation use existing progress",async({page},info)=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem("header-progress-seeded"))return;
    sessionStorage.setItem("header-progress-seeded","yes");
    localStorage.setItem("abap2-master-progress",JSON.stringify({version:2,labs:["orientation","addition"],missions:["addition"],started:["structures"],current:"addition",results:{structures:{attempts:2,passed:false}}}));
    localStorage.setItem("abap2-workspace:structures:visualize","WRITE 123.");
  });
  await page.goto("/?mission=structures");
  const header=page.locator(".lesson-header");
  await expect(header.locator(".lesson-header-status")).toHaveText("In progress");
  await header.locator(".lesson-header-prerequisite").click();
  await expect(page).toHaveURL(/mission=addition/);
  await expect(header.locator(".lesson-header-status")).toHaveText("Completed");
  await expect(header.locator('[data-stat="reward"] dd')).toHaveText(`${missions[0].xp} XP earned`);
  await expect(header.locator('.lesson-header-objectives li svg')).toHaveCount(missions[0].objectives.length);
  await expect(header.locator('.lesson-header-objectives li svg').first()).toHaveCSS("color","rgb(95, 212, 168)");
  await expect(header.locator(".lesson-header-prerequisite .sr-only")).toHaveText(ui.en.completed);
  await header.locator(".lesson-header-prerequisite").click();
  await expect(page).toHaveURL(/mission=orientation/);
  const saved=await page.evaluate(()=>({progress:JSON.parse(localStorage.getItem("abap2-master-progress")!),draft:localStorage.getItem("abap2-workspace:structures:visualize")}));
  expect(saved.progress.missions).toEqual(["addition"]);expect(saved.progress.labs).toEqual(["orientation","addition"]);
  expect(saved.progress.results.structures).toEqual({attempts:2,passed:false});expect(saved.draft).toBe("WRITE 123.");
  await page.screenshot({path:info.outputPath("completed-header.png"),animations:"disabled"});
});

test("header stays in flow, mirrors logical direction and respects reduced motion",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/?mission=structures");
  const header=page.locator(".lesson-header");
  await expect(header).toBeVisible();
  await page.locator(".connected-lesson").evaluate(el=>el.setAttribute("dir","rtl"));
  const icon=await header.locator(".lesson-header-icon").boundingBox();
  const title=await header.locator("h1").boundingBox();
  expect(icon!.x).toBeGreaterThan(title!.x);
  await expect(header.locator(".lesson-header-back-arrow")).toHaveCSS("transform","matrix(-1, 0, 0, 1, 0, 0)");
  await page.locator(".connected-lesson").evaluate(el=>el.setAttribute("dir","ltr"));
  const top=(await header.boundingBox())!.y;
  await page.locator(".lesson-view-body").evaluate(el=>el.scrollTop=200);
  expect((await header.boundingBox())!.y).toBeLessThan(top-100);
  await page.reload();
  await expect(header.locator(".lesson-header-status")).toHaveText("Not started");
});
