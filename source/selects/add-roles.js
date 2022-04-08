const Select = require('../../classes/Select.js');

module.exports = new Select("add-roles");

module.exports.execute = (interaction, [page]) => {
	// Give the user the roles selected
	if (interaction.member.manageable) {
		let added = interaction.values;
		interaction.member.roles.add(added);
		interaction.reply({ content: `Roles added: <@&${added.join(">, <@&")}>`, ephemeral: true });
	} else {
		interaction.reply({ content: "RolesBot cannot change your roles because you have one that is above it.", ephemeral: true });
	}
}
