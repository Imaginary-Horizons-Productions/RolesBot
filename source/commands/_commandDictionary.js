const CommandSet = require('../../classes/CommandSet.js');

// A maximum of 25 command sets are supported by /commands to conform with MessageEmbed limit of 25 fields
exports.commandSets = [
	new CommandSet("Configuration Commands", "These commands change how the bot operates on your server. They require bot management permission (a role above the bot's roles).", true, []),
];

exports.commandFiles = exports.commandSets.reduce((allFiles, set) => allFiles.concat(set.fileNames), []);
const commandDictionary = {};
exports.slashData = [];

exports.injectConfigCommands = function (isProduction) {
	for (const file of exports.commandFiles) {
		const command = require(`./${file}`);
		commandDictionary[command.name] = command.injectConfig(isProduction);
		exports.slashData.push(command.data.toJSON());
	}
}

exports.getCommand = function (commandName) {
	return commandDictionary[commandName];
}
