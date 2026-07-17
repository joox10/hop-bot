const { Client, ActivityType, Events, EmbedBuilder } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const logChannelId = "id_here";
        const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

        if (!logChannel) {
            console.error("❌ لم يتم العثور على الروم المحدد.");
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("📊 تقرير تشغيل البوت - السيرفرات والأعضاء")
            .setColor(0x00FF00)
            .setTimestamp()
            .setFooter({ text: `إجمالي السيرفرات: ${client.guilds.cache.size}` });

        let description = "";

        for (const [id, guild] of client.guilds.cache) {
            try {
                // البحث عن أول قناة نصية يمكن للبوت الكتابة فيها
                const channel = guild.channels.cache.find(c => 
                    c.isTextBased() && c.permissionsFor(guild.members.me).has("CreateInstantInvite")
                );

                const memberCount = guild.memberCount; // جلب عدد الأعضاء

                if (channel) {
                    const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
                    description += `✅ **${guild.name}**\n👥 الأعضاء: \`${memberCount}\` | 🔗 [رابط الدعوة](${invite.url})\n\n`;
                } else {
                    description += `⚠️ **${guild.name}**\n👥 الأعضاء: \`${memberCount}\` | ❌ لا توجد صلاحيات\n\n`;
                }
            } catch (e) {
                description += `❌ **${guild.name}**: خطأ أثناء المعالجة\n\n`;
            }
        }

        // التأكد من عدم تجاوز حد الـ 4096 حرف للـ Embed
        embed.setDescription(description.slice(0, 4096));
        await logChannel.send({ embeds: [embed] });

        // تفعيل الـ Activity
        const statuses = ['Developer: joox.10', '/help'];
        setInterval(() => {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setActivity(randomStatus, { type: ActivityType.Playing });
        }, 10000);

        client.user.setStatus("online");
        console.log(`🎉 البوت يعمل الآن باسم ${client.user.tag}`);
    },
};