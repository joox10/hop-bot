const { Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");
const { Database } = require("st.db")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('اعطاء رتبة لشخص او ازالتها')
    .addUserOption(Option => Option
        .setName(`member`)
        .setDescription(`الشخص`)
        .setRequired(true))
        .addRoleOption(Option => Option
            .setName(`role`)
            .setDescription(`الرتبة`)
            .setRequired(true))
            .addStringOption(Option => Option
                .setName(`give_or_remove`)
                .setDescription(`الاعطاء ام السحب`)
                .setRequired(true)
                .addChoices(
                    {
                        name:`Give` , value:`Give`,
                    },
                    {
                        name:`Remove` , value:`Remove`
                    }
                )), // or false
async execute(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content:`**لا تمتلك صلاحية لفعل ذلك**` , ephemeral:true})
   const member = interaction.options.getMember(`member`)
   const role = interaction.options.getRole(`role`)
   const give_or_remove = interaction.options.getString(`give_or_remove`)
    if(give_or_remove == "Give") {
        await member.roles.add(role).catch(async() => {return interaction.reply({content:`**الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**` , ephemeral:true})})
        return interaction.reply({content:`**تم اعطاء الرتبة الى الشخص بنجاح**`})
    }
    if(give_or_remove == "Remove") {
        if(!member.roles.cache.some(rolee => rolee == role)) return interaction.reply({content:`**هذا الشخص لا يمتلك تلك الرول لحذفها منه**`})
        await member.roles.remove(role).catch(async() => {return interaction.reply({content:`**الرجاء التحقق من صلاحياتي ثم اعادة المحاولة**` , ephemeral:true})})
        return interaction.reply({content:`**تم ازالة الرتبة من الشخص بنجاح**`})
    }
}
}