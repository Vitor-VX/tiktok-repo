import express from "express";
import path from "path";
import { getContext } from "./tiktok/browser.js";
import { isTikTokLogged } from "./tiktok/auth.js";
import { uploadVideo } from "./tiktok/upload.js";
import { startTikTokQrLogin } from "./tiktok/login.js";

const app = express();
app.use(express.static(path.resolve("public")));
app.use(express.json());
app.use(express.json({
    limit: "500mb"
}));
app.use(express.urlencoded({
    limit: "500mb",
    extended: true
}));

const loginPages = new Map();

app.post("/tiktok/:userId/login/qrcode", async (req, res) => {
    try {
        const { userId } = req.params;
        const context = await getContext(userId);

        const logged = await isTikTokLogged(context);
        if (logged) {
            return res.json({ logged: true });
        }

        const { qrCodeBase64, page } = await startTikTokQrLogin(context);
        loginPages.set(userId, page);

        res.json({
            logged: false,
            qrCode: qrCodeBase64
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/tiktok/:userId/login/status", async (req, res) => {
    try {
        const { userId } = req.params;
        const context = await getContext(userId);

        const logged = await isTikTokLogged(context);
        if (logged) {
            const page = loginPages.get(userId);
            if (page) {
                await page.close();
                loginPages.delete(userId);
            }
        }

        res.json({ logged });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/tiktok/:userId/print", async (req, res) => {
    try {
        const { userId } = req.params;
        const context = await getContext(userId);
        const page = loginPages.get(userId);

        const buffer = await page.screenshot({ encoding: "base64" });
        const base64 = buffer.toString("base64");

        res.json({ qrCode: `data:image/png;base64,${base64}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/tiktok/:userId/upload", async (req, res) => {
    try {
        const { userId } = req.params;
        const { videoPath, videoBase64, caption } = req.body;

        if (!videoPath && !videoBase64) {
            return res.status(400).json({
                error: "Informe videoPath ou videoBase64"
            });
        }

        const context = await getContext(userId);
        const logged = await isTikTokLogged(context);

        if (!logged) {
            return res.status(401).json({
                error: "Usuário não autenticado no TikTok"
            });
        }

        let finalVideoPath = videoPath;
        if (videoBase64) {
            finalVideoPath = saveBase64Video(videoBase64, userId);
        }

        const result = await uploadVideo({
            context,
            videoPath: finalVideoPath,
            caption
        });

        if (videoBase64 && fs.existsSync(finalVideoPath)) {
            fs.unlinkSync(finalVideoPath);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(6080, () => {
    console.log("🚀 API TikTok rodando na porta 6080");
});