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

app.get('/',
  // a connect like middleware
  (req, res, next) => {
    next()
  },
  // async middleware (no need for `next()` or `try {} catch (err) {}`)
  async (req, res) => {
    await something()
  },
  (req, res) => {
    res.end('ok')
  }
)
app.put('/users/:user',
  // get `req.params` compatibility
  params('/users/:user'), // NOTE: use the same route as the router here!
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
  (req, res) => {
    req.pipe(transform).pipe(res)
  }
)

app.listen(9001)
```

If you need to better fine tune the performance of your app and don't want to
trade speed...

```js
// same as `import uWs from 'uWebSockets.js'`
import { uWS, connect } from 'uws-connect'
import cors from 'cors'
const uapp = uWS.App()

// just uWS, as fast as fast can be
uapp.get('/', (response, request) => response.end('done'))

// use some routes with connect middlewares (like cors)
const _cors = cors()
const glue = connect()
uapp.options('/*', glue(_cors))
uapp.get('/with-cors', glue(
  _cors,
  (req, res) => res.end('with cors'))
)

uapp.listen(9001, () => {})
```

# Benchmarks

```
$ cd benchmark
$ node index.js -d 10 -c 2500 -p 4
```

\*) Results may vary on your machine.

| Package     | Version | Requests/s | Latency (ms) | Throughput (Mb) |
| :---------- | ------: | ---------: | -----------: | --------------: |
| uWebSockets | 20.30.0 |     188939 |        65.23 |           19.28 |
| uws-connect |         |     163354 |        79.40 |           14.02 |
| native      | v20.3.0 |      95206 |        70.51 |           12.44 |
| polka       |   0.5.2 |      84582 |        68.51 |           11.05 |
| restana     |   4.9.7 |      73406 |        76.23 |            9.59 |
| express     |  4.18.2 |      24776 |        91.40 |            3.24 |

# Contributing

Your help is appreciated. File an issue and fork this project to contribute with
your ideas.

Please follow the minimalistic approach as choosen here. Keep things simple.

If you contribute code to this project, you are implicitly allowing your code to
be distributed under the MIT license. You are also implicitly verifying that all
code is your original work or correctly attributed with the source of its origin
and licence.

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
