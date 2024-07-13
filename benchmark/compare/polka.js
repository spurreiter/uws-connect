import polka from 'polka'

const set = (item) => (req, res, next) => {
  res.locals = item
  next()
}
const userId = (req, res, _next) => {
  res.end(`User ${req.params.id} ${res.locals}`)
}

const app = polka()

app
  .get('/favicon.ico', (req, res) => res.end())
  .get('/', (req, res) => res.end('Hello'))
  .get('/users/:id', set('two'), userId)
  .listen(5050)
