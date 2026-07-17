const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("احصل على رابط دعوة البوت"),
  async execute(interaction) {
    await interaction.reply("رابط دعوة البوت: https://discord.com/oauth2/authorize?client_id=1303646938557579295");
  },
};
