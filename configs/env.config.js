const path = require('path')
require('dotenv').config()

module.exports = {
  dbPath: path.join(process.cwd(), 'db', 'activity.db'), //  unix path
  discordToken: process.env.DISCORD_SECRET,
  statsDuration: 7, // in days
}
