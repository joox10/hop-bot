const { Client, Collection, GatewayIntentBits, ChannelType, AuditLogEvent, Partials, EmbedBuilder, ApplicationCommandOptionType, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActivityType } = require("discord.js");
const ms = require('ms');
const moment = require('moment');
const https = require('https');
const { Database } = require("st.db")
const taxDB = new Database("/Json-db/Bots/taxDB.json")
const { PermissionsBitField } = require('discord.js')
const autolineDB = new Database("/Json-db/Bots/autolineDB.json")
const autoroleDB = new Database("/Json-db/Bots/autoroleDB.json");
const suggestionsDB = new Database("/Json-db/Bots/suggestionsDB.json")
const feedbackDB = new Database("/Json-db/Bots/feedbackDB.json")
const giveawayDB = new Database("/Json-db/Bots/giveawayDB.json")
const systemDB = new Database("/Json-db/Bots/systemDB.json")
const shortcutDB = new Database("/Json-db/Others/shortcutDB.json")
const protectDB = new Database("/Json-db/Bots/protectDB.json")
const logsDB = new Database("/Json-db/Bots/logsDB.json")
const nadekoDB = new Database("/Json-db/Bots/nadekoDB.json")
const one4allDB = new Database("/Json-db/Bots/one4allDB.json")
// Backward-compatible alias: the broadcast section historically used `db`.
const db = one4allDB;
const ticketDB = new Database("/Json-db/Bots/ticketDB.json")
const afkDB = new Database("/Json-db/Bots/afkDB.json");

const path = require('path');
const { readdirSync } = require("fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { token, clientId, owner, prefix } = require('./config.js');
const getHelpCategories = require('./helpCategories');
global.theowner = owner;

/**
 * مطابقة آمنة للأوامر والاختصارات.
 * تمنع أن يتحول الاختصار غير الموجود (null) إلى كلمة فعلية،
 * وتمنع أوامر مثل !banX من مطابقة !ban.
 */
function commandMatches(content, command) {
    if (typeof content !== 'string' || typeof command !== 'string') return false;
    const cmd = command.trim();
    if (!cmd) return false;
    return content === cmd || content.startsWith(`${cmd} `);
}


const client27 = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] , shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
client27.commands = new Collection();
client27.events = new Collection();
require(`./handlers/events`)(client27);
const rest = new REST({ version: '10' }).setToken(token);
client27.setMaxListeners(1000)

let slashCommandsRegistered = false;
client27.on("ready", async () => {
    if (slashCommandsRegistered) return;
    try {
        await rest.put(
            Routes.applicationCommands(client27.user.id),
            { body: one4allSlashCommands },
        );
        slashCommandsRegistered = true;
        console.log(`✅ Registered ${one4allSlashCommands.length} global slash commands.`);
    } catch (error) {
        console.error("❌ Failed to register slash commands:", error);
    }
});

client27.once('ready', () => {
    client27.guilds.cache.forEach(guild => {
        guild.members.fetch().then(members => {
            if (members.size < 10) {
                console.log(`one4all bot : Guild: ${guild.name} has less than 10 members`);
            }
        }).catch(console.error);
    });
});

//------------- التحقق من وقت البوتHandlers --------------//

require("./handlers/suggest")(client27)
require('./handlers/tax4bot')(client27)
require("./handlers/autorole")(client27)
;
require(`./handlers/claim`)(client27);
require(`./handlers/close`)(client27);
require(`./handlers/create`)(client27);
require(`./handlers/reset`)(client27);
require(`./handlers/support-panel`)(client27);
require('./handlers/joinGiveaway')(client27)

require(`./handlers/applyCreate`)(client27)
require(`./handlers/applyResult`)(client27)
require(`./handlers/applySubmit`)(client27)

require(`./handlers/addToken`)(client27)
require(`./handlers/info`)(client27)
 
const folderPath = path.join(__dirname, 'slashcommand27');
client27.one4allSlashCommands = new Collection();
const one4allSlashCommands = [];
const ascii = require("ascii-table");
const table = new ascii("one4all commands").setJustify();

for (let folder of readdirSync(folderPath).filter((folder) => !folder.includes("."))) {
    for (let file of readdirSync(`${folderPath}/` + folder).filter((f) => f.endsWith(".js"))) {
        let command = require(`${folderPath}/${folder}/${file}`);
        if (command) {
            one4allSlashCommands.push(command.data.toJSON());
            client27.one4allSlashCommands.set(command.data.name, command);
            if (command.data.name) {
                table.addRow(`/${command.data.name}`, "🟢 Working");
            } else {
                table.addRow(`/${command.data.name}`, "🔴 Not Working");
            }
        }
    }
}

const folderPath2 = path.join(__dirname, 'slashcommand27');
for(let foldeer of readdirSync(folderPath2).filter((folder) => !folder.includes("."))) {
    for(let fiee of(readdirSync(`${folderPath2}/${foldeer}`).filter((fi) => fi.endsWith(".js")))) {
        const commander = require(`${folderPath2}/${foldeer}/${fiee}`)
    }
}

require("./handlers/events")(client27)

for (let file of readdirSync('./events/').filter(f => f.endsWith('.js'))) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client27.once(event.name, (...args) => event.execute(...args));
    } else {
        client27.on(event.name, (...args) => event.execute(...args));
    }
}

//------------- نظام الـ AFK --------------//
client27.on("messageCreate", async (message) => {
        if (!message.guild) return;
if (message.author.bot) return;

    const userId = message.author.id;
    const guild = message.guild;

    if (afkDB.has(userId)) {
        afkDB.delete(userId);
        message.reply(`<:hop:1527591995399209010> **مرحبًا بعودتك ${message.author}, تم إلغاء وضع AFK!**`);
    }

    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach(member => {
            if (afkDB.has(member.id)) {
                const reason = afkDB.get(member.id).reason;
                const mentionEmbed = new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle("<:trianglewarning:1527931329331728414> هذا العضو في وضع AFK")
                    .setDescription(`**السبب:** ${reason}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }));

                message.reply({ embeds: [mentionEmbed] });
            }
        });
    }

    if (commandMatches(message.content.toLowerCase(), ".afk")) {
        const args = message.content.split(" ").slice(1);
        const reason = args.join(" ") || "غير محدد";

        afkDB.set(userId, { reason: reason, timestamp: Date.now() });

        const afkEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("<:check:1527933632591691846> تم تفعيل وضع AFK")
            .setDescription(`**السبب:** ${reason}`)
            .setThumbnail(guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [afkEmbed] });
    }
});

client27.on("messageCreate" , async(message) => {
        if (!message.guild) return;
if(message.content == "test"){
        message.reply(`works fine`)
    }
})

//------------- تشغيل أوامر السلاش --------------//
client27.on("interactionCreate" , async(interaction) => {
    if (interaction.isChatInputCommand()) {
        if(interaction.user.bot) return;

        const command = client27.one4allSlashCommands.get(interaction.commandName);
        if (!command) return;

        if (command.ownersOnly === true) {
            if (owner != interaction.user.id) {
                return interaction.reply({content: `❗ ***لا تستطيع استخدام هذا الامر***`, ephemeral: true});
            }
        }
        if (command.adminsOnly === true) {
            if (!interaction.inGuild() || !interaction.member?.permissions?.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: `❗ ***يجب أن تمتلك صلاحية الأدمن لاستخدام هذا الأمر***`, ephemeral: true });
            }
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error("🔴 | error in one4all bot", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true }).catch(() => {});
            } else {
                await interaction.followUp({ content: '❌ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true }).catch(() => {});
            }
        }
    }
})

//------------- نظام الـ Giveaway --------------//
client27.on("ready", async () => {
    const processGiveaways = async () => {
        for (const theguild of client27.guilds.cache.values()) {
            try {
                const giveaways = giveawayDB.get(`giveaways_${theguild.id}`);
                if (!Array.isArray(giveaways) || giveaways.length === 0) continue;

                let changed = false;

                for (const giveaway of giveaways) {
                    if (!giveaway || giveaway.ended) continue;

                    const messageid = giveaway.messageid;
                    const channelid = giveaway.channelid;
                    const entries = Array.isArray(giveaway.entries) ? giveaway.entries : [];
                    const winners = Math.max(1, Number(giveaway.winners) || 1);
                    const prize = giveaway.prize ?? 'جائزة';
                    const duration = Number(giveaway.duration);

                    if (!Number.isFinite(duration)) continue;

                    if (duration > 0) {
                        giveaway.duration = duration - 1;
                        changed = true;
                        continue;
                    }

                    const theRoom = theguild.channels.cache.get(channelid);
                    if (!theRoom || !theRoom.messages?.fetch) {
                        giveaway.ended = true;
                        changed = true;
                        continue;
                    }

                    const themsg = await theRoom.messages.fetch(messageid).catch(() => null);
                    if (!themsg) {
                        giveaway.ended = true;
                        changed = true;
                        continue;
                    }

                    const button = new ButtonBuilder()
                        .setEmoji('<:gift:1534180600322330765>')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('join_giveaway')
                        .setDisabled(true);

                    const row = new ActionRowBuilder().addComponents(button);
                    await themsg.edit({ components: [row] }).catch(() => {});

                    if (entries.length > 0 && entries.length >= winners) {
                        const availableEntries = [...entries];
                        const theWinners = [];

                        for (let i = 0; i < winners && availableEntries.length; i++) {
                            const winnerIndex = Math.floor(Math.random() * availableEntries.length);
                            theWinners.push(availableEntries.splice(winnerIndex, 1)[0]);
                        }

                        await themsg.reply({
                            content: `Congratulations ${theWinners.map(id => `<@${id}>`).join(', ')}! You won the **${prize}**!`
                        }).catch(() => {});
                    } else {
                        await themsg.reply({ content: '**لا يوجد عدد من المشتركين كافي**' }).catch(() => {});
                    }

                    giveaway.ended = true;
                    giveaway.duration = -1;
                    changed = true;
                }

                if (changed) {
                    await giveawayDB.set(`giveaways_${theguild.id}`, giveaways);
                }
            } catch (error) {
                console.error(`[GIVEAWAY] Error in guild ${theguild.id}:`, error);
            }
        }
    };

    await processGiveaways();
    setInterval(processGiveaways, 1000);
});

//------------- نظام الـ Tax --------------//
client27.on('messageCreate', async (message) => {
        if (!message.guild) return;
if (message.author.bot) return;
    let roomid = taxDB.get(`tax_room_${message.guild.id}`);
    let taxLine = taxDB.get(`tax_line_${message.guild.id}`);
    let taxMode = taxDB.get(`tax_mode_${message.guild.id}`) || 'embed'; 
    let taxColor = taxDB.get(`tax_color_${message.guild.id}`) || '#0099FF'; 

    if (roomid) {
        if (message.channel.id === roomid) {
            let number = message.content;

            if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
            else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
            else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
            else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

            if (isNaN(number) || number == 0) return message.delete();

            let number2 = parseInt(number);
            let tax = Math.floor(number2 * 20 / 19 + 1);
            let tax3 = Math.floor(tax * 20 / 19 + 1);
            let tax4 = Math.floor(number2 * 0.02);
            let tax5 = Math.floor(tax3 + tax4);

            let description = `
🪙 المبلغ ** : ${number2}**
- ضريبة برو بوت **: ${tax}**
- المبلغ كامل مع ضريبة الوسيط **: ${tax3}**
- نسبة الوسيط 2 % **: ${tax4}**
- الضريبة كاملة مع نسبة الوسيط **: ${tax5}**
`;

            let btn1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`tax_${tax}`)
                    .setLabel('Tax')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`mediator_${tax5}`)
                    .setLabel('Mediator')
                    .setStyle(ButtonStyle.Secondary)
            );

            if (taxMode === 'embed') {
                let embed1 = new EmbedBuilder()
                    .setColor(taxColor)
                    .setDescription(description)
                    .setThumbnail(message.guild.iconURL({ dynamic: true }));

                message.reply({ embeds: [embed1], components: [btn1] });

                if (taxLine) {
                    message.channel.send({ files: [taxLine] });
                }
            } else {
                message.reply({ content: description, components: [btn1] });

                if (taxLine) {
                    message.channel.send({ files: [taxLine] });
                }
            }
            return;
        }
    }
});

//------------- نظام الـ Auto-Role --------------//
client27.on(Events.GuildMemberAdd, async (member) => {
    try {
        if (member.user.bot) {
            const botRoleId = autoroleDB.get(`botRole_${member.guild.id}`);
            if (botRoleId) {
                const role = member.guild.roles.cache.get(botRoleId);
                if (role) {
                    await member.roles.add(role).catch(err => console.log(`فشل إعطاء رتبة البوت: ${err.message}`));
                }
            }
        } else {
            const memberRoleId = autoroleDB.get(`memberRole_${member.guild.id}`);
            if (memberRoleId) {
                const role = member.guild.roles.cache.get(memberRoleId);
                if (role) {
                    await member.roles.add(role).catch(err => console.log(`فشل إعطاء رتبة العضو: ${err.message}`));
                }
            }
        }
    } catch (error) {
        console.error("حدث خطأ في نظام الـ Auto-Role:", error);
    }
});

//------------- معالجة الأخطاء --------------//
process.on('uncaughtException', (err) => {
    console.log(err)
});
process.on('unhandledRejection', (reason, promise) => {
    console.log(reason)
});
process.on("uncaughtExceptionMonitor", (reason) => { 
    console.log(reason)
});

  
client27.on("messageCreate", async (message) => {
      if (!message.guild) return;
if (message.author.bot) return;

  const line = autolineDB.get(`line_${message.guild.id}`);
  const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

  if (message.content === "-" || message.content === "خط") {
    if (line && message.member.permissions.has('ManageMessages')) {
      await message.delete();
      if (lineMode === 'link') {
        return message.channel.send({ content: `${line}` });
      } else if (lineMode === 'image') {
        return message.channel.send({ files: [line] });
      }
    }
  }
});
  


client27.on("messageCreate", async (message) => {
      if (!message.guild) return;
if (message.author.bot) return;

  const autoChannels = autolineDB.get(`line_channels_${message.guild.id}`);
  if (autoChannels) {
    if (autoChannels.length > 0) {
      if (autoChannels.includes(message.channel.id)) {
        const line = autolineDB.get(`line_${message.guild.id}`);
        const lineMode = autolineDB.get(`line_mode_${message.guild.id}`) || 'image'; // Default to link if not set

        if (line) {
          if (lineMode === 'link') {
            return message.channel.send({ content: `${line}` });
          } else if (lineMode === 'image') {
            return message.channel.send({ files: [line] });
          }
        }
      }
    }
  }
});


//------------- تقييم  --------------//


client27.on('messageCreate', async message => {
        if (!message.guild) return;
if (message.author.bot) return;

    if(message.content == `قيمني`) {
        const designer = message.author;
        const designRole = '1271443664194895894';
        if (!message.member.roles.cache.has(designRole)) {
            return; 
        }

        const filter = response => !response.author.bot && response.author.id !== designer.id;

        message.channel.send(`من فضلك أكتب تقييمك للتصاميم، <@${designer.id}>`).then(() => {
            message.channel.awaitMessages({ filter, max: 1, errors: ['time'] })
                .then(async collected => {

                    const user = collected.first().author; 
                    const userText = collected.first().content;
                    const rankroom = '1278108478828843118';

                    const st1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Primary)
                        );

                    const ratingPrompt = await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i =>
                        !i.user.bot &&
                        i.user.id === user.id &&
                        /^([1-5])star$/.test(i.customId);
                    const collector = ratingPrompt.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

                    collector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;

                        let embedDescription;
                        switch (interaction.customId) {
                            case '1star':
                                embedDescription = '⭐';
                                break;
                            case '2star':
                                embedDescription = '⭐⭐';
                                break;
                            case '3star':
                                embedDescription = '⭐⭐⭐';
                                break;
                            case '4star':
                                embedDescription = '⭐⭐⭐⭐';
                                break;
                            case '5star':
                                embedDescription = '⭐⭐⭐⭐⭐';
                                break;
                        }

                        const embedrank = new EmbedBuilder()
                            .setDescription(`${userText}\n**عدد النجوم:**\n${embedDescription}`)
                            .setColor('#808080')
                            .setAuthor({
                                name: user.username,
                                iconURL: user.displayAvatarURL()
                            });

                        const rankChannel = client27.channels.cache.get(rankroom);
                        if (rankChannel) {
                            await rankChannel.send({ content: `المصمم: <@${designer.id}>`, embeds: [embedrank] });
                            await interaction.reply({ content: 'تم إرسال تقييمك بنجاح، نشكرك لاستعمال خدماتنا', ephemeral: true });
                        } else {
                            await interaction.reply({ content: 'حدث خطأ، روم التقييم غير موجود.', ephemeral: true });
                        }
                            await interaction.message.delete().catch(() => {});

                        collector.stop();
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            message.channel.send('لم يتم تلقي أي تقييمات.');
                        }
                    });
                })
                .catch(error => {
                    console.error('Error collecting messages: ', error);
                    message.channel.send('انتهى الوقت، لا يمكنك التقييم.');
                });
        });
    }
});


client27.on('messageCreate', async message => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`rate_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
  if (message.content === `${prefix}تقييم` || commandMatches(message.content, cmd)) {
        const stafer = message.author;
        const staffRole = await feedbackDB.get(`staff_role_${message.guild.id}`);  
        if (!message.member.roles.cache.has(staffRole)) {
            return; 
        }

        const filter = response => !response.author.bot && response.author.id !== stafer.id;

        message.channel.send(`من فضلك أكتب تقييمك للاداري <@${stafer.id}>`).then(() => {
            message.channel.awaitMessages({ filter, max: 1, errors: ['time'] })
                .then(async collected => {

                    const user = collected.first().author; 
                    const userText = collected.first().content;
                    const rankroom = feedbackDB.get(`rank_room_${message.guild.id}`);

                    const st1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('1star').setLabel('نجمة 1').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('2star').setLabel('نجمتين 2').setEmoji(`⭐`).setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('3star').setLabel('3 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId('4star').setLabel('4 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Success),
                            new ButtonBuilder().setCustomId('5star').setLabel('5 نجوم').setEmoji(`⭐`).setStyle(ButtonStyle.Success)
                        );

                    const ratingPrompt = await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i =>
                        !i.user.bot &&
                        i.user.id === user.id &&
                        /^([1-5])star$/.test(i.customId);
                    const collector = ratingPrompt.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

                    collector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;

                        let embedDescription;
                        switch (interaction.customId) {
                            case '1star':
                                embedDescription = '⭐';
                                break;
                            case '2star':
                                embedDescription = '⭐⭐';
                                break;
                            case '3star':
                                embedDescription = '⭐⭐⭐';
                                break;
                            case '4star':
                                embedDescription = '⭐⭐⭐⭐';
                                break;
                            case '5star':
                                embedDescription = '⭐⭐⭐⭐⭐';
                                break;
                        }

                        const embedrank = new EmbedBuilder()
                            .setDescription(`${userText}\n**عدد النجوم:**\n${embedDescription}`)
                            .setColor('Random')
                            .setAuthor({
                                name: user.username,
                                iconURL: user.displayAvatarURL()
                            });

                        const rankChannel = client27.channels.cache.get(rankroom);
                        if (rankChannel) {
                            await rankChannel.send({ content: `الاداري: <@${stafer.id}>`, embeds: [embedrank] });
                            await interaction.reply({ content: 'تم إرسال تقييمك بنجاح، نشكرك لاستعمال خدماتنا', ephemeral: true });
                        } else {
                            await interaction.reply({ content: 'حدث خطأ، روم التقييم غير موجود.', ephemeral: true });
                        }
                            await interaction.message.delete().catch(() => {});

                        collector.stop();
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            message.channel.send('لم يتم تلقي أي تقييمات.');
                        }
                    });
                })
                .catch(error => {
                    console.error('Error collecting messages: ', error);
                    message.channel.send('انتهى الوقت، لا يمكنك التقييم.');
                });
        });
    }
});

//------------- الاقتراحات   --------------//


client27.on("messageCreate", async (message) => {
      if (!message.guild) return;
if (message.author.bot) return;
  const line = suggestionsDB.get(`line_${message.guild.id}`);
  const chan = suggestionsDB.get(`suggestions_room_${message.guild.id}`);
  const suggestionMode = suggestionsDB.get(`suggestion_mode_${message.guild.id}`) || 'buttons'; // Default to buttons if not set
  const threadMode = suggestionsDB.get(`thread_mode_${message.guild.id}`) || 'enabled'; // Default to enabled if not set

  if (chan) {
    if (message.channel.id !== chan) return;
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content.slice(0, 240)} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (suggestionMode === 'buttons') {
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("<:check:1527933632591691846>")
        .setStyle(ButtonStyle.Success);
      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("<:cross:1527933924594946068>")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(button1, button2);
      let send = await message.channel.send({ embeds: [embed], components: [row] }).catch(() => { return; });

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      await suggestionsDB.set(`${send.id}_ok`, 0);
      await suggestionsDB.set(`${send.id}_no`, 0);
      return message.delete();
    } else if (suggestionMode === 'reactions') {
      let send = await message.channel.send({ embeds: [embed] }).catch(() => { return; });
      await send.react('<:check:1527933632591691846>');
      await send.react('<:cross:1527933924594946068>');

      if (threadMode === 'enabled') {
        await send.startThread({
          name: `Comments - تعليقات`
        }).then(async (thread) => {
          thread.send(`** - هذا المكان مخصص لمشاركة رايك حول هذا الاقتراح : \`${message.content}\` **`);
        });
      }

      if (line) {
        await message.channel.send({ files: [line] }).catch((err) => { return; });
      }
      return message.delete();
    }
  }
});


//------------- فيدباك الاراء   --------------//

client27.on("messageCreate", async (message) => {
      if (!message.guild) return;
if (message.author.bot) return;
  
  const line = feedbackDB.get(`line_${message.guild.id}`);
  const chan = feedbackDB.get(`feedback_room_${message.guild.id}`);
  const feedbackMode = feedbackDB.get(`feedback_mode_${message.guild.id}`) || 'embed'; 
  const feedbackEmoji = feedbackDB.get(`feedback_emoji_${message.guild.id}`) || "❤"; 

  if (chan) {
    if (message.channel.id !== chan) return;

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTimestamp()
      .setTitle(`** > ${message.content.slice(0, 240)} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip:**`, embeds: [embed] });
      await themsg.react("<:handshake:1537447122528370788>");
      await themsg.react("<:opinion:1534180888575737887>");
      if (line) {
        await message.channel.send({ files: [line] });
      }
    } else if (feedbackMode === 'reactions') {
      await message.react(feedbackEmoji);
      if (line) {
        await message.channel.send({ files: [line] });
      }
    }
  }
});

//------------- نظام غلق التيكت   --------------//

// ============================================================
// 🔒 إغلاق التذكرة
// ============================================================

client27.on('messageCreate', async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.content === `${prefix}close`) {

        const ticket = ticketDB.get(
            `TICKET-PANEL_${message.channel.id}`
        );

        // التأكد أن القناة تذكرة
        if (!ticket) {
            return message.reply({
                content: '❌ هذه القناة ليست تذكرة.',
            });
        }

        const supportRoleID = ticket.Support;

        /*
        // يمكنك تفعيل هذا الجزء إذا أردت أن يكون الإغلاق
        // مسموحًا فقط لفريق الدعم

        if (
            supportRoleID &&
            !message.member.roles.cache.has(supportRoleID)
        ) {
            return message.reply({
                content: '❌ ليس لديك صلاحية لإغلاق هذه التذكرة.'
            });
        }
        */

        // إخفاء التذكرة عن صاحبها
        await message.channel.permissionOverwrites
            .edit(ticket.author, {
                ViewChannel: false
            })
            .catch(() => {});

        // ====================================================
        // 🔒 Embed إغلاق التذكرة
        // ====================================================

        const embed2 = new EmbedBuilder()
            .setColor('#F1C40F')
            .setAuthor({
                name: 'Ticket System',
                iconURL: message.guild.iconURL({ dynamic: true })
            })
            .setTitle('🔒 تم إغلاق التذكرة')
            .setDescription(
                `تم إغلاق هذه التذكرة بواسطة ${message.author}.\n\n` +
                `يمكن لفريق الدعم استخدام لوحة التحكم بالأسفل لإدارة التذكرة.`
            )
            .addFields(
                {
                    name: '👤 تم الإغلاق بواسطة',
                    value: `${message.author}`,
                    inline: true
                },
                {
                    name: '🎫 التذكرة',
                    value: `${message.channel}`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({
                text: message.guild.name,
                iconURL: message.guild.iconURL({ dynamic: true })
            });

        // ====================================================
        // 🎛️ لوحة التحكم
        // ====================================================

        const embed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle('🎛️ لوحة التحكم بالتذكرة')
            .setDescription(
                'اختر الإجراء الذي تريد تنفيذه من الأزرار بالأسفل.\n\n' +
                '🔓 **فتح التذكرة**\n' +
                'إعادة فتح التذكرة وإتاحة الوصول إليها.\n\n' +
                '🗑️ **حذف التذكرة**\n' +
                'حذف التذكرة بشكل نهائي.\n\n' +
                '📄 **Transcript**\n' +
                'إنشاء نسخة من محادثة التذكرة.'
            )
            .setFooter({
                text: 'Ticket System • Support Panel'
            });

        // ====================================================
        // 🎛️ الأزرار
        // ====================================================

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('delete')
                    .setLabel('حذف التذكرة')
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('Open')
                    .setLabel('فتح التذكرة')
                    .setEmoji('🔓')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('Tran')
                    .setLabel('Transcript')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Secondary)
            );

        await message.reply({
            embeds: [embed2, embed],
            components: [row]
        });

        // ====================================================
        // 📋 Close Logs
        // ====================================================

        const logsRoomId = ticketDB.get(
            `LogsRoom_${message.guild.id}`
        );

        const logChannel =
            message.guild.channels.cache.get(logsRoomId);

        if (logChannel) {

            const logEmbed = new EmbedBuilder()
                .setColor('#F1C40F')
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true
                    })
                })
                .setTitle('🔒 Ticket Closed')
                .setDescription(
                    `تم إغلاق تذكرة بواسطة ${message.author}.`
                )
                .addFields(
                    {
                        name: '🎫 اسم التذكرة',
                        value: `\`${message.channel.name}\``,
                        inline: true
                    },
                    {
                        name: '👤 صاحب التذكرة',
                        value: `${ticket.author}`,
                        inline: true
                    },
                    {
                        name: '🔒 تم الإغلاق بواسطة',
                        value: `${message.author}`,
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({
                    text: message.guild.name,
                    iconURL: message.guild.iconURL({
                        dynamic: true
                    })
                });

            logChannel.send({
                embeds: [logEmbed]
            }).catch(() => {});
        }
    }
});


// ============================================================
// 🗑️ حذف التذكرة
// ============================================================

client27.on('messageCreate', async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.content === `${prefix}delete`) {

        const ticket = ticketDB.get(
            `TICKET-PANEL_${message.channel.id}`
        );

        // التأكد أن القناة تذكرة
        if (!ticket) {
            return message.reply({
                content: '❌ هذه القناة ليست تذكرة.'
            });
        }

        const supportRoleId = ticket.Support;

        // التأكد من صلاحية الدعم
        if (
            supportRoleId &&
            !message.member.roles.cache.has(supportRoleId)
        ) {
            return message.reply({
                content: '❌ هذا الأمر متاح لفريق الدعم فقط.'
            });
        }

        // ====================================================
        // 🗑️ رسالة الحذف
        // ====================================================

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setAuthor({
                name: 'Ticket System',
                iconURL: message.guild.iconURL({
                    dynamic: true
                })
            })
            .setTitle('🗑️ سيتم حذف التذكرة')
            .setDescription(
                'سيتم حذف هذه التذكرة نهائيًا خلال **5 ثوانٍ**.\n\n' +
                'يرجى الانتظار حتى انتهاء عملية الحذف.'
            )
            .addFields({
                name: '🎫 التذكرة',
                value: `${message.channel}`,
                inline: true
            })
            .setTimestamp()
            .setFooter({
                text: 'Ticket System'
            });

        await message.reply({
            embeds: [embed]
        });

        // ====================================================
        // 📋 تجهيز الـ Logs قبل حذف القناة
        // ====================================================

        const Logs = ticketDB.get(
            `LogsRoom_${message.guild.id}`
        );

        const Log =
            message.guild.channels.cache.get(Logs);

        const logEmbed = new EmbedBuilder()
            .setColor('#ED4245')
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({
                    dynamic: true
                })
            })
            .setTitle('🗑️ Ticket Deleted')
            .setDescription(
                `تم حذف التذكرة بواسطة ${message.author}.`
            )
            .addFields(
                {
                    name: '🎫 اسم التذكرة',
                    value: `\`${message.channel.name}\``,
                    inline: true
                },
                {
                    name: '👤 صاحب التذكرة',
                    value: `${ticket.author}`,
                    inline: true
                },
                {
                    name: '🗑️ تم الحذف بواسطة',
                    value: `${message.author}`,
                    inline: true
                }
            )
            .setTimestamp()
            .setFooter({
                text: message.guild.name,
                iconURL: message.guild.iconURL({
                    dynamic: true
                })
            });

        // إرسال الـLog قبل حذف القناة
        if (Log) {
            Log.send({
                embeds: [logEmbed]
            }).catch(() => {});
        }

        // حذف بيانات التذكرة من قاعدة البيانات
        ticketDB.delete(
            `TICKET-PANEL_${message.channel.id}`
        );

        // ====================================================
        // 🗑️ حذف التذكرة بعد 5 ثواني
        // ====================================================

        setTimeout(() => {

            message.channel
                .delete()
                .catch(() => {});

        }, 5000);
    }
});

//------------- اختصار البان--------------//

client27.on('messageCreate', async message => {
        if (!message.guild) return;
if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر ban
    const banCmd = shortcutDB.get(`ban_cmd_${message.guild.id}`) || `${prefix}ban`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (commandMatches(message.content, banCmd)) {
        // التحقق إذا كان المستخدم لديه صلاحية الحظر
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("🚫 **ليس لديك صلاحية لاستخدام هذا الاختصار!**");
        }

        // جلب العضو الذي يريد حظره
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply("⚠️ **يجب عليك منشن الشخص الذي تريد حظره!**");
        }

        const member = await message.guild.members.fetch(user.id);

        // التحقق إذا كان العضو الذي يحاول حظره أعلى رتبة
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply("🚫 **لا يمكنك حظر شخص أعلى منك في الرتبة!**");
        }

        // تنفيذ أمر الحظر
        try {
            await member.ban({ reason: 'تم حظره بواسطة الاختصار' });
            message.reply(`✅ **تم حظر ${user.tag} بنجاح!** 🚨`);
        } catch (error) {
            console.error(error);
            message.reply("❌ **حدث خطأ أثناء محاولة حظر العضو.**");
        }
    }
});

client27.on('messageCreate', async message => {
      if (!message.guild) return;
if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر الطرد
  const kickCmd = shortcutDB.get(`kick_cmd_${message.guild.id}`) || `${prefix}kick`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (commandMatches(message.content, kickCmd)) {
      // التحقق إذا كان المستخدم لديه صلاحية الطرد
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          return message.reply("<:trianglewarning:1527931329331728414> **ليس لديك صلاحية لاستخدام هذا الاختصار!**");
      }

      // استخراج الـ ID من الرسالة
      const userID = message.content.split(' ')[1]; // استخدام الرقم الذي يأتي بعد الاختصار

      // التحقق إذا تم توفير الـ ID
      if (!userID) {
          return message.reply("<:trianglewarning:1527931329331728414> **يجب عليك إدخال الـ ID الخاص بالشخص الذي تريد طرده!**");
      }

      // جلب العضو باستخدام الـ ID
      const member = await message.guild.members.fetch(userID).catch(err => {
          return message.reply("<:trianglewarning:1527931329331728414> **لم يتم العثور على هذا العضو! تأكد من صحة الـ ID.**");
      });

      // التحقق إذا كان العضو الذي يحاول طرده أعلى رتبة
      if (member.roles.highest.position >= message.member.roles.highest.position) {
          return message.reply("<:trianglewarning:1527931329331728414> **لا يمكنك طرد شخص أعلى منك في الرتبة!**");
      }

      // تنفيذ أمر الطرد
      try {
          await member.kick('تم طرده بواسطة الاختصار');
          message.reply(`<:check:1527933632591691846> **تم طرد ${member.user.tag} بنجاح!** <:trianglewarning:1527931329331728414>`);
      } catch (error) {
          console.error(error);
          message.reply("<:cross:1527933924594946068> **حدث خطأ أثناء محاولة طرد العضو.**");
      }
  }
});



client27.on('messageCreate', async message => {
        if (!message.guild) return;
if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر user
    const userCmd = shortcutDB.get(`user_cmd_${message.guild.id}`) || `${prefix}user`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (commandMatches(message.content, userCmd)) {
        let user = message.mentions.users.first();

        // إذا لم يتم منشن أي شخص، استخدم صاحب الرسالة
        if (!user) {
            user = message.author;
        }

        // جلب العضو المتعلق بالمستخدم للحصول على 'joinedAt'
        const member = await message.guild.members.fetch(user.id);
        
        // تأكد من أن الـ user متاح
        if (!user || !member) {
            return message.reply("<:trianglewarning:1527931329331728414> **لم يتم العثور على المستخدم!**");
        }

        // إنشاء Embed للرد
        const embed = new EmbedBuilder()
            .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
            .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 1024 }) })
            .addFields(
                {
                    name: `**Joined Discord :**`, value: `**<t:${parseInt(user.createdAt / 1000)}:R>**`, inline: true
                },
                {
                    name: `**Joined Server :**`, value: `**<t:${parseInt(member.joinedAt / 1000)}:R>**`, inline: true // استخدام member.joinedAt
                }
            );

        // إرسال الـ embed كإجابة
        return message.reply({ embeds: [embed] });
    }
});




client27.on('messageCreate', async message => {
      if (!message.guild) return;
if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر avatar
  const avatarCmd = shortcutDB.get(`avatar_cmd_${message.guild.id}`) || `${prefix}avatar`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (commandMatches(message.content, avatarCmd)) {
    const args = message.content.slice(avatarCmd.length).trim().split(/ +/);

    // إذا كانت الكلمة التالية هي 'server'
    if (args[0] && args[0].toLowerCase() === 'server') {
      // عرض صورة أفاتار السيرفر
      const serverIcon = message.guild.iconURL({ dynamic: true, size: 1024 });
      
      if (!serverIcon) {
        return message.reply("<:trianglewarning:1527931329331728414> **لا يوجد أي أيقونة سيرفر!**");
      }

      const embed = new EmbedBuilder()
        .setTitle(`Server Avatar`)
        .setImage(serverIcon)
        .setURL(serverIcon)
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      return message.reply({ embeds: [embed] });
    } else {
      // عرض صورة أفاتار المستخدم
      const user = message.mentions.users.first() || message.author;

      const embed = new EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
        .setTitle(`Avatar link`)
        .setURL(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
        .setImage(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024`)
        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      return message.reply({ embeds: [embed] });
    }
  }
});



client27.on('messageCreate', async message => {
      if (!message.guild) return;
if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر banner
  const bannerCmd = shortcutDB.get(`banner_cmd_${message.guild.id}`) || `${prefix}banner`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (commandMatches(message.content, bannerCmd)) {
      const member = message.mentions.members.first() || message.member;
      const user = message.mentions.users.first() || message.author;

      try {
          // طلب بيانات المستخدم من Discord API باستخدام https
          https.get(`https://discord.com/api/v10/users/${member.id}`, {
              headers: { Authorization: `Bot ${token}` }
          }, (res) => {
              let data = '';

              // تجميع البيانات
              res.on('data', chunk => {
                  data += chunk;
              });

              // عندما تنتهي الاستجابة
              res.on('end', () => {
                  if (res.statusCode !== 200) {
                      return message.reply({ content: "<:cross:1527933924594946068> تعذر الحصول على بيانات البانر من Discord." }).catch(() => {});
                  }

                  let parsedData;
                  try {
                      parsedData = JSON.parse(data);
                  } catch {
                      return message.reply({ content: "<:cross:1527933924594946068> تعذر قراءة بيانات المستخدم." }).catch(() => {});
                  }

                  const { banner, accent_color } = parsedData;

                  if (banner) {
                      // المستخدم لديه بانر
                      const extension = banner.startsWith("a_") ? ".gif" : ".png";
                      const url = `https://cdn.discordapp.com/banners/${member.id}/${banner}${extension}?size=2048`;

                      const button = new ActionRowBuilder().addComponents(
                          new ButtonBuilder()
                              .setStyle(5)
                              .setLabel("<:open:1527980630720385065> تحميل البانر")
                              .setURL(url)
                      );

                      const embed = new EmbedBuilder()
                          .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                          .setTitle(" بانر المستخدم")
                          .setURL(url)
                          .setImage(url)
                          .setFooter({ text: `طلب بواسطة: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

                      message.reply({ embeds: [embed], components: [button] });

                  } else if (accent_color) {
                      // المستخدم لا يملك بانر، لكن لديه لون مخصص
                      const url = `https://serux.pro/rendercolour?hex=${accent_color}&height=200&width=512`;

                      const embed = new EmbedBuilder()
                          .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                          .setTitle("🎨 لون الحساب")
                          .setURL(url)
                          .setImage(url)
                          .setColor(accent_color)
                          .setFooter({ text: `طلب بواسطة: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

                      message.reply({ embeds: [embed] });

                  } else {
                      // المستخدم لا يملك بانر أو لون مخصص
                      message.reply({ content: "<:cross:1527933924594946068> **هذا المستخدم لا يملك بانر أو لون مخصص!**" });
                  }
              });
          }).on('error', (error) => {
              console.error("🔴 | حدث خطأ أثناء تنفيذ أمر /banner", error);
              message.reply({ content: "<:cross:1527933924594946068> **حدث خطأ! حاول مرة أخرى لاحقًا.**" });
          });

      } catch (error) {
          console.error("🔴 | حدث خطأ أثناء تنفيذ أمر /banner", error);
          message.reply({ content: "<:cross:1527933924594946068> **حدث خطأ! حاول مرة أخرى لاحقًا.**" });
      }
  }
});



client27.on('messageCreate', async message => {
      if (!message.guild) return;
if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر nickname
  const nicknameCmd = shortcutDB.get(`nickname_cmd_${message.guild.id}`) || `${prefix}nickname`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (commandMatches(message.content, nicknameCmd)) {
      const targetUser = message.mentions.users.first() || message.author; // إذا لم يتم تحديد شخص، يكون المستخدم نفسه
      const targetMember = message.guild.members.cache.get(targetUser.id);
      const nickname = message.content.split(' ').slice(2).join(' '); // استخراج الاسم المستعار من الرسالة

      // التحقق مما إذا كان المستخدم يحاول تغيير لقبه أم لقب شخص آخر
      const isSelf = targetUser.id === message.author.id;
      const hasManageNicknames = message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames);

      // السماح بتغيير اللقب فقط إذا كان المستخدم يحاول تغيير اسمه، أو كان لديه صلاحية "إدارة الألقاب"
      if (!isSelf && !hasManageNicknames) {
          return message.reply({ content: `<:trianglewarning:1527931329331728414> **لا يمكنك تغيير ألقاب الآخرين!**` });
      }

      // منع تغيير اسم مالك السيرفر
      if (targetUser.id === message.guild.ownerId) {
          return message.reply({ content: `<:trianglewarning:1527931329331728414> **لا يمكنك تغيير لقب مالك السيرفر!**` });
      }

      // التحقق من أن البوت لديه الصلاحية
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
          return message.reply({ content: `<:cross:1527933924594946068> **ليس لدي صلاحية "إدارة الألقاب"!**` });
      }

      // منع تغيير لقب شخص بنفس رتبة البوت أو أعلى
      if (targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
          return message.reply({ content: `<:trianglewarning:1527931329331728414> **لا يمكنني تغيير لقب شخص بنفس رتبتي أو أعلى!**` });
      }

      // تغيير اللقب أو إزالته
      try {
          await targetMember.setNickname(nickname || null).then(() => {
              const embed = new EmbedBuilder()
                  .setColor(nickname ? "#00FF00" : "#FF0000")
                  .setDescription(nickname
                      ? `<:check:1527933632591691846> **تم تغيير اسم المستعار لـ __${targetUser.username}__ إلى:** \`${nickname}\``
                      : `<:check:1527933632591691846> **تمت إعادة ضبط اسم المستعار لـ __${targetUser.username}__ إلى الافتراضي!**`);

              return message.reply({ embeds: [embed] });
          });
      } catch (error) {
          console.error(error);
          return message.reply({ content: `<:cross:1527933924594946068> **حدث خطأ أثناء تغيير الاسم المستعار. تحقق من صلاحياتي!**` });
      }
  }
});

//------------- اختصار ساي   --------------//



client27.on('messageCreate', async message => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
    if (commandMatches(message.content, `${prefix}say`) || commandMatches(message.content, cmd)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const activeSayCommand = commandMatches(message.content, `${prefix}say`) ? `${prefix}say` : cmd;
        const content = message.content.slice(activeSayCommand.length).trim();
        if (!content) {
            message.channel.send("<:bulb:1534180772473470976>**من فضلك اكتب شيئا بعد الأمر.**");
            return;
        }
        let image = null;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }

        await message.delete();

        await message.channel.send({ 
            content: content, 
            files: image ? [image] : [] 
        });
    }
});
//------------- اختصار حذف رسائل    --------------//

client27.on('messageCreate', async message => {
      if (!message.guild) return;
if (message.author.bot) return;

  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
  if (!commandMatches(message.content, `${prefix}clear`) && !commandMatches(message.content, cmd)) return;

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply(`<:cross:1527933924594946068> **ليس لديك صلاحية لحذف الرسائل!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  const args = message.content.split(' ').slice(1);
  let amount = args[0] ? parseInt(args[0]) : 99;

  if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply(`<:trianglewarning:1527931329331728414> **يرجى تحديد عدد صحيح بين 1 و 100!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  try {
      const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
      const messagesToDelete = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

      const deletedMessages = await message.channel.bulkDelete(messagesToDelete, true);

      const confirmationMsg = await message.channel.send(`<:check:1527933632591691846> **تم حذف \`${deletedMessages.size}\` رسالة بنجاح!** `);
      setTimeout(() => confirmationMsg.delete().catch(() => {}), 7000);

  } catch (error) {
      console.error(error);
      return message.reply(`<:cross:1527933924594946068> **حدث خطأ أثناء حذف الرسائل!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }
});

//------------- اختصار ضريبه بروبوت    --------------//

client27.on('messageCreate', async message => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null; 
    if (commandMatches(message.content, `${prefix}tax`) || commandMatches(message.content, cmd)) {
        const args = commandMatches(message.content, `${prefix}tax`)
            ? message.content.slice(`${prefix}tax`.length).trim()
            : message.content.slice(typeof cmd === 'string' ? cmd.length : 0).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (!Number.isFinite(number2) || number2 <= 0) {
            return message.reply('يرجى إدخال رقم صحيح وموجب بعد الأمر');
        }

        let tax = Math.floor(number2 * 20 / 19 + 1); // الضريبة
        let tax2 = Math.floor(tax - number2); // المبلغ مع الضريبة

        await message.reply(`${tax}`);
    }
}); 
//------------- اختصار فك بان     --------------//


client27.on('messageCreate', async message => {
        if (!message.guild) return;
if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر unban
    const unbanCmd = shortcutDB.get(`unban_cmd_${message.guild.id}`) || `${prefix}unban`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (commandMatches(message.content, unbanCmd)) {
        // التحقق إذا كان المستخدم لديه صلاحية إلغاء الحظر
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("<:trianglewarning:1527931329331728414> **ليس لديك صلاحية لاستخدام هذا الاختصار!**");
        }

        // جلب العضو الذي يريد إلغاء الحظر باستخدام معرفه
        const userId = message.content.split(' ')[1]; // يفترض أن المستخدم يكتب المعرف بعد الاختصار
        if (!userId) {
            return message.reply("<:trianglewarning:1527931329331728414> **يجب عليك تحديد معرف العضو الذي تريد إلغاء حظره!**");
        }

        try {
            // إلغاء الحظر
            await message.guild.members.unban(userId);
            message.reply(`<:check:1527933632591691846> **تم إلغاء حظر العضو بنجاح!** `);
        } catch (error) {
            console.error(error);
            message.reply("<:cross:1527933924594946068> **حدث خطأ أثناء محاولة إلغاء الحظر. تأكد أن العضو محظور بالفعل.**");
        }
    }
});

//------------- اختصار امر كمي    --------------//


client27.on('messageCreate', async message => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (commandMatches(message.content, `${prefix}come`) || commandMatches(message.content, cmd)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("<:trianglewarning:1527931329331728414> **يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).**");
        }
        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);
        if (!targetMember) {
            return message.reply("<:trianglewarning:1527931329331728414> **من فضلك قم بعمل منشن لشخص أو ضع الإيدي.**");
        }
        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;
        try {
            await targetMember.send(directMessageContent);
            await message.reply("<:check:1527933632591691846> **تم الارسال للشخص بنجاح**");
        } catch (error) {
            await message.reply("<:cross:1527933924594946068> **لم استطع الارسال للشخص**");
        }
    }
});
//-------------  اختصار امر غلق روم وفتحها    --------------//

client27.on("messageCreate", async (message) => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}lock` || commandMatches(message.content, cmd)) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("<:trianglewarning:1527931329331728414> **لا تمتلك صلاحية لفعل ذلك**");
            }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      
      return message.reply("<:check:1527933632591691846> **${message.channel} has been locked**");
    } catch (error) {
      message.reply("<:cross:1527933924594946068> **لقد حدث خطأ، اتصل بالمطورين.**");
      console.log(error);
    }
  }
});

client27.on("messageCreate", async (message) => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || commandMatches(message.content, cmd)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("<:trianglewarning:1527931329331728414> **لا تمتلك صلاحية لفعل ذلك**");
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply("<:check:1527933632591691846> **${message.channel} has been unlocked**");
  }
});
 
//------------- اختصار اخفاء روم او اظهارها    --------------//

client27.on("messageCreate", async (message) => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || commandMatches(message.content, cmd)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("<:trianglewarning:1527931329331728414> **لا تمتلك صلاحية لفعل ذلك**");
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply("<:check:1527933632591691846> **${message.channel} تم اخفاؤه بنجاح**");
  }
});

client27.on("messageCreate", async (message) => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unhide` || commandMatches(message.content, cmd)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("<:trianglewarning:1527931329331728414> **لا تمتلك صلاحية لفعل ذلك**");
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply("<:check:1527933632591691846> **${message.channel} تم اظهاره بنجاح**");
  }
});
//------------- اختصار معلومات عن سيرفر     --------------//

client27.on("messageCreate", async (message) => {
    if (!message.guild) return;
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || commandMatches(message.content, cmd)) {
    const embedser = new EmbedBuilder()
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setColor('Random')
      .addFields(
        {
          name: `**🆔 Server ID:**`, 
          value: message.guild.id, 
          inline: false
        },
        {
          name: `**📆 Created On:**`, 
          value: `**<t:${parseInt(message.guild.createdTimestamp / 1000)}:R>**`, 
          inline: false
        },
        {
          name: `**👑 Owned By:**`, 
          value: `**<@${message.guild.ownerId}>**`, 
          inline: false
        },
        {
          name: `**👥 Members (${message.guild.memberCount})**`, 
          value: `**${message.guild.premiumSubscriptionCount} Boosts ✨**`, 
          inline: false
        },
        {
          name: `**💬 Channels (${message.guild.channels.cache.size})**`, 
          value: `**${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildText).size}** Text | **${
              message.guild.channels.cache.filter(r => r.type === ChannelType.GuildVoice).size
            }** Voice | **${message.guild.channels.cache.filter(r => r.type === ChannelType.GuildCategory).size}** Category`,
          inline: false
        },
        {
          name: '🌍 Others',
          value: `**Verification Level:** ${message.guild.verificationLevel}`,
          inline: false
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }));
    return message.reply({ embeds: [embedser] });
  }
});


  // بداية الحماية من البوتات
client27.on("guildMemberAdd" , async(member) => {
  if(protectDB.has(`antibots_status_${member.guild.id}`)) {
    let antibotsstatus = protectDB.get(`antibots_status_${member.guild.id}`)
    if(antibotsstatus == "on") {
      if(member.user.bot) {
        try {
          const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
          if(logRoom){
            const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
            theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `نظام الحماية من البوتات`} , {name : `العقاب :` , value : `طرد البوت`})]})
          }
          member.kick()
        } catch(err){
          return console.log('error' , err);
        }
      }
    }
  }
})
// نهاية الحماية من البوتات

//-

// بداية الحماية من حذف الرومات

/**
 * مراقبة حدود أنظمة الحماية وإعادة ضبط العدادات يوميًا.
 * تعمل على جميع السيرفرات بدل الاعتماد على أول سيرفر فقط.
 */
async function processProtectionResetType(guild, statusKey, usersKey, limitKey) {
    try {
        const guildid = guild.id;
        const status = protectDB.get(`${statusKey}_${guildid}`);
        if (!status || status === 'off') return;

        const users = protectDB.get(`${usersKey}_${guildid}`) || [];
        if (!Array.isArray(users) || users.length === 0) return;

        const now = moment();
        const nextDay = now.clone().add(1, 'day').format('YYYY-MM-DD');
        let changed = false;

        for (const user of users) {
            if (!user?.userid) continue;

            if (user.newReset && (now.isSame(user.newReset, 'day') || now.isAfter(user.newReset, 'day'))) {
                user.limit = 0;
                user.newReset = nextDay;
                changed = true;
            }
        }

        if (changed) {
            await protectDB.set(`${usersKey}_${guildid}`, users);
        }

        const limitValue = Number(protectDB.get(`${limitKey}_${guildid}`));
        if (!Number.isFinite(limitValue)) return;

        for (const user of users) {
            if (!user?.userid || Number(user.limit) <= limitValue) continue;

            const member = guild.members.cache.get(user.userid) ||
                await guild.members.fetch(user.userid).catch(() => null);

            if (!member || !member.kickable) continue;

            await member.kick().catch(() => {});
        }
    } catch (error) {
        console.error(`[PROTECT] Reset monitor error in ${guild.id}:`, error);
    }
}

let protectionMonitorStarted = false;

client27.once('ready', () => {
    if (protectionMonitorStarted) return;
    protectionMonitorStarted = true;

    const runProtectionMonitors = async () => {
        for (const guild of client27.guilds.cache.values()) {
            await processProtectionResetType(guild, 'antideleterooms_status', 'roomsdelete_users', 'antideleterooms_limit');
            await processProtectionResetType(guild, 'antideleteroles_status', 'rolesdelete_users', 'antideleteroles_limit');
            await processProtectionResetType(guild, 'ban_status', 'ban_users', 'ban_limit');
        }
    };

    runProtectionMonitors().catch(console.error);
    setInterval(() => runProtectionMonitors().catch(console.error), 60 * 1000);
});

client27.on('channelDelete' , async(channel) => {
  if (!channel?.guild) return;
  let guildid = channel.guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const executor = channelDeleteLog?.executor;
  if (!executor?.id || executor.id === client27.user?.id) return;
  const users = protectDB.get(`roomsdelete_users_${guildid}`) || []
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`roomsdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`roomsdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`antideleterooms_limit_${guildid}`)
  if(Number.isFinite(Number(deletelimit)) && newexecutorlimit > Number(deletelimit)) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حذف رومات`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`roomsdelete_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`roomsdelete_users_${guildid}` , users)
  }
})
// نهاية الحماية من حذف الرومات

//-

// بداية الحماية من حذف الرتب
client27.on('roleDelete' , async(role) => {
  if (!role?.guild) return;
  let guildid = role.guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const executor = channelDeleteLog?.executor;
  if (!executor?.id || executor.id === client27.user?.id) return;
  const users = protectDB.get(`rolesdelete_users_${guildid}`) || []
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`rolesdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`rolesdelete_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`antideleteroles_limit_${guildid}`)
  if(Number.isFinite(Number(deletelimit)) && newexecutorlimit > Number(deletelimit)) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حذف رتب`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`rolesdelete_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`rolesdelete_users_${guildid}` , users)
  }
})

// نهاية الحماية من حذف الرتب

//-

// بداية الحماية من البان
client27.on('guildBanAdd', async (ban) => {
  if (!ban?.guild) return;

  const guildid = ban.guild.id;
  const status = protectDB.get(`ban_status_${guildid}`);
  if (!status || status === "off") return;

  try {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 5,
      type: AuditLogEvent.MemberBanAdd
    });

    const auditEntry = fetchedLogs.entries.find(
      entry => entry.target?.id === ban.user?.id
    ) || fetchedLogs.entries.first();

    const executor = auditEntry?.executor;
    if (!executor?.id) return;
    if (executor.id === client27.user?.id) return;

    const users = protectDB.get(`ban_users_${guildid}`) || [];
    const endTime = moment().add(1, 'day').format('YYYY-MM-DD');

    const existing = users.find(user => user.userid === executor.id);

    if (!existing) {
      await protectDB.push(
        `ban_users_${guildid}`,
        { userid: executor.id, limit: 1, newReset: endTime }
      );
      return;
    }

    existing.limit = Number(existing.limit) + 1;
    existing.newReset = endTime;

    const limit = Number(protectDB.get(`ban_limit_${guildid}`));
    await protectDB.set(`ban_users_${guildid}`, users);

    if (!Number.isFinite(limit) || existing.limit <= limit) return;

    const executorMember = await ban.guild.members.fetch(executor.id).catch(() => null);
    if (!executorMember || !executorMember.kickable) return;

    const logRoom = protectDB.get(`protectLog_room_${guildid}`);
    const logChannel = logRoom ? ban.guild.channels.cache.get(logRoom) : null;

    if (logChannel?.isTextBased?.()) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('نظام الحماية')
            .addFields(
              { name: 'العضو :', value: `${executor.username ?? executor.tag ?? 'Unknown'} \`${executor.id}\`` },
              { name: 'السبب :', value: 'حظر اعضاء' },
              { name: 'العقاب :', value: 'طرد العضو' }
            )
        ]
      }).catch(() => {});
    }

    await executorMember.kick().catch(() => {});
    await protectDB.set(
      `ban_users_${guildid}`,
      users.filter(entry => entry.userid !== executor.id)
    );
  } catch (error) {
    console.error('[PROTECT] guildBanAdd error:', error);
  }
});

// نهاية الحماية من البان

// --- SHOPPING WORLD ADVANCED LOGS ---
// 1. حذف الرسائل

/* =========================================================
 * 7. BAN ADD
 * ========================================================= */
client27.on('guildBanAdd', async (ban) => {
    try {
        if (!ban?.guild) return;

        const logChannel = getLogChannel(ban.guild, 'log_banadd');
        if (!logChannel) return;

        const entry = await getRecentAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanAdd,
            ban.user?.id
        );

        await sendLogEmbed(
            ban.guild,
            logChannel,
            'تم حظر عضو',
            [
                {
                    name: 'العضو:',
                    value: `\`\`\`${cleanLogText(ban.user?.tag || ban.user?.username || ban.user?.id || 'Unknown')}\`\`\``,
                    inline: true
                },
                {
                    name: 'ID:',
                    value: `\`${ban.user?.id || 'Unknown'}\``,
                    inline: true
                },
                {
                    name: 'بواسطة:',
                    value: `\`\`\`${cleanLogText(entry?.executor?.tag || 'غير معروف')}\`\`\``,
                    inline: true
                },
                {
                    name: 'السبب:',
                    value: `\`\`\`${cleanLogText(entry?.reason || 'غير محدد')}\`\`\``,
                    inline: false
                }
            ]
        );
    } catch (err) {
        console.error('[LOGS] guildBanAdd error:', err);
    }
});


/* =========================================================
 * 8. KICK
 * ========================================================= */
client27.on('guildMemberRemove', async (member) => {
    try {
        if (!member?.guild) return;

        const logChannel = getLogChannel(member.guild, 'log_kickadd');
        if (!logChannel) return;

        const entry = await getRecentAuditEntry(
            member.guild,
            AuditLogEvent.MemberKick,
            member.id
        );

        // إذا لم يوجد Audit Log مطابق، غالبًا كان خروجًا طبيعيًا.
        if (!entry?.executor) return;

        await sendLogEmbed(
            member.guild,
            logChannel,
            'تم طرد عضو',
            [
                {
                    name: 'العضو:',
                    value: `\`\`\`${cleanLogText(member.user?.tag || member.user?.username || member.id)}\`\`\``,
                    inline: true
                },
                {
                    name: 'ID:',
                    value: `\`${member.id}\``,
                    inline: true
                },
                {
                    name: 'بواسطة:',
                    value: `\`\`\`${cleanLogText(entry.executor.tag || entry.executor.username || entry.executor.id)}\`\`\``,
                    inline: true
                },
                {
                    name: 'السبب:',
                    value: `\`\`\`${cleanLogText(entry.reason || 'غير محدد')}\`\`\``,
                    inline: false
                }
            ]
        );
    } catch (err) {
        console.error('[LOGS] guildMemberRemove/kick log error:', err);
    }
});


/* =========================================================
 * 9. UNBAN
 * ========================================================= */
client27.on('guildBanRemove', async (ban) => {
    try {
        if (!ban?.guild) return;

        const logChannel = getLogChannel(ban.guild, 'log_unban');
        if (!logChannel) return;

        const entry = await getRecentAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanRemove,
            ban.user?.id
        );

        await sendLogEmbed(
            ban.guild,
            logChannel,
            'تم إلغاء حظر عضو',
            [
                {
                    name: 'العضو:',
                    value: `\`\`\`${cleanLogText(ban.user?.tag || ban.user?.username || ban.user?.id || 'Unknown')}\`\`\``,
                    inline: true
                },
                {
                    name: 'ID:',
                    value: `\`${ban.user?.id || 'Unknown'}\``,
                    inline: true
                },
                {
                    name: 'بواسطة:',
                    value: `\`\`\`${cleanLogText(entry?.executor?.tag || 'غير معروف')}\`\`\``,
                    inline: true
                }
            ]
        );
    } catch (err) {
        console.error('[LOGS] guildBanRemove error:', err);
    }
});


/* =========================================================
 * 10. NICKNAME UPDATE
 * ========================================================= */
client27.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        if (!newMember?.guild) return;
        if ((oldMember.nickname ?? null) === (newMember.nickname ?? null)) return;

        const logChannel = getLogChannel(newMember.guild, 'log_nickname');
        if (!logChannel) return;

        const entry = await getRecentAuditEntry(
            newMember.guild,
            AuditLogEvent.MemberUpdate,
            newMember.id
        );

        await sendLogEmbed(
            newMember.guild,
            logChannel,
            'تم تغيير اسم عضو',
            [
                {
                    name: 'العضو:',
                    value: `\`\`\`${cleanLogText(newMember.user?.tag || newMember.user?.username || newMember.id)}\`\`\``,
                    inline: true
                },
                {
                    name: 'القديم:',
                    value: `\`\`\`${cleanLogText(oldMember.nickname || 'بدون اسم مستعار')}\`\`\``,
                    inline: true
                },
                {
                    name: 'الجديد:',
                    value: `\`\`\`${cleanLogText(newMember.nickname || 'بدون اسم مستعار')}\`\`\``,
                    inline: true
                },
                {
                    name: 'بواسطة:',
                    value: `\`\`\`${cleanLogText(entry?.executor?.tag || 'غير معروف')}\`\`\``,
                    inline: false
                }
            ]
        );
    } catch (err) {
        console.error('[LOGS] guildMemberUpdate/nickname error:', err);
    }
});


/* =========================================================
 * 11. CHANNEL UPDATE
 * ========================================================= */
client27.on('channelUpdate', async (oldChannel, newChannel) => {
    try {
        if (!newChannel?.guild) return;

        const changes = [];
        if (oldChannel.name !== newChannel.name) {
            changes.push({
                name: 'الاسم القديم:',
                value: `\`\`\`${cleanLogText(oldChannel.name || 'Unknown')}\`\`\``,
                inline: true
            });
            changes.push({
                name: 'الاسم الجديد:',
                value: `\`\`\`${cleanLogText(newChannel.name || 'Unknown')}\`\`\``,
                inline: true
            });
        }

        if (oldChannel.parentId !== newChannel.parentId) {
            changes.push({
                name: 'القسم القديم:',
                value: oldChannel.parentId ? `<#${oldChannel.parentId}>` : 'بدون قسم',
                inline: true
            });
            changes.push({
                name: 'القسم الجديد:',
                value: newChannel.parentId ? `<#${newChannel.parentId}>` : 'بدون قسم',
                inline: true
            });
        }

        if (changes.length === 0) return;

        const logChannel = getLogChannel(newChannel.guild, 'log_channelupdate');
        if (!logChannel) return;

        const entry = await getRecentAuditEntry(
            newChannel.guild,
            AuditLogEvent.ChannelUpdate,
            newChannel.id
        );

        changes.push({
            name: 'بواسطة:',
            value: `\`\`\`${cleanLogText(entry?.executor?.tag || 'غير معروف')}\`\`\``,
            inline: false
        });

        await sendLogEmbed(
            newChannel.guild,
            logChannel,
            'تم تعديل قناة',
            changes
        );
    } catch (err) {
        console.error('[LOGS] channelUpdate error:', err);
    }
});


/* =========================================================
 * 12. MEMBER ADD
 * ========================================================= */
client27.on('guildMemberAdd', async (member) => {
    try {
        if (!member?.guild) return;

        const logChannel = getLogChannel(member.guild, 'log_memberadd');
        if (!logChannel) return;

        const entry = member.user?.bot
            ? await getRecentAuditEntry(
                member.guild,
                AuditLogEvent.BotAdd,
                member.id
            )
            : null;

        await sendLogEmbed(
            member.guild,
            logChannel,
            'انضمام عضو',
            [
                {
                    name: 'العضو:',
                    value: `\`\`\`${cleanLogText(member.user?.tag || member.user?.username || member.id)}\`\`\``,
                    inline: true
                },
                {
                    name: 'ID:',
                    value: `\`${member.id}\``,
                    inline: true
                },
                {
                    name: 'بواسطة:',
                    value: `\`\`\`${cleanLogText(entry?.executor?.tag || 'انضمام طبيعي / غير معروف')}\`\`\``,
                    inline: true
                }
            ]
        );
    } catch (err) {
        console.error('[LOGS] guildMemberAdd/memberadd log error:', err);
    }
});


// --- END OF LOGS ---

const invites = Object.create(null);

client27.once('ready', async () => {
    for (const guild of client27.guilds.cache.values()) {
        try {
            const fetched = await guild.invites.fetch();
            invites[guild.id] = new Map(
                fetched.map(invite => [invite.code, invite.uses ?? 0])
            );
        } catch (error) {
            console.warn(`[INVITES] Could not initialize invites for ${guild.id}:`, error?.message || error);
            invites[guild.id] = new Map();
        }
    }
});

client27.on('inviteCreate', async invite => {
    if (!invites[invite.guild.id]) {
        invites[invite.guild.id] = new Map();
    }
    invites[invite.guild.id].set(invite.code, invite.uses);
});

client27.on('inviteDelete', async invite => {
    if (invites[invite.guild.id]) {
        invites[invite.guild.id].delete(invite.code);
    }
});

client27.on('guildMemberAdd', async member => {
    try {
        const welcomeChannelId = await systemDB.get(`welcome_channel_${member.guild.id}`);
        const welcomeRoleId = await systemDB.get(`welcome_role_${member.guild.id}`);
        const welcomeImage = await systemDB.get(`welcome_image_${member.guild.id}`);

        if (welcomeRoleId) {
            const role = member.guild.roles.cache.get(welcomeRoleId);
            if (role) {
                await member.roles.add(role);
            }
        }

        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invites[member.guild.id] || new Map();

        const usedInvite = newInvites.find(inv => {
            const prevUses = oldInvites.get(inv.code) || 0;
            return inv.uses > prevUses;
        });

        let inviterMention = 'Unknown';
        if (usedInvite && usedInvite.inviter) {
            inviterMention = `<@${usedInvite.inviter.id}>`;
        }

        const fullUser = await client27.users.fetch(member.user.id, { force: true });

        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
            .setColor('#787575')
            .setTitle('Welcome to the Server!')
            .setDescription(`Hello ${member}, welcome to **${member.guild.name}**! Enjoy your stay.`)
            .addFields(
                { name: 'Username', value: member.user.tag, inline: true },
                { name: 'Invited By', value: inviterMention, inline: true },
                { name: 'Invite Used', value: usedInvite ? `||${usedInvite.code}||` : 'Direct Join', inline: true },
                { name: 'You\'re Member', value: `${member.guild.memberCount}`, inline: true }
            )
            .setThumbnail(fullUser?.displayAvatarURL?.() || member.user.displayAvatarURL())
            .setTimestamp();
        
        if (welcomeImage) {
            welcomeEmbed.setImage(welcomeImage);
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (welcomeChannel) {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }

        invites[member.guild.id] = new Map(newInvites.map(invite => [invite.code, invite.uses]));
    } catch (error) {
        console.error('Error handling guildMemberAdd event:', error);
    }
});


client27.on("guildMemberAdd" , async(member) => {
  const theeGuild = member.guild
  let rooms = nadekoDB.get(`rooms_${theeGuild.id}`)
  const message = nadekoDB.get(`message_${theeGuild.id}`)
  if(!rooms) return;
  if(rooms.length <= 0) return;
  if(!message) return;
  for (const room of rooms) {
    const theRoom = theeGuild.channels.cache.get(room);
    if (!theRoom || typeof theRoom.send !== 'function') continue;

    const sent = await theRoom.send({ content: `${member} - ${message}` }).catch(() => null);
    if (sent) {
      setTimeout(() => {
        sent.delete().catch(() => {});
      }, 3000);
    }
  }
})

client27.on("messageCreate" ,  async(message) => {
        if (!message.guild) return;
if(message.author.bot) return;
    const autoReplys = one4allDB.get(`replys_${message.guild.id}`);
    if(!autoReplys) return;
    const data = autoReplys.find((r) => r.word == message.content);
    if(!data) return;
    message.reply(`${data.reply}`)
  })



client27.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== "help_menu") return;
    if (!interaction.inGuild() || !interaction.guild) return;

    const categories = getHelpCategories(prefix);
    const selected = categories.find(cat => cat.id === interaction.values[0]);
    if (!selected) return;

    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTitle(selected.title)
        .setDescription(selected.embedDescription)
        .addFields(selected.fields)
        .setTimestamp()
        .setFooter({ text: `Requested By ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setColor('#2b2d31');

    const menu = new StringSelectMenuBuilder()
        .setCustomId('help_menu')
        .setPlaceholder('<:folder:1534178691448438877> اختر قسم لعرض أوامره')
        .addOptions(
            categories.map(cat => new StringSelectMenuOptionBuilder()
                .setLabel(cat.label)
                .setValue(cat.id)
                .setEmoji(cat.emoji)
                .setDescription(cat.selectDescription)
                .setDefault(cat.id === selected.id)
            )
        );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.update({ embeds: [embed], components: [row] });
});

  //-------------------------- جميع الاكواد هنا ----------------------//

  client27.login(token);