const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('hide-all')
        .setDescription('إخفاء جميع القنوات مع عرض حالة التقدم'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });
        }

        const guild = interaction.guild;
        const channels = guild.channels.cache.filter(c => c.manageable);
        let hiddenCount = 0;

        // إنشاء الـ Embed المبدئي
        const embed = new EmbedBuilder()
            .setTitle('جاري إخفاء القنوات...')
            .setDescription(`بدأنا العملية... تم إخفاء 0 من أصل ${channels.size} قناة.`)
            .setColor(0x0099FF);

        await interaction.reply({ embeds: [embed] });

        // التكرار على القنوات
        for (const [id, channel] of channels) {
            try {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    ViewChannel: false
                });
                hiddenCount++;

                // تحديث الـ Embed كل قناة
                const progressEmbed = new EmbedBuilder()
                    .setTitle('جاري إخفاء القنوات...')
                    .setDescription(`تم إخفاء **${hiddenCount}** من أصل **${channels.size}** قناة.\nحالياً يتم إخفاء: ${channel.name}`)
                    .setColor(0xFFFF00);

                await interaction.editReply({ embeds: [progressEmbed] });
            } catch (error) {
                console.error(`خطأ في إخفاء ${channel.name}:`, error);
            }
        }

        // الرسالة النهائية بعد الانتهاء
        const finalEmbed = new EmbedBuilder()
            .setTitle('✅ تمت العملية بنجاح')
            .setDescription(`تم إخفاء جميع القنوات (${hiddenCount} قناة).`)
            .setColor(0x00FF00);

        await interaction.editReply({ embeds: [finalEmbed] });
    }
};