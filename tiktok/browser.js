import { chromium } from "playwright";
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

    const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: [
            "--no-sandbox",
            "--disable-blink-features=AutomationControlled"
        ]
    });

    contexts.set(userId, context);
    return context;
};