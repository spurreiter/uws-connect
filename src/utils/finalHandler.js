/** @typedef {import('../http/Response.js').Response} Response */
/** @typedef {import('../utils/HttpError.js').HttpError} HttpError */

const isEnvDevelopment = ['development', undefined].includes(process.env.NODE_ENV)

/**
 * @param {HttpError|Error|undefined|null} err
 * @param {Response} res
 */
export const finalHandler = (err, res) => {
  if (err) {
    // @ts-ignore
    const { message, stack, status = 500 } = err
    const out = { message, status }
    if (isEnvDevelopment) out.stack = stack
    res.send(out, status)
    console.error(stack)
  } else {
    res.send({ message: 'Not Found', status: 404 }, 404)
  }
}
