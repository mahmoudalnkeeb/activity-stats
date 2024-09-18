const { Database } = require('sqlite3').verbose()
const Logger = require('../utils/logger')

module.exports = class StorageManager {
  constructor(config) {
    this.logger = new Logger('STORAGE')
    this.client = new Database(config.dbPath, (err) => {
      if (err) this.logger.log_err('Error opening database:', err.message)
    })
  }

  async migrate_db() {
    const query = `
      CREATE TABLE IF NOT EXISTS messages (
        user_id INTEGER NOT NULL,
        username TEXT NOT NULL,
        message_content TEXT NOT NULL,
        time_created INTEGER NOT NULL
      );
    `
    await this.execute(query, [], 'Table "messages" created or already exists.')
  }

  async save_message({ user_id, username, message_content, time_created = Date.now() }) {
    const query = `
      INSERT INTO messages (user_id, username, message_content, time_created)
      VALUES (?, ?, ?, ?);
    `
    await this.execute(query, [user_id, username, message_content, time_created], `Message saved for user ${username}`)
  }

  // FIXME: get only count
  async get_period_messages(start, end) {
    const query = `SELECT COUNT(*) FROM messages WHERE time_created BETWEEN ? AND ?;`
    return await this.fetch(query, [start, end], `Messages retrieved between ${start} and ${end}`)
  }

  // FIXME: get only count of messages in specific timeframe
  async get_user_messages(user_id) {
    const query = `SELECT COUNT(*) FROM messages WHERE user_id = ? ORDER BY time_created DESC;`
    return await this.fetch(query, [user_id], `Messages retrieved for user ${user_id}`)
  }

  // Helper methods for database operations
  execute(query, params, successMsg) {
    return new Promise((resolve, reject) => {
      this.client.run(query, params, (err) => {
        if (err) {
          this.logger.log_err(err.message)
          reject(err)
        } else {
          this.logger.log_info(successMsg)
          resolve()
        }
      })
    })
  }

  fetch(query, params, successMsg) {
    return new Promise((resolve, reject) => {
      this.client.all(query, params, (err, rows) => {
        if (err) {
          this.logger.log_err(err.message)
          reject(err)
        } else {
          this.logger.log_info(successMsg)
          resolve(rows)
        }
      })
    })
  }
}
