//#region Imports
const { Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getCommand, slashData } = require("./source/commands/_commandDictionary.js");
const { getButton } = require("./source/buttons/_buttonDictionary.js");
const { getSelect } = require("./source/selects/_selectDictionary.js");
const { SAFE_DELIMITER } = require("./source/helpers.js");
//#endregion

//#region Executing Code
const client = new Client({
	retryLimit: 5,
	presense: {
		activities: [{
			type: "LISTENING",
			name: "/commands"
		}]
	},
	intents: ["GUILDS", "GUILD_MEMBERS"]
});

(() => {
	try {
		client.login(require("./config/auth.json").token);
	} catch (rejectMessage) {
		console.error(rejectMessage);
	}
})()
//#endregion

//#region Event Handlers
client.on("ready", () => {
	console.log(`Connected as ${client.user.tag}`);

	(async () => {
		try {
			await new REST({ version: 9 }).setToken(require("./config/auth.json").token).put(
				Routes.applicationCommands(client.user.id),
				{ body: slashData }
			)
		} catch (error) {
			console.error(error);
		}
	})()
})

client.on("interactionCreate", interaction => {
	if (interaction.inGuild()) {
		if (interaction.isCommand()) {
			const command = getCommand(interaction.commandName);
			if (!command.managerCommand || !interaction.member.manageable) {
				command.execute(interaction);
			} else {
				interaction.reply(`The \`/${interaction.commandName}\` command is restricted to bot managers (users with permissions above the bot).`)
					.catch(console.error);
			}
		}

		if (interaction.isButton()) {
			const [customId, ...args] = interaction.customId.split(SAFE_DELIMITER);
			getButton(customId).execute(interaction, args);
		}

		if (interaction.isSelectMenu()) {
			const [customId, ...args] = interaction.customId.split(SAFE_DELIMITER);
			getSelect(customId).execute(interaction, args);
		}
	} else {
		interaction.reply({ content: "There are no roles to adjust in private messages.", ephemeral: true });
	}
})
	//#endregion
