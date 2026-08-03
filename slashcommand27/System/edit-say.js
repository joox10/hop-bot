const { PermissionsBitField, SlashCommandBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('edit-say')
        .setDescription('تعديل رسالة ساي أرسلها البوت مسبقاً')
        .addStringOption(option => option
            .setName('message-id')
            .setDescription('أيدي الرسالة التي تريد تعديلها')
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
            return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });

        const messageId = interaction.options.getString('message-id');

        try {
            // جلب الرسالة المراد تعديلها للتأكد من وجودها
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            
            if (targetMessage.author.id !== interaction.client.user.id) {
                return interaction.reply({ content: "**لا يمكنني تعديل رسالة لم أقم بإرسالها بنفسي!**", ephemeral: true });
            }

            // إرسال توجيه للمستخدم لإرسال النص الجديد
            await interaction.reply({ content: '**برجاء إرسال الرسالة الجديدة التي تريد وضعها مكانها الآن في الشات...**', ephemeral: true });

            // إنشاء مجمع لانتظار رسالة واحدة فقط من نفس الشخص الذي أمر البوت
            const filter = m => m.author.id === interaction.user.id;
            const collected = await interaction.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 60000, // مهلة دقيقة واحدة لإرسال الرسالة
                errors: ['time'] 
            });

            const userMessage = collected.first();

            // تعديل الرسالة الأصلية بالنص الجديد كاملاً بالفواصل والأسطر
            await targetMessage.edit({ content: userMessage.content });
            
            // حذف رسالة المستخدم التي تحتوي على النص الجديد لتنظيف الشات
            await userMessage.delete().catch(() => {});

            // تأكيد إتمام العملية بنجاح
            return interaction.followUp({ content: `**تم تبديل الرسالة بنجاح ونظفت الشات!**`, ephemeral: true });

        } catch (error) {
            // التعامل مع حالة انتهاء الوقت دون إرسال رسالة
            if (error.size === 0) {
                return interaction.followUp({ content: '**انتهى الوقت (60 ثانية) ولم تقم بإرسال الرسالة الجديدة!**', ephemeral: true }).catch(() => {});
            }

            console.error(error);
            
            // تحديد رد الخطأ بناءً على حالة التفاعل الحالي
            if (interaction.replied || interaction.deferred) {
                return interaction.followUp({ content: '**حدث خطأ، تأكد من أيدي الرسالة أو صلاحيات البوت!**', ephemeral: true }).catch(() => {});
            } else {
                return interaction.reply({ content: '**حدث خطأ، تأكد من أيدي الرسالة وأنك في نفس الروم!**', ephemeral: true }).catch(() => {});
            }
        }
    }
}