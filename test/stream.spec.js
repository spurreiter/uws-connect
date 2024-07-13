import { fileURLToPath } from 'url'
import { Transform } from 'stream'
import assert from 'assert/strict'
import fs from 'fs'
import path from 'path'
import { App, connect } from '../src/index.js'
import { fetch } from './support/fetch.js'
import { connectionClose } from './support/utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

describe('stream', function () {
  const port = 9001
  const url = `http://localhost:${port}`
  let app

  before(async function () {
    const glue = connect()
    const transform = new Transform({
      transform(chunk, enc, cb) {
        const _chunk = chunk.toString().replace(/[2468]/g, '')
        this.push(_chunk)
        cb()
      }
    })

    app = App()
    app.app
      // streaming
      .post(
        '/echo',
        glue(
          // stream(),
          connectionClose,
          (req, res) => {
            req.pipe(res)
          }
        )
      )
      .post(
        '/transform',
        glue(
          // stream(),
          connectionClose,
          (req, res) => {
            req.pipe(transform).pipe(res)
          }
        )
      )
      .get(
        '/text.txt',
        glue(
          // stream(),
          connectionClose,
          (req, res) => {
            res.setHeader('content-type', 'text/plain')
            fs.createReadStream(
              path.resolve(__dirname, 'static/text.txt')
            ).pipe(res)
          }
        )
      )

    await app.listen(port)
  })

  after(async function () {
    await app.close()
  })

  it('shall echo stream', async function () {
    const body = new Array(6000)
      .fill('')
      .map((_, i) => i % 10)
      .join('')
    const res = await fetch(`${url}/echo`, {
      method: 'POST',
      body
    })
    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.equal(text, body)
  })

  it('shall transform stream', async function () {
    const body = new Array(6000)
      .fill('')
      .map((_, i) => i % 10)
      .join('')
    const res = await fetch(`${url}/transform`, {
      method: 'POST',
      body
    })
    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.equal(text.length, 3600)
  })

  it('shall stream file', async function () {
    const res = await fetch(`${url}/text.txt`)
    assert.strictEqual(res.status, 200)
    const text = await res.text()
    assert.equal(text, 'serving...')
  })
})
