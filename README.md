# uws-connect

Use connect like middlewares with [uWebSockets.js][].

Provides support for

- connect helper for connecting connect, express middlewares
- body-parser (json, form-urlencoded)
- nodejs streams support for `uWS.HttpRequest` and `uWS.HttpResponse`
  (may not be 100% compliant with nodejs streams)
- final handler for errors

The design aims to be as fast and unopinionated as possible.

All parts provided can also be used as single building blocks.

**Table of Contents**

<!-- !toc (omit="uws-connect") -->

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

<!-- toc! -->

# Installation

```sh
npm install uws-connect
```

# Usage

```js
import { App, bodyParser, params } from 'uws-connect'
import { Transform } from 'stream'

const app = App()

app.use((req, res, next) => { // a simple logging mw applied to all routes
  const { method, url } = req
  console.log('%s %s', method, url)
  next()
})
app.get('/',
  // a connect like middleware
  (req, res, next) => {
    next()
    },
  // async middleware (no need for `next()` or `try {} catch (err) {}`)
  async (req, res) => {
    res.body = await something()
  },
  (req, res) => {
    res.end(res.body)
  }
)
app.put('/users/:user',
  // get `req.params` compatibility
  // NOTE: use the same route as the router here!
  params('/users/:user'),
  // does json or form body parsing.
  bodyParser({ limit: 100000 }),
  (req, res) => {
    // restana like res.send method
    // res.send(data: any, status?: number, headers?: object) => void
    res.send({
      params: req.params, // from `params()` middleware
      body: req.body,     // from `bodyParser()` middleware
    })
  }
)

// if stream support is needed...
const transform = new Transform({
  transform (chunk, enc, cb) {
    this.push(_chunk)
    cb()
  }
})
app.post('/echo',
  (req, res) => { req.pipe(transform).pipe(res) }
)

app.listen(9001)
```

If you need to better fine tune the performance of your app and don't want to
trade speed, use `glue(...handlers)` for connecting middlewares.

```js
// same as `import uWs from 'uWebSockets.js'`
import { uWS, connect } from 'uws-connect'
import cors from 'cors'
const uwsApp = uWS.App()

// just uWS, as fast as fast can be
// NOTE: (response, request) for uWS handler
uwsApp.get('/', (response, request) => response.end('done'))

// use some routes with connect middlewares (like cors)
// NOTE: glue() uses express (req, res, next) handlers!
const _cors = cors()
const glue = connect()
uwsApp.options('/*', glue(_cors))
uwsApp.get('/with-cors', glue(
  _cors,
  (req, res) => res.end('with cors'))
)

uwsApp.listen(9001, () => {})
```

# Benchmarks

```
$ cd benchmark
$ node index.js -d 10 -c 2500 -p 4
```

\*) Results may vary on your machine.

| Package     | Version | Requests/s | Latency (ms) | Throughput (Mb) |
| :---------- | ------: | ---------: | -----------: | --------------: |
| uWebSockets | 20.42.0 |     199909 |        85.06 |           20.40 |
| uws-connect |   1.2.3 |     176311 |       100.07 |           15.13 |
| native      | v21.6.2 |      66488 |        76.57 |            8.69 |
| polka       |   0.5.2 |      61027 |        80.09 |            7.97 |
| restana     |   4.9.7 |      60422 |        68.04 |            7.89 |
| express     |  4.18.3 |      16915 |       125.88 |            2.21 |

# Contributing

Your help is appreciated. File an issue and fork this project to contribute with
your ideas.

Please follow the minimalistic approach as chosen here. Keep things simple.

If you contribute code to this project, you are implicitly allowing your code to
be distributed under the MIT license. You are also implicitly verifying that all
code is your original work or correctly attributed with the source of its origin
and license.

The Code-of-Conduct is [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

# License

MIT Licensed

# References

<!-- !ref -->

- [uWebSockets.js][uWebSockets.js]
- [uWebSockets.js documentation][uWebSockets.js documentation]

<!-- ref! -->

[uWebSockets.js]: https://github.com/uNetworking/uWebSockets.js
[uWebSockets.js documentation]: https://unetworking.github.io/uWebSockets.js/generated/index.html

<!--
https://nodejs.org/en/docs/guides/backpressuring-in-streams/
-->
