const { ShardingManager } = require("discord.js");

const manager = new ShardingManager("./source/bot.js", { token: require("./config/auth.json").token });

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
