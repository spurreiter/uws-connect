import http from 'http'

http.createServer((req, res) => {
  res.locals = 'two'
  if (req.url === '/favicon.ico') {
    res.end()
  } else if (req.url === '/') {
    res.end('Hello')
  } else if (req.url.indexOf('/users/') === 0) {
    const id = req.url.slice(7)
    res.end(`User ${id} ${res.locals}`)
  }
}).listen(5050)
