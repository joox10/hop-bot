const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    adminsOnly: true,

    data: new SlashCommandBuilder()
        .setName("dm-mode")
        .setDescription("تفعيل أو تعطيل إرسال إشعارات التقديم عبر الخاص")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("اختر حالة نظام الرسائل الخاصة")
                .addChoices(
                    { name: "تفعيل", value: "enable" },
                    { name: "تعطيل", value: "disable" }
                )
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const type = interaction.options.getString("type");

        const currentStatus = await applyDB.get(`dm_${guildId}`);

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setFooter({
                text: `بواسطة ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        if (type === "enable") {
            if (currentStatus === true) {
                embed
                    .setColor("#FEE75C")
                    .setTitle("⚠️ نظام الرسائل الخاصة مفعّل بالفعل")
                    .setDescription(
                        "نظام الرسائل الخاصة مفعّل حاليًا، ولم يتم إجراء أي تغيير."
                    );

                return interaction.editReply({ embeds: [embed] });
            }

            await applyDB.set(`dm_${guildId}`, true);

            embed
                .setColor("#57F287")
                .setTitle("📩 تم تفعيل الرسائل الخاصة")
                .setDescription(
                    "سيتم إرسال إشعارات للمتقدم عبر الرسائل الخاصة عند قبول طلبه أو رفضه."
                );
        }

        if (type === "disable") {
            if (currentStatus === false) {
                embed
                    .setColor("#FEE75C")
                    .setTitle("⚠️ نظام الرسائل الخاصة معطّل بالفعل")
                    .setDescription(
                        "نظام الرسائل الخاصة معطّل حاليًا، ولم يتم إجراء أي تغيير."
                    );

                return interaction.editReply({ embeds: [embed] });
            }

            await applyDB.set(`dm_${guildId}`, false);

            embed
                .setColor("#ED4245")
                .setTitle("📪 تم تعطيل الرسائل الخاصة")
                .setDescription(
                    "لن يتم إرسال إشعارات القبول أو الرفض للمتقدم عبر الرسائل الخاصة."
                );
        }

        return interaction.editReply({ embeds: [embed] });
    },
};