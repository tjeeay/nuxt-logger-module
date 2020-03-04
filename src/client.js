import consola from 'consola/dist/consola.browser'
import Logger from './logger'

class ClientLogger extends Logger {
  constructor(options = {}) {
    super({ providers: [consola], ...options })
  }

  getLogger(module) {
    return new ClientLogger({
      module,
      ...this.options,
    })
  }
}

export default function createLogger(options) {
  if (!window.$logger) {
    window.$logger = new ClientLogger(options)
  }
  return window.$logger
}
