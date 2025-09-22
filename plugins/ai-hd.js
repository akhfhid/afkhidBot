import fetch from 'node-fetch'
import { uploadPomf } from '../lib/uploadImage.js'

const wait = '⏳ Sedang memproses...'

let handler = async (m, { conn }) => {
    try {
        // cek apakah pesan berupa gambar
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        if (!mime || !mime.startsWith('image/')) {
            return await conn.sendMessage(
                m.chat,
                { text: '⚠️ Kirim atau reply gambar dengan caption .hd' },
                { quoted: m }
            )
        }

        await conn.sendMessage(m.chat, { text: wait }, { quoted: m })

        const media = await q.download()
        const url = await uploadPomf(media)
        async function fetchWithRetry(url, retries = 3, delay = 2000) {
            for (let i = 0; i < retries; i++) {
                const response = await fetch(url)
                if (response.status === 429) {
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, delay))
                        continue
                    } else {
                        throw new Error('⚠️ Server sedang sibuk, coba beberapa saat lagi')
                    }
                }
                if (!response.ok) throw new Error('⚠️ Gagal menghubungi server upscaler')
                return Buffer.from(await response.arrayBuffer())
            }
        }
        const hasil = await fetchWithRetry(`${APIs.ryzumi}/api/ai/waifu2x?url=${url}`)

        await conn.sendMessage(
            m.chat,
            { image: hasil, caption: '✨ Hasil HD' },
            { quoted: m }
        )

    } catch (err) {
        console.error(err)
        await conn.sendMessage(
            m.chat,
            { text: `⚠️ Terjadi error: ${err.message}` },
            { quoted: m }
        )
    }
}

handler.help = ['hd']
handler.tags = ['ai']
handler.command = /^(hd)$/i
handler.register = true
handler.limit = 10

export default handler
