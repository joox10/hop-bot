const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

// المسارات دي متأكد منها بناء على مكان الملف: slashcommand27/General/help.js
const getHelpCategories = require("../../helpCategories");
const { prefix } = require("../../config.js");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('قائمة اوامر البوت'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const categories = getHelpCategories(prefix);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ forceStatic: false })
                })
                .setTitle('📋 لوحة التحكم والمساعدة')
                .setDescription(
                    `<:hop:1527591995399209010> *أممم... دعني أرى ما الذي يمكنني مساعدتك به اليوم!*\n\n` +
                    `> **يرجى اختيار القسم المراد معرفة أوامره من القائمة بالأسفل.**`
                )
                .addFields(
                    { name: ' إحصائيات سريعة', value: `\`\`\` | يحتوي البوت على أكثر من +90 أمر جاهز لخدمتك\`\`\`` }
                )
                .setTimestamp()
                .setFooter({
                    text: `Developed by joox.10 | Requested By ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setColor('#2b2d31');

            const menu = new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('📂 اختر قسم لعرض أوامره')
                .addOptions(
                    categories.map(cat => ({
                        label: cat.label,
                        value: cat.id,
                        emoji: cat.emoji,
                        description: cat.selectDescription,
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.log("🔴 | Error in help all in one bot", error);
        }
    }
};