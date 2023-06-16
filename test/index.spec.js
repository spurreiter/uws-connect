import assert from 'assert/strict'

import { App, connect, bodyParser } from '../src/index.js'
import { fetch } from './support/fetch.js'
import { getHeaders, connectionClose } from './support/utils.js'

describe('uws-connect', function () {
  const port = 9001
  const url = `http://localhost:${port}`
  let app

  before(async function () {
    const glue = connect()
    // const debugMw = (req, res, next) => {
    //   console.log(req.url, req.method)
    //   next()
    // }

    app = App()
    app.app
      // attributes
      .get('/request', glue(
        connectionClose,
        (req, res) => {
          const { url, method, headers, cookies } = req
          const { remoteAddress } = req.socket
          res.end(JSON.stringify({ url, method, headers, cookies, remoteAddress }))
        }
      ))
      .post('/request', glue(
        connectionClose,
        bodyParser({ limit: 5e3 }),
        (req, res) => {
          const { body } = req
          res.setHeader('foo', 'bar')
          res.removeHeader('foo')
          res.send(JSON.stringify(body), 200, { foo: 'bar' })
        }
      ))
      .get('/number/:number', glue(
        connectionClose,
        (req, res) => {
          const number = +req.getParameter(0)
          res.send(number)
        }
      ))
      // final handler
      .get('/none', glue())
      .get('/cookies', glue(
        connectionClose,
        (req, res) => {
          const { name, value, ...options } = req.query
          if (!value) {
            res.clearCookie(name, options)
          } else {
            res.cookie(name, value, options)
          }
          res.cookie('foo', 'bar')
          res.end()
        }
      ))
    await app.listen(port)
  })

  after(async function () {
    await app.close()
  })

  it('request url, method, headers, cookies', async function () {
    const res = await fetch(`${url}/request`, {
      headers: {
        'user-agent': 'test/1.0',
        cookie: 'foo=bar; test=1'
      }
    })
    const { remoteAddress, ...body } = await res.json()
    assert.equal(typeof remoteAddress, 'string')
    assert.deepEqual(body, {
      url: '/request',
      method: 'GET',
      cookies: {
        foo: 'bar',
        test: '1'
      },
      headers: {
        host: 'localhost:9001',
        connection: 'keep-alive',
        'user-agent': 'test/1.0',
        accept: '*/*',
        'accept-language': '*',
        'sec-fetch-mode': 'cors',
        'accept-encoding': 'gzip, deflate',
        cookie: 'foo=bar; test=1'
      }
    })
  })

  it('request json body', async function () {
    const obj = { test: 123, foo: 'bar' }
    const res = await fetch(`${url}/request`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    })
    const body = await res.json()
    assert.equal(res.status, 200)
    assert.deepEqual(body, { test: 123, foo: 'bar' })
  })

  it('shall fail to parse json body', async function () {
    const res = await fetch(`${url}/request`, {
      method: 'POST',
      body: 'test=123&foo=bar&test=abc&abc=true',
      headers: { 'Content-Type': 'application/json' }
    })
    assert.equal(res.status, 400)
    const { message } = await res.json()
    assert.equal(message, 'err_json_parse')
  })

  it('request form body', async function () {
    const res = await fetch(`${url}/request`, {
      method: 'POST',
      body: 'test=123&foo=bar&test=abc&abc=true',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const body = await res.json()
    assert.equal(res.status, 200)
    assert.deepEqual(body, { test: ['123', 'abc'], foo: 'bar', abc: 'true' })
  })

  it('max. content length exceeded', async function () {
    const res = await fetch(`${url}/request`, {
      method: 'POST',
      body: new Array(6000).fill('1').join(''),
      headers: {}
    })
    assert.equal(res.status, 413)
    const { message, status } = await res.json()
    assert.deepEqual({ message, status }, {
      message: 'err_limit',
      status: 413
    })
  })

  it('return a number', async function () {
    const res = await fetch(`${url}/number/1000`)
    const text = await res.text()
    assert.equal(res.status, 200)
    assert.deepEqual(text, '1000')
  })

  it('return a number', async function () {
    const res = await fetch(`${url}/number/undefined`)
    const text = await res.text()
    assert.equal(res.status, 200)
    assert.deepEqual(text, '')
  })

  it('no middleware shall use finalHandler', async function () {
    const res = await fetch(`${url}/none`, {})
    assert.equal(res.status, 404)
    const { message, status } = await res.json()
    assert.deepEqual({ message, status }, {
      message: 'Not Found',
      status: 404
    })
  })

  it('set cookies', async function () {
    const res = await fetch(`${url}/cookies?name=test&value=100&domain=foo.bar&httpOnly=true`, {})
    assert.equal(res.status, 200)
    assert.deepEqual(getHeaders(res.headers), {
      connection: 'close',
      'content-length': '0',
      'set-cookie': [
        'test=100; Domain=foo.bar; Path=/; HttpOnly',
        'foo=bar; Path=/'
      ]
    })
    const text = await res.text()
    assert.equal(text, '')
  })

  it('clear cookie', async function () {
    const res = await fetch(`${url}/cookies?name=test&path=/login&httpOnly=true`, {})
    assert.equal(res.status, 200)
    assert.deepEqual(getHeaders(res.headers), {
      connection: 'close',
      'content-length': '0',
      'set-cookie': [
        'test=; Path=/login; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
        'foo=bar; Path=/'
      ]
    })
    const text = await res.text()
    assert.equal(text, '')
  })
})
