/**
 * logs a single request
 * You may also want to consider other logger middlewares like
 * - [morgan](https://npmjs.com/package/morgan)
 * @param {object} log
 * @returns {import('./types').Middleware}
 */
export const logRequest = (log) => (req, res, next) => {
  const start = Date.now()

  res.once('finish', () => {
    const ms = Date.now() - start
    const { method, url } = req
    const status = res.statusCode
    const userAgent = req.headers?.['user-agent']
    const level = status < 400
      ? 'info'
      : status < 500
        ? 'warn'
        : 'error'
    log[level]('%j', { status, method, url, userAgent, ms })
  })

  next()
}
