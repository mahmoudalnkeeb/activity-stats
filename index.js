const envConfig = require("./configs/env.config");
const DiscordManager = require("./managers/DiscordManager");
const StatisticsManager = require("./managers/StatsManager");
const StorageManager = require("./managers/StorageManager");
const Logger = require("./utils/logger");

const storage = new StorageManager(envConfig);
const statsManager = new StatisticsManager(envConfig, storage);
const discordManager = new DiscordManager(envConfig, storage, statsManager);

storage.migrate_db();
discordManager.init_client(process.argv.includes("reload-commands"));

const mainLogger = new Logger("MAIN");

mainLogger.log_debug("this is a test for debug message");
