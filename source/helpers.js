const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const fs = require("fs");

exports.SAFE_DELIMITER = "→";

const ROLES_WHITELISTS = require("./../saves/rolesWhitelist.json"); // { guildId: [roleId1, roleId2...]}

exports.getRoles = function (guildId) {
	return ROLES_WHITELISTS[guildId] || [];
}

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
					return await options;
				}
			}, []);
		} else {
			return [{ label: "Placeholder", description: "If the select is stuck open, try reloading Discord.", value: "placeholder" }];
		}
	})).then(roleOptions => {
		return {
			content: "Use the following select menus to modify your roles:",
			components: [
				...slicedRoles.map((ids, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`add-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(ids.length ? "Select roles to gain..." : "No roles set yet")
							.setDisabled(ids.length < 1)
							.setMinValues(1)
							.setMaxValues(ids.length || 1)
							.setOptions(roleOptions[index])
					)
				}),
				...slicedRoles.map((ids, index) => {
					return new MessageActionRow().addComponents(
						new MessageSelectMenu().setCustomId(`remove-roles${exports.SAFE_DELIMITER}${index}`)
							.setPlaceholder(ids.length ? "Select roles to remove..." : "No roles set yet")
							.setDisabled(ids.length < 1)
							.setMinValues(1)
							.setMaxValues(ids.length || 1)
							.setOptions(roleOptions[index])
					)
				})
			]
		}
	})
}
