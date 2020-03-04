import controller from './controller'

export default function loggerMiddleware(options) {
  return function(req, res, next) {
    const context = { req, res, options }

    let url = req.url.toLowerCase()
    if (url !== '/' && url.split('').pop() === '/') {
      url = url.substr(0, url.length - 1)
    }

    if (url === '/record') {
      return controller.record(context, next)
    }

    return controller.default(context, next)
  }
}
