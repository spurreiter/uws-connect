import { STATUS_CODES } from 'http'
import { Writable } from 'stream'
import cookie from 'cookie'

const COOKIE_DEFAULTS = {
  path: '/',
  domain: undefined
}

/** @typedef {import('node:stream').WritableOptions} WritableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */

const getStatus = (status) => `${status} ${STATUS_CODES[status] || ''}`

export class Response extends Writable {
  /**
   * @param {uWs.HttpResponse} rawRes
   * @param {uWs.HttpRequest} [rawReq]
   * @param {WritableOptions} [options]
   */
  constructor (rawRes, rawReq, options) {
    super(options)
    this._res = rawRes
    // this._req = rawReq // currently not in use
    this._headers = {}
    this._status = 200
    this.headersSent = false
    this.finished = false // @deprecated since: v12.16.0 but used by serve-static / on-finished

    this._res.onAborted(() => {
      this.destroy()
      this.emit('close')
      this.removeAllListeners()
    })
  }

  /**
   * sets response status code
   * @param {number} status
   */
  set statusCode (status) {
    if (!isNaN(status)) {
      this._status = +status
    }
  }

  /**
   * set response status code
   * @returns {number}
   */
  get statusCode () {
    return this._status
  }

  /**
   * get response header value
   * @param {string} key
   * @returns {any}
   */
  getHeader (key) {
    return (this._headers[key.toLowerCase()] || [])[1]
  }

  /**
   * set response header
   * @param {string} key
   * @param {string|number} value
   */
  setHeader (key, value) {
    this._headers[key.toLowerCase()] = [key, String(value)]
  }

  /**
   * remove response header by key
   * @param {string} key
   */
  removeHeader (key) {
    const lc = key.toLowerCase()
    delete this._headers[lc]
  }

  /**
   * write headers only before end or the first write
   * @private
   */
  _writeHeaders () {
    if (this.headersSent) return
    this._res.writeStatus(getStatus(this._status))

    for (const [lc, [key, value]] of Object.entries(this._headers)) {
      // never set content-length as request crashes then
      if (lc === 'content-length') continue
      this._res.writeHeader(key, value)
    }
    this.headersSent = true
  }

  /**
   * set cookie
   * @param {string} name
   * @param {string} value
   * @param {import('cookie').CookieSerializeOptions} options
   */
  cookie (name, value = '', options = {}) {
    const opts = { ...COOKIE_DEFAULTS, ...options }
    const setCookie = cookie.serialize(name, value, opts)
    const key = `set-cookie--${name}-${opts.path}-${opts.domain || ''}`
    this._headers[key] = ['Set-Cookie', setCookie]
  }

  /**
   * clear cookie
   * @param {string} name
   * @param {import('cookie').CookieSerializeOptions} options
   */
  clearCookie (name, options) {
    this.cookie(name, '', { ...options, expires: new Date(0) })
  }

  /**
   * drained write to uWs.HttpResponse
   * @param {string|Buffer} chunk
   * @returns {boolean} `false` if chunk was not or only partly written
   */
  write (chunk) {
    if (this.destroyed || this.finished) return true
    const lastOffset = this._res.getWriteOffset()
    this._writeHeaders()
    const drain = this._res.write(chunk)
    if (!drain) {
      this._res.onWritable(offset => {
        const sliced = chunk.slice(offset - lastOffset)
        const drain = this.write(sliced) // drain === true; chunk is now fully written
        if (drain) { this.emit('drain') }
        return drain
      })
    }
    return drain
  }

  /**
   * Writable _write implementation
   * @param {string|Buffer} chunk
   * @param {string} encoding (ignored)
   * @param {Function} callback
   */
  _write (chunk, encoding, callback) {
    const drain = this.write(chunk)
    const err = drain ? null : new Error('backpressure')
    callback(err)
  }

  /**
   * end a request
   * @param {string|Buffer} body
   * @param {boolean} [closeConnection]
   */
  // @ts-ignore
  end (body, closeConnection) {
    if (this.destroyed || this.finished) return
    // no backpressure handling here
    this._writeHeaders()
    this._res.end(body, closeConnection)
    super.end()
    this._finish()
  }

  /**
   * drained write with end to uWs.HttpResponse
   * @param {string|Buffer} body
   * @returns {boolean} `false` if body was not or only partly written
   */
  tryEnd (body) {
    if (this.destroyed || this.finished) return true
    this._writeHeaders()
    const lastOffset = this._res.getWriteOffset()
    // @ts-ignore
    const [drain] = this._res.tryEnd(body)
    if (!drain) {
      this._res.onWritable(offset => {
        const sliced = body.slice(offset - lastOffset)
        return this.tryEnd(sliced)
      })
    } else {
      this._finish()
    }
    return drain
  }

  /**
   * send a response
   * @param {string|Buffer|object|null|boolean|number} data
   * @param {*} status
   * @param {*} headers
   */
  send (data, status = 200, headers = {}) {
    // @ts-ignore
    const _data = data || this.body
    let body
    if (_data instanceof Buffer || typeof _data === 'string') {
      body = _data
    } else if (typeof _data === 'object') {
      this.setHeader('Content-Type', 'application/json; charset=utf-8')
      body = JSON.stringify(_data)
    } else {
      body = `${_data ?? ''}`
    }

    for (const [key, value] of Object.entries(headers)) {
      this.setHeader(key, value)
    }
    this.statusCode = status
    this.tryEnd(body)
  }

  /**
   * @private
   */
  _finish () {
    this.finished = true
    this.emit('finish')
    this.removeAllListeners()
    this.destroy()
  }
}
