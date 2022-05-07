
/** @typedef {import('./types').Middleware} Middleware */

/**
 * achieves compatibility with express `req.params`
 * Use with care; This is much slower than the uWs method `req.getParameter(index)`.
 * ```js
 * app.get('/users/:user',
 *  params('/users/:user'), // needs same route as with router
 *  (req, res) => res.send(req.params)
 * )
 * ```
 * @param {string} route
 * @returns {Middleware}
 */
export function params (route = '') {
  const params = []

  route.split('/')
    .filter(p => p.indexOf(':') === 0)
    .forEach(p => { params.push(p.substring(1)) })

  return (req, res, next) => {
    req.params = {}

    for (let i = 0; i < params.length; i++) {
      const key = params[i]
      req.params[key] = req.getParameter(i)
    }

    next()
  }
}
