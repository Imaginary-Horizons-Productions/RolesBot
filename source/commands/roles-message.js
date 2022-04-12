const Command = require('../classes/Command.js');
const { rolesMessagePayload } = require('../helpers.js');

const options = [];
module.exports = new Command("roles-message", "(Manager) Post a message with the role selects", true, false, options);

module.exports.execute = async (interaction) => {
	interaction.channel.send(await rolesMessagePayload(interaction.guild.roles, interaction.guildId)).then(message => {
		interaction.reply({ content: "The role message has been sent.", ephemeral: true });
	}).catch(error => {
		if (error.code === 50013) {
			interaction.reply({ content: "RolesBot doesn't have permission to send public messages in this channel.", ephemeral: true });
		} else {
			console.error(error);
		}
	})
}
