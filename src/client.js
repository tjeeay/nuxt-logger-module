import consola from 'consola/dist/consola.browser'
import Logger from './logger'

// fallback to window.console due to consola has compatibility issue in IE
const isIE = navigator.userAgent.indexOf('MSIE') > -1 || !!document.documentMode
const provider = isIE ? console : consola

class ClientLogger extends Logger {
  constructor(options = {}) {
    super({ providers: [provider], ...options })
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
