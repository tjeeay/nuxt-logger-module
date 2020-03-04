import fs from 'fs'
import path from 'path'
import util from 'util'
import consola from 'consola'
import Logger from './logger'
import { formatDate } from './utils/format'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Overwrite formatLogObj, formatArgs method
 * keep log message simple and without any style color
 */
class PlainReporter extends consola.BasicReporter {
  formatArgs(args) {
    const _args = args.map(arg => {
      if (arg && typeof arg.stack === 'string') {
        return arg.message + '\n' + this.formatStack(arg.stack)
      }
      return arg
    })

    return util.format(..._args)
  }

  formatLogObj(logObj) {
    const message = this.formatArgs(logObj.args)
    return this.filterAndJoin([message])
  }
}

class ServerLogger extends Logger {
  constructor(options = {}) {
    super(options)
    this.logStream = null
    this.logsDir = options.logsDir
  }

  get logPath() {
    return path.resolve(this.logsDir, `${this.currentDate}.log`)
  }

  createLogStream() {
    this.currentDate = formatDate(new Date(), '-')
    this.logStream = fs.createWriteStream(this.logPath, { flags: 'a' })

    this.providers = []
    this.providers.push(
      consola.create({
        level: this.levelCode,
        reporters: [new PlainReporter()],
        stderr: this.logStream,
        stdout: this.logStream,
      }),
    )

    if (isDev) {
      this.providers.push(
        consola.create({
          level: this.levelCode,
          defaults: { tag: this.module || '' },
        }),
      )
    }
  }

  beforeLog() {
    if (!this.logStream) {
      this.createLogStream()
    }

    const date = formatDate(new Date(), '-')
    if (date !== this.currentDate) {
      this.logStream.end()
      this.createLogStream()
    }
  }

  getLogger(module) {
    return new ServerLogger({
      module,
      ...this.options,
    })
  }
}

export default function createLogger(options) {
  if (!global.$logger) {
    global.$logger = new ServerLogger(options)
  }

  return global.$logger
}
