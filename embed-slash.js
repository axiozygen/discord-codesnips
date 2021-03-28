/*
This code would be your index.js file.
Don't forget to authorize your Discord bot with the applications.commands scope.
Keep in mind that this slash command is GUILD-BASED, not GLOBAL.
To make the slash command global, follow the instructions in the offical docs.
	Link to docs: https://discord.com/developers/docs/interactions/slash-commands
*/

const Discord = require('discord.js');
const dotenv = require('dotenv');
const GuildId = '<your-guild-id-here>';

dotenv.config;

const client = new Discord.Client();
const getApp = (GuildId) => {
	const app = client.api.applications(client.user.id);
	if (GuildId) {
		app.guilds(GuildId)
	};
	return app
};

client.on('ready', async () => {
	console.log('Bot is online!');

	const commands = await getApp(GuildId).commands.get();

	await getApp(GuildId).commands.post({
		data: {
			name: 'embed',
			description: 'Create an embed. (Total embed cannot exceed 4,000 characters due to slash command limitations.)',
			options: [
				{
					name: 'Title',
					description: 'Sets thembed title. (256 characters max)',
					required: true,
					type: 3
				},
				{
					name: 'Description',
					description: 'Sets the embed description. (2048 characters max)',
					required: true,
					type: 3
				},
				{
					name: 'Footer',
					description: 'Sets the footer of your embed (2048 characters max)',
					required: false,
					type: 3
				},
				{
					name: 'Color',
					description: 'Sets the embed color. Use the hex-code color value. (e.g. #ffffff)',
					required: false,
					type: 3
				},
				{
					name: 'Thumbnail',
					description: 'Adds an image/gif to the upper-right corner of your embed. (Use a direct media link.)',
					required: false,
					type: 3
				},
				{
					name: 'Image',
					description: 'Adds an image/gif to the bottom of your embed. (Use a direct media link.)',
					required: false,
					type: 3
				}
			]
		}
	})
});

client.ws.on('INTERACTION_CREATE', async (interaction) => {
	const { name, options } = interaction.data;
	const slash = name.toLowerCase();

	const args = {};

	const createAPIMessage = async(interaction, content) => {
		const { data, files } = await Discord.APIMessage.create(
			client.channels.resolve(interaction.channel_id),
			content
		)
		.resolveData()
		.resolveFiles()
		return { ...data, files }
	}

	const reply = async (interaction, response) => {
		let data = {
			content: response
		}

		if (typeof response === 'object') {
			data = await createAPIMessage(interaction, response)
		}

		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data,
			}
		})
	};

	if (options) {
		for (const option of options) {
			const { name, value } = option
			args[name] = value
		}
	};

	if (slash === 'embed') {
		const embed = new Discord.MessageEmbed()
			for (const arg in args) {
				if (arg === 'title') {
					embed.setTitle(args[arg])
				};
				if (arg === 'description') {
					embed.setDescription(args[arg])
				};
				if (arg === 'footer') {
					embed.setFooter(args[arg])
				};
				if (arg === 'color') {
					embed.setColor(`${args[arg]}`)
				};
				if (arg === 'thumbnail') {
					embed.setThumbnail(args[arg])
				};
				if (arg === 'image') {
					embed.setImage(args[arg])
				};

			};
		embed.setAuthor(`${interaction.member.user.username}#${interaction.member.user.discriminator}`)
		embed.setTimestamp()
			
		reply(interaction, embed)	
	};
});


client.login(process.env.TOKEN);
