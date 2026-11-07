import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("build/visual-classroom",{recursive:true});
const browser=await chromium.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
const ids=process.argv.slice(2).length ? process.argv.slice(2) : ["data-table-categories","data-work-areas-field-symbols","addition","structures","do","while","dictionary-introduction","database-fundamentals","oop-introduction","applications-reports","modern-syntax","cloud-introduction","projects-employee-management"];
try {for(const [lang,width,height] of [["en",1440,1000],["en",390,844]]) {
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(({lang,width})=>{localStorage.setItem("abap2-language",lang);localStorage.setItem("abap2-appearance",width>760 ? "light" : "dark");},{lang,width});
 const page=await context.newPage();
 for(const id of ids){
   await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3025"}/?mission=${id}`);await page.locator("[data-primary-diagram]").first().waitFor();
   if(width>760)await page.getByRole("button",{name:"Expand workspace",exact:true}).click();
   await page.locator(".panel-body").evaluate(el=>el.scrollTop=0);
   await page.screenshot({path:`build/visual-classroom/${id}-${lang}-${width}-first.png`});
   const diagram=page.locator("[data-primary-diagram]").first();
   await diagram.evaluate(el=>{const panel=el.closest(".panel-body");panel.scrollTop+=el.getBoundingClientRect().top-panel.getBoundingClientRect().top-75;});
   await page.screenshot({path:`build/visual-classroom/${id}-${lang}-${width}-diagram.png`});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`Document overflow ${id}/${lang}`);
 }
 await context.close();
}}finally{await browser.close();}
console.log(`Captured ${ids.length} topics in English desktop/light and English mobile/dark. Inspect PNGs before recording visual approval.`);
