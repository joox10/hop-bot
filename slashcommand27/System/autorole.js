const { ChatInputCommandInteraction, Client, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const autoroleDB = new Database("/Json-db/Bots/autoroleDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('إدارة نظام الرتب التلقائية عند دخول الأعضاء أو البوتات')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تعيين رتبة للأعضاء أو البوتات')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('اختر لمن تريد تعيين الرتبة')
                        .setRequired(true)
                        .addChoices(
                            { name: 'أعضاء (Members)', value: 'member' },
                            { name: 'بوتات (Bots)', value: 'bot' }
                        ))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('الرتبة المراد إعطاؤها')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إيقاف الرتبة التلقائية للأعضاء أو البوتات')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('اختر القسم المراد إلغاء رتبته')
                        .setRequired(true)
                        .addChoices(
                            { name: 'أعضاء (Members)', value: 'member' },
                            { name: 'بوتات (Bots)', value: 'bot' }
                        ))
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: `**لا تمتلك صلاحية إدارة الرتب (Manage Roles) لفعل ذلك!**`, ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const type = interaction.options.getString('type');
        const guildId = interaction.guild.id;

        if (subcommand === 'set') {
            const role = interaction.options.getRole('role');

            // التحقق من صلاحيات البوت وهرمية الرتب
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ content: `**لا يمكنني تعيين هذه الرتبة لأنها أعلى من رتبتي في السيرفر!**`, ephemeral: true });
            }

            if (type === 'member') {
                autoroleDB.set(`memberRole_${guildId}`, role.id);
                return interaction.reply({ content: `**<:check:1527933632591691846> تم تعيين رتبة الأعضاء التلقائية بنجاح إلى: ${role}**`, ephemeral: true });
            } else if (type === 'bot') {
                autoroleDB.set(`botRole_${guildId}`, role.id);
                return interaction.reply({ content: `**<:check:1527933632591691846> تم تعيين رتبة البوتات التلقائية بنجاح إلى: ${role}**`, ephemeral: true });
            }
        } 
        else if (subcommand === 'remove') {
            if (type === 'member') {
                const currentRole = autoroleDB.get(`memberRole_${guildId}`);
                if (!currentRole) {
                    return interaction.reply({ content: `**لا توجد رتبة أعضاء تلقائية مفعلة أصلاً!**`, ephemeral: true });
                }
                autoroleDB.delete(`memberRole_${guildId}`);
                return interaction.reply({ content: `**<:check:1527933632591691846> تم إيقاف وحذف رتبة الأعضاء التلقائية بنجاح.**`, ephemeral: true });
            } else if (type === 'bot') {
                const currentRole = autoroleDB.get(`botRole_${guildId}`);
                if (!currentRole) {
                    return interaction.reply({ content: `**لا توجد رتبة بوتات تلقائية مفعلة أصلاً!**`, ephemeral: true });
                }
                autoroleDB.delete(`botRole_${guildId}`);
                return interaction.reply({ content: `**<:check:1527933632591691846> تم إيقاف وحذف رتبة البوتات التلقائية بنجاح.**`, ephemeral: true });
            }
        }
    }
};