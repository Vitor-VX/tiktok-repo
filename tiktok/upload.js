export async function uploadVideo({
    context,
    videoPath,
    caption
}) {
    const page = await context.newPage();

    await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
        waitUntil: "domcontentloaded"
    });

    const fileInput = await page.locator("input[type=\"file\"][accept=\"video/*\"]").waitHandle();
    await fileInput.uploadFile(videoPath);

    await new Promise((res) => setTimeout(res, 8000));

    const editor = await page.locator('div[contenteditable="true"]').waitHandle();
    await editor.click();

    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");

    await page.keyboard.press('Backspace');

    await page.keyboard.type(caption, { delay: 40 });

    const publishButton = await page.locator('[data-e2e="post_video_button"]').waitHandle();

    await page.waitForFunction(() => {
        const btn = document.querySelector('[data-e2e="post_video_button"]');
        return btn &&
            btn.getAttribute("aria-disabled") === "false" &&
            btn.getAttribute("data-disabled") === "false" &&
            btn.getAttribute("data-loading") === "false";
    }, { timeout: 60000 });

    await publishButton.hover();
    await new Promise(res => setTimeout(res, 200));
    await publishButton.click({ delay: 150 });

    await page.locator('button[type="button"][aria-disabled="false"]').waitHandle();
    await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('button')];
        const btn = buttons.find(b => b.innerText.includes('Publicar agora'));
        if (btn) btn.click();
    });

    return { success: true };
}