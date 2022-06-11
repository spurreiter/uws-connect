import assert from 'assert/strict'
import request from 'supertest'
import { App } from '../src/index.js'

describe('http/Request', function () {
  it('req.query', function () {
    const app = new App()
    app.get('/*', (req, res) => {
      res.send(req.query)
    })

    return request(app).get('/home/user?a=0&b=bla&a=1&a=2')
      .then(({ status, headers, body }) => {
        assert.equal(status, 200)
        assert.equal(headers['content-type'], 'application/json; charset=utf-8')
        assert.deepEqual(body, {
          a: ['0', '1', '2'],
          b: 'bla'
        })
      })
  })
})
