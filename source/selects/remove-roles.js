const Select = require('../classes/Select.js');

module.exports = new Select("remove-roles");

module.exports.execute = (interaction, [page]) => {
	// Give the user the roles selected
	if (interaction.member.manageable) {
		let removed = interaction.values;
		interaction.member.roles.remove(removed);
		interaction.reply({ content: `Roles removed: <@&${removed.join(">, <@&")}>`, ephemeral: true });
	} else {
		interaction.reply({ content: "RolesBot cannot change your roles because you have one that is above it.", ephemeral: true });
	}
}
