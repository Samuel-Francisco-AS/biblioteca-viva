import { defineConfig, devices } from "@playwright/test";

const port = 4_173;
const b2DevelopmentPort = 4_174;
// E2E clears IndexedDB as part of its fixture. Reusing an arbitrary local
// server would make that destructive operation target an unknown browser
// origin, so reuse is opt-in even outside CI.
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_SERVER === "true";

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: "test-results",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: process.env.CI ? "github" : "list",
  retries: process.env.CI ? 1 : 0,
  testDir: "./e2e",
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
      port,
      reuseExistingServer,
      timeout: 30_000,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${b2DevelopmentPort}`,
      port: b2DevelopmentPort,
      reuseExistingServer,
      timeout: 30_000,
    },
  ],
});
