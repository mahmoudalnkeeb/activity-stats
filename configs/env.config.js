const path = require("path");
require("dotenv").config();

module.exports = {
  dbPath: path.join(process.cwd(), "db", "activity.db"), //  unix path
  discordToken: process.env.DISCORD_SECRET,
  clientId: process.env.DISCORD_CLIENT_ID,
  statsDuration: 7, // in days
  guilds: process.env.GUILDS.split(";"),
  dev_roles: process.env.DEV_ROLES.split(";"),
};
