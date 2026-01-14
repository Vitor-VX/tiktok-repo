// import { chromium } from "playwright";
import { connect } from "puppeteer-real-browser";
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

function buildFollowersUrl({ msToken, verifyFp, xBogus, maxTime = 0 }) {
  const groupList = encodeURIComponent(JSON.stringify([
    {
      count: 20,
      is_mark_read: 1,
      group: 7,
      max_time: maxTime,
      min_time: 0
    }
  ]));

  return `https://www.tiktok.com/api/notice/multi/?` +
    `aid=1988` +
    `&device_platform=web_pc` +
    `&region=BR` +
    `&priority_region=BR` +
    `&user_is_login=true` +
    `&browser_language=pt-BR` +
    `&browser_platform=Win32` +
    `&os=windows` +
    `&tz_name=America/Sao_Paulo` +
    `&group_list=${groupList}` +
    `&verifyFp=${verifyFp}` +
    `&msToken=${msToken}` +
    `&X-Bogus=${xBogus}`;
}

async function getFollowers(page, xBogus, maxTime = 0) {
  const cookies = await page.cookies();
  const msToken = await page.evaluate(() => {
    return sessionStorage.getItem("msToken");
  });
  const verifyFp = cookies.find(c => c.name === "s_v_web_id")?.value;

  const url = buildFollowersUrl({
    msToken: msToken,
    verifyFp: verifyFp,
    xBogus: xBogus,
    maxTime
  });

  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
  const userAgent = await page.evaluate(() => navigator.userAgent);

  const res = await fetch(url, {
    headers: {
      "cookie": cookieHeader,
      "user-agent": userAgent,
      "accept": "application/json"
    }
  });

  const data = await res.json();

  return data.notice_lists
    .flatMap(g => g.notice_list || [])
    .filter(n => n.follow?.from_user)
    .map(n => ({
      nickname: n.follow.from_user.nickname,
      username: n.follow.from_user.unique_id,
      avatar: n.follow.from_user.avatar_thumb?.url_list?.[0] || null,
      timestamp: new Date(n.create_time * 1000).toLocaleString("pt-BR"),
      maxTime: n.create_time
    }));
}

function waitForXBogus(page) {
  return new Promise(resolve => {
    const handler = req => {
      const url = req.url();
      if (url.includes("/api/notice/multi")) {
        const u = new URL(url);
        const xBogus = u.searchParams.get("X-Bogus");
        if (xBogus) {
          page.off("request", handler);
          resolve(xBogus);
        }
      }
    };
    page.on("request", handler);
  });
}

(async () => {
  const { browser: context } = await connect(
    {
      customConfig: {
        userDataDir: profilePath,
      },
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

    await page.goto("https://www.tiktok.com", {
      waitUntil: "domcontentloaded"
    });

    const xBogus = await waitForXBogus(page);
    const followers = await getFollowers(page, xBogus);
    console.log(followers);

    // await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
    //   waitUntil: "domcontentloaded"
    // });

    // const fileInput = await page.locator("input[type=\"file\"][accept=\"video/*\"]").waitHandle();
    // await fileInput.uploadFile("C:/Users/João/Desktop/tiktok/video.mp4");

    // await new Promise((res) => setTimeout(res, 8000));

    // const editor = await page.locator('div[contenteditable="true"]').waitHandle();
    // await editor.click();

    // await page.keyboard.down("Control");
    // await page.keyboard.press("A");
    // await page.keyboard.up("Control");

    // await page.keyboard.press('Backspace');

    // await page.keyboard.type(
    //   'Legenda automática 🚀 #fyp #viral',
    //   { delay: 40 }
    // );

    // const publishButton = await page.locator('[data-e2e="post_video_button"]').waitHandle();

    // await page.waitForFunction(() => {
    //   const btn = document.querySelector('[data-e2e="post_video_button"]');
    //   return btn &&
    //     btn.getAttribute("aria-disabled") === "false" &&
    //     btn.getAttribute("data-disabled") === "false" &&
    //     btn.getAttribute("data-loading") === "false";
    // }, { timeout: 60000 });

    // await publishButton.hover();
    // await new Promise(res => setTimeout(res, 200));
    // await publishButton.click({ delay: 150 });

    // await page.locator('button[type="button"][aria-disabled="false"]').waitHandle();
    // await page.evaluate(() => {
    //   const buttons = [...document.querySelectorAll('button')];
    //   const btn = buttons.find(b => b.innerText.includes('Publicar agora'));
    //   if (btn) btn.click();
    // });
  }
})();