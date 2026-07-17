const { 
    Client, 
    Collection, 
    PermissionsBitField, 
    SlashCommandBuilder, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    ApplicationCommandOptionType, 
    Events, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");
const { Database } = require("st.db");
const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('say-channel') // الاسم الجديد للأمر ليتماشى مع ملفاتك
        .setDescription('إرسال منشور منسق عبر البوت لقناة محددة')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('اختر القناة التي تريد إرسال الرسالة إليها')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // قنوات كتابية فقط
        ),

    async execute(interaction) {
        // التحقق من الصلاحيات بنفس طريقتك
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**`, ephemeral: true });
        }

        const targetChannel = interaction.options.getChannel('channel');

        // إنشاء النافذة المنبثقة (Modal) التي تتيح النزول لأسطر جديدة وكتابة الإيموجيات
        const modal = new ModalBuilder()
            .setCustomId(`say_modal_${targetChannel.id}`) // نحتفظ بـ ID القناة داخل الكاستم آيدي
            .setTitle('كتابة المنشور');

        const messageInput = new TextInputBuilder()
            .setCustomId('message_content')
            .setLabel('اكتب رسالتك (يدعم الأسطر والإيموجيات):')
            .setStyle(TextInputStyle.Paragraph) // Paragraph يحل مشكلة ضغط Enter تماماً
            .setPlaceholder('اكتب منشورك هنا بأسطر وفواصل...\nيمكنك استخدام إيموجيات خارج السيرفر.')
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(messageInput);
        modal.addComponents(actionRow);

        // إظهار النافذة للمشرف
        await interaction.showModal(modal);

        // استقبال البيانات بعد إرسال النافذة المنبثقة (تنتظر التفاعل من المستخدم)
        const filter = (subInteraction) => subInteraction.customId === `say_modal_${targetChannel.id}`;
        
        try {
            const submitted = await interaction.awaitModalSubmit({
                filter,
                time: 30000 // مدة الانتظار (دقيقة واحدة لكتابة الرسالة)
            });

            if (submitted) {
                const userMessage = submitted.fields.getTextInputValue('message_content');
                
                // إرسال الرسالة إلى القناة المحددة
                await targetChannel.send({ content: `${userMessage}` });

                // رد تأكيدي يختفي تلقائياً بعد 1.5 ثانية (تماماً كطريقتك السابقة)
                await submitted.reply({ content: `**Done**`, ephemeral: true }).then((msg) => {
                    setTimeout(() => {
                        msg.delete().catch(() => {});
                    }, 1.5 * 1000);
                });
            }
        } catch (error) {
            // في حال انتهاء الوقت ولم يرسل المستخدم الرسالة
            console.error(error);
        }
    }
};