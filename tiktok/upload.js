export async function uploadVideo({
    context,
    videoPath,
    caption
}) {
    const page = await context.newPage();

    await page.goto("https://www.tiktok.com/tiktokstudio/upload");

    const fileInput = page.locator('input[type="file"][accept="video/*"]');
    await fileInput.setInputFiles(videoPath);

    await page.waitForTimeout(8000);

    const editor = page.locator('div[contenteditable="true"]');
    await editor.first().waitFor({ state: "visible", timeout: 60000 });

    await editor.first().click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.type(caption, { delay: 40 });

    const publishButton = page.locator('[data-e2e="post_video_button"]');

    await publishButton.waitFor({ state: "attached", timeout: 60000 });

    await page.waitForFunction(() => {
        const btn = document.querySelector('[data-e2e="post_video_button"]');
        return btn &&
            btn.getAttribute("aria-disabled") === "false" &&
            btn.getAttribute("data-disabled") === "false" &&
            btn.getAttribute("data-loading") === "false";
    }, { timeout: 60000 });

    await publishButton.hover();
    await page.waitForTimeout(200);
    await publishButton.click({ delay: 150 });

    return { success: true };
}