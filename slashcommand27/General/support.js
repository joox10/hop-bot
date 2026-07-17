const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("رابط سيرفر الدعم الفني"),
  async execute(interaction) {
    await interaction.reply("سيرفر الدعم الفني: https://discord.gg/vZhRwJbwnh");
  },
};
