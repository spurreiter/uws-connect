import { App } from '../../src/index.js'
const port = 5050

const set = (item) => (req, res, next) => {
  res.locals = item
  next()
}
const userId = (req, res) => {
  res.end(`User ${req.getParameter(0)} ${res.locals}`)
}

App()
  .get('/favicon.ico', (req, res) => res.end())
  .get('/', (req, res) => res.end('Hello'))
  .get('/users/:id', set('two'), userId)
  .listen(port)
