const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("احصل على رابط دعوة البوت"),
  async execute(interaction) {
    await interaction.reply("رابط دعوة البوت: https://bit.ly/invite-hop");
  },
};