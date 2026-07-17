const { ChatInputCommandInteraction, Client, PermissionsBitField, SlashCommandBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('اعطاء بان لشخص او ازالته')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('الشخص')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('السبب')
                .setRequired(false)),
    
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({ content: `🚫 **ليس لديك صلاحية لاستخدام هذا الأمر!**`, ephemeral: true });
            }

            const user = interaction.options.getUser('member');
            const member = interaction.options.getMember('member');
            const reason = interaction.options.getString('reason') 
                ? `${interaction.options.getString('reason')} | By: ${interaction.user.tag}` 
                : `By: ${interaction.user.tag}`;

            if (!member) {
                return interaction.reply({ content: `❌ **لم أتمكن من العثور على هذا العضو في السيرفر.**`, ephemeral: true });
            }

            // ✅ منع البان عن صاحب السيرفر
            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({ content: `⚠️ **لا يمكنك إعطاء بان لمالك السيرفر!**`, ephemeral: true });
            }

            // ✅ منع البان عن شخص أعلى رتبة من المستخدم
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: `🚫 **لا يمكنك إعطاء بان لشخص أعلى منك في الرتبة!**`, ephemeral: true });
            }

            // ✅ تنفيذ البان أو إزالة البان حسب الحالة
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(user.id);

            if (!bannedUser) {
                await member.ban({ reason }).catch(() => {
                    return interaction.reply({ content: `❌ **حدث خطأ! تأكد أن لديّ صلاحية البان.**`, ephemeral: true });
                });
                return interaction.reply({ content: `✅ **تم حظر ${user.tag} بنجاح!** 🚀` });
            } else {
                await interaction.guild.members.unban(user.id).catch(() => {
                    return interaction.reply({ content: `❌ **حدث خطأ أثناء محاولة إلغاء الحظر.**`, ephemeral: true });
                });
                return interaction.reply({ content: `✅ **تم إلغاء حظر ${user.tag} بنجاح!** 🎉` });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `⚠️ **حدث خطأ غير متوقع! يرجى التواصل مع المطور.**`, ephemeral: true });
        }
    }
};
