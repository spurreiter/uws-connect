import { Readable } from 'stream'
import cookie from 'cookie'

/** @typedef {import('node:stream').ReadableOptions} ReadableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */

/**
 * @typedef {ReadableOptions} ReadableOptionsExt
 * @property {'http'|'https'} protocol
 */

export class Request extends Readable {
  /**
   * @param {uWs.HttpResponse} uwsRes
   * @param {uWs.HttpRequest} uwsReq
   * @param {ReadableOptionsExt} [options]
   */
  constructor (uwsRes, uwsReq, options = {}) {
    // @ts-expect-error
    const { protocol = 'http', ...opts } = options
    super(opts)
    this._uwsReq = uwsReq
    this._uwsRes = uwsRes

    this.headers = {}
    this.params = {}
    /** @type {'http'|'https'} */
    this.protocol = protocol

    this._uwsReq.forEach((key, value) => {
      // @ts-ignore
      this.headers[key.toLowerCase()] = value
    })
    this.method = this._uwsReq.getMethod().toUpperCase()

    this.connection = this.socket = {}
    Object.defineProperty(this.socket, 'remoteAddress',
      {
        get: () => uwsRes?.getRemoteAddressAsText &&
        Buffer.from(uwsRes.getRemoteAddressAsText()).toString()
      }
    )

    this._uwsRes.onData((arrayBuffer, isLast) => {
      const chunk = Buffer.from(arrayBuffer)
      this.emit('data', chunk)
      if (isLast) {
        this._uwsRes._ended = true
        this.emit('end')
      }
    })
  }

  /**
   * request url
   */
  get url () {
    return this._url || (this._url = this._uwsReq.getUrl())
  }

  set url (newUrl) {
    this._url = newUrl
  }

  /**
   * request query
   *
   * uses URLSearchParams for query string parsing
   *
   * @returns {object}
   */
  get query () {
    const searchParams = new URLSearchParams(this._uwsReq.getQuery())
    const query = {}
    for (const [name, value] of searchParams.entries()) {
      if (query[name]) {
        Array.isArray(query[name])
          ? query[name].push(value)
          : (query[name] = [query[name], value])
      } else {
        query[name] = value
      }
    }
    return query
  }

  /**
   * get parsed cookies
   * @returns {object}
   */
  get cookies () {
    return cookie.parse(this.headers.cookie || '')
  }

  _read (size) {
    this.resume()
  }

  /**
   * pauses stream
   */
  pause () {
    if (!this.isPaused()) {
      !this._uwsRes._ended && this._uwsRes.pause()
      super.pause()
    }
    return this
  }

  /**
   * resumes stream
   */
  resume () {
    if (this.isPaused()) {
      super.resume()
      !this._uwsRes._ended && this._uwsRes.resume()
    }
    return this
  }

  /**
   * get `uWs.HttpRequest.getParameter()`
   * @param {number} index
   * @returns {string}
   */
  getParameter (index) {
    return this._uwsReq.getParameter(index)
  }
}
