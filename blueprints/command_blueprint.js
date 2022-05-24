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
const subcommands = [
	{
		name: "",
		description: "",
		optionsInput: [
			{
				type: "",
				name: "",
				description: "",
				required: false,
				choices: [] // elements are objects with properties: name, value
			}
		]
	}
];
module.exports = new Command("name", "description", false, false, options, subcommands);

module.exports.execute = (interaction) => {
	// Command specifications go here
}
