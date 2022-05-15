const Command = require('../classes/Command.js');

const options = [
	{
		type: "",
		name: "",
		description: "",
		required: false,
		choices: [] // elements are objects with properties: name, value
	}
];
module.exports = new Command("name", "description", false, false, options);

module.exports.execute = (interaction) => {
	// Command specifications go here
}
