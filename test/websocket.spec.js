import assert from 'assert/strict'
import { App } from '../src/index.js'
import { nap } from '../src/utils/nap.js'
import { itBool } from './support/itBool.js'

const majorV = Number(process.versions.node.split('.')[0])

describe('websocket', function () {
  itBool(majorV >= 22)('shall connect to websocket', async function () {
    const messages = []

    const app = new App()
    app.ws('/*', {
      open: (_ws) => {
        messages.push('connected')
      },
      message: (ws, message, isBinary) => {
        messages.push(new TextDecoder().decode(message))
        ws.send(message, isBinary)
      },
      close: (_ws, _code, _message) => {
        messages.push('close')
      }
    })

    await app.listen(0)
    const port = app.address()?.port

    const client = createWsClient(port)
    await nap(50)
    client.close()
    await nap(50)
    assert.deepEqual(messages, ['connected', 'hello', 'close'])
  })
})

const createWsClient = (port) => {
  const socket = new WebSocket(`ws://localhost:${port}`)
  const messages = []

  socket.addEventListener('open', (_ev) => {
    socket.send('hello')
  })

  socket.addEventListener('message', (ev) => {
    messages.push(ev.data)
  })

  const close = () => {
    socket.close()
  }

  return { close, messages }
}
