export async function startTikTokQrLogin(context) {
    const page = await context.newPage();

    await page.goto("https://www.tiktok.com/login/qrcode", {
        waitUntil: "domcontentloaded"
    });

    const canvas = page.locator("canvas");
    await canvas.waitFor({ state: "visible", timeout: 30000 });

    const buffer = await canvas.screenshot();
    const base64 = buffer.toString("base64");

    return {
        qrCodeBase64: `data:image/png;base64,${base64}`,
        page
    };
}