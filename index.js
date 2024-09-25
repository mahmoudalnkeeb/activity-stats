const envConfig = require("./configs/env.config");
const DiscordManager = require("./managers/DiscordManager");
const StatisticsManager = require("./managers/StatsManager");
const StorageManager = require("./managers/StorageManager");

const storage = new StorageManager(envConfig);
const statsManager = new StatisticsManager(envConfig, storage);
const discordManager = new DiscordManager(envConfig, storage, statsManager);

storage.migrate_db();
discordManager.init_client(process.argv.includes("reload-commands"));
