import { getLogger } from '../../logger'
const logger = getLogger('errorMiddleware')

export default function() {
  // register ready, close hooks
  const hooks = ['ready', 'close']
  hooks.forEach(hook => {
    this.nuxt.hook(hook, () => {
      global.$logger.info(`nuxt ${hook}.`)
    })
  })

  // register global error handler
  this.nuxt.hook('render:errorMiddleware', function(app) {
    app.use(function(err, req, res, next) {
      if (err) {
        logger.error(
          `${req.method} ${req.originalUrl}`,
          'Unhandled server error:',
          err,
        )
      }
      return next(err)
    })
  })
}

module.exports.meta = {
  name: 'nuxt-logger-module/submodules/hooks.listener'
}
