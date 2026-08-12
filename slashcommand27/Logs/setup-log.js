const { SlashCommandBuilder, EmbedBuilder , PermissionsBitField } = require("discord.js");
const { Database } = require("st.db")
const db = new Database("/Json-db/Bots/logsDB.json")

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('setup-logs')
        .setDescription('تسطيب نظام اللوج')
        .addChannelOption(Option => Option.setName('messagedelete').setDescription('روم لوج حذف الرسائل').setRequired(false))
        .addChannelOption(Option => Option.setName('messageupdate').setDescription('روم لوج تعديل الرسائل').setRequired(false))
        .addChannelOption(Option => Option.setName('rolecreate').setDescription('روم انشاء رتبة').setRequired(false))
        .addChannelOption(Option => Option.setName('roledelete').setDescription('روم حذف رتبة').setRequired(false))
        .addChannelOption(Option => Option.setName('rolegive').setDescription('روم اعطاء لشخص رتبة').setRequired(false))
        .addChannelOption(Option => Option.setName('roleremove').setDescription('روم سحب من شخص رتبة').setRequired(false))
        .addChannelOption(Option => Option.setName('channelcreate').setDescription('روم انشاء روم').setRequired(false))
        .addChannelOption(Option => Option.setName('channeldelete').setDescription('روم حذف روم').setRequired(false))
        .addChannelOption(Option => Option.setName('channelupdate').setDescription('روم تحديث/تعديل روم').setRequired(false))
        .addChannelOption(Option => Option.setName('botadd').setDescription('روم عند دخول بوت للسيرفر').setRequired(false))
        .addChannelOption(Option => Option.setName('banadd').setDescription('روم عند اعطاء شخص بان').setRequired(false))
        .addChannelOption(Option => Option.setName('bandelete').setDescription('روم عند فك بان شخص').setRequired(false))
        .addChannelOption(Option => Option.setName('kickadd').setDescription('روم عند اعطاء شخص طرد').setRequired(false))
        .addChannelOption(Option => Option.setName('unban').setDescription('روم فك الحظر').setRequired(false))
        .addChannelOption(Option => Option.setName('nickname').setDescription('روم تغيير النك نيم').setRequired(false))
        .addChannelOption(Option => Option.setName('memberadd').setDescription('روم انضمام عضو جديد').setRequired(false)),

    async execute(interaction) {
        const options = [
            'messagedelete', 'messageupdate', 'rolecreate', 'roledelete', 
            'rolegive', 'roleremove', 'channelcreate', 'channeldelete', 
            'channelupdate', 'botadd', 'banadd', 'bandelete', 
            'kickadd', 'unban', 'nickname', 'memberadd'
        ];

        for (const opt of options) {
            const channel = interaction.options.getChannel(opt);
            if (channel) {
                await db.set(`log_${opt}_${interaction.guild.id}`, channel.id);
            }
        }

        return interaction.reply({ content: `**تم تحديد اعدادات اللوجات بنجاح!**` });
    }
};