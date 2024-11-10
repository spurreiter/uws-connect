import assert from 'node:assert'

export const isDate = (date) => !isNaN(new Date(date).getTime())

export const getHeaders = (resHeaders) => {
  const { date, ...headers } = Object.fromEntries(resHeaders)
  assert.equal(isDate(date), true)
  return headers
}

// needed for node@20 which by default uses keepalive=true
export const connectionClose = (req, res, next) => {
  res.setHeader('connection', 'close')
  next()
}
