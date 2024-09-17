const Logger = require("../utils/logger")
/**
 collect data about created messages with help of DiscordManager like user_id , username , time_created , and content save all that to database
 then at the end of predefined period get the avg of period activity and make the compare each user with the minimum allowed activity if less the user added to the less_active list with number of messages and avg messages
 */

module.exports = class StatisticsManager {
  constructor(config , storage) {
    this.storage = storage
    this.config = config
    this.logger = new Logger('STATS')
  }

  save_user_messsage({ user_id, username }, { message_content, time_created }) {
    // save the message to database
  }

  get_period_avg() {}
}
