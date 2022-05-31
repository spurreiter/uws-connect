import { STATUS_CODES } from 'http'
import { Writable } from 'stream'
import cookie from 'cookie'

/** @typedef {import('node:stream').WritableOptions} WritableOptions */
/** @typedef {import('uWebSockets.js').HttpRequest} uWs.HttpRequest */
/** @typedef {import('./Request.js').Request} Request */
/** @typedef {import('uWebSockets.js').HttpResponse} uWs.HttpResponse */

const COOKIE_DEFAULTS = {
  path: '/',
  domain: undefined
}

const CONTENT_TYPE = 'Content-Type'
const CONTENT_LENGTH = 'Content-Length'
const TRANSFER_ENCODING = 'Transfer-Encoding'

const getStatus = (status) => `${status} ${STATUS_CODES[status] || ''}`

export class Response extends Writable {
  /**
   * @param {uWs.HttpResponse} uwsRes
   * @param {Request} req
   * @param {WritableOptions} [options]
   */
  constructor (uwsRes, req, options) {
    super(options)
    this._uwsRes = uwsRes
    this._req = req
    this._headers = {}
    this._status = 200
    this.headersSent = false
    this.finished = false // @deprecated since: v12.16.0 but used by serve-static / on-finished

    this._uwsRes.onAborted(() => {
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
    this._uwsRes.writeStatus(getStatus(this._status))

    for (const [lc, [key, value]] of Object.entries(this._headers)) {
      // never set content-length as request crashes then
      if (lc === 'content-length') continue
      this._uwsRes.writeHeader(key, value)
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
    const lastOffset = this._uwsRes.getWriteOffset()
    this._writeHeaders()
    const drain = this._uwsRes.write(chunk)
    if (!drain) {
      this._uwsRes.onWritable(offset => {
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
   * end a request (without backpressure handling).
   * use `res.send` if backpressure handling is needed.
   * @param {string|Buffer} body
   * @param {boolean} [closeConnection]
   */
  // @ts-expect-error
  end (body, closeConnection) {
    if (this.destroyed || this.finished) return
    // no backpressure handling here
    this._writeHeaders()
    this._uwsRes.end(body, closeConnection)
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
    const lastOffset = this._uwsRes.getWriteOffset()
    // @ts-expect-error
    const [drain] = this._uwsRes.tryEnd(body)
    if (!drain) {
      this._uwsRes.onWritable(offset => {
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
   * @param {number} [status]
   * @param {object} [headers]
   */
  send (data, status, headers = {}) {
    // @ts-expect-error
    const chunk = data || this.body
    /** @type {Buffer|string} */
    let buffer = ''

    for (const [key, value] of Object.entries(headers)) {
      this.setHeader(key, value)
    }

    if (chunk !== undefined) {
      switch (typeof chunk) {
        case 'string':
          setDefaultContentType(this, 'text/plain')
          buffer = Buffer.from(chunk)
          break
        case 'boolean':
        case 'number':
        case 'object':
          if (Buffer.isBuffer(chunk)) {
            setDefaultContentType(this, 'application/octet-stream', false)
            buffer = chunk
          } else {
            setDefaultContentType(this, 'application/json')
            buffer = Buffer.from(JSON.stringify(chunk))
          }
          break
        default:
          buffer = ''
          break
      }
    }

    this.statusCode = status || this._status || 200

    // strip irrelevant headers
    if ([204, 205, 304].includes(this.statusCode)) {
      this.removeHeader(CONTENT_TYPE)
      this.removeHeader(CONTENT_LENGTH)
      this.removeHeader(TRANSFER_ENCODING)
      buffer = ''
    }

    if (this._req.method === 'HEAD') {
      buffer = ''
    }

    this.tryEnd(buffer)
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

/**
 * set content type if not set already
 * @param {any} res Response
 * @param {string} type
 * @param {string|false} encoding
 */
function setDefaultContentType (res, type, encoding = 'utf-8') {
  if (!res.getHeader(CONTENT_TYPE)) {
    const contentType = type + (encoding ? '; charset=' + encoding : '')
    res.setHeader(CONTENT_TYPE, contentType)
  }
}
