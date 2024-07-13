import restana from 'restana'

const set = (item) => (req, res, next) => {
  res.locals = item
  next()
}
const userId = (req, res, _next) => {
  res.end(`User ${req.params.id} ${res.locals}`)
}

const app = restana()

app
  .get('/favicon.ico', (req, res) => res.end())
  .get('/', (req, res) => res.end('Hello'))
  .get('/users/:id', set('two'), userId)
  .start(5050)
