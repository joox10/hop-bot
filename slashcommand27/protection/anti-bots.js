const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/protectDB.json")
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('anti-bots')
    .setDescription('تسطيب نظام الحماية من البوتات')
    .addStringOption(Option => Option
        .setName(`status`)
        .setDescription(`الحالة`)
        .setRequired(true)
        .addChoices(
            {
                name:`On` , value:`on`
            },
            {
                name:`Off` , value:`of`
            }
        ))
   , // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    try {
      const status = interaction.options.getString(`status`)
      await db.set(`antibots_status_${interaction.guild.id}` , status)
     return interaction.editReply({content:`**تم بنجاح تعيين الحالة \n - تاكد من رفع رتبتي لاعلى رتبة في السيرفر**`})
    } catch {
    }
}
}