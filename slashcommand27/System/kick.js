const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🚪 طرد عضو من السيرفر')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('👤 العضو الذي تريد طرده')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('📌 سبب الطرد')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // ✅ التأكد من أن المستخدم لديه صلاحية "Kick Members"
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({ content: `🚫 **ليس لديك صلاحية لطرد الأعضاء!**`, ephemeral: true });
            }

            const member = interaction.options.getMember('member');
            const user = interaction.options.getUser('member');
            const reason = interaction.options.getString('reason') || "لا يوجد سبب محدد";
            const formattedReason = `${reason} | بواسطة: ${interaction.user.tag}`;

            // ✅ التحقق مما إذا كان العضو غير موجود
            if (!member) {
                return interaction.reply({ content: `⚠️ **لم يتم العثور على هذا العضو في السيرفر!**`, ephemeral: true });
            }

            // ✅ منع طرد مالك السيرفر
            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({ content: `❌ **لا يمكنك طرد مالك السيرفر!**`, ephemeral: true });
            }

            // ✅ منع طرد البوتات
            if (member.user.bot) {
                return interaction.reply({ content: `🤖 **لا يمكنك طرد البوتات!**`, ephemeral: true });
            }

            // ✅ منع طرد عضو لديه رتبة أعلى من مستخدم الأمر
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.reply({ content: `⚠️ **لا يمكنك طرد هذا العضو لأن رتبته أعلى منك أو مساوية لك!**`, ephemeral: true });
            }

            // ✅ تنفيذ الطرد
            await member.kick(formattedReason).catch(() => {
                return interaction.reply({ content: `❌ **حدث خطأ أثناء محاولة الطرد! تحقق من صلاحياتي وأعد المحاولة.**`, ephemeral: true });
            });

            // ✅ إرسال رسالة نجاح
            return interaction.reply({ content: `✅ **تم طرد ${member.user.tag} بنجاح!** 🚪`, ephemeral: false });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `⚠️ **حدث خطأ غير متوقع! يرجى التواصل مع المطور.**`, ephemeral: true });
        }
    }
};
