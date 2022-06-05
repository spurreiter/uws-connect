/* eslint camelcase: off */

// @ts-ignore
import uWS from 'uWebSockets.js'
import { connect } from './connect.js'
import { nap } from './utils/nap.js'

/** @typedef {import('./types.d').AppOptions} AppOptions */

/**
 * A uWs App wrapper for connect compatible middlewares
 * @param {AppOptions} [options]
 * @returns {App}
 */
// @ts-ignore
export function App (options) {
  if (!(this instanceof App)) {
    // @ts-ignore
    return new App(options)
  }

  const {
    isSsl = false,
    isSilent = true,
    finalHandler,
    ...opts
  } = options || {}

  let listenSocket
  const app = isSsl ? uWS.SSLApp(opts) : uWS.App(opts)
  this.app = app

  if (isSilent) {
    // @ts-ignore
    uWS._cfg('silent') // keyCode = 655 + 1 (addon.cpp)
  }

  this.address = () => {
    if (listenSocket) {
      return { port: uWS.us_socket_local_port(listenSocket) }
    }
  }

  /**
   * Listens to hostname & port. Callback hands either false or a listen socket.
   * @param {[host: uWS.RecognizedString, port: number]|[port: number]|[port: number, options: uWS.ListenOptions]} args
   * @returns {Promise<uWS.us_listen_socket>}
   */
  this.listen = (...args) => {
    return new Promise((resolve, reject) => {
      const cb = (socket) => {
        /* c8 ignore next 4 */
        if (!socket) {
          reject(new Error('Could not connect'))
          return
        }
        listenSocket = socket
        resolve(socket)
      }
      // @ts-ignore
      args.push(cb)
      // @ts-ignore
      app.listen(...args)
    })
  }

  /**
   * Close listening socket
   * @returns {Promise<void>}
   */
  this.close = async () => {
    uWS.us_listen_socket_close(listenSocket)
    await nap(50)
  }

  const methods = ['get', 'post', 'options', 'del', 'patch', 'put', 'head',
    'connect', 'trace', 'any']
  // @ts-ignore
  const glue = connect({ finalHandler, isSsl })
  for (const method of methods) {
    this[method] = (pattern, ...handlers) => {
      app[method](pattern, glue(...handlers))
      return this
    }
  }

  const others = ['ws', 'publish', 'numSubscribers', 'addServerName',
    'removeServerName', 'missingServerName']
  for (const method of others) {
    this[method] = (...args) => {
      app[method](...args)
      return this
    }
  }

  // @ts-ignore
  return this
}
