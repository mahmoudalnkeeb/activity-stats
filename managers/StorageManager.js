const { Database } = require("sqlite3")
const Logger = require("../utils/logger")

module.exports = class StorageManager {
  constructor(config) {
    this.client = new Database(config.dbPath)
    this.logger = new Logger('STORAGE')
  }
  save_message({user_id , username , message_content , time_created}) {}
  get_period_messages(start , end) {}
  get_user_messages(user_id) {}
}
