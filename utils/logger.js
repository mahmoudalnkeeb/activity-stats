module.exports = class Logger {
  constructor(name) {
    this.name = name
  }
  log_err(message) {
    console.error(`[${this.name}:ERR] ${message}`)
  }
  log_info(message) {
    console.info(`[${this.name}:INFO] ${message}`)
  }
  log_warning(message) {
    console.warn(`[${this.name}:WARN] ${message}`)
  }
}
