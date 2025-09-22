import axios from "axios";
import { ryzenCDN } from "../lib/uploadFile.js";

const validFilters = ["coklat", "hitam", "nerd", "piggy", "carbon", "botak"];
const wait = "⏳ Sedang memproses gambar...";

let handler = async (m, { conn, args }) => {
    try {
        await conn.sendMessage(m.chat, { text: wait }, { quoted: m });

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";
        if (!mime) {
            return await conn.sendMessage(m.chat, { text: " Kirim atau reply gambar dengan caption .hitamkan" }, { quoted: m });
        }
        let media = await q.download();
        if (!media) {
            return await conn.sendMessage(m.chat, { text: " Gagal mendownload media!" }, { quoted: m });
        }

        let cdnResult = await ryzenCDN(media);
        if (!cdnResult || !cdnResult.url) {
            return await conn.sendMessage(m.chat, { text: " Gagal upload ke RyzenCDN!" }, { quoted: m });
        }

        let url = cdnResult.url;
        let filter = (args[0] || "coklat").trim().toLowerCase();

        if (!validFilters.includes(filter)) {
            return await conn.sendMessage(m.chat, { text: `Filter tidak valid! Pilihan: ${validFilters.join(", ")}` }, { quoted: m });
        }

        let response = await axios.get(`${APIs.ryzumi}/api/ai/negro`, {
            params: { url: url, filter: filter },
            responseType: "arraybuffer",
        });

        await conn.sendMessage(
            m.chat,
            {
                image: response.data,
                caption: ` Filter diterapkan: ${filter}`,
            },
            { quoted: m }
        );

    } catch (error) {
        await conn.sendMessage(
            m.chat,
            { text: ` Terjadi error: ${error.message || error}` },
            { quoted: m }
        );
        console.error(error);
    }
};

handler.help = ["hitamkan"];
handler.tags = ["ai"];
handler.command = /^(hitamkan)$/i;
handler.register = true;
handler.limit = 20;

export default handler;
