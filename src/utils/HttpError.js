import { STATUS_CODES } from 'http'

export class HttpError extends Error {
  /**
   * @param {number} [status=500]
   * @param {string} [message]
   * @param {Error} [err]
   */
  constructor(status = 500, message, err) {
    message = message || STATUS_CODES[status] || String(status)
    super(message)
    this.name = this.constructor.name
    this.status = status
    /* c8 ignore next 3 */
    if (err) {
      this.error = err
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
      /* c8 ignore next 3 */
    } else {
      this.stack = new Error(message).stack
    }
  }
}
