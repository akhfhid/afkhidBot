let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user;
    if (m.isGroup) {
        user = m.mentionedJid && m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted ? m.quoted.sender : null;
    } else {
        if (!text) return conn.sendMessage(m.chat, { text: `Example:\n${usedPrefix + command} 6281234567890 7` }, { quoted: m });
        let phone = text.split(' ')[0].replace(/[^0-9]/g, '');
        user = `${phone}@s.whatsapp.net`;
    }

    if (!user) return conn.sendMessage(m.chat, { text: ' Mention a user or reply to their message!' }, { quoted: m });
    let userData = db.data.users[user];
    if (!userData) return conn.sendMessage(m.chat, { text: ' User not found!' }, { quoted: m });

    let days = parseInt(text.split(' ')[1]);
    if (!days || isNaN(days)) return conn.sendMessage(
        m.chat,
        { text: ` Invalid days!\nExample:\n${usedPrefix + command} @user 7` },
        { quoted: m }
    );

    let jumlahHari = 86400000 * days; // milliseconds
    let now = Date.now();
    if (!userData.role || userData.role === 'Free user') userData.role = 'Premium user';
    if (now < (userData.premiumTime || 0)) userData.premiumTime += jumlahHari;
    else userData.premiumTime = now + jumlahHari;

    userData.premium = true;

    await conn.sendMessage(
        m.chat,
        { text: `✔️ *Success!*\n\n📛 Name: ${userData.name}\n📆 Added Days: ${days} days\n⏱ Countdown: ${Math.ceil((userData.premiumTime - now) / 86400000)} days left` },
        { quoted: m }
    );
};

handler.help = ['addprem <phone number/mention> <days>'];
handler.tags = ['owner'];
handler.command = /^addprem?$/i;

handler.rowner = true;

export default handler;
