const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
}

module.exports = class Logger {
  constructor(name) {
    this.name = name
  }

  log_err(message) {
    console.error(`${colors.Bright}${colors.Red}[${this.name}:ERR]${colors.Reset} ${message}`)
  }

  log_info(message) {
    console.info(`${colors.Bright}${colors.Green}[${this.name}:INFO]${colors.Reset} ${message}`)
  }

  log_warning(message) {
    console.warn(`${colors.Bright}${colors.Yellow}[${this.name}:WARN]${colors.Reset} ${message}`)
  }
}
