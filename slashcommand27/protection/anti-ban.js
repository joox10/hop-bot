const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/protectDB.json")
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('anti-ban')
    .setDescription('تسطيب نظام الحماية من الباند')
    .addStringOption(Option => Option
        .setName(`status`)
        .setDescription(`الحالة`)
        .setRequired(true)
        .addChoices(
            {
                name:`On` , value:`on`
            },
            {
                name:`Off` , value:`off`
            }
        ))
        .addIntegerOption(Option => Option
            .setName(`limit`)
            .setDescription(`العدد المسموح في اليوم`)
            .setRequired(true))
   , // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    try {
      const status = interaction.options.getString(`status`)
      const limit = interaction.options.getInteger(`limit`)
      await db.set(`ban_status_${interaction.guild.id}` , status)
      await db.set(`ban_limit_${interaction.guild.id}` , limit)
      await db.set(`ban_users_${interaction.guild.id}` , [])
     return interaction.editReply({content:`**تم بنجاح تعيين نظام الحماية من البان \n - تاكد من رفع رتبتي لاعلى رتبة في السيرفر**`})
    } catch {
    }
}
}