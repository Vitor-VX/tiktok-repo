import { connect } from "puppeteer-real-browser";
import path from "path";
import fs from "fs";

const sessions = new Map();

export async function getContext(userId) {
    if (sessions.has(userId)) {
        return sessions.get(userId);
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
    
    const session = { browser, page };
    sessions.set(userId, session);

    return sessions;
};