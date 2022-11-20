import assert from 'node:assert'

export const isDate = date => !isNaN(new Date(date).getTime())

export const getHeaders = (resHeaders) => {
  const { date, ...headers } = Object.fromEntries(resHeaders)
  assert.equal(isDate(date), true)
  return headers
}
