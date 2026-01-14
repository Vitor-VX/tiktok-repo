export async function uploadVideo({
    context,
    videoPath,
    caption
}) {
    const page = await context.newPage();

    await page.goto("https://www.tiktok.com/tiktokstudio/upload");

    const fileInput = await page.waitForSelector('input[type="file"][accept="video/*"]', {
        visible: true
    });
    await fileInput.setInputFiles(videoPath);

    await new Promise(res => setTimeout(res, 8000));
    const editor = page.waitForSelector('div[contenteditable="true"]', {
        visible: true
    });

    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.type(caption, { delay: 40 });

    const publishButton = page.waitForSelector('[data-e2e="post_video_button"]', {
         visible: true
    });

    // await publishButton.waitFor({ state: "attached", timeout: 60000 });

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

    return { success: true };
}