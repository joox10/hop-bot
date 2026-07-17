const { SlashCommandBuilder, EmbedBuilder ,ButtonStyle, PermissionsBitField, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/protectDB.json")
module.exports = {
    adminsOnly:true,
    data: new SlashCommandBuilder()
    .setName('set-protect-logs')
    .setDescription('لتحديد روم لوج الحماية')
    .addChannelOption(Option => 
        Option
        .setName('room')
        .setDescription('الروم')
        .setRequired(true)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    try {
        let room = interaction.options.getChannel(`room`)
        await db.set(`protectLog_room_${interaction.guild.id}` , room.id)
      
        return interaction.editReply({content:`**تم تحديد الروم ${room} بنجاح**`})
    } catch {
    }
}
}