const { ChatInputCommandInteraction, Client, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription(' اصنع اميبد  ')
        .addStringOption((option) => option
            .setName('title')
            .setDescription(`عنوان الاميبد`)
            .setRequired(true))
        .addStringOption((option) => option // تم تحويله إلى StringOption لاستقبال الروابط
            .setName('image')
            .setDescription(`صورة اسفل الاميبد (ضع رابط الصورة)`)
            .setRequired(false))
        .addChannelOption((option) => option
            .setName('channel')
            .setDescription(`روم التي يترسل فها الاميبد`)
            .setRequired(false))
        .addStringOption((option) => option
            .setName('color')
            .setDescription(`اللون`)
            .addChoices(
                { name: `احمر`, value: 'Red' },
                { name: `ازرق`, value: 'Blue' },
                { name: `ازرق فاتح`, value: 'Aqua' },
                { name: `اخضر`, value: 'Green' },
                { name: `اصفر`, value: 'Yellow' },
                { name: `اسود`, value: 'Black' },
                { name: `ذهبي`, value: 'Gold' },
                { name: `ابيض`, value: 'White' },
                { name: `برتقالي`, value: 'Orange' },
                { name: `رمادي`, value: 'Grey' },
                { name: `بدون لون`, value: 'DarkButNotBlack' },
                { name: `عشوائي`, value: 'Random' },
            )
            .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
    */
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
                return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });
            
            // جلب البيانات (بدون استخدام await لتسريع الاستجابة)
            let title = interaction.options.getString('title');
            let image = interaction.options.getString('image');
            let color = interaction.options.getString('color') || "Random";
            let channel = interaction.options.getChannel('channel') || interaction.channel;

            let embed = new EmbedBuilder().setColor(color);

            if (title) {
                embed.setTitle(title);
            }
            
            // التحقق من أن الرابط صحيح تقريباً قبل وضعه لتجنب الأخطاء
            if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
                embed.setImage(image);
            }

            await interaction.reply({ content: "يرجى كتابة الرسالة التي تود وضعها في الامبد (لديك 60 ثانية)...\n*(إذا لم تكتب شيئاً، سيتم إرسال الإمبد بالعنوان والصورة فقط)*", ephemeral: true });

            const filter = (msg) => msg.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async (msg) => {
                embed.setDescription(msg.content);

                // حذف رسالة المستخدم بشكل آمن
                try {
                    await msg.delete();
                } catch (e) {
                    // تجاهل الخطأ إذا لم يمتلك البوت صلاحية الحذف
                }

                await channel.send({ embeds: [embed] });
                return interaction.followUp({ content: `** <:check:1527933632591691846> تم ارسال الامبد بنجاح **`, ephemeral: true });
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    // تحسين: بدلاً من إلغاء العملية، يتم إرسال الإمبد بدون وصف
                    try {
                        await channel.send({ embeds: [embed] });
                        interaction.followUp({ content: `**انتهى الوقت، تم إرسال الإمبد بدون وصف بنجاح <:check:1527933632591691846>**`, ephemeral: true });
                    } catch (err) {
                        interaction.followUp({ content: "لم يتم استلام أي رسالة وفشل الإرسال التلقائي. تم إلغاء العملية  <:cross:1527933924594946068>.", ephemeral: true });
                    }
                }
            });
            
        } catch (error) {
            console.log(error);
            const errorMessage = { content: `لقد حدث خطأ، اتصل بالمطورين [SHPOPPING WORLD](https://discord.gg/jeTRCe78aS).`, ephemeral: true };
            
            // معالجة الخطأ بشكل يمنع إيقاف عمل البوت (Crash)
            if (interaction.replied || interaction.deferred) {
                interaction.followUp(errorMessage).catch(() => {});
            } else {
                interaction.reply(errorMessage).catch(() => {});
            }
        }
    }
}
