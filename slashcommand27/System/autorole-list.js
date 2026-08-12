const { ChatInputCommandInteraction, Client, PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { Database } = require("st.db");
const autoroleDB = new Database("/Json-db/Bots/autoroleDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('autorole-list')
        .setDescription('عرض قائمة الرتب التلقائية المفعلة في السيرفر للأعضاء والبوتات'),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: `**لا تمتلك صلاحية إدارة الرتب لفعل ذلك!**`, ephemeral: true });
        }

        const memberRoleId = autoroleDB.get(`memberRole_${interaction.guild.id}`);
        const botRoleId = autoroleDB.get(`botRole_${interaction.guild.id}`);

        let memberRoleText = "**غير محددة**";
        let botRoleText = "**غير محددة**";

        if (memberRoleId) {
            const fetchedRole = interaction.guild.roles.cache.get(memberRoleId);
            if (fetchedRole) memberRoleText = `${fetchedRole} (\`${fetchedRole.id}\`)`;
        }

        if (botRoleId) {
            const fetchedRole = interaction.guild.roles.cache.get(botRoleId);
            if (fetchedRole) botRoleText = `${fetchedRole} (\`${fetchedRole.id}\`)`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`قائمة الرتب التلقائية لـ ${interaction.guild.name}`)
            .setColor('Blue')
            .addFields(
                { name: '👤 رتبة الأعضاء (Members):', value: memberRoleText, inline: false },
                { name: '🤖 رتبة البوتات (Bots):', value: botRoleText, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};