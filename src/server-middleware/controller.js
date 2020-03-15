import { EOL } from 'os'
import { readdir } from 'fs'
import serveStatic from 'serve-static'

export default {
  get logger() {
    return global.$logger.getLogger('logger')
  },

  default({ req, res, options }, next) {
    if (options.isEnableView !== true) return next()

    if (req.url !== '/') {
      return serveStatic(options.logsDir)(req, res, next)
    }

    readdir(options.logsDir, (err, files) => {
      if (err) {
        return next(err)
      }

      const list = files
        .map(f => `<li><a href="${options.logsPath}/${f}">${f}</a></li>`)
        .join('')

      const body = `<ul style="padding: 0; list-style: none;">${list}</ul>`

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html; charset=utf-8',
      })
      res.end(body)
    })
  },

  record({ req, res }) {
    if (req.method !== 'POST') {
      res.writeHead(501, 'only support POST')
      return res.end()
    }

    let body = ''
    req.on('data', data => {
      body += data

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) {
        req.connection.destroy()
      }
    })

    req.on('end', () => {
      let log = body
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const userAgent = req.headers['user-agent'] || '-'

      try {
        const data = JSON.parse(body)

        log = data.message || ''
        delete data.message

        if (data.page) {
          log += `${data.page} ${data.statusCode}`
          delete data.page
          delete data.statusCode
        }

        log += `"${userAgent}" ${ip}`

        if (Object.keys(data).length > 0) {
          log += EOL
          log += JSON.stringify(data, null, 2)
        }
      } catch (error) {
        // ignore parse error
      }

      this.logger.error(log)
      res.writeHead(201)
      res.end()
    })
  },
}
