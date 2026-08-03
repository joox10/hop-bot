const { SlashCommandBuilder } = require('discord.js');
const { Database } = require('st.db');
const buttonsDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('edit-button-info')
        .setDescription('تعديل الرسالة المرتبطة بـ زر معلومات معين')
        .addStringOption(option => option
            .setName('message-id')
            .setDescription('أيدي الرسالة التي تحتوي على الأزرار')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('button-number')
            .setDescription('ترتيب الزرار في الرسالة من اليسار إلى اليمين (1، 2، 3...)')
            .setRequired(true)),

    async execute(interaction) {
        const messageId = interaction.options.getString('message-id');
        const buttonNumber = interaction.options.getInteger('button-number');
        const guildId = interaction.guild.id;

        try {
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            if (!targetMessage) {
                return await interaction.reply({ content: 'قم بعمل الأمر في نفس روم الرسالة.', ephemeral: true });
            }

            if (targetMessage.components.length === 0 || targetMessage.components[0].components.length === 0) {
                return await interaction.reply({ content: 'هذه الرسالة لا تحتوي على أي أزرار!', ephemeral: true });
            }

            const allButtons = targetMessage.components[0].components;
            const buttonIndex = buttonNumber - 1; 

            if (buttonIndex < 0 || buttonIndex >= allButtons.length) {
                return await interaction.reply({ 
                    content: `هذه الرسالة تحتوي على عدد (${allButtons.length}) أزرار فقط. يرجى اختيار رقم صحيح!`, 
                    ephemeral: true 
                });
            }

            const selectedButton = allButtons[buttonIndex];
            const customId = selectedButton.customId; 

            if (!customId || !customId.startsWith('info_')) {
                return await interaction.reply({ content: 'الزر المختار ليس زر معلومات تابع لهذا النظام.', ephemeral: true });
            }

            const buttonId = customId.replace('info_', '');

            await interaction.reply({ content: '**برجاء إرسال الرسالة الجديدة التي تريد ظهورها عند الضغط على الزر الآن في الشات...**', ephemeral: true });

            const filter = m => m.author.id === interaction.user.id;
            const collected = await interaction.channel.awaitMessages({ 
                filter, 
                max: 1, 
                time: 60000, 
                errors: ['time'] 
            });

            const userMessage = collected.first();
            const newContent = userMessage.content;

            await buttonsDB.set(`${guildId}_${buttonId}`, newContent);
            await userMessage.delete().catch(() => {});

            return await interaction.followUp({
                content: `<:check:1527933632591691846> تم بنجاح تعديل الرسالة المرتبطة بالزرار رقم (**${buttonNumber}**) في قاعدة البيانات!`,
                ephemeral: true
            });

        } catch (error) {
            if (error.size === 0) {
                return interaction.followUp({ content: '**انتهى الوقت (60 ثانية) ولم تقم بإرسال الرسالة الجديدة!**', ephemeral: true }).catch(() => {});
            }

            console.error(error);
            if (interaction.replied || interaction.deferred) {
                return interaction.followUp({ content: 'حدث خطأ أثناء محاولة تعديل زر المعلومات.', ephemeral: true }).catch(() => {});
            } else {
                return interaction.reply({ content: 'حدث خطأ أثناء محاولة تعديل زر المعلومات.', ephemeral: true }).catch(() => {});
            }
        }
    }
};