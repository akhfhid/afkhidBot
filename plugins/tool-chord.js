import axios from "axios";

function decodeHtml(html) {
    const entities = {
        "&quot;": '"',
        "&apos;": "'",
        "&lt;": "<",
        "&gt;": ">",
        "&amp;": "&",
        "&#8211;": "–",
        "&#8212;": "—",
        "&#160;": " ",
    };

    return html.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
}

let handler = async function (m, { text }) {
    if (!text)
        return this.sendMessage(
            m.chat,
            { text: "⚠️ Input query, contoh: .chord sober" },
            { quoted: m }
        );

    try {
        let a = await chord(text);

        // batasi biar ga kepanjangan
        let chordText =
            a.chord.length > 5000
                ? a.chord.slice(0, 5000) + "\n\n⚠️ Chord dipotong, terlalu panjang..."
                : a.chord;

        await this.sendMessage(
            m.chat,
            {
                text: `*🎵 Song:* ${a.title}\n\n* Chord:*\n\n${chordText}`,
            },
            { quoted: m }
        );

        console.log("✅ Chord berhasil dikirim:", a.title);
    } catch (e) {
        await this.sendMessage(
            m.chat,
            {
                text: typeof e === "string" ? e : "⚠️ Gagal mengambil chord.",
            },
            { quoted: m }
        );
        console.error("❌ ERROR chord:", e);
    }
};

handler.help = ["chord <judul lagu>"];
handler.tags = ["tools"];
handler.command = /^(chord)$/i;

handler.register = true;
// handler.limit = true;

export default handler;

export async function chord(query) {
    return new Promise(async (resolve, reject) => {
        const url = `https://api.ryzumi.vip/api/search/chord?query=${encodeURIComponent(
            query
        )}`;

        try {
            let { data } = await axios.get(url, {
                headers: { accept: "application/json" },
            });

            console.log("API RESPONSE:", data);

            if (data && data.title && data.chord) {
                resolve({
                    title: decodeHtml(data.title),
                    chord: data.chord,
                });
            } else {
                reject(" Tidak ada hasil untuk: " + query);
            }
        } catch (error) {
            console.error("API ERROR:", error.response?.data || error.message);
            reject(
                "Error fetching data: " +
                (error.response?.status || error.message || "Unknown error")
            );
        }
    });
}
