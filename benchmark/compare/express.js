import express from 'express'

const set = (item) => (req, res, next) => {
  res.locals = item
  next()
}
const userId = (req, res, next) => {
  res.end(`User ${req.params.id} ${res.locals}`)
}

const app = express()
app.disable('etag')
app.disable('x-powered-by')

app
  .get('/favicon.ico', (req, res) => res.end())
  .get('/', (req, res) => res.end('Hello'))
  .get('/users/:id', set('two'), userId)
  .listen(5050)
