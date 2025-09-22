import axios from 'axios'

var handler = async (m, { conn, text }) => {
  if (!text) throw `*_Masukkan Nama Mahasiswa/Siswa Yang Ingin Kamu Cari !_*`;

  await conn.sendMessage(m.chat, { text: 'Sedang mencari orangnya... Silahkan tunggu.' }, { quoted: m });

  const url = `${APIs.ryzumi}/api/search/mahasiswa?query=${encodeURIComponent(text)}`;

  try {
    let res = await axios.get(url);

    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw 'Tidak ditemukan data untuk nama tersebut.';
    }

    let message = `Hasil pencarian untuk nama "${text}":\n\n`;

    data.forEach((mahasiswa, index) => {
      const nama = mahasiswa.nama || 'Tidak Diketahui';
      const nim = mahasiswa.nim || 'Tidak Diketahui';
      const namaPt = mahasiswa.nama_pt || 'Tidak Diketahui';
      const namaProdi = mahasiswa.nama_prodi || 'Tidak Diketahui';

      message += `${index + 1}. Nama: ${nama}\n   NIM: ${nim}\n   Perguruan Tinggi: ${namaPt}\n   Program Studi: ${namaProdi}\n\n`;
    });

    await conn.sendMessage(m.chat, { text: message }, { quoted: m });
  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: `Terjadi kesalahan: ${error.message || error}` }, { quoted: m });
  }
};

handler.help = ['mahasiswa <nama>'];
handler.tags = ['internet'];
handler.command = /^(mahasiswa)$/i;

handler.register = true

export default handler
