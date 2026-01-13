import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const userId = "user_123";

const profilePath = path.resolve(
  "profiles",
  userId
);

export async function isTikTokLogged(context) {
  const cookies = await context.cookies("https://www.tiktok.com");

  const hasSession = cookies.some(c =>
    ["sessionid", "sessionid_ss", "sid_tt"].includes(c.name)
  );

  if (!hasSession) return false;

  const page = await context.newPage();
  await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
    waitUntil: "domcontentloaded"
  });

  const logged = !page.url().includes("login");
  await page.close();

  return logged;
};

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
  const logged = await isTikTokLogged(context, page);

  if (!logged) {
    console.log("⚠️ Usuário NÃO está logado, precisa autenticar");

    await page.goto("https://www.tiktok.com/login/qrcode", {
      waitUntil: "domcontentloaded"
    });

    const canvasElement = page.locator('canvas');

    await canvasElement.screenshot({
      path: 'canvas.png'
    });
  } else {
    console.log("✅ Usuário autenticado");

    const fileInput = page.locator("input[type=\"file\"][accept=\"video/*\"]");
    await fileInput.setInputFiles("C:/Users/João/Desktop/tiktok/video.mp4");

    await page.waitForTimeout(8000);

    // localiza o editor Draft.js
    const editor = page.locator('div[contenteditable="true"]');

    // espera existir e estar visível
    await editor.first().waitFor({
      state: 'visible',
      timeout: 60000
    });

    // foca
    await editor.first().click();

    // limpa texto
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    // digita legenda
    await page.keyboard.type(
      'Legenda automática 🚀 #fyp #viral',
      { delay: 40 }
    );

    const publishButton = page.locator('[data-e2e="post_video_button"]');

    // espera botão existir
    await publishButton.waitFor({ state: 'attached', timeout: 60000 });

    // espera estar realmente habilitado
    await page.waitForFunction(() => {
      const btn = document.querySelector('[data-e2e="post_video_button"]');
      return btn &&
        btn.getAttribute('aria-disabled') === 'false' &&
        btn.getAttribute('data-disabled') === 'false' &&
        btn.getAttribute('data-loading') === 'false';
    }, { timeout: 60000 });

    // clique humano
    await publishButton.hover();
    await page.waitForTimeout(200);
    await publishButton.click({ delay: 150 });
  }
})();