import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 180000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  workers: 1,
  reporter: "list",
});
