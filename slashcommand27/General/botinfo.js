const { SlashCommandBuilder } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("يعرض معلومات عن البوت"),
  async execute(interaction) {
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalMemory = os.totalmem() / 1024 / 1024;
    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));

    await interaction.reply({
      embeds: [
        {
          title: "معلومات البوت",
          color: 0x00AE86,
          fields: [
            { name: "السيرفرات", value: `${interaction.client.guilds.cache.size}`, inline: true },
            { name: "المستخدمين", value: `${interaction.client.users.cache.size}`, inline: true },
            { name: "الرام المستخدمة", value: `${usedMemory.toFixed(2)} MB`, inline: true },
            { name: "مدة التشغيل", value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: false }
          ],
          footer: { text: interaction.client.user.username }
        }
      ]
    });
  },
};
