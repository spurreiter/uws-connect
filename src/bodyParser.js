import { HttpError } from './utils/HttpError.js'
import * as qs from './utils/qs.js'

export const CONTENT_TYPE_JSON = 'application/json'
export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded'

/**
 * @param {string} v
 * @param {number} [def]
 * @returns {string|number}
 */
const toNumber = (v, def) => {
  const n = +v
  return isNaN(n) ? def || v : n
}

/**
 * body-parser for json and url-encoded data
 *
 * form data is parsed with [qs](https://www.npmjs.com/package/qs).
 *
 * @param {object} [options]
 * @param {number} [options.limit=1e6] max. content-length in bytes
 * @param {string} [options.type] default expected content-type
 * @returns {import('./types.js').BodyParserMiddleware}
 */
export function bodyParser(options) {
  const { limit = 1e6, type } = options || {}

  /**
   * @param {import('./types.js').BodyParserRequest} req
   * @param {import('./http/Response').Response} res
   * @param {function} next
   */
  return (req, res, next) => {
    const buffer = []
    let length = 0

    const contentType = type || req.headers['content-type'] || ''
    const contentLength = Number(
      req.headers['content-length'] === undefined
        ? NaN
        : toNumber(req.headers['content-length'], NaN)
    )

    const onEnd = (err) => {
      req.raw = Buffer.concat(buffer)
      const body = (req.text = req.raw.toString())

      if (contentType.indexOf(CONTENT_TYPE_JSON) === 0) {
        try {
          req.body = JSON.parse(body)
        } catch (/** @type {Error|any} */ e) {
          err = new HttpError(400, 'err_json_parse', e)
        }
      } else if (contentType.indexOf(CONTENT_TYPE_FORM) === 0) {
        try {
          req.body = qs.parse(body)
          /* c8 ignore next 3 */
        } catch (/** @type {Error|any} */ e) {
          err = new HttpError(400, 'err_urlencoded_parse', e)
        }
      }

      next(err)
    }

    const limitExceeded = () => {
      length = limit + 1
      next(new HttpError(413, 'err_limit'))
    }

    if (contentLength > limit) {
      limitExceeded()
      return
    }

    req.on('data', (chunk) => {
      if (length > limit) {
        return
      }

      length += chunk.length

      if (length > limit || length > contentLength) {
        limitExceeded()
        return
      }

      buffer.push(chunk)
    })

    req.on('end', () => onEnd())
  }
}
