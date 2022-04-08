const { MessageEmbed } = require('discord.js');
const Command = require('../classes/Command.js');

const options = [];
module.exports = new Command("about", "List information about RolesBot", false, false, options);

module.exports.execute = (interaction) => {
	interaction.reply({
		embeds: [
			new MessageEmbed().setColor('6b81eb')
				.setAuthor({ name: "Click here to vist the RolesBot GitHub", iconURL: interaction.client.user.displayAvatarURL(), url: "https://github.com/Imaginary-Horizons-Productions/RolesBot" })
				.setTitle("RolesBot")
				.setURL("https://discord.com/api/oauth2/authorize?client_id=950469509628702740&permissions=397284665360&scope=applications.commands%20bot") //TODO join link
				.setDescription("A light-weight bot for allowing server members to select their own roles.")
				.addField("Design & Engineering", "Nathaniel Tseng ( <@106122478715150336> | [GitHub](https://github.com/ntseng) )")
				.setFooter({ text: "Click the title link to add RolesBot to your server", iconURL: "https://cdn.discordapp.com/icons/353575133157392385/c78041f52e8d6af98fb16b8eb55b849a.png" })
		],
		ephemeral: true
	})
}
