import assert from 'assert/strict'
import { connect } from '../src/connect.js'
import { nap } from '../src/utils/nap.js'

function Request () {
  this.getMethod = () => 'get'
  this.forEach = () => undefined
}

function Response () {
  this.onData = () => undefined
  this.onAborted = () => undefined
}

describe('connect', function () {
  it('shall connect middlewares', function (done) {
    connect()(
      (req, res, next) => {
        res.body = []
        next()
      },
      async (req, res) => {
        await nap(10)
        res.body.push(1)
      },
      (req, res, next) => {
        res.body.push(2)
        next()
      },
      (req, res) => {
        assert.deepEqual(res.body, [1, 2])
        done()
      }
    )(new Response(), new Request())
  })

  it('shall call final handler middlewares', function (done) {
    const finalHandler = (err) => {
      assert.equal(err.message, 'no good')
      done()
    }

    connect({ finalHandler })(
      (req, res, next) => {
        res.body = []
        next()
      },
      async (req, res) => {
        res.body.push(1)
      },
      (req, res, next) => {
        res.body.push(2)
        next()
      },
      (req, res) => {
        throw new Error('no good')
      }
    )(new Response(), new Request())
  })
})
