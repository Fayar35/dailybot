// import discord.js
import { Client, Events, GatewayIntentBits, TextChannel, type Channel } from 'discord.js';
import config from '../config.json';
import cron from 'node-cron';
import { getUserScore, Score, type Player } from './util/scrapper';
import { possibleTimeLeft, registerCommand } from './commands/register';
import { remove_player, unregisterCommand } from './commands/unregister';
import { getParam } from './util/params';
import { schedulingCommand } from './commands/scheduling';

// create a new Client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]});

// listen for the client to be ready
client.once(Events.ClientReady, async (c) => {
  	console.log(`Ready! Logged in as ${c.user.tag}`);
	
	possibleTimeLeft.forEach(timeLeft => {
		cron.schedule(`0 ${24-timeLeft} * * *`, async () => {
			fetchForTimeleft(timeLeft)
		}, { timezone: 'Etc/UTC' })
	})
});

const fetchForTimeleft = async (timeleft: number) => {
	const param = getParam()

	let players0: Player[] = []
	param[0].players.forEach((player: any) => {
		if (player.times.includes(timeleft)) {
			players0.push(player)
		}
	});

	let players1: Player[] = []
	param[1].players.forEach((player: any) => {
		if (player.times.includes(timeleft)) {
			players1.push(player)
		}
	});

	let channels: TextChannel[] = []
	let players: Player[][] = []
	let scoresFound: ((player: Player, score: Score, index: number) => void)[] = []
	let scoresNotFound: ((player: Player) => void)[] = []
	let channelIndex = 0
	let websiteDownHandlers: (() => void)[] = []

	// server ffs
	if (players0.length > 0) {
		let channel = await client.channels.fetch(param[0].channel_id)
		if (channel !== null && channel instanceof TextChannel) {
			channels.push(channel)
			players.push(players0)
			scoresFound.push(((currentChannelIndex) => (player, score, index) => {
				channels[currentChannelIndex].send(`#${index} : ${player.username} ${score.score.toString()}`)
				.then(message => console.log(`Sent message: ${message.content}`))
				.catch(console.error)
			}) (channelIndex))
			scoresNotFound.push(((currentChannelIndex) => (player) => {
				client.users.fetch(player.discord_id)
				.then(user => {
					channels[currentChannelIndex].send(`/!\\ faut jouer au jeu ${user.toString()}`)
					.then(message => console.log(`Sent message: ${message.content}`))
					.catch(console.error)
				})
				.catch(console.error)
			})(channelIndex))
		}

		websiteDownHandlers.push(((currentChannelIndex) => () => {
			channels[currentChannelIndex].send(`Le site est down :wilted_rose:`)
			.then(message => console.log(`Sent message: ${message.content}`))
			.catch(console.error)
		}) (channelIndex))

		channelIndex += 1
	}

	// server streak
	let playersFound: Player[] = []
	let streakChannelIndex = -1
	if (players1.length > 0) {
		streakChannelIndex = channelIndex
		let channel = await client.channels.fetch(param[1].channel_id)
		if (channel !== null && channel instanceof TextChannel) {
			channels.push(channel)
			players.push(players1)
			scoresFound.push((player, score, index) => {
				console.log(`found ${player.username}`)
				playersFound.push(player)
			})
			scoresNotFound.push(((currentChannelIndex) => (player) => {
				client.users.fetch(player.discord_id)
				.then(user => async () => {
					const guild = await client.guilds.fetch(channel.guildId);
					if (!guild.members.cache.has(user.id)) {
						remove_player(channel.guildId, user.id)
						return
					}

					channels[currentChannelIndex].send(`/!\\ ${user.toString()} did **NOT** play the daily challenge™ (yet)`)
					.then(message => console.log(`Sent message: ${message.content}`))
					.catch(console.error)
				})
				.catch(console.error)
			})(channelIndex))
		}

		websiteDownHandlers.push(((currentChannelIndex) => () => {
			channels[currentChannelIndex].send(`Couldn't access the website :wilted_rose:`)
			.then(message => console.log(`Sent message: ${message.content}`))
			.catch(console.error)
		}) (channelIndex))

		channelIndex += 1
	}

	getUserScore(players, scoresFound, scoresNotFound, websiteDownHandlers).then(() => {
		if (playersFound.length > 0 && streakChannelIndex !== -1) channels[streakChannelIndex].send(`${playersFound.map(p => p.username).join(", ")} played the daily. good.`)
											.then(message => console.log(`Sent message: ${message.content}`))
											.catch(console.error)
		}
	)
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return
	
	if(interaction.commandName === registerCommand.data.name) {
		try {
			await registerCommand.execute(interaction)
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: ':(', ephemeral: true });
		}
	} else if (interaction.commandName === unregisterCommand.data.name) {
		try {
			await unregisterCommand.execute(interaction)
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: ':(', ephemeral: true });
		}
	} else if (interaction.commandName === schedulingCommand.data.name) {
		try {
			await schedulingCommand.execute(interaction)
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: ':(', ephemeral: true });
		}
	} 
})

// login with the token from .env.local
client.login(config.token);