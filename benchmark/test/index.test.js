import path from 'path'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'
import { filesUnderTest } from '../index.js'
import supertest from 'supertest'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// @ts-ignore
const nap = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

describe('quick test', function () {
  const url = new URL('http://localhost:5050/users/alias')

  filesUnderTest.forEach((file) => {
    describe(file, function () {
      let forked
      before(async function () {
        const filename = path.resolve(__dirname, '..', 'compare', file)
        forked = fork(filename)
        await nap(150)
      })
      after(function () {
        forked.kill('SIGINT')
      })

      it('run', function () {
        const { origin, pathname } = url
        return supertest(origin)
          .get(pathname)
          .expect(200, 'User alias two')
      })
    })
  })
})
