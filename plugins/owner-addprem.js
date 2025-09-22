let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user;
    if (m.isGroup) {
        user = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
                ? m.quoted.sender
                : false;
    } else {
        user = text.split(" ")[0];
        user = user.replace("@", "") + "@s.whatsapp.net";
    }

    let userData = db.data.users[user];
    if (!userData) {
        return conn.sendMessage(
            m.chat,
            { text: `❌ User not found!` },
            { quoted: m }
        );
    }

    // ambil nomor hp
    let phoneNumber = user.split("@")[0];
    if (!phoneNumber) {
        return conn.sendMessage(
            m.chat,
            { text: `⚠️ where the number of days?` },
            { quoted: m }
        );
    }
    if (isNaN(phoneNumber)) {
        return conn.sendMessage(
            m.chat,
            {
                text: `⚠️ only number!\n\nexample:\n${usedPrefix + command} @${m.sender.split`@`[0]
                    } 7`,
            },
            { quoted: m }
        );
    }

    let txt = text.split(" ")[1]; 
    var jumlahHari = 86400000 * txt;
    var now = new Date() * 1;

    if (userData.role === "Free user") userData.role = "Premium user";
    if (now < userData.premiumTime) userData.premiumTime += jumlahHari;
    else userData.premiumTime = now + jumlahHari;
    userData.premium = true;

    await conn.sendMessage(
        m.chat,
        {
            text: `✔️ Success\n📛 *Name:* ${userData.name}\n📆 *Days:* ${txt} days\n📉 *Countdown:* ${userData.premiumTime - now}`,
        },
        { quoted: m }
    );
};

handler.help = ["addprem <phone number> <days>"];
handler.tags = ["owner"];
handler.command = /^addprem?$/i;
handler.rowner = true;

export default handler;
