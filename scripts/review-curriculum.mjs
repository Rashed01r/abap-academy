import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3020";
const folder = "build/curriculum-review";
await mkdir(folder, {recursive: true});
const browser = await chromium.launch({executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true});
try {
  for (const [lang, width, height] of [["en",1440,1000],["ar",1440,1000],["ar",390,844]]) {
    const context = await browser.newContext({viewport: {width,height}});
    await context.addInitScript(({lang}) => {
      localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", lang === "ar" ? "dark" : "light");
    }, {lang});
    const page = await context.newPage();
    for (const id of ["dictionary-introduction", "database-fundamentals", "oop-introduction", "applications-reports", "modern-syntax", "cloud-introduction", "data-read-table", "data-table-mutations", "data-sorting-filtering"]) {
      await page.goto(`${base}/?mission=${id}`);
      await page.locator(".lesson-summary h1").waitFor();
      if (width > 768) await page.locator(".panel-actions button").first().click();
      await page.getByRole("tab").nth(1).click();
      await page.getByRole("tabpanel").waitFor();
      if (id.startsWith("data-")) await page.locator(".monaco-editor").waitFor();
      await page.locator(".panel-body").evaluate(el => {el.scrollTop = 0;});
      await page.screenshot({path: `${folder}/${id}-${lang}-${width}.png`});
      if (!id.startsWith("data-")) {
        await page.locator(".panel-body").evaluate(el => {
          const target = el.querySelector(".guided-explorer");
          if (target) el.scrollTop += target.getBoundingClientRect().top - el.getBoundingClientRect().top - 20;
        });
        await page.screenshot({path: `${folder}/${id}-model-${lang}-${width}.png`});
      } else {
        await page.getByRole("button", {name: lang === "en" ? "Build trace" : "إنشاء تتبع التنفيذ", exact: true}).click();
        const statement = id === "data-read-table" ? "READ TABLE lt_employees" : id === "data-table-mutations" ? "INSERT ls_employee" : "SORT lt_employees";
        await page.locator(".timeline").getByRole("button").filter({hasText: statement}).first().click();
        await page.locator(".panel-body").evaluate(el => {
          const target = el.querySelector(".lookup-summary, .table-change-summary");
          if (target) el.scrollTop += target.getBoundingClientRect().top - el.getBoundingClientRect().top - 20;
        });
        await page.screenshot({path: `${folder}/${id}-model-${lang}-${width}.png`});
      }
      const sizes = await page.evaluate(() => ({documentWidth:document.documentElement.scrollWidth, documentHeight:document.documentElement.scrollHeight, width:innerWidth,height:innerHeight}));
      if (sizes.documentWidth > width || sizes.documentHeight > height) throw new Error(`${id}/${lang}: document overflow ${JSON.stringify(sizes)}`);
    }
    await context.close();
  }
} finally {await browser.close();}
console.log(`Saved 60 viewport captures to ${folder}; document geometry passed.`);
