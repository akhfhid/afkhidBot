import fetch from 'node-fetch'

let handler = async (m, { conn, command, text }) => {
  if (!text || !text.trim()) throw 'Masukkan teks yang valid!'

  // m.reply(wait)
  // let res = await fetch(APIs.ryzumi + '/api/image/brat?text=' + encodeURIComponent(text.trim()))
  // if (!res.ok) throw await res.text()

  try {
    let end = '/api/image/brat?text='
    if (/vid|video/i.test(command)) {
      end = '/api/image/brat/animated?text='
    }
    let url = APIs.ryzumi + end + encodeURIComponent(text.trim())
    conn.sendSticker(m.chat, url, m)
  } catch (err) {
    console.error('Error:', err)
    await m.reply(`Error: ${err.message || 'Gagal mengambil gambar.'}`)
  }
}

handler.help = ['brat', 'bratvid']
handler.tags = ['sticker']
handler.command = /^(brat|brat(vid|video))$/i
handler.register = true

export default handler
