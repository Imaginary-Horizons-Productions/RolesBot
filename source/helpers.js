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


exports.rolesMessagePayload = async function (rolesManager, guildId) {
	let roles = exports.getRoles(guildId);
	let slicedRoles = [roles.slice(0, 25)];
	if (roles.length > 25) {
		slicedRoles.push(roles.slice(25, 50));
	}
	let roleOptions = [];
	slicedRoles.forEach(async ids => {
		if (ids.length) {
			roleOptions.push((await Promise.all(
				ids.map(async id => {
					return {
						label: (await rolesManager.fetch(id)).name,
						description: "",
						value: id
					}
				})
			)))
		} else {
			roleOptions.push([{ label: "Placeholder", description: "If the select is stuck open, try reloading Discord.", value: "placeholder" }])
		}
	})
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
}
