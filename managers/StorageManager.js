const { Database } = require("sqlite3").verbose();
const Logger = require("../utils/logger");

module.exports = class StorageManager {
  constructor(config) {
    this.logger = new Logger("STORAGE");
    this.client = new Database(config.dbPath, (err) => {
      if (err) this.logger.log_err("Error opening database:", err.message);
    });
  }

  async migrate_db() {
    // TODO: refactor database schema to optimize queries
    const query = `
      CREATE TABLE IF NOT EXISTS messages (
        user_id INTEGER NOT NULL,
        server_id TEXT NOT NULL,
        username TEXT NOT NULL,
        time_created INTEGER NOT NULL
      );
    `;
    await this.execute(
      query,
      [],
      'Table "messages" created or already exists.',
    );
  }

  async save_message({
    user_id,
    username,
    server_id,
    time_created = Date.now(),
  }) {
    const query = `
      INSERT INTO messages (user_id, username,server_id,time_created)
      VALUES (?, ?, ?, ? );
    `;
    await this.execute(
      query,
      [user_id, username, server_id, time_created],
      `Message saved for user ${username}`,
    );
  }

  async get_period_stats(server_id, start, end) {
    const query = `
    WITH UserMessageCounts AS (
      SELECT
        user_id,
        COUNT(*) AS message_count
      FROM
        messages
      WHERE
        server_id = ? AND
        time_created BETWEEN ? AND ?
      GROUP BY
        user_id
    ),
    OverallAverage AS (
      SELECT
        AVG(message_count) AS overall_avg
      FROM
        UserMessageCounts
    )
    SELECT
      u.user_id,
      u.message_count,
      o.overall_avg,
      (u.message_count * 1.0 / o.overall_avg) AS relative_to_avg
    FROM
      UserMessageCounts u,
      OverallAverage o;
  `;
    return await this.fetch(
      query,
      [server_id, start, end],
      `Messages retrieved between ${start} and ${end}`,
    );
  }

  async get_user_period_stats(start, end, server_id, user_id) {
    const query = `
    WITH UserMessageCounts AS (
      SELECT
        user_id,
        COUNT(*) AS message_count
      FROM
        messages
      WHERE
        time_created BETWEEN ? AND ?
        AND server_id = ?
      GROUP BY
        user_id
    ),
    OverallAverage AS (
      SELECT
        AVG(message_count) AS overall_avg
      FROM
        UserMessageCounts
    )
    SELECT
      u.user_id,
      u.message_count,
      o.overall_avg,
      (u.message_count * 1.0 / o.overall_avg) AS relative_to_avg
    FROM
      UserMessageCounts u,
      OverallAverage o
    WHERE
      u.user_id = ?;
  `;

    return await this.execute(
      query,
      [start, end, server_id, user_id],
      `stats get for user_id ${user_id}`,
    );
  }

  // Helper methods for database operations
  execute(query, params, successMsg) {
    return new Promise((resolve, reject) => {
      this.client.run(query, params, (err) => {
        if (err) {
          this.logger.log_err(err.message);
          reject(err);
        } else {
          this.logger.log_info(successMsg);
          resolve();
        }
      });
    });
  }

  fetch(query, params, successMsg) {
    return new Promise((resolve, reject) => {
      this.client.all(query, params, (err, rows) => {
        if (err) {
          this.logger.log_err(err.message);
          reject(err);
        } else {
          this.logger.log_info(successMsg);
          resolve(rows);
        }
      });
    });
  }
};
