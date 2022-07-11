/**
 * querystring parser for utf-8 encoded text
 * @param {string} text
 * @returns {object} parsed object
 */
export function parse (text) {
  const params = new URLSearchParams(text)
  const body = {}
  for (const [name, value] of params.entries()) {
    if (body[name]) {
      Array.isArray(body[name])
        ? body[name].push(value)
        : (body[name] = [body[name], value])
    } else {
      body[name] = value
    }
  }
  return body
}
