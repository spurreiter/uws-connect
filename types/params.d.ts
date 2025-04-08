/** @typedef {import('./types.js').Middleware} Middleware */
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
export function params(route?: string): Middleware;
export type Middleware = typeof import("./types.js").Middleware;
