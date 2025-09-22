
import fetch from "node-fetch";

var handler = async (m, { conn, text }) => {
    try {
        if (!text) {
            return await conn.sendMessage(
                m.chat,
                { text: "*⚠️ Masukkan Judul Manga Yang Ingin Kamu Cari!*" },
                { quoted: m }
            );
        }

        await conn.sendMessage(
            m.chat,
            { text: "⏳ Sedang mencari manga... Silahkan tunggu" },
            { quoted: m }
        );

        let res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}`);
        if (!res.ok) throw "❌ Manga tidak ditemukan!";

        let json = await res.json();
        let manga = json.data[0];
        if (!manga) throw "❌ Manga tidak ditemukan!";

        const judul = manga.titles.map(j => `${j.title} [${j.type}]`).join("\n");
        const penulis = manga.authors.map(a => `${a.name} (${a.url})`).join("\n");
        const genres = manga.genres.map(g => g.name).join(", ");

        let pesan = `
📚 *Title:* ${judul}
📑 *Chapters:* ${manga.chapters || "N/A"}
✉️ *Type:* ${manga.type || "N/A"}
🗂 *Status:* ${manga.status || "N/A"}
😎 *Genre:* ${genres || "N/A"}
🗃 *Volumes:* ${manga.volumes || "N/A"}
🌟 *Favorites:* ${manga.favorites || "N/A"}
🧮 *Score:* ${manga.score || "N/A"}
🧮 *Scored:* ${manga.scored || "N/A"}
🧮 *Scored By:* ${manga.scored_by || "N/A"}
🌟 *Rank:* ${manga.rank || "N/A"}
🤩 *Popularity:* ${manga.popularity || "N/A"}
👥 *Members:* ${manga.members || "N/A"}
⛓️ *URL:* ${manga.url || "N/A"}
👨‍🔬 *Author:* ${penulis || "N/A"}
📝 *Background:* ${manga.background || "N/A"}
💬 *Sinopsis:* ${manga.synopsis || "N/A"}
`;

        // Kirim gambar dan info sekaligus
        await conn.sendMessage(
            m.chat,
            {
                image: { url: manga.images.jpg.image_url },
                caption: pesan,
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(error);
        await conn.sendMessage(
            m.chat,
            { text: `⚠️ Terjadi error: ${error.message || error}` },
            { quoted: m }
        );
    }
};

handler.help = ["mangainfo <manga>"];
handler.tags = ["anime"];
handler.command = /^(mangainfo)$/i;

handler.register = true;

export default handler;
