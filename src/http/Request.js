import { Readable } from 'stream'
import cookie from 'cookie'

/** @typedef {import('node:stream').ReadableOptions} ReadableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */

export class Request extends Readable {
  /**
   * @param {uWs.HttpResponse} uwsRes
   * @param {uWs.HttpRequest} uwsReq
   * @param {ReadableOptions} [options]
   */
  constructor (uwsRes, uwsReq, options) {
    super(options)
    this._uwsReq = uwsReq
    this._uwsRes = uwsRes

    this.headers = {}
    this.params = {}

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
    return Object.fromEntries(new URLSearchParams(this._uwsReq.getQuery()))
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
