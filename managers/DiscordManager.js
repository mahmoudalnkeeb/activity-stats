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
    this.clientTag = ''
    this.client.on('ready', () => {
      this.logger.log_info(`client is ready and watching for messages > ${this.client.user.tag}`)
      this.clientTag = this.client.user.tag
      this.watch_messages()
    })
  }

  watch_messages() {
    // on message event save save the event with user id
    // {message , user_id , username , time_created}
    this.client.on('messageCreate', async (message) => {
      const { username, id, displayName, tag } = message.author
      const { createdTimestamp, content } = message
      if (tag != this.clientTag) {
        const reply = `${username} - ${displayName} - ${id}  - ${content} - ${createdTimestamp}`
        await this.storage.save_message({
          user_id: id,
          username,
          message_content: content,
          time_created: createdTimestamp,
        })
        this.logger.log_info(reply)
      }
    })
  }

  // TODO: Make slash commands for getting stats manually
  // TODO: Permissions for commands
  // LIKE
  // /activity period?--> reply with same user activity
  // /useractivity (user) period?  --> reply with supplied user activity [ADMIN]
  // /allactivity period?
}
