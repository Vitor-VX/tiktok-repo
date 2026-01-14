export async function isTikTokLogged(session) {
    const { page } = session;

    const cookies = await page.cookies("https://www.tiktok.com");

    const hasSession = cookies.some(c =>
        ["sessionid", "sessionid_ss", "sid_tt"].includes(c.name)
    );

    if (!hasSession) return false;

    await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
        waitUntil: "domcontentloaded"
    });

    const logged = !page.url().includes("login");
    return logged;
};