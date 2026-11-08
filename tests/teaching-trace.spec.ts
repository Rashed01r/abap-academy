import { enabledLocales } from "../src/lib/language-policy";
import { test,expect } from "@playwright/test";
import { educationLessonIds } from "../src/lib/education-quality";
import { openLesson, openPictures } from "./academy-helpers";

for(const lang of enabledLocales)test(`${lang}: all lesson families share trace controls, captions, code and keyboard navigation`,async({page})=>{test.skip(lang === "en", "English lessons no longer show lesson pictures (user decision: Explore code matches Add two numbers)");
  test.setTimeout(180000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(lang=>localStorage.setItem("abap2-language",lang),lang);
  await page.goto("/");
  for(const id of educationLessonIds){
    await openLesson(page,id,lang);
    if(id === "addition" && lang === "en") {
      // The addition pilot traces on Learn with its own line-by-line runner.
      const learn=page.locator("[data-addition-learn]");
      await expect(learn.getByRole("button",{name:"Back",exact:true})).toBeDisabled();
      for(let i=0;i<4;i++) await learn.getByRole("button",{name:"Run next line",exact:true}).click();
      await expect(learn.locator('.add-code [data-state="active"]')).toContainText("lv_result = lv_first + lv_second.");
      await expect(learn.locator(".add-say")).toContainText("13");
      continue;
    }
    await openPictures(page,id);
    const trace=page.locator('.visual-classroom .teaching-trace');
    await expect(trace).toHaveCount(1);
    const restart=trace.locator('.trace-buttons').getByRole('button',{name:lang==="en"?"Restart":"البداية",exact:true});
    await restart.click();
    await expect(trace).toHaveAttribute('data-trace-step','0');
    await expect(trace.getByRole('button',{name:lang==="en"?"Previous":"السابق",exact:true})).toBeDisabled();
    expect(await trace.locator('.trace-controls').evaluate(e=>getComputedStyle(e).position)).toBe('static');
    await expect(trace.locator('.step-caption p')).not.toBeEmpty();
    await expect(trace.locator('.trace-code-line.current').first()).toBeVisible();
    const first=await trace.locator('.step-caption p').textContent();
    const total=Number(await trace.getAttribute('data-trace-total'));
    if(total>1){
      await trace.focus();await page.keyboard.press(lang==="ar"?'ArrowLeft':'ArrowRight');
      await expect(trace).toHaveAttribute('data-trace-step','1');
      await expect(trace.locator('.step-caption p')).not.toHaveText(first!);
    }else await expect(trace.getByRole('button',{name:lang==="en"?'Next':'التالي',exact:true})).toBeDisabled();
    if(total>15){await trace.getByRole('button',{name:lang==="en"?'Skip to end':'انتقل إلى النهاية',exact:true}).click();await expect(trace).toHaveAttribute('data-trace-step',String(total-1));await expect(trace.getByRole('button',{name:lang==="en"?'Next':'التالي',exact:true})).toBeDisabled();}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const diagram=trace.locator('.educational-flowchart');
    if(await diagram.count()){
      expect(await diagram.locator('.flow-svg-node.active').count()).toBeLessThanOrEqual(1);
      expect(await diagram.locator('.flow-edge.active').count()).toBeLessThanOrEqual(1);
      const clipping=await diagram.evaluate(el=>{const svg=el.querySelector('svg')!,box=svg.viewBox.baseVal;return Array.from(el.querySelectorAll('.flow-svg-node text')).some(text=>{const b=(text as SVGGraphicsElement).getBBox();return b.x<box.x || b.y<box.y || b.x+b.width>box.width+box.x || b.y+b.height>box.height+box.y;});});
      expect(clipping,id).toBe(false);
    }
  }
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('abap2-master-progress')!));
  expect(saved.missions).toEqual([]);expect(saved.labs).toEqual([]);expect(saved.passedChallenges).toEqual([]);expect(errors).toEqual([]);
});

test('playback, skip, changed chips and reduced motion stay local to the trace',async({page})=>{test.skip(true, "English lessons no longer show lesson pictures (user decision: Explore code matches Add two numbers)");
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await openLesson(page,'do');await openPictures(page,'do');
  const trace=page.locator('.visual-classroom .teaching-trace');
  await trace.getByRole('button',{name:'Restart',exact:true}).click();
  await trace.focus();await page.keyboard.press('Space');
  await expect(trace.getByRole('button',{name:'Pause',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect.poll(async()=>Number(await trace.getAttribute('data-trace-step'))).toBeGreaterThan(0);
  await trace.focus();await page.keyboard.press('Space');
  await expect(trace.getByRole('button',{name:'Play',exact:true})).toHaveAttribute('aria-pressed','false');
  await trace.getByRole('button',{name:'Skip to end',exact:true}).click();
  await expect(trace.getByRole('button',{name:'Next',exact:true})).toBeDisabled();
  expect(await trace.locator('button').first().evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');
  await page.getByRole('button',{name:'Academy home',exact:true}).click();await openLesson(page,'while');await openPictures(page,'while');
  const initial=page.locator('.visual-classroom .teaching-trace');
  await initial.getByRole('button',{name:'Restart',exact:true}).click();
  await expect(initial.locator('.trace-comparison > section').last().locator('.trace-state-chip.changed')).not.toHaveCount(0);
  await expect(initial.locator('.trace-comparison > section').first().locator('.trace-empty')).toBeVisible();
});
