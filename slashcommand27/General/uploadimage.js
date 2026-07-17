const { SlashCommandBuilder } = require('@discordjs/builders');
const cloudinary = require('cloudinary').v2;
const config = require('../../config.js'); // استدعاء إعدادات البوت

// إعداد Cloudinary باستخدام config.js
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uploadimage')
        .setDescription('ارفع صورة واحصل على رابط دائم')
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('الصورة التي تريد رفعها')
                .setRequired(true)
        ),
    async execute(interaction) {
        const image = interaction.options.getAttachment('image');

        // التحقق من أن الملف صورة
        if (!image.contentType.startsWith('image/')) {
            return interaction.reply({ content: '❌ يجب عليك رفع صورة فقط!', ephemeral: true });
        }

        await interaction.deferReply(); // تأخير الرد أثناء رفع الصورة

        try {
            // رفع الصورة إلى Cloudinary
            const uploadResult = await cloudinary.uploader.upload(image.url, {
                folder: "discord_uploads", // يمكن تغييره حسب الحاجة
                resource_type: "image"
            });

            // إرسال رابط الصورة الدائم داخل Embed
            const embed = {
                color: 0x00ff00,
                title: '📸 تم رفع الصورة بنجاح!',
                description: `🔗 **رابط الصورة:**\n\`\`\`${uploadResult.secure_url}\`\`\` `, // عرض الرابط مباشرة
                image: { url: uploadResult.secure_url },
                footer: { text: `تم الرفع بواسطة: ${interaction.user.tag}` }
            };
            
            await interaction.editReply({ embeds: [embed] });            

        } catch (error) {
            console.error("خطأ أثناء رفع الصورة:", error);
            await interaction.editReply({ content: "❌ حدث خطأ أثناء رفع الصورة، حاول مرة أخرى لاحقًا!" });
        }
    }
};
