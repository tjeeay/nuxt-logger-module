import fs from 'fs'
import path from 'path'
import createServerLogger from './server'
import loggerMiddleware from './server-middleware'

const defaults = {
  clientLogger: 'nuxt-logger-module/dist/client.js',
  serverLogger: 'nuxt-logger-module/src/server.js',
}

export default function(moduleOptions) {
  const options = { ...this.options.logger, ...moduleOptions }
  const { client: clientOptions = {}, server: serverOptions = {} } = options

  delete options.client
  delete options.server

  const isProd = process.env.NODE_ENV === 'production'
  options.level = isProd ? 'info' : 'debug'
  clientOptions.factory = clientOptions.factory || defaults.clientLogger
  serverOptions.factory = serverOptions.factory || defaults.serverLogger
  serverOptions.logsDir = serverOptions.logsDir || '~/logs'
  serverOptions.logsPath = serverOptions.logsPath || '/logger/logs'
  if (typeof serverOptions.isEnableView === 'undefined') {
    serverOptions.isEnableView = !isProd
  }

  const srcPath = path.resolve(this.options.srcDir)

  function convertToRelativePath(target, prop, baseDir) {
    if (!path.isAbsolute(target[prop]) && !target[prop].startsWith('~')) {
      target[prop] = path.join('~', target[prop])
    }
    target[prop] = path.relative(baseDir, target[prop].replace('~', baseDir))
    target[prop] = target[prop].split(/[\\/]/g).join(path.posix.sep)
  }

  convertToRelativePath(serverOptions, 'logsDir', srcPath)

  // create if logs directory is not exists
  if (!fs.existsSync(serverOptions.logsDir)) {
    fs.mkdirSync(serverOptions.logsDir)
  }

  // initialize default server logger
  createServerLogger({
    ...options,
    ...serverOptions,
  })

  // add server middleware
  this.options.serverMiddleware = this.options.serverMiddleware || []
  this.options.serverMiddleware.push({
    path: serverOptions.logsPath,
    handler: loggerMiddleware(serverOptions),
  })

  const serverPluginFile = 'generated.plugin.logger.server.js'
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.template'),
    fileName: serverPluginFile,
    ssr: true,
    options: {
      ...options,
      ...serverOptions,
    },
  })

  const clientPluginFile = 'generated.plugin.logger.client.js'
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.template'),
    fileName: clientPluginFile,
    ssr: false,
    options: {
      ...options,
      ...clientOptions,
    },
  })


  // register nuxt hooks
  this.addModule([path.resolve(__dirname, './submodules/hooks.listener.js')], true)

  // extend plugins order: recommend put logger plugin to the first
  const originExtendPlugins = this.options.extendPlugins || (plugins => plugins)
  this.options.extendPlugins = function(plugins) {
    const newPlugins = originExtendPlugins(plugins)

    const serverPluginIndex = newPlugins.findIndex(p => (p.src || p).endsWith(serverPluginFile))
    const clientPluginIndex = newPlugins.findIndex(p => (p.src || p).endsWith(clientPluginFile))

    const serverPlugin = newPlugins[serverPluginIndex]
    const clientPlugin = newPlugins[clientPluginIndex]
    
    newPlugins.splice(serverPluginIndex, 1)
    newPlugins.splice(clientPluginIndex, 1)
    newPlugins.unshift(serverPlugin, clientPlugin)

    return newPlugins
  }
}

module.exports.meta = require('../package.json')
