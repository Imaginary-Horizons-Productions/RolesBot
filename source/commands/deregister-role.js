const Command = require('../classes/Command.js');
const { deleteRole } = require('../helpers.js');

const options = [
	{ type: "Role", name: "role", description: "Mention the role to delist", required: true, choices: [] }
];
module.exports = new Command("deregister-role", "(Manager) Remove a role the bot can give", true, false, options);

module.exports.execute = (interaction) => {
	let role = interaction.options.getRole("role");
	deleteRole(interaction.guildId, role.id, interaction.guild.roles);
	interaction.reply({ content: `Server members can no longer use the bot to give or remove ${role} from themselves.`, ephemeral: true });
}
