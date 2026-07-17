const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("يعرض ميم عشوائي"),
  async execute(interaction) {
    try {
      const response = await axios.get("https://meme-api.com/gimme");
      const meme = response.data;

      await interaction.reply({
        embeds: [
          {
            title: meme.title,
            image: { url: meme.url },
            footer: { text: `من r/${meme.subreddit}` },
            color: 0x2ecc71
          }
        ]
      });
    } catch (error) {
      await interaction.reply("حدث خطأ أثناء جلب الميم.");
    }
  },
};
