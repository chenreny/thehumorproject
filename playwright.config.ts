import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 90_000,
  workers: 1,
  use: { baseURL: process.env.TEST_BASE_URL || "http://localhost:3100", headless: true },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
});
