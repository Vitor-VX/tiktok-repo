import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const userId = "user_123";

const profilePath = path.resolve(
  "profiles",
  userId
);

if (!fs.existsSync(profilePath)) {
  fs.mkdirSync(profilePath, { recursive: true });
}

(async () => {
  const context = await chromium.launchPersistentContext(
    profilePath,
    {
      headless: false,
      viewport: { width: 1280, height: 720 },
      args: [
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    }
  );

  const page = await context.newPage();

  await page.goto("https://www.tiktok.com");

  console.log("Se for o primeiro acesso, faça login manual pelo VNC");
})();