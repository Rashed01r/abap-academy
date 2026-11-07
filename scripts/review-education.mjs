import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const output = "build/education-review";
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true});
const topics = process.argv.length > 2 ? process.argv.slice(2) : ["conditions", "data-table-categories", "dictionary-introduction", "database-fundamentals", "oop-introduction", "applications-reports", "modern-syntax", "cloud-introduction", "projects-employee-management"];
try {
  for (const [lang, theme, width, height] of [["en", "light", 1440, 1100], ["en", "dark", 390, 844]]) {
    const context = await browser.newContext({viewport: {width, height}});
    await context.addInitScript(({lang, theme}) => {localStorage.setItem("abap2-language", lang); localStorage.setItem("abap2-appearance", theme);}, {lang, theme});
    const page = await context.newPage();
    for (const id of topics) {
      await page.goto(`${process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3023"}/?mission=${id}`);
      await page.locator(".lesson-concepts").waitFor();
      if (width > 760) await page.getByRole("button", {name: lang === "en" ? "Expand workspace" : "توسيع مساحة التعلّم", exact: true}).click();
      await page.locator(".lesson-concepts").scrollIntoViewIfNeeded();
      await page.screenshot({path: `${output}/${id}-${lang}-learn.png`});
      const diagram = page.locator(".control-flow-explorer");
      if (await diagram.count()) {
        await diagram.evaluate(el => el.scrollIntoView({block: "start"}));
        await page.screenshot({path: `${output}/${id}-${lang}-diagram.png`});
        if (id === "loop-control") await diagram.getByRole("button", {name: "EXIT", exact: true}).click();
        if (id === "oop-introduction") {
          await diagram.getByRole("button", {name: "CLASS-DATA", exact: true}).click();
          await diagram.getByRole("button", {name: lang === "en" ? "Increment through object A" : "زِد القيمة عبر الكائن A", exact: true}).click();
        }
        if (id === "applications-reports") await diagram.getByRole("button", {name: lang === "en" ? "Uncaught runtime error" : "خطأ وقت تشغيل غير معالج", exact: true}).click();
        if (["loop-control", "oop-introduction", "applications-reports"].includes(id)) {
          await diagram.locator('[role="status"]').evaluate(el => el.scrollIntoView({block: "end"}));
          await page.screenshot({path: `${output}/${id}-${lang}-changed-outcome.png`});
        }
      }
      await page.getByRole("tab", {name: lang === "en" ? "Visualize" : "تصوّر", exact: true}).click();
      const relations = page.locator(".artifact-relationship-map");
      if (!["conditions", "loop-control", "data-table-categories"].includes(id)) {
        await relations.waitFor();
        await relations.scrollIntoViewIfNeeded();
        await page.screenshot({path: `${output}/${id}-${lang}-relations.png`});
      }
      const geometry = await page.evaluate(() => ({document: document.documentElement.scrollWidth <= innerWidth, panel: !!document.querySelector(".panel-body")}));
      if (!geometry.document || !geometry.panel) throw new Error(`Viewport failed: ${id}/${lang}`);
    }
    await context.close();
  }
} finally {await browser.close();}
console.log(`Captured ${topics.length} topics in English desktop/light and English mobile/dark, including available concept, diagram and relationship views. Inspect the actual PNGs before recording visual verification.`);
