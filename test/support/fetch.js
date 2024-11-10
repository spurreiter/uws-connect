import http from 'http'
import https from 'https'

export function fetch(url, opts) {
  const { protocol, hostname, port, pathname, search } = new URL(url)
  const { body, ..._opts } = opts || {}
  _opts.headers = {
    connection: 'keep-alive',
    accept: '*/*',
    'accept-language': '*',
    'sec-fetch-mode': 'cors',
    'accept-encoding': 'gzip, deflate',
    ..._opts.headers
  }
  const path = pathname + search
  const transport = protocol === 'http:' ? http : https
  const req = transport.request({ ..._opts, hostname, port, path })
  const then = (_resolve) =>
    new Promise((resolve, reject) => {
      req.once('response', (res) => {
        let text = ''
        // @ts-ignore
        res.status = res.statusCode
        // @ts-ignore
        res.ok = res.status < 300
        // @ts-ignore
        res.headers = Object.entries(res.headers)
        // @ts-ignore
        res.text = async () => text
        // @ts-ignore
        res.json = async () => JSON.parse(text)
        res.on('data', (data) => {
          text += data.toString()
        })
        res.on('error', reject)
        res.on('end', () => resolve(res))
        req.on('error', reject)
      })
    }).then(_resolve)
  req.end(body)
  return { then }
}
