import { test, expect } from "@playwright/test";

test("all project pages work and no runtime/CSP errors occur", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(4);
  for (const [slug, title] of [["byzantium", "Byzantium"], ["boomtown", "BoomTown"], ["the-grid", "The Grid"], ["horizon", "Horizon"]]) {
    await page.goto("/projects/" + slug + "/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
    await expect(page.getByRole("link", { name: "All projects" })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("pages do not overflow at narrow, tablet, and desktop widths", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/projects/", "/projects/boomtown/", "/studio/", "/contact/", "/privacy/", "/terms/", "/support/"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path + " at " + width).toBe(true);
    }
  }
});

test("mobile menu supports keyboard, escape, and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Menu" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(nav).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test("skip link reaches the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("unconfigured contact never pretends it can send a message", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByText("Not open just yet.")).toBeVisible();
  await page.goto("/contact/success/");
  await expect(page.getByText(/No message has been sent/)).toBeVisible();
});

test("navigation and project content survive JavaScript being disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(4);
  await context.close();
});

test("unknown routes show the custom 404", async ({ page }) => {
  const response = await page.goto("/page-that-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("off course");
});
