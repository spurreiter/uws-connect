import { Readable } from 'stream'
import cookie from 'cookie'
import qs from 'qs'

/** @typedef {import('node:stream').ReadableOptions} ReadableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */

export class Request extends Readable {
  /**
   * @param {uWs.HttpResponse} rawRes
   * @param {uWs.HttpRequest} rawReq
   * @param {ReadableOptions} [options]
   */
  constructor (rawRes, rawReq, options) {
    super(options)
    this._req = rawReq
    this._res = rawRes

    this.headers = {}
    this.params = {}

    this._req.forEach((key, value) => {
      // @ts-ignore
      this.headers[key.toLowerCase()] = value
    })
    this.method = this._req.getMethod().toUpperCase()

    this.connection = this.socket = {}
    Object.defineProperty(this.socket, 'remoteAddress',
      {
        get: () => rawRes?.getRemoteAddressAsText &&
        Buffer.from(rawRes.getRemoteAddressAsText()).toString()
      }
    )

    this._res.onData((arrayBuffer, isLast) => {
      const chunk = Buffer.from(arrayBuffer)
      this.emit('data', chunk)
      if (isLast) {
        this._res._ended = true
        this.emit('end')
      }
    })
  }

  /**
   * request url
   */
  get url () {
    return this._url || this._req.getUrl()
  }

  set url (newUrl) {
    this._url = newUrl
  }

  /**
   * request query
   *
   * uses [qs](https://www.npmjs.com/package/qs) for query string parsing
   *
   * @returns {object}
   */
  get query () {
    return qs.parse(this._req.getQuery())
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
      !this._res._ended && this._res.pause()
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
      !this._res._ended && this._res.resume()
    }
    return this
  }

  /**
   * get `uWs.HttpRequest.getParameter()`
   * @param {number} index
   * @returns {string}
   */
  getParameter (index) {
    return this._req.getParameter(index)
  }
}
