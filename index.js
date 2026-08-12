const { Client, Collection, discord,GatewayIntentBits, ChannelType, AuditLogEvent , Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const ms = require('ms')
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
const ticketDB = new Database("/Json-db/Bots/ticketDB.json")
const afkDB = new Database("/Json-db/Bots/afkDB.json");

const path = require('path');
const { readdirSync } = require("fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { token, clientId, owner, prefix } = require('./config.js');
const getHelpCategories = require('./helpCategories');
theowner = owner;

const client27 = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] , shards: "auto", partials: [Partials.Message, Partials.Channel, Partials.GuildMember,]});
client27.commands = new Collection();
require(`./handlers/events`)(client27);
client27.events = new Collection();
const rest = new REST({ version: '10' }).setToken(token);
client27.setMaxListeners(1000)

client27.on("ready" , async() => {
    try {
        await rest.put(
            Routes.applicationCommands(client27.user.id),
            { body: one4allSlashCommands },
        );
    } catch (error) {
        console.error(error)
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
require(`./handlers/events`)(client27)
require("./handlers/suggest")(client27)
require('./handlers/tax4bot')(client27)
require("./handlers/autorole")(client27)
require(`./handlers/events`)(client27);
require(`./handlers/claim`)(client27);
require(`./handlers/close`)(client27);
require(`./handlers/create`)(client27);
require(`./handlers/reset`)(client27);
require(`./handlers/support-panel`)(client27);
require('./handlers/joinGiveaway')(client27)
require(`./handlers/events`)(client27)
require(`./handlers/applyCreate`)(client27)
require(`./handlers/applyResult`)(client27)
require(`./handlers/applySubmit`)(client27)
require(`./handlers/events`)(client27)
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
    if (message.author.bot) return;

    const userId = message.author.id;
    const guild = message.guild;

    if (afkDB.has(userId)) {
        afkDB.delete(userId);
        message.reply(`✅ **مرحبًا بعودتك ${message.author}, تم إلغاء وضع AFK!**`);
    }

    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach(member => {
            if (afkDB.has(member.id)) {
                const reason = afkDB.get(member.id).reason;
                const mentionEmbed = new EmbedBuilder()
                    .setColor("#000000")
                    .setTitle("🚧 هذا العضو في وضع AFK")
                    .setDescription(`**السبب:** ${reason}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }));

                message.reply({ embeds: [mentionEmbed] });
            }
        });
    }

    if (message.content.toLowerCase().startsWith(".afk")) {
        const args = message.content.split(" ").slice(1);
        const reason = args.join(" ") || "غير محدد";

        afkDB.set(userId, { reason: reason, timestamp: Date.now() });

        const afkEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setTitle("☕ تم تفعيل وضع AFK")
            .setDescription(`**السبب:** ${reason}`)
            .setThumbnail(guild.iconURL({ dynamic: true }));

        message.reply({ embeds: [afkEmbed] });
    }
});

client27.on("messageCreate" , async(message) => {
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
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: `❗ ***يجب أن تمتلك صلاحية الأدمن لاستخدام هذا الأمر***`, ephemeral: true });
            }
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            return console.log("🔴 | error in one4all bot" , error)
        }
    }
})

//------------- نظام الـ Giveaway --------------//
client27.on("ready" , async() => {
    let theguild = client27.guilds.cache.first();
    setInterval(() => {
        if(!theguild) return;
        let giveaways = giveawayDB.get(`giveaways_${theguild.id}`)
        if(!giveaways) return;
        giveaways.forEach(async(giveaway) => {
            let {messageid , channelid , entries , winners , prize , duration,dir1,dir2,ended} = giveaway;
            if(duration > 0) {
                duration = duration - 1
                giveaway.duration = duration;
                await giveawayDB.set(`giveaways_${theguild.id}` , giveaways)
            } else if(duration == 0) {
                duration = duration - 1
                giveaway.duration = duration;
                await giveawayDB.set(`giveaways_${theguild.id}` , giveaways)
                const theroom = theguild.channels.cache.find(ch => ch.id == channelid)
                await theroom.messages.fetch(messageid)
                const themsg = await theroom.messages.cache.find(msg => msg.id == messageid)
                if(entries.length > 0 && entries.length >= winners) {
                    const theWinners = [];
                    for(let i = 0; i < winners; i++) {
                        let winner = Math.floor(Math.random() * entries.length);
                        let winnerExcept = entries.splice(winner, 1)[0];
                        theWinners.push(winnerExcept);
                    }
                    const button = new ButtonBuilder()
                        .setEmoji(`🎉`)
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`join_giveaway`)
                        .setDisabled(true)
                    const row = new ActionRowBuilder().addComponents(button)
                    themsg.edit({components:[row]})
                    themsg.reply({content:`Congratulations ${theWinners}! You won the **${prize}**!`})
                    giveaway.ended = true;
                    await giveawayDB.set(`giveaways_${theguild.id}` , giveaways)
                } else {
                    const button = new ButtonBuilder()
                        .setEmoji(`🎉`)
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`join_giveaway`)
                        .setDisabled(true)
                    const row = new ActionRowBuilder().addComponents(button)
                    themsg.edit({components:[row]})
                    themsg.reply({content:`**لا يوجد عدد من المشتركين كافي**`})
                    giveaway.ended = true;
                    await giveawayDB.set(`giveaways_${theguild.id}` , giveaways)
                }
            }
        })
    }, 1000);
})

//------------- نظام الـ Tax --------------//
client27.on('messageCreate', async (message) => {
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

client27.on('messageCreate', async message => {
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

                    await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i => !i.user.bot && i.user.id !== designer.id;
                    const collector = message.channel.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

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
                            await interaction.message.delete();

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
  if (message.author.bot) return;

if (message.content.startsWith(`${prefix}obc`) || message.content.startsWith(`${prefix}bc`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ ليس لديك الصلاحيات اللازمة لاستخدام هذا الأمر.');
    }

    const args = message.content.split(' ').slice(1);
    const broadcastMsg = args.join(' ');
    if (!broadcastMsg) {
      return message.reply('يرجى كتابة رسالة بعد الأمر.');
    }

    await message.guild.members.fetch();
    let allMembers = message.guild.members.cache.filter(member => !member.user.bot);

    if (message.content.startsWith(`${prefix}obc`)) {
      allMembers = allMembers.filter(mem =>
        mem.presence?.status === 'online' ||
        mem.presence?.status === 'dnd' ||
        mem.presence?.status === 'idle' ||
        mem.presence?.activities.some(activity => activity.type === ActivityType.Streaming)
      );
    }

    allMembers = allMembers.map(mem => mem.user.id);

    const thetokens = db.get(`tokens_${message.guild.id}`) || [];
    const botsNum = thetokens.length;
    const membersPerBot = Math.floor(allMembers.length / botsNum);
    const submembers = [];
    for (let i = 0; i < allMembers.length; i += membersPerBot) {
      submembers.push(allMembers.slice(i, i + membersPerBot));
    }
    if (submembers.length > botsNum) {
      submembers.pop();
    }

    let donemembers = 0;
    let faildmembers = 0;

    const embed = new EmbedBuilder()
      .setTitle('📢 بدء إرسال البرودكاست')
      .setColor('Aqua')
      .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

    const msg = await message.channel.send({ embeds: [embed] });

    for (let i = 0; i < submembers.length; i++) {
      const token = thetokens[i];
      let clienter = new Client({ intents: 131071 });
      await clienter.login(token);

      submembers[i].forEach(async (sub) => {
        try {
          const user = await clienter.users.fetch(sub);
          await user.send(`${broadcastMsg}\n<@${sub}>`);
          donemembers++;

        } catch (error) {
          faildmembers++;
        }

        const progressEmbed = new EmbedBuilder()
          .setTitle('📢 تحديث حالة البرودكاست')
          .setColor('Aqua')
          .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

        await msg.edit({ embeds: [progressEmbed] });

        if (donemembers + faildmembers >= allMembers.length) {
          const finalEmbed = new EmbedBuilder()
            .setTitle('✅ تم الانتهاء من إرسال البرودكاست')
            .setColor('Green')
            .setDescription(`**⚫ عدد الأعضاء: \`${allMembers.length}\`\n🟢 تم الإرسال إلى: \`${donemembers}\`\n🔴 فشل الإرسال إلى: \`${faildmembers}\`**`);

          await msg.edit({ embeds: [finalEmbed] });
        }
      });
    }
  }
});

client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`rate_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
  if (message.content === `${prefix}تقييم` || message.content === `${cmd}`) {
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

                    await message.channel.send({ content: 'اختر عدد النجوم:', components: [st1] });

                    const buttonFilter = i => !i.user.bot && i.user.id !== stafer.id;
                    const collector = message.channel.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

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
                            await interaction.message.delete();

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

client27.on("messageCreate", async (message) => {
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
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (suggestionMode === 'buttons') {
      const button1 = new ButtonBuilder()
        .setCustomId(`ok_button`)
        .setLabel(`0`)
        .setEmoji("✔️")
        .setStyle(ButtonStyle.Success);
      const button2 = new ButtonBuilder()
        .setCustomId(`no_button`)
        .setLabel(`0`)
        .setEmoji("✖️")
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
      await send.react('✔️');
      await send.react('❌');

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

client27.on("messageCreate", async (message) => {
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
      .setTitle(`** > ${message.content} **`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    if (feedbackMode === 'embed') {
      await message.delete();
      const themsg = await message.channel.send({ content: `**<@${message.author.id}> شكرا لمشاركتنا رأيك :tulip:**`, embeds: [embed] });
      await themsg.react("❤");
      await themsg.react("❤️‍🔥");
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

client27.on('messageCreate', async message => {
    if (message.author.bot) return;
  if(message.content == `${prefix}close`) {
        const supportRoleID = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;

   /*     if (!message.member.roles.cache.has(supportRoleID)) {
            return message.reply({ content: ':x: You do not have permission to close this ticket.', ephemeral: true });
        }*/

        const ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);

        await message.channel.permissionOverwrites.edit(ticket.author, { ViewChannel: false });

        const embed2 = new EmbedBuilder()
            .setDescription(`تم اغلاق تذكرة بواسطة ${message.author}`)
            .setColor("Yellow");

        const embed = new EmbedBuilder()
            .setDescription("```لوحة فريق الدعم.```")
            .setColor("DarkButNotBlack");

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('Open').setLabel('Open').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('Tran').setLabel('Transcript').setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ embeds: [embed2, embed], components: [row] });

        const logsRoomId = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logsRoomId);

        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTitle('Close Ticket')
                .addFields(
                    { name: 'Name Ticket', value: `${message.channel.name}` },
                    { name: 'Owner Ticket', value: `${ticket.author}` },
                    { name: 'Closed By', value: `${message.author}` },
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

            logChannel.send({ embeds: [logEmbed] });
        }
    }
});


client27.on('messageCreate', async message => {
    const supportRoleId = ticketDB.get(`TICKET-PANEL_${message.channel.id}`)?.Support;
    if (message.author.bot) return;
  if(message.content == `${prefix}delete`) {
        if (!message.member.roles.cache.has(supportRoleId)) {
            message.reply({ content: ':x: Only Support', ephemeral: true });
            return;
        }

        if (!ticketDB.has(`TICKET-PANEL_${message.channel.id}`)) {
            message.reply({ content: 'This channel isn\'t a ticket', ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Ticket will be deleted in a few seconds');
        await message.reply({ embeds: [embed] });

        setTimeout(() => {
            message.channel.delete();
        }, 4500);

        const Logs = ticketDB.get(`LogsRoom_${message.guild.id}`);
        const Log = message.guild.channels.cache.get(Logs);
        const Ticket = ticketDB.get(`TICKET-PANEL_${message.channel.id}`);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTitle('Delete Ticket')
            .addFields(
                { name: 'Name Ticket', value: `${message.channel.name}` },
                { name: 'Owner Ticket', value: `${Ticket.author}` },
                { name: 'Deleted By', value: `${message.author}` },
            )
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

        Log?.send({ embeds: [logEmbed] });
        ticketDB.delete(`TICKET-PANEL_${message.channel.id}`);
    }
});

client27.on('messageCreate', async message => {
    if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر ban
    const banCmd = shortcutDB.get(`ban_cmd_${message.guild.id}`) || `${prefix}ban`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (message.content.startsWith(banCmd)) {
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
  if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر الطرد
  const kickCmd = shortcutDB.get(`kick_cmd_${message.guild.id}`) || `${prefix}kick`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (message.content.startsWith(kickCmd)) {
      // التحقق إذا كان المستخدم لديه صلاحية الطرد
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
          return message.reply("🚫 **ليس لديك صلاحية لاستخدام هذا الاختصار!**");
      }

      // استخراج الـ ID من الرسالة
      const userID = message.content.split(' ')[1]; // استخدام الرقم الذي يأتي بعد الاختصار

      // التحقق إذا تم توفير الـ ID
      if (!userID) {
          return message.reply("⚠️ **يجب عليك إدخال الـ ID الخاص بالشخص الذي تريد طرده!**");
      }

      // جلب العضو باستخدام الـ ID
      const member = await message.guild.members.fetch(userID).catch(err => {
          return message.reply("⚠️ **لم يتم العثور على هذا العضو! تأكد من صحة الـ ID.**");
      });

      // التحقق إذا كان العضو الذي يحاول طرده أعلى رتبة
      if (member.roles.highest.position >= message.member.roles.highest.position) {
          return message.reply("🚫 **لا يمكنك طرد شخص أعلى منك في الرتبة!**");
      }

      // تنفيذ أمر الطرد
      try {
          await member.kick('تم طرده بواسطة الاختصار');
          message.reply(`✅ **تم طرد ${member.user.tag} بنجاح!** 🚨`);
      } catch (error) {
          console.error(error);
          message.reply("❌ **حدث خطأ أثناء محاولة طرد العضو.**");
      }
  }
});



client27.on('messageCreate', async message => {
    if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر user
    const userCmd = shortcutDB.get(`user_cmd_${message.guild.id}`) || `${prefix}user`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (message.content.startsWith(userCmd)) {
        let user = message.mentions.users.first();

        // إذا لم يتم منشن أي شخص، استخدم صاحب الرسالة
        if (!user) {
            user = message.author;
        }

        // جلب العضو المتعلق بالمستخدم للحصول على 'joinedAt'
        const member = await message.guild.members.fetch(user.id);
        
        // تأكد من أن الـ user متاح
        if (!user || !member) {
            return message.reply("⚠️ **لم يتم العثور على المستخدم!**");
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
  if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر avatar
  const avatarCmd = shortcutDB.get(`avatar_cmd_${message.guild.id}`) || `${prefix}avatar`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (message.content.startsWith(avatarCmd)) {
    const args = message.content.slice(avatarCmd.length).trim().split(/ +/);

    // إذا كانت الكلمة التالية هي 'server'
    if (args[0] && args[0].toLowerCase() === 'server') {
      // عرض صورة أفاتار السيرفر
      const serverIcon = message.guild.iconURL({ dynamic: true, size: 1024 });
      
      if (!serverIcon) {
        return message.reply("⚠️ **لا يوجد أي أيقونة سيرفر!**");
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
  if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر banner
  const bannerCmd = shortcutDB.get(`banner_cmd_${message.guild.id}`) || `${prefix}banner`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (message.content.startsWith(bannerCmd)) {
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
                  const parsedData = JSON.parse(data);
                  const { banner, accent_color } = parsedData;

                  if (banner) {
                      // المستخدم لديه بانر
                      const extension = banner.startsWith("a_") ? ".gif" : ".png";
                      const url = `https://cdn.discordapp.com/banners/${member.id}/${banner}${extension}?size=2048`;

                      const button = new ActionRowBuilder().addComponents(
                          new ButtonBuilder()
                              .setStyle(5)
                              .setLabel("📥 تحميل البانر")
                              .setURL(url)
                      );

                      const embed = new EmbedBuilder()
                          .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                          .setTitle("📌 بانر المستخدم")
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
                      message.reply({ content: "❌ **هذا المستخدم لا يملك بانر أو لون مخصص!**" });
                  }
              });
          }).on('error', (error) => {
              console.error("🔴 | حدث خطأ أثناء تنفيذ أمر /banner", error);
              message.reply({ content: "❌ **حدث خطأ! حاول مرة أخرى لاحقًا.**" });
          });

      } catch (error) {
          console.error("🔴 | حدث خطأ أثناء تنفيذ أمر /banner", error);
          message.reply({ content: "❌ **حدث خطأ! حاول مرة أخرى لاحقًا.**" });
      }
  }
});



client27.on('messageCreate', async message => {
  if (message.author.bot) return;

  // جلب الاختصار المحفوظ لأمر nickname
  const nicknameCmd = shortcutDB.get(`nickname_cmd_${message.guild.id}`) || `${prefix}nickname`;

  // التحقق إذا كان المستخدم قد كتب الاختصار
  if (message.content.startsWith(nicknameCmd)) {
      const targetUser = message.mentions.users.first() || message.author; // إذا لم يتم تحديد شخص، يكون المستخدم نفسه
      const targetMember = message.guild.members.cache.get(targetUser.id);
      const nickname = message.content.split(' ').slice(2).join(' '); // استخراج الاسم المستعار من الرسالة

      // التحقق مما إذا كان المستخدم يحاول تغيير لقبه أم لقب شخص آخر
      const isSelf = targetUser.id === message.author.id;
      const hasManageNicknames = message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames);

      // السماح بتغيير اللقب فقط إذا كان المستخدم يحاول تغيير اسمه، أو كان لديه صلاحية "إدارة الألقاب"
      if (!isSelf && !hasManageNicknames) {
          return message.reply({ content: `🚫 **لا يمكنك تغيير ألقاب الآخرين!**` });
      }

      // منع تغيير اسم مالك السيرفر
      if (targetUser.id === message.guild.ownerId) {
          return message.reply({ content: `⚠️ **لا يمكنك تغيير لقب مالك السيرفر!**` });
      }

      // التحقق من أن البوت لديه الصلاحية
      if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
          return message.reply({ content: `❌ **ليس لدي صلاحية "إدارة الألقاب"!**` });
      }

      // منع تغيير لقب شخص بنفس رتبة البوت أو أعلى
      if (targetMember.roles.highest.position >= message.guild.members.me.roles.highest.position) {
          return message.reply({ content: `⚠️ **لا يمكنني تغيير لقب شخص بنفس رتبتي أو أعلى!**` });
      }

      // تغيير اللقب أو إزالته
      try {
          await targetMember.setNickname(nickname || null).then(() => {
              const embed = new EmbedBuilder()
                  .setColor(nickname ? "#00FF00" : "#FF0000")
                  .setDescription(nickname
                      ? `✅ **تم تغيير اسم المستعار لـ __${targetUser.username}__ إلى:** \`${nickname}\``
                      : `✅ **تمت إعادة ضبط اسم المستعار لـ __${targetUser.username}__ إلى الافتراضي!**`);

              return message.reply({ embeds: [embed] });
          });
      } catch (error) {
          console.error(error);
          return message.reply({ content: `❌ **حدث خطأ أثناء تغيير الاسم المستعار. تحقق من صلاحياتي!**` });
      }
  }
});




client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`say_cmd_${message.guild.id}`) || null;  
    if (message.author.bot) return;
    if (message.content.startsWith(`${prefix}say`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const content = message.content.slice(`${prefix}say`.length).trim();
        if (!content) {
            message.channel.send("من فضلك اكتب شيئا بعد الأمر.");
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

client27.on('messageCreate', async message => {
  if (message.author.bot) return;

  const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
  if (!message.content.startsWith(`${prefix}clear`) && (!cmd || !message.content.startsWith(`${cmd}`))) return;

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply(`🚫 **ليس لديك صلاحية لحذف الرسائل!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  const args = message.content.split(' ').slice(1);
  let amount = args[0] ? parseInt(args[0]) : 99;

  if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply(`⚠️ **يرجى تحديد عدد صحيح بين 1 و 100!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  try {
      const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
      const messagesToDelete = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);

      const deletedMessages = await message.channel.bulkDelete(messagesToDelete, true);

      const confirmationMsg = await message.channel.send(`✅ **تم حذف \`${deletedMessages.size}\` رسالة بنجاح!** 🧹`);
      setTimeout(() => confirmationMsg.delete().catch(() => {}), 7000);

  } catch (error) {
      console.error(error);
      return message.reply(`❌ **حدث خطأ أثناء حذف الرسائل!**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }
});


client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null; 
    if (message.content.startsWith(`${prefix}tax`) || message.content.startsWith(`${cmd}`)) {
        const args = message.content.startsWith(`${prefix}tax`) 
            ? message.content.slice(`${prefix}tax`.length).trim() 
            : message.content.slice(`${cmd}`.length).trim();

        let number = args;
        if (number.endsWith("k")) number = number.replace(/k/gi, "") * 1000;
        else if (number.endsWith("K")) number = number.replace(/K/gi, "") * 1000;
        else if (number.endsWith("m")) number = number.replace(/m/gi, "") * 1000000;
        else if (number.endsWith("M")) number = number.replace(/M/gi, "") * 1000000;

        let number2 = parseFloat(number);

        if (isNaN(number2)) {
            return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
        }

        let tax = Math.floor(number2 * (20) / (19) + 1); // الضريبة
        let tax2 = Math.floor(tax - number2); // المبلغ مع الضريبة

        await message.reply(`${tax}`);
    }
}); 


client27.on('messageCreate', async message => {
    if (message.author.bot) return;

    // جلب الاختصار المحفوظ لأمر unban
    const unbanCmd = shortcutDB.get(`unban_cmd_${message.guild.id}`) || `${prefix}unban`;

    // التحقق إذا كان المستخدم قد كتب الاختصار
    if (message.content.startsWith(unbanCmd)) {
        // التحقق إذا كان المستخدم لديه صلاحية إلغاء الحظر
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("🚫 **ليس لديك صلاحية لاستخدام هذا الاختصار!**");
        }

        // جلب العضو الذي يريد إلغاء الحظر باستخدام معرفه
        const userId = message.content.split(' ')[1]; // يفترض أن المستخدم يكتب المعرف بعد الاختصار
        if (!userId) {
            return message.reply("⚠️ **يجب عليك تحديد معرف العضو الذي تريد إلغاء حظره!**");
        }

        try {
            // إلغاء الحظر
            await message.guild.members.unban(userId);
            message.reply(`✅ **تم إلغاء حظر العضو بنجاح!** 🎉`);
        } catch (error) {
            console.error(error);
            message.reply("❌ **حدث خطأ أثناء محاولة إلغاء الحظر. تأكد أن العضو محظور بالفعل.**");
        }
    }
});

client27.on('messageCreate', async message => {
const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;  
    if (message.content.startsWith(`${prefix}come`) || message.content.startsWith(`${cmd}`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
        }
        const mentionOrID = message.content.split(/\s+/)[1];
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);
        if (!targetMember) {
            return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
        }
        const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;
        try {
            await targetMember.send(directMessageContent);
            await message.reply('**تم الارسال للشخص بنجاح**');
        } catch (error) {
            await message.reply('**لم استطع الارسال للشخص**');
        }
    }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}lock` || message.content === `${cmd}`) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
            }
      await message.channel.permissionOverwrites.edit(
        message.channel.guild.roles.everyone, 
        { SendMessages: false }
      );
      
      return message.reply({ content: `**${message.channel} has been locked**` });
    } catch (error) {
      message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
      console.log(error);
    }
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unlock` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { SendMessages: true }
    );
    return message.reply({ content: `**${message.channel} has been unlocked**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}hide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: false }
    );
    return message.reply({ content: `**${message.channel} has been hidden**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;  
  if (message.content === `${prefix}unhide` || message.content === `${cmd}`) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
    }
      await message.channel.permissionOverwrites.edit(
      message.channel.guild.roles.everyone, 
      { ViewChannel: true }
    );
    return message.reply({ content: `**${message.channel} has been unhidded**` });
  }
});

client27.on("messageCreate", async (message) => {
const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
  if (message.content === `${prefix}server` || message.content === `${cmd}`) {
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
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`roomsdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`roomsdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleterooms_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('channelDelete' , async(channel) => {
  let guildid = channel.guild.id
  let status = protectDB.get(`antideleterooms_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const users = protectDB.get(`roomsdelete_users_${guildid}`)
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
  if(newexecutorlimit > deletelimit) {
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
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`rolesdelete_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`antideleteroles_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('roleDelete' , async(role) => {
  let guildid = role.guild.id
  let status = protectDB.get(`antideleteroles_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const users = protectDB.get(`rolesdelete_users_${guildid}`)
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
  if(newexecutorlimit > deletelimit) {
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
client27.on('ready' , async() => {
  const guild = client27.guilds.cache.first()
  if(!guild) return;
  const guildid = guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  setInterval(() => {
  const users = protectDB.get(`ban_users_${guildid}`)
    if(!users) return;
    if(users.length > 0) {
      users.forEach(async(user) => {
        const { userid , limit , newReset } = user;
        const currentTime = moment().format('YYYY-MM-DD');
        if(moment(currentTime).isSame(newReset) || moment(currentTime).isAfter(newReset)) {
          const newResetDate = moment().add(1 , 'day').format('YYYY-MM-DD')
          executordb = {userid:userid,limit:0,newReset:newResetDate}
          const index = users.findIndex(user => user.userid === userid);
      users[index] = executordb;
      await protectDB.set(`ban_users_${guildid}` , users)
        }
        let limitrooms = protectDB.get(`ban_limit_${guildid}`)
      if(limit > limitrooms) {
        let member = guild.members.cache.find(m => m.id == userid)
       try {
         member.kick()
       } catch  {
        return;
       }
      }
      })
      
    } 
  }, 6 * 1000);
})

client27.on('guildBanAdd' , async(member) => {
  let guildid = member.guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const users = protectDB.get(`ban_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`ban_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `حظر اعضاء`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`ban_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`ban_users_${guildid}` , users)
  }
})

client27.on('guildMemberRemove' , async(member) => {
  let guildid = member.guild.id
  let status = protectDB.get(`ban_status_${guildid}`)
  if(!status)return;
  if(status == "off") return;
  if(member.id === client27.user.id) return;
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  const { executor } = channelDeleteLog;
  const users = protectDB.get(`ban_users_${guildid}`)
  const endTime = moment().add(1 , 'day').format('YYYY-MM-DD')
  if(users.length <= 0) {
    await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
    return;
  }
  let executordb = users.find(user => user.userid == executor.id)
  if(!executordb) {
      await protectDB.push(`ban_users_${guildid}` , {userid:executor.id , limit:1 , newReset:endTime})
      return;
  }
  let oldexecutorlimit = executordb.limit
  let newexecutorlimit = oldexecutorlimit + 1
  executordb = {userid:executor.id,limit:newexecutorlimit,newReset:endTime}
  const index = users.findIndex(user => user.userid === executor.id);
users[index] = executordb;
  let deletelimit = protectDB.get(`ban_limit_${guildid}`)
  if(newexecutorlimit > deletelimit) {
    let guild = client27.guilds.cache.find(gu => gu.id == guildid)
    let member = guild.members.cache.find(ex => ex.id == executor.id)
   try {
    const logRoom = await protectDB.get(`protectLog_room_${member.guild.id}`)
    if(logRoom){
      const theLogRoom = await member.guild.channels.cache.find((ch) => ch.id == logRoom);
      theLogRoom.send({embeds : [new EmbedBuilder().setTitle('نظام الحماية').addFields({name : `العضو :` , value : `${member.user.username} \`${member.id}\``} , {name : `السبب :` , value : `طرد اعضاء`} , {name : `العقاب :` , value : `طرد العضو`})]})
    }
    member.kick()
   } catch  {
    return;
   }
    let filtered = users.filter(a => a.userid != executor.id)
    await protectDB.set(`ban_users_${guildid}` , filtered)
  } else {
    await protectDB.set(`ban_users_${guildid}` , users)
  }
})

// نهاية الحماية من البان

// --- SHOPPING WORLD ADVANCED LOGS ---
// 1. حذف الرسائل
client27.on('messageDelete', async (message) => {
    try {
        if (!message.guild || !message.author || message.author.bot) return;
        if (!logsDB.has(`log_messagedelete_${message.guild.id}`)) return;
        
        const logChannelId = logsDB.get(`log_messagedelete_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const auditLogs = await message.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MessageDelete }).catch(() => null);
        const deletionEntry = auditLogs?.entries.first();
        
        // التأكد من أن السجل حديث لتجنب جلب بيانات قديمة
        const executor = (deletionEntry && (Date.now() - deletionEntry.createdTimestamp < 5000)) ? deletionEntry.executor : null;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: message.guild.iconURL() })
            .setTitle('**تم حذف رسالة**')
            .addFields(
                { name: 'صاحب الرسالة:', value: `\`\`\`${message.author.tag}\`\`\``, inline: true },
                { name: 'حاذف الرسالة:', value: `\`\`\`${executor ? executor.tag : 'صاحب الرسالة نفسه (أو غير معروف)'}\`\`\``, inline: true },
                { name: 'القناة:', value: `<#${message.channel.id}>`, inline: false },
                { name: 'المحتوى:', value: `\`\`\`${message.content || 'None'}\`\`\``, inline: false }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in messageDelete log:', err);
    }
});

// 2. تعديل الرسائل
client27.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        if (!oldMessage.guild || !oldMessage.author || oldMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;
        if (!logsDB.has(`log_messageupdate_${oldMessage.guild.id}`)) return;

        const logChannelId = logsDB.get(`log_messageupdate_${oldMessage.guild.id}`);
        const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: oldMessage.guild.iconURL() })
            .setTitle('**تم تعديل رسالة**')
            .addFields(
                { name: 'صاحب الرسالة:', value: `\`\`\`${oldMessage.author.tag}\`\`\``, inline: false },
                { name: 'القديم:', value: `\`\`\`${oldMessage.content || 'None'}\`\`\``, inline: false },
                { name: 'الجديد:', value: `\`\`\`${newMessage.content || 'None'}\`\`\``, inline: false }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in messageUpdate log:', err);
    }
});

// 3. الرتب (إنشاء)
client27.on('roleCreate', async (role) => {
    try {
        if (!logsDB.has(`log_rolecreate_${role.guild.id}`)) return;
        const logChannel = role.guild.channels.cache.get(logsDB.get(`log_rolecreate_${role.guild.id}`));
        if (!logChannel) return;

        const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: role.guild.iconURL() })
            .setTitle('**تم انشاء رتبة**')
            .addFields(
                { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in roleCreate log:', err);
    }
});

// 3. الرتب (حذف)
client27.on('roleDelete', async (role) => {
    try {
        if (!logsDB.has(`log_roledelete_${role.guild.id}`)) return;
        const logChannel = role.guild.channels.cache.get(logsDB.get(`log_roledelete_${role.guild.id}`));
        if (!logChannel) return;

        const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: role.guild.iconURL() })
            .setTitle('**تم حذف رتبة**')
            .addFields(
                { name: 'اسم الرتبة:', value: `\`\`\`${role.name}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in roleDelete log:', err);
    }
});

// 4. القنوات (إنشاء)
client27.on('channelCreate', async (channel) => {
    try {
        if (!channel.guild || !logsDB.has(`log_channelcreate_${channel.guild.id}`)) return;
        const logChannel = channel.guild.channels.cache.get(logsDB.get(`log_channelcreate_${channel.guild.id}`));
        if (!logChannel) return;

        const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: channel.guild.iconURL() })
            .setTitle('**تم إنشاء قناة**')
            .addFields(
                { name: 'اسم القناة:', value: `\`\`\`${channel.name}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in channelCreate log:', err);
    }
});

// 4. القنوات (حذف)
client27.on('channelDelete', async (channel) => {
    try {
        if (!channel.guild || !logsDB.has(`log_channeldelete_${channel.guild.id}`)) return;
        const logChannel = channel.guild.channels.cache.get(logsDB.get(`log_channeldelete_${channel.guild.id}`));
        if (!logChannel) return;

        const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: channel.guild.iconURL() })
            .setTitle('**تم حذف قناة**')
            .addFields(
                { name: 'اسم القناة:', value: `\`\`\`${channel.name}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in channelDelete log:', err);
    }
});

// 5. الحظر (Ban Add)
client27.on('guildBanAdd', async (ban) => {
    try {
        const { guild, user } = ban;
        if (!logsDB.has(`log_banadd_${guild.id}`)) return;
        const logChannel = guild.channels.cache.get(logsDB.get(`log_banadd_${guild.id}`));
        if (!logChannel) return;

        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: guild.iconURL() })
            .setTitle('**تم حظر عضو**')
            .addFields(
                { name: 'العضو المحظور:', value: `\`\`\`${user.tag}\`\`\``, inline: true },
                { name: 'بواسطة المشرف:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildBanAdd log:', err);
    }
});

// 6. الطرد الحقيقي (Kick - باستخدام Audit Logs لمنع الوهم)
client27.on('guildMemberRemove', async (member) => {
    try {
        if (!logsDB.has(`log_kickadd_${member.guild.id}`)) return;
        
        // التحقق مما إذا كان الحدث عبارة عن "طرد" حقيقي عبر سجل التدقيق وليس مجرد مغادرة عادية
        const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick }).catch(() => null);
        const entry = auditLogs?.entries.first();

        // التأكد من أن السجل يعود لهذا العضو المحدود وتم تنفيذه خلال آخر 5 ثوانٍ
        if (!entry || entry.target.id !== member.id || (Date.now() - entry.createdTimestamp > 5000)) return;

        const logChannel = member.guild.channels.cache.get(logsDB.get(`log_kickadd_${member.guild.id}`));
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: member.guild.iconURL() })
            .setTitle('**تم طرد عضو**')
            .addFields(
                { name: 'العضو المطرود:', value: `\`\`\`${member.user.tag}\`\`\``, inline: true },
                { name: 'بواسطة المشرف:', value: `\`\`\`${entry.executor ? entry.executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in kick log:', err);
    }
});

// 7. فك الحظر (Unban)
client27.on('guildBanRemove', async (ban) => {
    try {
        const { guild, user } = ban;
        if (!logsDB.has(`log_unban_${guild.id}`)) return;
        const logChannel = guild.channels.cache.get(logsDB.get(`log_unban_${guild.id}`));
        if (!logChannel) return;

        const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: guild.iconURL() })
            .setTitle('**تم فك الحظر عن عضو**')
            .addFields(
                { name: 'العضو:', value: `\`\`\`${user.tag}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildBanRemove log:', err);
    }
});

// 8. تغيير اللقب (Nickname)
client27.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        if (oldMember.nickname === newMember.nickname) return;
        if (!logsDB.has(`log_nickname_${oldMember.guild.id}`)) return;

        const logChannel = oldMember.guild.channels.cache.get(logsDB.get(`log_nickname_${oldMember.guild.id}`));
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: oldMember.guild.iconURL() })
            .setTitle('**تم تغيير نك نيم**')
            .addFields(
                { name: 'العضو:', value: `${oldMember.user.tag}`, inline: false },
                { name: 'القديم:', value: `\`\`\`${oldMember.nickname || 'None'}\`\`\``, inline: true },
                { name: 'الجديد:', value: `\`\`\`${newMember.nickname || 'None'}\`\`\``, inline: true }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in nickname log:', err);
    }
});

// 9. تحديث القنوات (اسم القناة)
client27.on('channelUpdate', async (oldChannel, newChannel) => {
    try {
        if (!oldChannel.guild || oldChannel.name === newChannel.name) return;
        if (!logsDB.has(`log_channelupdate_${oldChannel.guild.id}`)) return;

        const logChannel = oldChannel.guild.channels.cache.get(logsDB.get(`log_channelupdate_${oldChannel.guild.id}`));
        if (!logChannel) return;

        const auditLogs = await oldChannel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate }).catch(() => null);
        const entry = auditLogs?.entries.first();
        const executor = entry?.executor;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: oldChannel.guild.iconURL() })
            .setTitle('**تم تحديث قناة**')
            .addFields(
                { name: 'الاسم القديم:', value: `\`\`\`${oldChannel.name}\`\`\``, inline: true },
                { name: 'الاسم الجديد:', value: `\`\`\`${newChannel.name}\`\`\``, inline: true },
                { name: 'بواسطة:', value: `\`\`\`${executor ? executor.tag : 'Unknown'}\`\`\``, inline: false }
            )
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in channelUpdate log:', err);
    }
});

// 10. دخول عضو جديد
client27.on('guildMemberAdd', async (member) => {
    try {
        if (!logsDB.has(`log_memberadd_${member.guild.id}`)) return;
        const logChannel = member.guild.channels.cache.get(logsDB.get(`log_memberadd_${member.guild.id}`));
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'SHOPPING WORLD', iconURL: member.guild.iconURL() })
            .setTitle('**عضو جديد انضم**')
            .addFields({ name: 'العضو:', value: `\`\`\`${member.user.tag}\`\`\``, inline: false })
            .setColor('#2b2d31')
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error('Error in guildMemberAdd log:', err);
    }
});

// --- END OF LOGS ---

let invites = {}; 
const getInviteCounts = async (guild) => {
    return new Map(guild.invites.cache.map(invite => [invite.code, invite.uses]));
};

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
            .setThumbnail(member.user.displayAvatarURL())
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
  await rooms.forEach(async(room) => {
    const theRoom = await theeGuild.channels.cache.find(ch => ch.id == room)
    if(!theRoom) return;
    await theRoom.send({content:`${member} - ${message}`}).then(async(msg) => {
      setTimeout(() => {
        msg.delete();
      }, 3000);
    })
  })
})

client27.on("messageCreate" ,  async(message) => {
    if(message.author.bot) return;
    const autoReplys = one4allDB.get(`replys_${message.guild.id}`);
    if(!autoReplys) return;
    const data = autoReplys.find((r) => r.word == message.content);
    if(!data) return;
    message.reply(`${data.reply}`)
  })



client27.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== "help_menu") return;

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