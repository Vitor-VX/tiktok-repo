function buildFollowersUrl({ msToken, verifyFp, xBogus, maxTime = 0 }) {
    const groupList = encodeURIComponent(JSON.stringify([
        {
            count: 20,
            is_mark_read: 1,
            group: 7,
            max_time: maxTime,
            min_time: 0
        }
    ]));

    return `https://www.tiktok.com/api/notice/multi/?` +
        `aid=1988` +
        `&device_platform=web_pc` +
        `&region=BR` +
        `&priority_region=BR` +
        `&user_is_login=true` +
        `&browser_language=pt-BR` +
        `&browser_platform=Win32` +
        `&os=windows` +
        `&tz_name=America/Sao_Paulo` +
        `&group_list=${groupList}` +
        `&verifyFp=${verifyFp}` +
        `&msToken=${msToken}` +
        `&X-Bogus=${xBogus}`;
}

export async function getFollowers(session, xBogus, maxTime = 0) {
    const { page } = session;

    const cookies = await page.cookies();
    const msToken = await page.evaluate(() => {
        return sessionStorage.getItem("msToken");
    });
    const verifyFp = cookies.find(c => c.name === "s_v_web_id")?.value;

    const url = buildFollowersUrl({
        msToken: msToken,
        verifyFp: verifyFp,
        xBogus: xBogus,
        maxTime
    });

    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
    const userAgent = await page.evaluate(() => navigator.userAgent);

    const res = await fetch(url, {
        headers: {
            "cookie": cookieHeader,
            "user-agent": userAgent,
            "accept": "application/json"
        }
    });

    const data = await res.json();
    return data.notice_lists
        .flatMap(g => g.notice_list || [])
        .filter(n => n.follow?.from_user)
        .map(n => ({
            nickname: n.follow.from_user.nickname,
            username: n.follow.from_user.unique_id,
            avatar: n.follow.from_user.avatar_thumb?.url_list?.[0] || null,
            timestamp: new Date(n.create_time * 1000).toLocaleString("pt-BR"),
            maxTime: n.create_time
        }));
}

export async function waitForXBogus(session) {
    const { page } = session;

    return new Promise(async (resolve) => {
        const handler = req => {
            const url = req.url();
            if (url.includes("/api/notice/multi")) {
                const u = new URL(url);
                const xBogus = u.searchParams.get("X-Bogus");
                if (xBogus) {
                    page.off("request", handler);
                    resolve(xBogus);
                }
            }
        };

        page.on("request", handler);

        await page.goto("https://www.tiktok.com", {
            waitUntil: "networkidle",
            timeout: 60000
        });
    });
}
