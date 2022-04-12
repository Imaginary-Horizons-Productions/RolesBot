const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const fs = require("fs");

exports.SAFE_DELIMITER = "→";

const ROLES_WHITELISTS = require("./../saves/rolesWhitelist.json"); // { guildId: [roleId1, roleId2...]}

/**
 * Get the ids of roles whitelisted by the guild
 *
 * @param {string} guildId
 * @returns {string[]}
 */
exports.getRoles = function (guildId) {
	return ROLES_WHITELISTS[guildId] || [];
}

/**
 * Add a role to a guild's whitelist
 *
 * @param {string} guildId
 * @param {string} roleId
 */
exports.setRole = function (guildId, roleId) {
	if (ROLES_WHITELISTS[guildId]) {
		ROLES_WHITELISTS[guildId].push(roleId);
	} else {
		ROLES_WHITELISTS[guildId] = [roleId];
	}
	if (!fs.existsSync("./saves")) {
		fs.mkdirSync("./saves", { recursive: true });
	}
	fs.writeFile("./saves/rolesWhitelist.json", JSON.stringify(ROLES_WHITELISTS), "utf8", error => {
		if (error) {
			console.error(error);
		}
	})
}

/**
 * Remove a role from a guild's whitelist
 *
 * @param {string} guildId
 * @param {string} roleId
 */
exports.deleteRole = function (guildId, roleId) {
	if (ROLES_WHITELISTS[guildId]) {
		ROLES_WHITELISTS[guildId] = ROLES_WHITELISTS[guildId].filter(id => id !== roleId);
		if (!fs.existsSync("./saves")) {
			fs.mkdirSync("./saves", { recursive: true });
		}
		fs.writeFile("./saves/rolesWhitelist.json", JSON.stringify(ROLES_WHITELISTS), "utf8", error => {
			if (error) {
				console.error(error);
			}
		})
	}
};

/**
 * Get the payload for the roles message for the given guild
 *
 * @param {RoleManager} rolesManager
 * @param {string} guildId
 * @returns {MessagePayload}
 */
exports.rolesMessagePayload = async function (rolesManager, guildId) {
	let roles = exports.getRoles(guildId);
	let slicedRoles = [roles.slice(0, 25)];
	if (roles.length > 25) {
		slicedRoles.push(roles.slice(25, 50));
	}
	return Promise.all(slicedRoles.map(async ids => {
		if (ids.length) {
			return ids.reduce(async (options, id) => {
				let role = await rolesManager.fetch(id);
				if (role) {
					return (await options).concat({
						label: role.name,
						value: id
					})
				} else {
					exports.deleteRole(guildId, id);
					return await options;
				}
			}, []);
		} else {
			return [{ label: "Placeholder", description: "If the select is stuck open, try reloading Discord.", value: "placeholder" }];
		}
	})).then(roleOptions => {
		return {
			content: `Use the following select menus to modify your roles. Available roles are: \n<@&${roles.join(">, <@&")}>`,
			components: [
				...roleOptions.map((optionSet, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`add-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(optionSet.length ? "➕ Select role(s) to gain..." : "No roles set yet")
							.setDisabled(optionSet.length < 1)
							.setMinValues(1)
							.setMaxValues(optionSet.length || 1)
							.setOptions(optionSet)
					)
				}),
				...roleOptions.map((optionSet, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`remove-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(optionSet.length ? "➖ Select role(s) to remove..." : "No roles set yet")
							.setDisabled(optionSet.length < 1)
							.setMinValues(1)
							.setMaxValues(optionSet.length || 1)
							.setOptions(optionSet)
					)
				})
			]
		}
	})
}
