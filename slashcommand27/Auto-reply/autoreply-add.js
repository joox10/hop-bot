const { ChatInputCommandInteraction, Client, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const one4allDB = new Database("/Json-db/Bots/one4allDB.json");

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('autoreply-add')
        .setDescription('إضافة رد تلقائي   '), 

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            // 1. حساب وقت انتهاء الخطوة الأولى (بعد 3 دقائق من الآن) وتحويله لصيغة ديسكورد
            let expireTime1 = Math.floor((Date.now() + 3 * 60 * 1000) / 1000);

            // إرسال رسالة مخفية تماماً لا يراها أحد غير المستخدم الذي كتب الأمر
            await interaction.reply({
                content: `**الخطوة 1️⃣: برجاء كتابة الكلمة المفتاحية (Word) في الشات هنا.**\n <:trianglewarning:1527931329331728414> سيتم إلغاء العملية تلقائياً: <t:${expireTime1}:R>`,
                ephemeral: true
            });

            // إنشاء مجمع رسائل (Collector) لانتظار رد المستخدم في نفس الروم
            const filter = m => m.author.id === interaction.user.id;
            const collectedWord = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 180000, // 3 دقائق بالملي ثانية
                errors: ['time']
            }).catch(() => null);

            // إذا انتهى الوقت ولم يرسل شيء
            if (!collectedWord || collectedWord.size === 0) {
                return interaction.editReply({ content: `**<:cross:1527933924594946068> تم إلغاء العملية بسبب انتهاء الوقت المحدد (3 دقائق).**` });
            }

            const userWordMsg = collectedWord.first();
            const word = userWordMsg.content;

            // حذف رسالة المستخدم التي كتبها فوراً لكي لا يراها أحد وتبقى الروم نظيفة
            await userWordMsg.delete().catch(() => {});

            // 2. حساب وقت انتهاء الخطوة الثانية (3 دقائق إضافية للرد)
            let expireTime2 = Math.floor((Date.now() + 3 * 60 * 1000) / 1000);

            // تعديل نفس الرسالة المخفية لطلب الرد التلقائي
            await interaction.editReply({
                content: `**الخطوة 2️⃣: تم استقبال الكلمة بنجاح \`${word}\`.**\n**الآن اكتب الرد التلقائي (Reply) الذي سيقوم البوت بإرساله.**\n<:trianglewarning:1527931329331728414> سيتم إلغاء العملية تلقائياً: <t:${expireTime2}:R>`
            });

            const collectedReply = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 180000,
                errors: ['time']
            }).catch(() => null);

            // إذا انتهى وقت الخطوة الثانية
            if (!collectedReply || collectedReply.size === 0) {
                return interaction.editReply({ content: `**<:cross:1527933924594946068> تم إلغاء العملية بسبب انتهاء وقت كتابة الرد (3 دقائق).**` });
            }

            const userReplyMsg = collectedReply.first();
            const reply = userReplyMsg.content;

            // حذف رسالة الرد من الشات للحفاظ على الخصوصية والترتيب
            await userReplyMsg.delete().catch(() => {});

            // 3. التعامل مع قاعدة البيانات وحفظ البيانات
            const data = await one4allDB.get(`replys_${interaction.guild.id}`);
            if (data) {
                const replyCheck = data.find((r) => r.word == word);
                if (replyCheck) {
                    return interaction.editReply({ content: `**هذا الرد \`${word}\` موجود بالفعل في السيرفر مسبقاً <:cross:1527933924594946068>**` });
                } else {
                    await one4allDB.push(`replys_${interaction.guild.id}`, {
                        "word": word,
                        "reply": reply,
                        "addedBy": interaction.user.id
                    });
                }
            } else {
                await one4allDB.set(`replys_${interaction.guild.id}`, [
                    {
                        "word": word,
                        "reply": reply,
                        "addedBy": interaction.user.id
                    }
                ]);
            }

            // الرسالة النهائية بنجاح العملية كاملة
            await interaction.editReply({ content: `**<:check:1527933632591691846> تم إضافة الرد التلقائي للكلمة __${word}__ بنجاح واختفت الرسائل المستلمة!**` });

        } catch (error) {
            console.error(error);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: `**لقد حدث خطأ غير متوقع، اتصل بالمطورين**` });
                } else {
                    await interaction.reply({ content: `**لقد حدث خطأ غير متوقع، اتصل بالمطورين**`, ephemeral: true });
                }
            } catch (err) {}
        }
    }
}