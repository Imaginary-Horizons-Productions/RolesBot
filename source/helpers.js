const { MessageActionRow, MessageSelectMenu, RoleManager } = require("discord.js");
const fs = require("fs");

exports.SAFE_DELIMITER = "→";

const ROLES_WHITELISTS = require("./../saves/rolesWhitelist.json"); // { guildId: { roles: [roleId1, roleId2...], channelId, messageId } }

function saveRolesWhitelist() {
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
 * Get the ids of roles whitelisted by the guild
 *
 * @param {string} guildId
 * @returns {string[]}
 */
exports.getRoles = function (guildId) {
	return ROLES_WHITELISTS[guildId]?.roles || [];
}

/**
 * Add a role to a guild's whitelist
 *
 * @param {string} guildId
 * @param {string} roleId
 */
exports.setRole = function (guildId, roleId, roleManager) {
	if (guildId in ROLES_WHITELISTS) {
		ROLES_WHITELISTS[guildId].roles.push(roleId);
	} else {
		ROLES_WHITELISTS[guildId] = { roles: [roleId] };
	}
	saveRolesWhitelist();
	updateRolesMessage(roleManager);
}

/**
 * Remove a role from a guild's whitelist
 *
 * @param {string} guildId
 * @param {string} roleId
 * @param {RoleManager} roleManager
 */
exports.deleteRole = function (guildId, roleId, roleManager) {
	if (guildId in ROLES_WHITELISTS) {
		ROLES_WHITELISTS[guildId].roles = ROLES_WHITELISTS[guildId].roles.filter(id => id !== roleId);
		saveRolesWhitelist();
		updateRolesMessage(roleManager);
	}
};

/**
 * Set the channelId and messageId for the guild's public roles message
 *
 * @param {string} guildId
 * @param {string} channelId
 * @param {string} messageId
 */
exports.setRolesMessageIds = function (guildId, channelId, messageId) {
	if (guildId in ROLES_WHITELISTS) {
		ROLES_WHITELISTS[guildId].channelId = channelId;
		ROLES_WHITELISTS[guildId].messageId = messageId;
	} else {
		ROLES_WHITELISTS[guildId] = { roles: [], channelId, messageId };
	}
	saveRolesWhitelist();
}

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
			content: `Use the following select menus to modify your roles. Available roles are: \n${roles.length ? `<@&${roles.join(">, <@&")}>` : "None yet, use `/register-roles` to add some!"}`,
			components: [
				...roleOptions.map((optionSet, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`add-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(optionSet.length ? "➕ Select role(s) to gain..." : "No roles set yet")
							.setDisabled(roles.length < 1)
							.setMinValues(1)
							.setMaxValues(roles.length || 1)
							.setOptions(optionSet)
					)
				}),
				...roleOptions.map((optionSet, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`remove-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(optionSet.length ? "➖ Select role(s) to remove..." : "No roles set yet")
							.setDisabled(roles.length < 1)
							.setMinValues(1)
							.setMaxValues(roles.length || 1)
							.setOptions(optionSet)
					)
				})
			]
		}
	})
}

/**
 * Get the guild's roles message
 *
 * @param {Guild} guild
 * @returns {Message}
 */
async function getRoleMessage(guild) {
	const guildId = guild.id;
	if (guildId in ROLES_WHITELISTS) {
		const { channelId, messageId } = ROLES_WHITELISTS[guildId];
		if (channelId && messageId) {
			let channel = await guild.channels.fetch(channelId).catch(error => {
				if (error.code !== 10003) {
					// ignore "Unknown Channel" errors, someone probably deleted the channel their roles message was in
					console.error(error);
				}
			});
			return await channel?.messages.fetch(messageId).catch(error => {
				if (error.code !== 10008) {
					// ignore "Unknown Message" errors, someone probably deleted their roles message
					console.error(error);
				}
			});
		}
	}
}

/**
 * Updates the roles message of the specified guild
 *
 * @param {RoleManager} roleManager
 */
function updateRolesMessage(roleManager) {
	getRoleMessage(roleManager.guild).then(message => {
		exports.rolesMessagePayload(roleManager, roleManager.guild.id).then(payload => {
			message?.edit(payload);
		})
	})
}

/**
 * Removes the components from the now outdated roles message
 *
 * @param {Guild} guild
 */
exports.disableRolesMessage = function (guild) {
	getRoleMessage(guild).then(message => {
		message?.edit({ components: [] });
	})
}
