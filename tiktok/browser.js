// import { chromium } from "playwright";
import { connect } from "puppeteer-real-browser";
import path from "path";
import fs from "fs";

const contexts = new Map();

export async function getContext(userId) {
    if (contexts.has(userId)) {
        return contexts.get(userId);
    }

    const profilePath = path.resolve("profiles", userId);

    if (!fs.existsSync(profilePath)) {
        fs.mkdirSync(profilePath, { recursive: true });
    }

    const { browser, page } = await connect({
        customConfig: {
            userDataDir: profilePath
        },
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: [
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled"
        ]
    });


    // page.waitForFunction()

    // const canvasHandle = await page.waitForSelector("canvas", {
    //     visible: true
    // });

    // await page.keyboard.
    // canvasHandle.screenshot({ encoding: "base64" })

        contexts.set(userId, browser);
    return browser;
};