import fs from "fs";
import path from "path";
import crypto from "crypto";

export function saveBase64Video(base64, userId) {
    const cleaned = base64.replace(/^data:video\/\w+;base64,/, "");

    const buffer = Buffer.from(cleaned, "base64");

    const tempDir = path.resolve("temp", userId);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `video-${crypto.randomUUID()}.mp4`;
    const filePath = path.join(tempDir, filename);

    fs.writeFileSync(filePath, buffer);

    return filePath;
};