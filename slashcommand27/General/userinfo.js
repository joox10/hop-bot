const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("يعرض معلومات عن المستخدم")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("اختر المستخدم")
        .setRequired(false)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .map(role => `<@&${role.id}>`)
      .join(", ") || "لا يملك رتب";

    await interaction.reply({
      embeds: [
        {
          title: `معلومات عن ${user.tag}`,
          color: 0x3498db,
          thumbnail: { url: user.displayAvatarURL({ dynamic: true }) },
          fields: [
            { name: "الاسم", value: user.username, inline: true },
            { name: "الآيدي", value: user.id, inline: true },
            { name: "نوع الحساب", value: user.bot ? "بوت 🤖" : "مستخدم 👤", inline: true },
            { name: "تاريخ الإنشاء", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
            { name: "تاريخ الانضمام", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
            { name: `الرتب (${member.roles.cache.size - 1})`, value: roles, inline: false },
          ]
        }
      ]
    });
  },
};
