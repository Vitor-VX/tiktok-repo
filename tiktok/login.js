export async function startTikTokQrLogin(context) {
    const page = await context.newPage();

    await page.goto("https://www.tiktok.com/login/qrcode", {
        waitUntil: "domcontentloaded"
    });

    const canvas = await page.waitForSelector("canvas", {
        visible: true
    });

    const buffer = await canvas.screenshot({ encoding: "base64" });
    const base64 = buffer.toString("base64");

    return {
        qrCodeBase64: `data:image/png;base64,${base64}`,
        page
    };
}