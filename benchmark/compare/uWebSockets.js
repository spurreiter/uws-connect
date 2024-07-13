import uWS from 'uWebSockets.js'
const port = 5050

const set = (item) => (res, _req) => {
  res.locals = item
}
const userId = (res, req) => {
  res.end(`User ${req.getParameter(0)} ${res.locals}`)
}

const handler = (res, req) => {
  set('two')(res, req)
  userId(res, req)
}

const app = uWS.App()
app
  .get('/favicon.ico', (res, _req) => res.end())
  .get('/', (res, _req) => res.end('Hello'))
  .get('/users/:id', handler)
  .listen(port, (token) => {
    if (!token) console.error('failed to start uws')
  })
