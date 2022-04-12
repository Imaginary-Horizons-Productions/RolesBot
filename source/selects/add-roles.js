const Select = require('../classes/Select.js');

module.exports = new Select("add-roles");

module.exports.execute = (interaction, [page]) => {
	// Give the user the roles selected
	if (interaction.member.manageable) {
		let added = interaction.values;
		interaction.member.roles.add(added);
		if (interaction.message.flags.has("EPHEMERAL")) {
			interaction.update({ content: `Roles added: <@&${added.join(">, <@&")}>`, components: [], ephemeral: true });
		} else {
			interaction.reply({ content: `Roles added: <@&${added.join(">, <@&")}>`, ephemeral: true });
		}
		//TODO update public roles message
	} else {
		interaction.reply({ content: "RolesBot cannot change your roles because you have one that is above it.", ephemeral: true });
	}
}
