import { createHash } from "crypto";

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
let handler = async function (m, { text, usedPrefix, conn }) {
  let user = global.db.data.users[m.sender];
  if (user.registered === true)
    return await conn.sendMessage(
      m.chat,
      {
        text: `Anda sudah terdaftar\nMau daftar ulang? ${usedPrefix}unreg <SERIAL NUMBER>`,
      },
      { quoted: m }
    );

  if (!Reg.test(text))
    return await conn.sendMessage(
      m.chat,
      { text: `Format salah\n*${usedPrefix}register nama.umur*` },
      { quoted: m }
    );

  let [_, name, splitter, age] = text.match(Reg);
  if (!name)
    return await conn.sendMessage(m.chat, { text: "Nama tidak boleh kosong (Alphanumeric)" }, { quoted: m });
  if (!age)
    return await conn.sendMessage(m.chat, { text: "Umur tidak boleh kosong (Angka)" }, { quoted: m });

  age = parseInt(age);
  if (age > 60)
    return await conn.sendMessage(m.chat, { text: "Tuwa Bangka Mana Paham Teknologi😂" }, { quoted: m });
  if (age < 16)
    return await conn.sendMessage(m.chat, { text: "Esempe dilarang masuk 😂" }, { quoted: m });

  user.name = name.trim();
  user.age = age;
  user.regTime = Date.now();
  user.registered = true;

  let sn = createHash("md5").update(m.sender).digest("hex");

  await conn.sendMessage(
    m.chat,
    {
      text: `
Daftar berhasil!

╭─「 Info 」
│ Nama: ${name}
│ Umur: ${age} tahun 
╰────
Serial Number: 
${sn}

**Ketentuan Layanan (TOS) - ${global.namebot}**
Dengan menggunakan ${global.namebot}, Anda setuju dengan ketentuan berikut:

1. *DILARANG KERAS MERUBAH TIMER/PESAN SEMENTARA*
Bot akan secara otomatis melakukan banning terhadap nomormu, untuk unban silahkan lapor owner (+${global.nomorown}).

2. *DILARANG MENGIRIM MEDIA NSFW*
Bot akan otomatis mendeteksi media dan melakukan banning terhadap nomormu, untuk unban silahkan lapor owner (+${global.nomorown}).

3. *DILARANG SPAM NOMOR BOT*
Bot akan melakukan ban permanent jika ada indikasi spam pada nomormu.

4. *CHAT OWNER BILA PERLU*
Tidak ada gunanya chat ke nomor bot, karena nomor bot tersimpan di server dan owner tidak akan melihat chatmu.

Dengan menggunakan ${global.namebot}, Anda setuju dengan semua ketentuan yang berlaku.

*Ketentuan ini terakhir diperbarui pada 12 Mei 2024.*

Mendaftar berarti setuju dengan ketentuan
      `.trim(),
    },
    { quoted: m }
  );
};

handler.help = ["daftar", "register"].map((v) => v + " <nama>.<umur>");
handler.command = /^(daftar|reg(ister)?)$/i;

export default handler;
