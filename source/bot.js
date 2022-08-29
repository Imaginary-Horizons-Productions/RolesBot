//#region Imports
const { Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getCommand, slashData } = require("./commands/_commandDictionary.js");
const { getButton } = require("./buttons/_buttonDictionary.js");
const { getSelect } = require("./selects/_selectDictionary.js");
const { SAFE_DELIMITER } = require("./helpers.js");
//#endregion

//#region Executing Code
const client = new Client({
	retryLimit: 5,
	presence: {
		activities: [{
			type: "PLAYING",
			name: "with /roles"
		}]
	},
	intents: ["GUILDS", "GUILD_MEMBERS"]
});

client.login(require("../config/auth.json").token)
	.catch(console.error);
//#endregion

//#region Event Handlers
client.on("ready", () => {
	console.log(`Connected as ${client.user.tag}`);

	(async () => {
		try {
			await new REST({ version: 9 }).setToken(require("../config/auth.json").token).put(
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

		const [mainId, ...args] = interaction.customId.split(SAFE_DELIMITER);
		if (interaction.isButton()) {
			getButton(mainId).execute(interaction, args);
		}

		if (interaction.isSelectMenu()) {
			getSelect(mainId).execute(interaction, args);
		}
	} else {
		interaction.reply({ content: "There are no roles to adjust in private messages.", ephemeral: true });
	}
})
	//#endregion
