import { formatTimestamp } from './utils/format'
import levels from './levels'

const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

export default class Logger {
  constructor(options = {}) {
    this.options = options
    this.module = options.module || 'global'
    this.providers = options.providers || []

    this.levels = options.levels || levels
    this.level = (options.level || defaultLevel).toLowerCase()
    this.levelCode = this.levels[this.level]
    if (typeof this.levelCode !== 'number') {
      throw new TypeError(`Unknown logger level: ${this.level}`)
    }

    // wrap logger functions
    for (const level in this.levels) {
      this[level] = this.wrapFn(level)
    }
  }

  wrapFn(level) {
    return function(...args) {
      if (typeof this.beforeLog === 'function') {
        this.beforeLog(level, ...args)
      }

      const timestamp = formatTimestamp(new Date())
      const prefix = `[${timestamp}][${level.toUpperCase()}][${this.module}]`

      if (typeof args[0] === 'string') {
        args[0] = prefix + ' ' + args[0]
      } else {
        args.unshift(prefix)
      }

      this.providers.forEach(provider => provider[level](...args))
    }
  }

  getLogger() {
    throw new Error('Not Implemented')
  }
}
