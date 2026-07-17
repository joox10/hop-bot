const { ChatInputCommandInteraction , Client, Collection,PermissionsBitField,SlashCommandBuilder, discord,GatewayIntentBits, Partials , EmbedBuilder, ApplicationCommandOptionType , Events , ActionRowBuilder , ButtonBuilder ,MessageAttachment, ButtonStyle , Message } = require("discord.js");


module.exports = {
    ownersOnly:false,
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('قول كلام في ايمبد')
    .addStringOption((option) => option
    .setName('title')
    .setDescription(`العنوان`)
    .setRequired(true))
    .addAttachmentOption((option) => option
    .setName('image')
    .setDescription(`صورة`)
    .setRequired(false))
    .addChannelOption((option) => option
    .setName('channel')
    .setDescription(`روم التي يترسل فها الاميبد`)
    .setRequired(false))
    .addStringOption((option) => option
    .setName('color')
    .setDescription(`اللون`)
    .addChoices(
        {name : `احمر` , value : 'Red'},
        {name : `ازرق` , value : 'Blue'},
        {name : `ازرق فاتح` , value : 'Aqua'},
        {name : `اخضر` , value : 'Green'},
        {name : `اصفر` , value : 'Yellow'},
        {name : `اسود` , value : 'Black'},
        {name : `ذهبي` , value : 'Gold'},
        {name : `ابيض` , value : 'White'},
        {name : `برتقالي` , value : 'Orange'},
        {name : `رمادي` , value : 'Grey'},
        {name : `بدون لون` , value : 'DarkButNotBlack'},
        {name : `عشوائي` , value : 'Random'},
    )
    .setRequired(false)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
    */
    async execute(interaction) {
        try {
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) 
                return interaction.reply({content:`**لا تمتلك صلاحية لفعل ذلك**` , ephemeral:true})
            
            let title = await interaction.options.getString('title');
            let imageOption = interaction.options.getAttachment('image');
            let color = interaction.options.getString('color') || "Random";
            let image = imageOption ? imageOption.proxyURL : null;
            let channel = await interaction.options.getChannel('channel') || interaction.channel;

            let embed = new EmbedBuilder().setColor(`${color}`);

            if(title){
                embed.setTitle(`${title}`)
            }
            if(image){
                embed.setImage(`${image}`)
            }


            await interaction.reply({content: "يرجى كتابة الرسال التي تود وضعها في الامبد", ephemeral: true});

            const filter = (msg) => msg.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async (msg) => {
                embed.setDescription(msg.content);

                await msg.delete();

                await channel.send({embeds : [embed]});
                return interaction.followUp({content:`**تم ارسال الامبد بنجاح**` , ephemeral:true});
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({content: "لم يتم استلام أي رسالة. تم إلغاء العملية.", ephemeral: true});
                }
            });
        } catch (error) {
            interaction.reply({content : `لقد حدث خطأ، اتصل بالمطورين.` , ephemeral : true});
            console.log(error);
        }
    }
}
