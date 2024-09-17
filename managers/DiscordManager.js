const { Client, GatewayIntentBits } = require('discord.js')
const Logger = require('../utils/logger')

module.exports = class DiscordManager {
  constructor(config, storage, statsManager) {
    this.storage = storage
    this.config = config
    this.statsManagaer = statsManager
    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
    })
    this.logger = new Logger('ACTIVITY')
  }

  init_client() {
    this.client.login(this.config.discordToken)
    this.client.on('ready', () => {
      this.logger.log_info(`client is ready and watching for messages > ${this.client.user.tag}`)
      this.watch_messages()
    })
  }

  watch_messages() {
    // on message event save save the event with user id
    // {message , user_id , username , time_created}
  }
}
