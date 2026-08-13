const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");

const applyDB = new Database("/Json-db/Bots/applyDB.json");

module.exports = {
    adminsOnly: true,

    data: new SlashCommandBuilder()
        .setName("close-apply")
        .setDescription("إنهاء التقديم المفتوح"),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

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

        const apply = await applyDB.get(`apply_${interaction.guild.id}`);

        if (!apply) {
            embed
                .setColor("#ED4245")
                .setTitle("<:trianglewarning:1527931329331728414> لا يوجد تقديم مفتوح")
                .setDescription(
                    "لا يوجد حاليًا أي تقديم مفتوح لإنهائه."
                );

            return interaction.editReply({ embeds: [embed] });
        }

        await applyDB.delete(`apply_${interaction.guild.id}`);

        embed
            .setColor("#57F287")
            .setTitle("<:check:1527933632591691846> تم إنهاء التقديم")
            .setDescription(
                "تم إنهاء التقديم المفتوح بنجاح."
            );

        return interaction.editReply({ embeds: [embed] });
    }
};