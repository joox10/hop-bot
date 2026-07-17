const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('التحكم في نظام الحماية التلقائي (AutoMod) للسيرفر')
        // 1. منع الكلمات البذيئة العامة
        .addSubcommand(command => 
            command.setName('flagged-words')
                   .setDescription('حظر الكلمات البذيئة والتلقائية من ديسكورد')
        )
        // 2. منع السبام والتكرار
        .addSubcommand(command => 
            command.setName('spam-msg')
                   .setDescription('منع إرسال الرسائل المزعجة (Spam)')
        )
        // 3. حد أقصى للمنشن
        .addSubcommand(command => 
            command.setName('mention-spam')
                   .setDescription('تحديد حد أقصى للمنشن في الرسالة الواحدة')
                   .addIntegerOption(option => 
                       option.setName('number')
                             .setDescription('الحد الأقصى للمنشنات المسموحة')
                             .setRequired(true)
                   )
        )
        // 4. منع كلمة معينة في الشات
        .addSubcommand(command => 
            command.setName('keywords')
                   .setDescription('حظر كلمة معينة تختارها من السيرفر')
                   .addStringOption(option => 
                       option.setName('word')
                             .setDescription('الكلمة التي تريد حظرها')
                             .setRequired(true)
                   )
        )
        // 5. [جديد] منع كلمة معينة في بروفايل العضو (الاسم والحالة)
        .addSubcommand(command => 
            command.setName('profile-words')
                   .setDescription('حظر كلمات معينة من الظهور في أسماء أو حسابات الأعضاء')
                   .addStringOption(option => 
                       option.setName('word')
                             .setDescription('الكلمة الممنوعة في حساب العضو')
                             .setRequired(true)
                   )
        )
        // 6. [جديد] تنظيف وحذف القواعد لتجنب امتلاء السيرفر والحد الأقصى
        .addSubcommand(command => 
            command.setName('clear')
                   .setDescription('حذف جميع قواعد الحماية التلقائية التي أنشأها البوت')
        ),

    async execute(interaction) {
        const { guild, options } = interaction;
        const sub = options.getSubcommand();

        // التحقق من صلاحية الإدارة
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ 
                content: '❌ لا تمتلك صلاحيات (Administrator) لاستخدام هذا الأمر.', 
                ephemeral: true 
            });
        }

        const botClientId = interaction.client.user.id;

        switch (sub) {
            case 'flagged-words': {
                await interaction.reply({ content: '⏳ جاري تفعيل تصفية الكلمات البذيئة...' });
                
                const rule = await guild.autoModerationRules.create({
                    name: 'Block Flagged Words - AutoMod',
                    creatorId: botClientId,
                    enabled: true,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: 4, // KEYWORD_PRESET
                    triggerMetadata: {
                        presets: [1, 2, 3] 
                    },
                    actions: [{ type: 1, metadata: { customMessage: 'تم حظر رسالتك تلقائياً.' } }]
                }).catch(async err => {
                    console.error(err);
                    return await interaction.editReply({ content: `❌ حدث خطأ: \`${err.message}\`` });
                });

                if (rule) {
                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription('✅ تم تفعيل حظر الكلمات البذيئة (Flagged Words) بنجاح!');
                    await interaction.editReply({ content: '', embeds: [embed] });
                }
                break;
            }

            case 'keywords': {
                const word = options.getString('word');
                await interaction.reply({ content: `⏳ جاري حظر الكلمة [ ${word} ]...` });
                
                const rule2 = await guild.autoModerationRules.create({
                    name: `Prevent ${word} Word - AutoMod`,
                    creatorId: botClientId,
                    enabled: true,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: 1, // KEYWORD
                    triggerMetadata: {
                        keywordFilter: [word]
                    },
                    actions: [{ type: 1, metadata: { customMessage: `تم منع إرسال الكلمة المحظورة: ${word}` } }]
                }).catch(async err => {
                    console.error(err);
                    return await interaction.editReply({ content: `❌ حدث خطأ: \`${err.message}\`` });
                });

                if (rule2) {
                    const embed2 = new EmbedBuilder()
                        .setColor('Blue')
                        .setDescription(`✅ تم بنجاح حظر الكلمة **${word}** من الشات.`);
                    await interaction.editReply({ content: '', embeds: [embed2] });
                }
                break;
            }

            case 'spam-msg': {
                await interaction.reply({ content: '⏳ جاري تفعيل نظام منع السبام...' });
                
                const rule3 = await guild.autoModerationRules.create({
                    name: 'Prevent Spam Messages - AutoMod',
                    creatorId: botClientId,
                    enabled: true,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: 3, // SPAM
                    triggerMetadata: {},
                    actions: [{ type: 1, metadata: { customMessage: 'الرجاء التوقف عن التكرار والسبام.' } }]
                }).catch(async err => {
                    console.error(err);
                    return await interaction.editReply({ content: `❌ حدث خطأ: \`${err.message}\`` });
                });

                if (rule3) {
                    const embed3 = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription('✅ تم تفعيل نظام منع الرسائل العشوائية (Spam) بنجاح!');
                    await interaction.editReply({ content: '', embeds: [embed3] });
                }
                break;
            }

            case 'mention-spam': {
                const number = options.getInteger('number');
                await interaction.reply({ content: `⏳ جاري تفعيل مانع سبام المنشن بالحد الأقصى (${number})...` });
                
                const rule4 = await guild.autoModerationRules.create({
                    name: 'Prevent Mention Spam - AutoMod',
                    creatorId: botClientId,
                    enabled: true,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: 5, // MENTION_SPAM
                    triggerMetadata: {
                        mentionTotalLimit: number
                    },
                    actions: [{ type: 1, metadata: { customMessage: `رسالتك تحتوي على أكثر من ${number} منشن.` } }]
                }).catch(async err => {
                    console.error(err);
                    return await interaction.editReply({ content: `❌ حدث خطأ: \`${err.message}\`` });
                });

                if (rule4) {
                    const embed4 = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription(`✅ تم تفعيل مانع منشن سبام! الحد الأقصى للمنشن: **${number}**.`);
                    await interaction.editReply({ content: '', embeds: [embed4] });
                }
                break;
            }

            // 🌟 ميزة منع الكلمة في الملف الشخصي (الاسم والبروفايل)
            case 'profile-words': {
                const word = options.getString('word');
                await interaction.reply({ content: `⏳ جاري حظر الكلمة [ ${word} ] من ملفات الأعضاء...` });

                const rule5 = await guild.autoModerationRules.create({
                    name: `Block Profile Word: ${word}`,
                    creatorId: botClientId,
                    enabled: true,
                    eventType: 2, // MEMBER_PROFILE_UPDATE (تحديث بروفايل العضو)
                    triggerType: 6, // MEMBER_PROFILE (نوع التريجر لملف العضو)
                    triggerMetadata: {
                        keywordFilter: [word]
                    },
                    actions: [
                        {
                            type: 1, // يمنع العضو من التفاعل أو يمنع التحديث
                            metadata: {
                                customMessage: `تم حجب حسابك لاحتوائه على كلمة ممنوعة: ${word}`
                            }
                        }
                    ]
                }).catch(async err => {
                    console.error(err);
                    return await interaction.editReply({ content: `❌ حدث خطأ: \`${err.message}\`` });
                });

                if (rule5) {
                    const embed5 = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription(`✅ تم تفعيل حظر الكلمة **${word}** في أسماء وحسابات الأعضاء بنجاح!`);
                    await interaction.editReply({ content: '', embeds: [embed5] });
                }
                break;
            }

            // 🧹 ميزة تنظيف وحذف جميع القواعد التي صنعها البوت
            case 'clear': {
                await interaction.reply({ content: '⏳ جاري تنظيف وإلغاء تفعيل قواعد الـ AutoMod...' });
                
                const rules = await guild.autoModerationRules.fetch().catch(() => null);
                if (!rules) return await interaction.editReply({ content: '❌ لم أتمكن من جلب قواعد السيرفر.' });

                // تصفية القواعد التي صنعها هذا البوت فقط
                const botRules = rules.filter(r => r.creatorId === botClientId);

                if (botRules.size === 0) {
                    return await interaction.editReply({ content: '❌ لا توجد قواعد حماية نشطة تم إنشاؤها بواسطة هذا البوت حالياً.' });
                }

                for (const [id, rule] of botRules) {
                    await rule.delete().catch(console.error);
                }

                const embedClear = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`🧹 تم بنجاح حذف وإيقاف جميع قواعد الحماية التلقائية (**${botRules.size}**) التي أنشأها البوت.`);
                
                await interaction.editReply({ content: '', embeds: [embedClear] });
                break;
            }
        }
    }
};