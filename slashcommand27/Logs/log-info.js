const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Json-db/Bots/logsDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('logs-info')
        .setDescription('معلومات نظام اللوج في السيرفر'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        await interaction.deferReply();

        let messagedelete = await db.get(`log_messagedelete_${interaction.guild.id}`);
        let messageupdate = await db.get(`log_messageupdate_${interaction.guild.id}`);
        let rolecreate = await db.get(`log_rolecreate_${interaction.guild.id}`);
        let roledelete = await db.get(`log_roledelete_${interaction.guild.id}`);
        let rolegive = await db.get(`log_rolegive_${interaction.guild.id}`);
        let roleremove = await db.get(`log_roleremove_${interaction.guild.id}`);
        let channelcreate = await db.get(`log_channelcreate_${interaction.guild.id}`);
        let channeldelete = await db.get(`log_channeldelete_${interaction.guild.id}`);
        let channelupdate = await db.get(`log_channelupdate_${interaction.guild.id}`);
        let botadd = await db.get(`log_botadd_${interaction.guild.id}`);
        let banadd = await db.get(`log_banadd_${interaction.guild.id}`);
        let bandelete = await db.get(`log_bandelete_${interaction.guild.id}`);
        let kickadd = await db.get(`log_kickadd_${interaction.guild.id}`);
        let unban = await db.get(`log_unban_${interaction.guild.id}`);
        let nickname = await db.get(`log_nickname_${interaction.guild.id}`);
        let memberadd = await db.get(`log_memberadd_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTitle('**معلومات نظام اللوج**')
            .addFields(
                { name: `حذف رسالة`, value: `${messagedelete ? `<#${messagedelete}>` : '```غير محددة```'}`, inline: true },
                { name: `تحديث رسالة`, value: `${messageupdate ? `<#${messageupdate}>` : '```غير محددة```'}`, inline: true },
                { name: `إنشاء رتبة`, value: `${rolecreate ? `<#${rolecreate}>` : '```غير محددة```'}`, inline: true },
                { name: `حذف رتبة`, value: `${roledelete ? `<#${roledelete}>` : '```غير محددة```'}`, inline: true },
                { name: `إعطاء رتبة`, value: `${rolegive ? `<#${rolegive}>` : '```غير محددة```'}`, inline: true },
                { name: `إزالة رتبة`, value: `${roleremove ? `<#${roleremove}>` : '```غير محددة```'}`, inline: true },
                { name: `إنشاء قناة`, value: `${channelcreate ? `<#${channelcreate}>` : '```غير محددة```'}`, inline: true },
                { name: `حذف قناة`, value: `${channeldelete ? `<#${channeldelete}>` : '```غير محددة```'}`, inline: true },
                { name: `تعديل قناة`, value: `${channelupdate ? `<#${channelupdate}>` : '```غير محددة```'}`, inline: true },
                { name: `إضافة بوت`, value: `${botadd ? `<#${botadd}>` : '```غير محددة```'}`, inline: true },
                { name: `إضافة باند`, value: `${banadd ? `<#${banadd}>` : '```غير محددة```'}`, inline: true },
                { name: `حذف باند`, value: `${bandelete ? `<#${bandelete}>` : '```غير محددة```'}`, inline: true },
                { name: `طرد`, value: `${kickadd ? `<#${kickadd}>` : '```غير محددة```'}`, inline: true },
                { name: `فك الحظر`, value: `${unban ? `<#${unban}>` : '```غير محددة```'}`, inline: true },
                { name: `تغيير النك نيم`, value: `${nickname ? `<#${nickname}>` : '```غير محددة```'}`, inline: true },
                { name: `انضمام عضو`, value: `${memberadd ? `<#${memberadd}>` : '```غير محددة```'}`, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp()
            .setFooter({ text: `Requested by : ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        await interaction.editReply({ embeds: [embed] });
    }
};