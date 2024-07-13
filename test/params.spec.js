import assert from 'assert/strict'
import { App, params } from '../src/index.js'
import { fetch } from './support/fetch.js'
import { connectionClose } from './support/utils.js'

describe('params', function () {
  const port = 9002
  const url = `http://localhost:${port}`
  let app

  before(async function () {
    app = App()
    app.get(
      '/path/:with/some/:ids',
      params('/path/:with/some/:ids'),
      connectionClose,
      (req, res) => {
        const { params } = req
        res.send({ params })
      }
    )

    await app.listen(port)
  })

  after(async function () {
    await app.close()
  })

  it('parameters hello world', async function () {
    const res = await fetch(`${url}/path/hello/some/world`)
    const body = await res.json()
    assert.strictEqual(res.status, 200)
    assert.deepEqual(body, { params: { with: 'hello', ids: 'world' } })
  })

  it('parameters foo bar', async function () {
    const res = await fetch(`${url}/path/foo/some/bar`)
    const body = await res.json()
    assert.strictEqual(res.status, 200)
    assert.deepEqual(body, { params: { with: 'foo', ids: 'bar' } })
  })
})
