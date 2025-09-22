import fetch from "node-fetch";

const handler = async (m, { usedPrefix, command, conn, args }) => {
    if (!args[0]) {
        return await conn.sendMessage(
            m.chat,
            { text: `*Example:* ${usedPrefix}${command} Yagami Light` },
            { quoted: m }
        );
    }

    await conn.sendMessage(m.chat, { text: wait }, { quoted: m });

    try {
        const q = encodeURIComponent(args.join(" "));
        const response = await fetch(
            `${APIs.ryzumi}/api/search/pinterest?query=${q}`
        );
        const data = await response.json();

        if (!Array.isArray(data) || data.length < 1) {
            return await conn.sendMessage(
                m.chat,
                { text: " Error, Foto Tidak Ditemukan" },
                { quoted: m }
            );
        }
        const results = data
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(5, data.length));

        for (const result of results) {
            const res = await fetch(result.directLink, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                    Referer: result.directLink,
                },
            });
            if (!res.ok) continue;
            const buffer = await res.buffer();

            await conn.sendMessage(
                m.chat,
                {
                    image: buffer,
                    caption: `🔗 ${result.link}`,
                },
                { quoted: m }
            );
        }
    } catch (e) {
        console.error(e);
        await conn.sendMessage(
            m.chat,
            { text: `⚠️ Error: ${e.message || e}` },
            { quoted: m }
        );
    }
};

handler.help = ["pinterest"];
handler.tags = ["internet"];
handler.command = /^pin(terest)?$/i;
handler.limit = 10;
handler.register = true;

export default handler;
