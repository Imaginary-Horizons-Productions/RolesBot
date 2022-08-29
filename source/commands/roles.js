const Command = require('../classes/Command.js');
const { rolesMessagePayload } = require('../helpers.js');

const options = [];
const subcommands = [];
module.exports = new Command("roles", "Open the roles get/remove interface", false, false, options, subcommands);

module.exports.execute = async (interaction) => {
	let payload = await rolesMessagePayload(interaction.guild.roles, interaction.guildId);
	payload.ephemeral = true;
	interaction.reply(payload);
}
