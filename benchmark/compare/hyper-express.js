import HyperExpress from 'hyper-express'

const set = (item) => (req, res, next) => {
  res.locals = item
  next()
}
const userId = (req, res, _next) => {
  res.end(`User ${req.params.id} ${res.locals}`)
}

const app = new HyperExpress.Server()

app.get('/favicon.ico', (req, res) => res.end())
app.get('/', (req, res) => { res.end('Hello') })
app.get('/users/:id', set('two'), userId)
app.listen(5050)
