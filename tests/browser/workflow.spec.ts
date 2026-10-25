import { test, expect } from "@playwright/test";
test("operator validates real source, approves evidence, exports, and survives refresh", async ({
  page,
}) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "New antibody", exact: true }).click();
  await page.getByRole("button", { name: "Use TLS example" }).click();
  await page.getByLabel("Incident title").fill(`TLS regression ${Date.now()}`);
  await page.locator("#files").setInputFiles({
    name: "another_service.py",
    mimeType: "text/x-python",
    buffer: Buffer.from(
      'import requests\nrequests.post("https://example.com", verify=False)\n',
    ),
  });
  await page.getByRole("button", { name: "Add example (0/8)" }).click();
  await page.getByLabel("Example name").fill("Trusted CA bundle");
  await page
    .getByLabel("Python code", { exact: true })
    .fill(
      'import requests\nrequests.get("https://example.invalid", verify="/etc/trusted-ca.pem")',
    );
  await page.getByRole("button", { name: "Create draft antibody" }).click();
  await expect(
    page.getByRole("button", { name: "Run validation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve prevention pack" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Run validation" }).click();
  await expect(
    page.getByText("Known failure detected", { exact: true }),
  ).toBeVisible({ timeout: 140000 });
  await expect(
    page.getByRole("button", { name: "Approve prevention pack" }),
  ).toBeEnabled({ timeout: 140000 });
  await expect(
    page.getByText("another_service.py:2", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve prevention pack" }).click();
  await expect(
    page.getByRole("heading", { name: "Approved for export" }),
  ).toBeVisible();
  const exportUrl = await page
    .getByRole("link", { name: "Detection rule" })
    .getAttribute("href");
  const exported = await page.request.get(exportUrl!);
  expect(exported.ok()).toBeTruthy();
  expect(await exported.text()).toContain("verify=False");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Approved for export" }),
  ).toBeVisible();
  expect(page.url()).toContain("view=detail");
  expect(page.url()).toContain("id=");
  await page.screenshot({ path: "/tmp/antibody-desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "Revise / import reviewed proposal" })
    .click();
  await page.getByLabel("Incident title").fill("Reviewed detector revision");
  await page.getByRole("button", { name: "Save new draft version" }).click();
  await expect(
    page.getByRole("heading", { name: "Reviewed detector revision" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Approve prevention pack" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "original evidence" }).click();
  await expect(
    page.getByRole("heading", { name: "Approved for export" }),
  ).toBeVisible();
});
test("mobile navigation, form, and landing have no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Fix it once/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "/tmp/antibody-landing-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Integrations", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Make the loop executable." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "/tmp/antibody-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/app?view=create");
  await page
    .getByLabel("Source for exposure scanning")
    .selectOption("repository");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeHidden();
});
test("a failed detector keeps approval locked and supports a corrected revision", async ({
  page,
}) => {
  await page.goto("/app?view=create");
  await page.getByRole("button", { name: "Use TLS example" }).click();
  await page
    .getByLabel("Incident title")
    .fill("Controlled invalid detector recovery");
  await page
    .getByLabel("Semgrep rule YAML")
    .fill("rules: []\n# Controlled invalid detector");
  await page.getByRole("button", { name: "Create draft antibody" }).click();
  await page.getByRole("button", { name: "Run validation" }).click();
  await expect(
    page.getByText(
      "Validation could not complete. Check rule syntax, Python fixtures, and Semgrep installation.",
    ),
  ).toBeVisible({ timeout: 60000 });
  await expect(
    page.getByRole("button", { name: "Approve prevention pack" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Revise / import reviewed proposal" })
    .click();
  await page.getByRole("button", { name: "Use TLS example" }).click();
  await page.getByRole("button", { name: "Save new draft version" }).click();
  await expect(
    page.getByRole("button", { name: "Run validation" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "original evidence" }),
  ).toBeVisible();
});
