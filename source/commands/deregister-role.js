const Command = require('../classes/Command.js');

const options = [
	{ type: "Role", name: "role", description: "Mention the role to delist", required: true, choices: {} }
];
module.exports = new Command("deregister-role", "(Manager) Remove a role the bot can give", true, false, options);

module.exports.execute = (interaction) => {
	//TODO error if role not stored
}
