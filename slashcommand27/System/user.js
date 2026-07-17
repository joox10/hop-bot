const { Client, Collection,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('رؤية معلومات حسابك او شخص اخر')
    .addUserOption(Option => Option
        .setName(`user`)
        .setDescription(`الشخص`)
        .setRequired(false)), // or false
async execute(interaction) {
    await interaction.deferReply({ephemeral:false})
    let user = interaction.options.getMember(`user`)
    if(!user) user = interaction.member
    const embed = new EmbedBuilder()
    .setThumbnail(`https://cdn.discordapp.com/avatars/${user.user.id}/${user.user.avatar}.png?size=1024`)
    .setFooter({text:interaction.user.username , iconURL:interaction.user.displayAvatarURL({dynamic:true , size:1024})})
    .addFields(
        {
            name:`**Joined Discord :**` , value:`**<t:${parseInt(user.user.createdAt / 1000)}:R>**` , inline:true
        },
        {
            name:`**Joined Server :**` , value:`**<t:${parseInt(user.joinedAt / 1000)}:R>**` , inline:true
        }
    )
    return interaction.editReply({embeds:[embed]})
}
}