const { PermissionsBitField, SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const ms = require("ms");

const systemDB = new Database("/Json-db/Bots/systemDB.json");

module.exports = {
    ownersOnly: false,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('إعطاء ميوت لشخص أو إزالته')
        .addUserOption(option => option
            .setName('member')
            .setDescription('الشخص')
            .setRequired(true))
        .addStringOption(option => option
            .setName('give_or_remove')
            .setDescription('إعطاء أو إزالة الميوت')
            .setRequired(true)
            .addChoices(
                { name: 'Give', value: 'Give' },
                { name: 'Remove', value: 'Remove' }
            ))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('مدة الميوت (مثلاً: 10m, 1h, 1d)')
            .setRequired(false)),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.reply({ content: `🚫 **لا تمتلك صلاحية لفعل ذلك!**`, ephemeral: true });
            }

            const member = interaction.options.getMember('member');
            const give_or_remove = interaction.options.getString('give_or_remove');
            const duration = interaction.options.getString('duration');

            // منع كتم مالك السيرفر
            if (member.id === interaction.guild.ownerId) {
                return interaction.reply({ content: `⚠️ **لا يمكنك إعطاء ميوت لمالك السيرفر!**`, ephemeral: true });
            }

            // منع كتم أعضاء أعلى من البوت
            if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ content: `⚠️ **لا يمكنني كتم هذا الشخص، رتبته أعلى مني!**`, ephemeral: true });
            }

            let muteRoleId = systemDB.get("muteRole");
            let muteRole = interaction.guild.roles.cache.get(muteRoleId) || interaction.guild.roles.cache.find(ro => ro.name == "Muted");

            if (!muteRole) {
                muteRole = await interaction.guild.roles.create({
                    name: `Muted`,
                    permissions: []
                });

                interaction.guild.channels.cache.forEach(channel => {
                    channel.permissionOverwrites.edit(muteRole, { SendMessages: false });
                });

                systemDB.set("muteRole", muteRole.id);
            }

            if (give_or_remove == "Give") {
                await member.roles.add(muteRole).catch(() => {
                    return interaction.reply({ content: `⚠️ **الرجاء التحقق من صلاحياتي ثم إعادة المحاولة!**`, ephemeral: true });
                });

                if (duration) {
                    const muteDuration = ms(duration);
                    if (!muteDuration) {
                        return interaction.reply({ content: `⚠️ **المدة غير صحيحة! يرجى استخدام (مثلاً: 10m, 1h, 1d)**`, ephemeral: true });
                    }

                    setTimeout(async () => {
                        await member.roles.remove(muteRole);
                        member.send(`🔊 **تم فك الميوت عنك في ${interaction.guild.name}!**`).catch(() => { });
                        interaction.channel.send(`🔊 **تم فك الميوت عن ${member.user.tag} بعد انتهاء المدة!**`);
                    }, muteDuration);
                }

                member.send(`🔇 **تم إعطاؤك ميوت في ${interaction.guild.name}!**`).catch(() => { });
                return interaction.reply({ content: `✅ **تم إعطاء الميوت إلى ${member.user.tag} بنجاح!** 🔇` });

            } else if (give_or_remove == "Remove") {
                if (!member.roles.cache.has(muteRole.id)) {
                    return interaction.reply({ content: `⚠️ **هذا الشخص لا يمتلك ميوت لإزالته!**`, ephemeral: true });
                }

                await member.roles.remove(muteRole).catch(() => {
                    return interaction.reply({ content: `⚠️ **الرجاء التحقق من صلاحياتي ثم إعادة المحاولة!**`, ephemeral: true });
                });

                member.send(`🔊 **تم إزالة الميوت عنك في ${interaction.guild.name}!**`).catch(() => { });
                return interaction.reply({ content: `✅ **تم إزالة الميوت من ${member.user.tag} بنجاح!** 🔊` });
            }

        } catch (error) {
            interaction.reply({ content: `⚠️ **لقد حدث خطأ! يرجى الاتصال بالمطورين.**`, ephemeral: true });
            console.log(error);
        }
    }
};
