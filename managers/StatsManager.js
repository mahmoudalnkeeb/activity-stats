const Logger = require("../utils/logger");
/**
 collect data about created messages with help of DiscordManager like user_id , username , time_created , and content save all that to database
 then at the end of predefined period get the avg of period activity and make the compare each user with the minimum allowed activity if less the user added to the less_active list with number of messages and avg messages
 */

module.exports = class StatisticsManager {
  constructor(config, storage) {
    this.storage = storage;
    this.config = config;
    this.logger = new Logger("STATS");
  }

  async get_period_stats(server_id, period = this.config.statsDuration) {
    const periodInMs = period * 24 * 60 * 60 * 1000;
    const end = Date.now();
    const start = end - periodInMs;
    const stats = await this.storage.get_period_stats(server_id, start, end);
    this.logger.log_info(stats);
    return stats;
  }

  async get_user_period_stats(
    server_id,
    user_id,
    period = this.config.statsDuration,
  ) {
    const periodInMs = period * 24 * 60 * 60 * 1000;
    const end = Date.now();
    const start = end - periodInMs;
    const stats = await this.storage.get_user_period_stats(
      start,
      end,
      server_id,
      user_id,
    );
    this.logger.log_info(stats);
    return stats;
  }
};
