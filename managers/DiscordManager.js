const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ApplicationCommandOptionType,
} = require("discord.js");
const Logger = require("../utils/logger");
const commands = require("../configs/commands.json");

module.exports = class DiscordManager {
  constructor(config, storage, statsManager) {
    this.storage = storage;
    this.config = config;
    this.statsManagaer = statsManager;
    this.client = new Client({
      intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.clientTag = null;
    this.start = 0;
    this.logger = new Logger("DISCORD");
  }

  init_client(reloadCommands = false) {
    if (reloadCommands) return this.register_commands();

    // login using token
    this.client.login(this.config.discordToken);

    // do stuff after client is ready
    this.client.on("ready", () => {
      this.start = Date.now();
      this.logger.log_info(
        `client is ready and watching for messages > ${this.client.user.tag}`,
      );
      this.clientTag = this.client.user.tag;
      this.watch_messages();
      this.watch_commands();
    });
    // handle client errors
    this.client.on("error", (error) => {
      this.logger.log_err(error);
    });
  }

  async register_commands() {
    const rest = new REST({ version: "10" }).setToken(this.config.discordToken);
    try {
      this.logger.log_info("Started refreshing application (/) commands. ");
      console.log(commands);
      await rest.put(Routes.applicationCommands(this.config.clientId), {
        body: commands,
      });

      this.logger.log_info("Successfully reloaded application (/) commands.");
    } catch (error) {
      this.logger.log_err(error);
    }
  }

  watch_messages() {
    this.client.on("messageCreate", async (message) => {
      const { content, author, guildId } = message;
      const isBot = this.is_bot_message(author);
      const isMonitoredGuild = this.is_monitored_guild(guildId);

      if (content === ".monitor_status") {
        return await this.handle_monitor_status(message, isMonitoredGuild);
      }

      if (!isMonitoredGuild && !isBot) {
        return this.log_unmonitored_message(message, guildId);
      }

      if (!isBot && isMonitoredGuild) {
        this.log_monitored_message(message, guildId);
        await this.save_message_data(message);
      }
    });
  }

  watch_commands() {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isCommand()) {
        switch (interaction.commandName) {
          case "activity":
            this.get_activity(interaction);
            await interaction.reply("ok"); // TEMP
            break;
          case "useractivity":
            this.get_user_activity(interaction);
            await interaction.reply("ok"); // TEMP
            break;
          default:
            break;
        }
      }
    });
  }

  async get_activity(interaction) {
    const server_id = interaction.guildId;
    const duration =
      interaction.options.get("duration") || this.config.statsDuration;
    const stats = await this.statsManagaer.get_period_stats(
      server_id,
      duration,
    );
    // create excel file from stats then send it to user or make webpage with it
  }

  async get_user_activity(interaction) {
    const { user } = interaction.options.get("user");
    const user_id = user.id || interaction.user.id;
    const server_id = interaction.guildId;
    const duration =
      interaction.options.get("duration") || this.config.statsDuration;
    const user_stats = await this.statsManagaer.get_user_period_stats(
      server_id,
      user_id,
      duration,
    );
    // create excel file from stats then send it to user or make webpage with it
  }

  is_bot_message(author) {
    return author.bot || author.tag === this.clientTag;
  }

  is_monitored_guild(guildId) {
    return this.config.guilds.includes(guildId);
  }

  has_dev_permissions(message) {
    return message.member.roles.cache.hasAny(...this.config.dev_roles);
  }

  async handle_monitor_status(message, isMonitoredGuild) {
    if (!this.has_dev_permissions(message)) {
      return await message.reply("Permission denied!");
    }

    if (!isMonitoredGuild) {
      return await message.reply(
        `This server has no monitoring activity running`,
      );
    }

    return await message.reply(
      `Currently monitoring server activity uptime > ${Date.now() - this.start}ms`,
    );
  }

  log_unmonitored_message(message, guildId) {
    const { content, createdTimestamp, author } = message;
    const { username, displayName, id } = author;
    const reply = `${username} - ${displayName} - ${id} - ${content} - ${createdTimestamp}`;

    this.logger.log_warning(
      `Message is not from a monitored guild > ${guildId} not in ${JSON.stringify(this.config.guilds)} \n ${reply}`,
    );
  }

  log_monitored_message(message, guildId) {
    const { content, createdTimestamp, author } = message;
    const { username, displayName, id } = author;
    const reply = `${username} - ${displayName} - ${id} - ${content} - ${createdTimestamp}`;

    this.logger.log_info(
      `Message is from a monitored guild > ${guildId} not in ${JSON.stringify(this.config.guilds)} \n ${reply}`,
    );
  }

  async save_message_data(message) {
    const { createdTimestamp, guildId, author } = message;
    const { username, id } = author;

    await this.storage.save_message({
      user_id: id,
      server_id: guildId,
      username,
      time_created: createdTimestamp,
    });
  }

  // TODO: Make slash commands for getting stats manually
  // TODO: Permissions for commands
  // LIKE
  // /activity period?--> reply with same user activity
  // /useractivity (user) period?  --> reply with supplied user activity [ADMIN]
  // /allactivity period?
};
