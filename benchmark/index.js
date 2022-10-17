#!/usr/bin/env node
/* eslint no-console: 0 */

import { fileURLToPath } from 'url'
import { fork } from 'child_process'
import autocannon from 'autocannon'
import fs from 'fs'
import kleur from 'kleur'
import minimist from 'minimist'
import ora from 'ora'
import path from 'path'
import Table from 'cli-table'
import { MdTable } from './mdtable.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// @ts-ignore
const nap = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

const shuffle = (array) => {
  let index = array.length
  while (index) {
    const rand = Math.floor(Math.random() * (index -= 1))
    const temp = array[index]
    array[index] = array[rand]
    array[rand] = temp
  }
  return array
}

/** files under test */
let files = shuffle(
  [
    'express.js',
    'hyper-express.js',
    'native.js',
    'restana.js',
    'uws-connect.js',
    'uws.js'
  ]
)

function findPackageJson (specifier, parent = '') {
  const segments = path.resolve(parent, process.cwd(), parent).split(path.sep)
  const pckg = ['node_modules', specifier, 'package.json']
  while (segments.length) {
    const pckgPath = [...segments, ...pckg].join(path.sep)
    try {
      fs.statSync(pckgPath)
      return pckgPath
    } catch (e) { }
    segments.pop()
  }
}

const versions = files.reduce((o, file) => {
  const packge = file.replace('.js', '')
  try {
    const pckgPath = findPackageJson(packge)
    const { version } = JSON.parse(fs.readFileSync(pckgPath, 'utf8'))
    o[packge] = o[file] = version
  } catch (e) {
    o[file] = o[file] || ''
    o[packge] = o[packge] || ''
  }
  return o
}, {
  'native.js': process.version,
  'uws.js': '20.12.0'
})

const argv = minimist(process.argv.slice(2))
if (argv.f) {
  files = shuffle([].concat(argv.f))
}

const cannon = (title = null, duration) =>
  new Promise((resolve, reject) => {
    autocannon(
      Object.assign(
        {},
        {
          url: argv.u || 'http://localhost:5050/users/alias',
          connections: argv.c || 2500,
          duration: duration || argv.d || 5,
          pipelining: argv.p || 4
        },
        { title }
      ),
      (error, result) => (error ? reject(error) : resolve(result))
    )
  })

async function run (file) {
  if (argv.o && argv.o !== file) {
    return null
  }

  const forked = fork(`${__dirname}/compare/${file}`)
  await nap(100)

  // 1 warm-up round, 1 to measure.
  const framework = kleur.blue(file.replace('.js', ''))
  const spin = ora(`Warming up ${framework}`).start()
  spin.color = 'yellow'
  await cannon(null, 1)
  spin.text = `Running ${framework}`
  spin.color = 'green'
  const result = await cannon(file)
  spin.text = framework
  spin.succeed()
  forked.kill('SIGINT')
  await nap(100)
  return result
}

let index = 0
const benchmark = async (results) => {
  const result = await run(files[index])
  results.push(result)

  index += 1
  if (index < files.length) {
    return benchmark(results)
  }

  return results.sort((a, b) => {
    if (b.requests.average < a.requests.average) {
      return -1
    }

    return b.requests.average > a.requests.average ? 1 : 0
  })
}

benchmark([]).then((results) => {
  const table = new Table({
    head: ['', 'Requests/s', 'Latency (ms)', 'Throughput (Mb)']
  })
  const md = new MdTable(
    ['Package', 'Version ', 'Requests/s', 'Latency (ms)', 'Throughput (Mb)'],
    ['l14', 'r8', 'r10', 'r12', 'r13']
  )

  results.forEach((result) => {
    if (result) {
      table.push([
        kleur.blue(result.title.replace('.js', '')),
        result.requests.average,
        result.latency.average,
        (result.throughput.average / 1024 / 1024).toFixed(2)
      ])
      md.push([
        result.title.replace('.js', ''),
        versions[result.title],
        result.requests.average.toFixed(0),
        result.latency.average.toFixed(2),
        (result.throughput.average / 1024 / 1024).toFixed(2)
      ])
    }
  })

  // console.log(table.toString())
  console.log(md.toString())
})
