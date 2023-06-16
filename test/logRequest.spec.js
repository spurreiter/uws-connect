import assert from 'assert/strict'

import { App, logRequest } from '../src/index.js'
import { log } from '../src/utils/log.js'
import { fetch } from './support/fetch.js'
import { connectionClose } from './support/utils.js'

describe('logRequest', function () {
  const port = 9001
  const url = `http://localhost:${port}`
  let app

  before(async function () {
    app = App()
    app.any('/log/*',
      connectionClose,
      logRequest(log),
      (req, res) => {
        res.end('log it')
      }
    )

    await app.listen(port)
  })

  after(async function () {
    await app.close()
  })

  it('shall log request', async function () {
    const res = await fetch(`${url}/log/it`, {
      method: 'DELETE',
      headers: { 'User-Agent': 'fetch/1.0' }
    })
    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.equal(text, 'log it')
  })
})
