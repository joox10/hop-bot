const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/protectDB.json")
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('anti-delete-rooms')
    .setDescription('تسطيب نظام الحماية من حذف الرومات')
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
      await db.set(`antideleterooms_status_${interaction.guild.id}` , status)
      await db.set(`antideleterooms_limit_${interaction.guild.id}` , limit)
      await db.set(`roomsdelete_users_${interaction.guild.id}` , [])
              return interaction.editReply({content:`**تم بنجاح تعيين نظام الحماية من حذف الرومات \n - تاكد من رفع رتبتي لاعلى رتبة في السيرفر**`})
    } catch {
    }
}
}