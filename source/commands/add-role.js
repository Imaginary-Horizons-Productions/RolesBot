const Command = require('../../classes/Command.js');
const { getRoles, setRole } = require('../helpers.js');

const options = [
	{ type: "Role", name: "role", description: "Mention the role to add", required: true, choices: {} }
];
module.exports = new Command("add-role", "(Manager) Add a role the bot can give", true, false, options);

module.exports.execute = (interaction) => {
	let roles = getRoles(interaction.guildId);
	if (roles.length < 50) { // hard limit at 2 select menus worth of roles, since there need to be selects for both adding and removing
		let registeredRole = interaction.options.getRole("role");
		if (registeredRole.position < interaction.guild.me.roles.highest.position) {
			if (!roles.includes(registeredRole.id)) {
				setRole(interaction.guildId, registeredRole.id);
				interaction.reply({ content: `Server members can now use the bot to give or remove ${registeredRole} from themselves.`, ephemeral: true })
			} else {
				interaction.reply({ content: `The role ${registeredRole} has already been registered.`, ephemeral: true });
			}
		} else {
			interaction.reply({ content: `The bot would not be able to add or remove ${registeredRole} from users because the role is above the bot's roles.`, ephemeral: true });
		}
	} else {
		interaction.reply({ content: "Only 50 roles can be registered per server.", ephemeral: true });
	}
}
