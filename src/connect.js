import util from 'util'
import { Request } from './http/Request.js'
import { Response } from './http/Response.js'
import { finalHandler } from './utils/finalHandler.js'

const { isAsyncFunction } = util.types

/** @typedef {import('./types').Middleware} Middleware */
/** @typedef {import('./utils/HttpError.js').HttpError} HttpError */
/** @typedef {import('uWebSockets.js').HttpResponse} uWS.HttpResponse */
/** @typedef {import('uWebSockets.js').HttpRequest} uWS.HttpRequest */

/**
 * connects middleware handlers
 * @param {object} [options]
 * @param {Function} [options.finalHandler] final handler for connect stack
 * @param {boolean} [options.isSsl=false] sets req.protocol
 * @param {(err: HttpError|Error|undefined|null, req: Request, res: Response) => void} [options.finalHandler]
 * @returns {(...Middleware) => (res: uWS.HttpResponse, req: uWS.HttpRequest) => void}
 */
export const connect = (options = {}) => (...handlers) => {
  const done = options.finalHandler
  const protocol = options.isSsl ? 'https' : 'http'

  const stack = handlers
    .flat(Infinity)
    .map(fn => {
      if (typeof fn !== 'function') throw new Error('need function')
      const isAsync = isAsyncFunction(fn)
      return [fn, isAsync]
    })

  /**
   * @param {uWS.HttpResponse} response
   * @param {uWS.HttpRequest} request
   */
  return (response, request) => {
    // @ts-ignore
    const req = new Request(response, request, { protocol })
    const res = new Response(response, req)

    let i = 0

    /**
     * @param {Error} [err]
     */
    function next (err) {
      const [fn, isAsync] = stack[i++] || []

      // early abort; no support for error handlers (like with expressjs)
      if (err || !fn) {
        done ? done(err, req, res) : finalHandler(err, res)
        return
      }
      try {
        const p = fn(req, res, next)
        if (isAsync || p?.then) {
          p.then(() => next()).catch(next)
        }
      } catch (/** @type {Error|any} */err) {
        done ? done(err, req, res) : finalHandler(err, res)
      }
    }

    next()
  }
}
