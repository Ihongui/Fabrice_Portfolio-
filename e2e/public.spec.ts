import { expect, test } from "@playwright/test";
test("English home renders and language toggle opens French", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /Building practical technology/i })).toBeVisible();
  await page.getByRole("link", { name: "FR" }).click();
  await expect(page).toHaveURL(/\/fr/);
  await expect(page.getByRole("heading", { name: /Concevoir des technologies/i })).toBeVisible();
});
test("CV download returns a PDF", async ({ request }) => {
  const response = await request.get("/api/cv/en");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("application/pdf");
});
test("admin login page is available without exposing the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
