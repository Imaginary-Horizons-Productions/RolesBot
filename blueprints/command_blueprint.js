const Command = require('../../classes/Command.js');

const options = [
	{ type: "", name: "", description: "", required: false, choices: {} }
];
module.exports = new Command("name", "description", false, false, options);

// imports from files that depend on /config
// let ;
module.exports.injectConfigCommands = function (isProduction) {
	({} = require("./../helpers.js").injectConfig(isProduction));
	return this;
}

module.exports.execute = (interaction) => {
	// Command specifications go here
}
