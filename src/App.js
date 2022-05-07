/* eslint camelcase: off */

// @ts-ignore
import uWs from 'uWebSockets.js'
import { connect } from './connect.js'
import { nap } from './utils/nap.js'

/**
 * A uWs App wrapper for connect compatible middlewares
 * @param {import('./types').AppOptions} [options]
 * @returns {import('./types').App}
 */
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
  const app = isSsl ? uWs.SSLApp(opts) : uWs.App(opts)
  this.app = app

  if (isSilent) {
    // @ts-ignore
    uWs._cfg('AAAAABBBBB') // keyCode = 655 + 1 (addon.cpp)
  }

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

  this.close = async () => {
    uWs.us_listen_socket_close(listenSocket)
    await nap(50)
  }

  const methods = ['get', 'post', 'options', 'del', 'patch', 'put', 'head',
    'connect', 'trace', 'any']
  // @ts-ignore
  const glue = connect({ finalHandler })
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
