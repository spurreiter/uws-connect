import { fetch } from '../test/support/fetch.js'

const main = async () => {
  const res = await fetch('http://localhost:5050/users/alice')
  const body = await res.text()
  console.log(res.status, body)
}

main()
