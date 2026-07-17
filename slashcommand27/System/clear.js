const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🧹 حذف عدد من الرسائل')
        .addIntegerOption(option => 
            option.setName('number')
                .setDescription('📌 عدد الرسائل التي تريد حذفها')
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            // ✅ التأكد من أن المستخدم لديه صلاحية "Manage Messages"
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: `🚫 **ليس لديك صلاحية لحذف الرسائل!**`, ephemeral: true });
            }

            let number = interaction.options.getInteger('number');

            // ✅ التأكد من أن الرقم لا يتجاوز الحد الأقصى
            if (number > 100) {
                return interaction.reply({ content: `⚠️ **لا يمكنك حذف أكثر من 100 رسالة في المرة الواحدة!**`, ephemeral: true });
            }

            // ✅ حذف الرسائل
            await interaction.channel.bulkDelete(number, true).then(async messages => {
                // إرسال رسالة بعدد الرسائل المحذوفة
                const msg = await interaction.reply({ content: `✅ **تم حذف \`${messages.size}\` رسالة بنجاح!** 🧹`, fetchReply: true });

                // حذف الرسالة بعد 7 ثوانٍ
                setTimeout(() => {
                    msg.delete().catch(() => {});
                }, 7000);
            }).catch(() => {
                return interaction.reply({ content: `❌ **حدث خطأ أثناء محاولة حذف الرسائل!**`, ephemeral: true });
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `⚠️ **حدث خطأ غير متوقع! يرجى التواصل مع المطور.**`, ephemeral: true });
        }
    }
};
