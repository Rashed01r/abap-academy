import { chromium } from "@playwright/test";
const browser=await chromium.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
let checked=0;
try{for(const [lang,width,height] of [["en",1440,1000],["en",390,844]]){
 const context=await browser.newContext({viewport:{width,height}});await context.addInitScript(lang=>localStorage.setItem("abap2-language",lang),lang);const page=await context.newPage();
 for(const id of ["dictionary-introduction","cloud-introduction","projects-employee-management"]){
  await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3025"}/?mission=${id}`);await page.locator(".architecture-node").first().waitFor();
  if(width>760)await page.getByRole("button",{name:"Expand workspace",exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll(".architecture-connections > path").length>0);
  await page.waitForTimeout(60);
  const failures=await page.locator(".architecture-canvas").evaluate(el=>Array.from(el.querySelectorAll("svg > path")).flatMap(path=>{
    const target=el.querySelector(`[data-architecture-node="${path.dataset.edgeTo}"]`).getBoundingClientRect();
    const point=path.getPointAtLength(path.getTotalLength());const p=new DOMPoint(point.x,point.y).matrixTransform(path.getScreenCTM());
    return p.x<target.left-2 || p.x>target.right+2 || p.y<target.top-2 || p.y>target.bottom+2 ? [`${path.dataset.edgeTo}: endpoint ${p.x},${p.y} outside node`] : [];
  }));if(failures.length)throw new Error(`${id}/${lang}: ${failures.join(", ")}`);checked++;
 }
 await context.close();
}}finally{await browser.close();}
console.log(`${checked} architecture scenes passed actual SVG-to-node endpoint geometry in desktop English and mobile English.`);
