import { localizedText } from "../src/lib/language-policy";
import {expect, type Page} from "@playwright/test";
import {missions} from "../src/lib/curriculum";
import {getAnatomy,orientationExamples} from "../src/lib/anatomy-content";
import {ui, type Locale} from "../src/lib/i18n";

/** Steps the beginner runner forward until the named part is shown. */
export async function runnerTo(page:Page,title:string) {
  const run=page.locator("[data-lesson-runner]");
  for(let i=0;i<120 && !(await run.locator(".add-progress").innerText()).endsWith(`· ${title}`);i++) await run.getByRole("button",{name:/^(Run next line|Next part|Start over)$/}).click();
  await expect(run.locator(".add-progress")).toContainText(`· ${title}`);
  return run;
}

/** English lessons teach the code with the beginner runner instead of the old matching lab (no lab tick). */
export async function walkRunner(page:Page) {
  const run=page.locator("[data-lesson-runner]");
  await expect(run).toBeVisible();
  const next=run.getByRole("button",{name:/^(Run next line|Next part)$/});
  while(await next.count()) await next.click();
  await expect(run.getByRole("button",{name:"Start over",exact:true})).toBeVisible();
}

export async function matchAnatomy(page:Page,id:string,lang:Locale) {
  if(lang === "en") return walkRunner(page);
  const source=id === "orientation" ? localizedText(orientationExamples, lang) : missions.find(m=>m.id === id)!.example;
  const doc=getAnatomy(id,source),t=ui[lang];
  const lab=page.locator(".syntax-lab > .visual-code-anatomy, .primary-code-anatomy > .visual-code-anatomy"),match=lab.locator(".anatomy-match");
  for(let index=0;index<doc.checks.length;index++) {
    await lab.locator(`.anatomy-group[data-group="${doc.checks[index]}"]`).click();
    await match.getByRole("button",{name:t.checkGroup,exact:true}).click();
    await expect(match.locator('[role="status"]')).toHaveClass("success-text");
    if(index<doc.checks.length-1) await match.getByRole("button",{name:t.nextMatch,exact:true}).click();
  }
}

/** Leaves Learn for the code tab: the Remember card's button in English, the Syntax Lab button otherwise. */
export async function finishLearn(page:Page,lang:Locale) {
  if(lang === "en") await page.getByRole("button",{name:"Explore this code →",exact:true}).click();
  else await page.getByRole("button",{name:ui[lang].syntaxDone,exact:true}).click();
}
