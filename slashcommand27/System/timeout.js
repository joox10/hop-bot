const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('إعطاء تايم أوت لشخص أو إزالته')
        .addUserOption(option => option
            .setName('member')
            .setDescription('الشخص')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('المدة (بالدقائق، أدخل 0 لإزالة التايم أوت)')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('السبب')
            .setRequired(false)),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return interaction.reply({ content: `🚫 **لا تمتلك صلاحية لفعل ذلك!**`, ephemeral: true });
            }

            const member = interaction.options.getMember('member');
            let time = interaction.options.getInteger('time');
            const reason = interaction.options.getString('reason') || "لم يتم تحديد سبب.";

            // منع إعطاء تايم أوت لمالك السيرفر
            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({ content: `⚠️ **لا يمكنك إعطاء تايم أوت لمالك السيرفر!**`, ephemeral: true });
            }

            // التحقق من الرتب
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: `⚠️ **لا يمكنك إعطاء تايم أوت لشخص بنفس رتبك أو أعلى منك!**`, ephemeral: true });
            }

            // تحويل الوقت إلى ميلي ثانية
            let duration = time * 60 * 1000;

            // إزالة التايم أوت إذا كان الوقت 0
            if (time === 0) {
                await member.timeout(null).catch(() => {
                    return interaction.reply({ content: `❌ **حدث خطأ أثناء إزالة التايم أوت. تأكد من صلاحياتي!**`, ephemeral: true });
                });

                const embed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setDescription(`✅ **تمت إزالة التايم أوت عن ${member.user.username}!**`);
                
                return interaction.reply({ embeds: [embed] });
            }

            // إعطاء تايم أوت
            await member.timeout(duration, reason).catch(() => {
                return interaction.reply({ content: `❌ **حدث خطأ أثناء إعطاء التايم أوت. تأكد من صلاحياتي!**`, ephemeral: true });
            });

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`⏳ **تم إعطاء تايم أوت لـ ${member.user.username} لمدة ${time} دقيقة.**\n📌 **السبب:** ${reason}`);
            
            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(`🔴 | Error in timeout command:`, error);
            return interaction.reply({ content: `❌ **حدث خطأ، يرجى التواصل مع المطورين!**`, ephemeral: true });
        }
    }
};
