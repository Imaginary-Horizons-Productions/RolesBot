const Command = require('../../classes/Command.js');
const { rolesMessagePayload } = require('../helpers.js');

const options = [];
module.exports = new Command("roles", "Open the roles get/remove interface", false, false, options);

module.exports.execute = async (interaction) => {
	let payload = await rolesMessagePayload(interaction.guild.roles, interaction.guildId);
	payload.ephemeral = true;
	interaction.reply(payload);
}
