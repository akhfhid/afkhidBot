import axios from "axios";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

let handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return await conn.sendMessage(
            m.chat,
            { text: "Sertakan URL/Link video BiliBili!" },
            { quoted: m }
        );
    }

    const sender = m.sender.split("@")[0];
    const url = args[0];
    await conn.sendMessage(
        m.chat,
        {
            text: "⏳ Proses download video sedang berlangsung. Mohon untuk menunggu hingga proses selesai. Status selanjutnya akan diinformasikan.",
        },
        { quoted: m }
    );

    try {
        const { data } = await axios.get(
            `${APIs.ryzumi}/api/downloader/bilibili?url=${encodeURIComponent(url)}`
        );

        if (!data.status || !data.data?.mediaList?.videoList?.length) {
            throw " Tidak ditemukan video yang tersedia!";
        }
        const video = data.data.mediaList.videoList[0];
        const videoUrl = video.url;
        const tempFilePath = path.join("/tmp", `${video.filename || "video"}.mp4`);
        const outputFilePath = path.join(
            "/tmp",
            `${video.filename || "video"}_fixed.mp4`
        );
        const writer = (await import("fs")).createWriteStream(tempFilePath);
        const response = await axios.get(videoUrl, { responseType: "stream" });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        // Informasi awal proses pengolahan video
        await conn.sendMessage(
            m.chat,
            {
                text: "⚙️ Memulai proses pengolahan video. Mohon tetap menunggu hingga video siap dikirim.",
            },
            { quoted: m }
        );

        await new Promise((resolve, reject) => {
            const ff = spawn("ffmpeg", [
                "-i",
                tempFilePath,
                "-c",
                "copy",
                outputFilePath,
                "-y",
            ]);
            ff.stderr.on("data", () => { }); 
            ff.on("close", resolve);
            ff.on("error", reject);
        });

        const fixedVideoBuffer = await fs.readFile(outputFilePath);
        await conn.sendMessage(
            m.chat,
            {
                video: fixedVideoBuffer,
                mimetype: "video/mp4",
                fileName: video.filename || "video.mp4",
                caption: `🎬 Video BiliBili untuk @${sender}\n© By Afkhidbot`,
                mentions: [m.sender],
            },
            { quoted: m }
        );

        await fs.unlink(tempFilePath);
        await fs.unlink(outputFilePath);
    } catch (error) {
        console.error(error);
        await conn.sendMessage(
            m.chat,
            { text: ` Terjadi error: ${error.message || error}` },
            { quoted: m }
        );
    }
};

handler.help = ["bilibili <url>"];
handler.tags = ["downloader"];
handler.command = /^(bili(bili)?)$/i;
handler.limit = 2;
handler.register = true;

export default handler;
