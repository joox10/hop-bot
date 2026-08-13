const {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType
} = require("discord.js");

const { Database } = require("st.db");

const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    adminsOnly: true,

    data: new SlashCommandBuilder()
        .setName("setup-apply")
        .setDescription("إعداد نظام التقديمات")

        .addChannelOption(option =>
            option
                .setName("applyroom")
                .setDescription("روم نشر رسالة التقديم")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addChannelOption(option =>
            option
                .setName("appliesroom")
                .setDescription("روم استقبال طلبات التقديم")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addChannelOption(option =>
            option
                .setName("resultsroom")
                .setDescription("روم عرض نتائج التقديمات")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("adminrole")
                .setDescription("رتبة مسؤولي التقديمات")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const applyChannel = interaction.options.getChannel("applyroom");
        const applicationsChannel = interaction.options.getChannel("appliesroom");
        const resultsChannel = interaction.options.getChannel("resultsroom");
        const adminRole = interaction.options.getRole("adminrole");

        await applyDB.set(`apply_settings_${interaction.guild.id}`, {
            applyroom: applyChannel.id,
            appliesroom: applicationsChannel.id,
            resultsroom: resultsChannel.id,
            adminrole: adminRole.id,
        });

        const embed = new EmbedBuilder()
            .setColor("#57F287")
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setTitle("⚙️ تم إعداد نظام التقديمات")
            .setDescription("تم حفظ إعدادات نظام التقديمات بنجاح.")
            .addFields(
                {
                    name: "📝 روم التقديم",
                    value: `${applyChannel}`,
                    inline: true,
                },
                {
                    name: "📥 روم الطلبات",
                    value: `${applicationsChannel}`,
                    inline: true,
                },
                {
                    name: "📊 روم النتائج",
                    value: `${resultsChannel}`,
                    inline: true,
                },
                {
                    name: "👤 رتبة الإدارة",
                    value: `${adminRole}`,
                    inline: true,
                }
            )
            .setFooter({
                text: `بواسطة ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        return interaction.editReply({
            embeds: [embed],
        });
    },
};