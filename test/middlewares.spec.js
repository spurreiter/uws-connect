import { fileURLToPath } from 'url'
import assert from 'assert/strict'
import path from 'path'
import cors from 'cors'
import serveStatic from 'serve-static'

import { App } from '../src/index.js'
import { fetch } from './support/fetch.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

describe('connect compliant middlewares', function () {
  const port = 9001
  const url = `http://localhost:${port}`
  let app

  before(async function () {
    const _cors = cors({
      origin: /^http:\/\/foo.bar$/
    })

    // const debugMw = (req, res, next) => {
    //   console.log(req.url, req.method)
    //   next()
    // }

    app = new App()
    app.options('/*', _cors)
    app.get('/cors',
      _cors,
      (req, res) => res.end('cors')
    )
    app.get('/static/*',
      serveStatic(path.resolve(__dirname)) // contains a `/static` folder
    )
    await app.listen(port)
  })

  after(async function () {
    await app.close()
  })

  describe('cors', function () {
    it('shall use cors middleware', async function () {
      const res = await fetch(`${url}/cors`, {
        method: 'OPTIONS',
        headers: {
          origin: 'http://foo.bar',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'Content-Type'
        }
      })
      assert.strictEqual(res.status, 204)
      const text = await res.text()
      assert.equal(text, '')
      const headers = Object.fromEntries(res.headers)
      assert.deepEqual(headers, {
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'access-control-allow-origin': 'http://foo.bar',
        'content-length': '0',
        vary: 'Origin, Access-Control-Request-Headers'
      })
    })

    it('shall refuse preflight', async function () {
      const res = await fetch(`${url}/cors`, {
        method: 'OPTIONS',
        headers: {
          origin: 'http://bar.foo',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'Content-Type'
        }
      })
      assert.strictEqual(res.status, 204)
      const text = await res.text()
      assert.equal(text, '')
      const headers = Object.fromEntries(res.headers)
      assert.deepEqual(headers, {
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'content-length': '0',
        vary: 'Origin, Access-Control-Request-Headers'
      })
    })

    it('shall add access-control-allow-origin response header', async function () {
      const res = await fetch(`${url}/cors`, {
        method: 'GET',
        headers: { origin: 'http://foo.bar' }
      })
      assert.strictEqual(res.status, 200)
      const text = await res.text()
      assert.equal(text, 'cors')
      const headers = Object.fromEntries(res.headers)
      assert.deepEqual(headers, {
        'access-control-allow-origin': 'http://foo.bar',
        'content-length': '4',
        vary: 'Origin'
      })
    })
  })

  describe('serveStatic', function () {
    it('shall serve text.txt', async function () {
      const res = await fetch(`${url}/static/text.txt`, {
      })
      assert.strictEqual(res.status, 200)
      const text = await res.text()
      assert.equal(text, 'serving...')
    })
  })
})
