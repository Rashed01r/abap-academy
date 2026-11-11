import { test, expect } from "@playwright/test";

test("contact page: header link, deep link, back button, details, validation and bot trap", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Learning roadmap" });
  await nav.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/page=contact/);
  await expect(page.getByRole("heading", { name: "Contact me", level: 1 })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Contact", exact: true })).toHaveAttribute("aria-current", "page");

  const details = page.getByRole("list", { name: "Contact details" });
  await expect(details.getByRole("link", { name: "rashed019r@gmail.com" })).toHaveAttribute("href", "mailto:rashed019r@gmail.com");
  await expect(details.getByRole("link", { name: /\+966 55 290 3225/ })).toHaveAttribute("href", "tel:+966552903225");
  await expect(details.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/rashed-balhareth-5385a5240/");
  await expect(details.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/Rashed01r");

  // Empty submit: three errors, focus on the first field.
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".contact-error")).toHaveCount(4);
  await expect(page.getByLabel("Full name")).toBeFocused();

  // Honeypot filled: fake success, fields cleared, no cooldown recorded.
  await page.getByLabel("Full name").fill("Bot");
  await page.getByLabel("Email", { exact: true }).fill("bot@example.com");
  await page.getByLabel("Subject").fill("Offer");
  await page.getByLabel("Message").fill("Buy cheap things now");
  await page.locator("#contact-trap").fill("spam.example", { force: true });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("Thank you.");
  await expect(page.getByLabel("Full name")).toHaveValue("");
  expect(await page.evaluate(() => localStorage.getItem("abap2-contact-last-sent"))).toBeNull();

  // Back returns to the roadmap; a fresh deep link reopens Contact.
  await page.goBack();
  await expect(page.getByRole("combobox", { name: "Search the roadmap" })).toBeVisible();
  await page.goto("/?page=contact");
  await expect(page.getByRole("heading", { name: "Contact me", level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("mouse wheel / touchpad scrolls the contact page on a short screen", async ({ page, isMobile }) => {
  test.skip(isMobile, "wheel input is desktop-only");
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/?page=contact");
  const send = page.getByRole("button", { name: "Send message" });
  await expect(send).not.toBeInViewport();
  await page.getByRole("heading", { name: "Contact me", level: 1 }).hover();
  await page.mouse.wheel(0, 2000);
  await expect(send).toBeInViewport();
});

test("Send opens a prefilled Gmail draft in a new tab and keeps the text", async ({ page }) => {
  // Record window.open instead of opening Gmail for real.
  await page.addInitScript(() => { (window as unknown as { opened: string[] }).opened = []; window.open = ((url: string) => { (window as unknown as { opened: string[] }).opened.push(url); return { opener: null } as Window; }) as typeof window.open; });
  await page.goto("/?page=contact");
  await page.getByLabel("Full name").fill("Sara Ahmed");
  await page.getByLabel("Email", { exact: true }).fill("sara@example.com");
  await page.getByLabel("Subject").fill("RAP lesson question");
  await page.getByLabel("Message").fill("A question about the RAP lesson.");
  // Sent immediately after filling (like browser autofill): must open Gmail, not be treated as a bot.
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("Gmail opened in a new tab");
  const opened = await page.evaluate(() => (window as unknown as { opened: string[] }).opened);
  expect(opened).toHaveLength(1);
  const url = new URL(opened[0]);
  expect(url.hostname).toBe("mail.google.com");
  expect(url.searchParams.get("to")).toBe("rashed019r@gmail.com");
  expect(url.searchParams.get("su")).toBe("RAP lesson question");
  expect(url.searchParams.get("body")).toContain("A question about the RAP lesson.");
  await expect(page.getByRole("status").getByRole("link", { name: "Use another email app" })).toHaveAttribute("href", /^mailto:rashed019r@gmail\.com\?subject=RAP%20lesson%20question&/);
  await expect(page.getByLabel("Message")).toHaveValue("A question about the RAP lesson.");
  // A second send within a minute is refused.
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("wait a minute");
  expect(await page.evaluate(() => (window as unknown as { opened: string[] }).opened.length)).toBe(1);
});
