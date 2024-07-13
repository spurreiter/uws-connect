import assert from 'assert/strict'
import request from 'supertest'
import { App } from '../src/index.js'

describe('http/Response', function () {
  describe('res.send', function () {
    it('shall send json', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send({ foo: 'bar' })
      })

      return request(app)
        .get('/')
        .then(({ status, headers, body }) => {
          assert.equal(status, 200)
          assert.equal(
            headers['content-type'],
            'application/json; charset=utf-8'
          )
          assert.deepEqual(body, { foo: 'bar' })
        })
    })

    it('shall send undefined with status 201', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.statusCode = 201
        res.send()
      })

      return request(app)
        .get('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 201)
          assert.equal(headers['content-length'], '0')
          assert.equal(text, '')
        })
    })

    it('shall send string with status 401', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send('foobar', 401)
      })

      return request(app)
        .get('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 401)
          assert.equal(headers['content-type'], 'text/plain; charset=utf-8')
          assert.equal(text, 'foobar')
        })
    })

    it('shall send html redirect', function () {
      const app = new App()
      app.get('/', (req, res) => {
        const location = 'https://example.domain'
        res.send(`<body><a href="${location}">${location}</a></body>`, 301, {
          Location: location,
          'Content-Type': 'text/html; charset=utf-8'
        })
      })

      return request(app)
        .get('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 301)
          assert.equal(headers['content-type'], 'text/html; charset=utf-8')
          assert.equal(headers.location, 'https://example.domain')
          assert.equal(
            text,
            '<body><a href="https://example.domain">https://example.domain</a></body>'
          )
        })
    })

    it('shall send Buffer', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send(Buffer.from('foobar'))
      })

      return request(app)
        .get('/')
        .then(({ status, headers, body }) => {
          assert.equal(status, 200)
          assert.equal(headers['content-type'], 'application/octet-stream')
          assert.deepEqual(body, Buffer.from('foobar'))
        })
    })

    it('shall fail to send boolean', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send(true)
      })

      return request(app)
        .get('/')
        .then(({ status, headers, body }) => {
          assert.equal(status, 200)
          assert.equal(
            headers['content-type'],
            'application/json; charset=utf-8'
          )
          assert.equal(body, true)
        })
    })

    it('shall fail to send number', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send(42)
      })

      return request(app)
        .get('/')
        .then(({ status, headers, body }) => {
          assert.equal(status, 200)
          assert.equal(
            headers['content-type'],
            'application/json; charset=utf-8'
          )
          assert.equal(body, 42)
        })
    })

    it('shall send function as empty string', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send(() => {})
      })

      return request(app)
        .get('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 200)
          assert.equal(headers['content-type'], undefined)
          assert.equal(text, '')
        })
    })

    it('shall send HEAD request with empty payload', function () {
      const app = new App()
      app.head('/', (req, res) => {
        res.send('foobar')
      })

      return request(app)
        .head('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 200)
          assert.equal(headers['content-type'], 'text/plain; charset=utf-8')
          assert.equal(text, undefined)
        })
    })

    it('shall set headers', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send('42', 200, { 'x-server': 'restana' })
      })

      return request(app)
        .get('/')
        .then(({ status, headers, text }) => {
          assert.equal(status, 200)
          assert.equal(headers['content-type'], 'text/plain; charset=utf-8')
          assert.equal(headers['x-server'], 'restana')
          assert.equal(text, '42')
        })
    })

    it('shall strip headers on 204', function () {
      const app = new App()
      app.get('/', (req, res) => {
        res.send({ foo: 42 }, 204, { 'x-server': 'restana' })
      })

      return request(app)
        .get('/')
        .then(({ status, headers, body }) => {
          assert.equal(status, 204)
          assert.equal(headers['content-type'], undefined)
          assert.equal(headers['x-server'], 'restana')
          assert.deepEqual(body, {})
        })
    })
  })
})
