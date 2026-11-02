import {expect, type Page} from "@playwright/test";
import {missions} from "../src/lib/curriculum";
import {getAnatomy,orientationExamples} from "../src/lib/anatomy-content";
import {ui, type Locale} from "../src/lib/i18n";

export async function matchAnatomy(page:Page,id:string,lang:Locale) {
  const source=id === "orientation" ? orientationExamples[lang] : missions.find(m=>m.id === id)!.example;
  const doc=getAnatomy(id,source),t=ui[lang];
  const lab=page.locator(".syntax-lab"),match=lab.locator(".anatomy-match");
  for(let index=0;index<doc.checks.length;index++) {
    await lab.locator(`.anatomy-group[data-group="${doc.checks[index]}"]`).click();
    await match.getByRole("button",{name:t.checkGroup,exact:true}).click();
    await expect(match.locator('[role="status"]')).toHaveClass("success-text");
    if(index<doc.checks.length-1) await match.getByRole("button",{name:t.nextMatch,exact:true}).click();
  }
}
