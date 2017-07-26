'use strict'

const test = require('ava')

const axios = require('axios')

const altruist = require('../')
const settings = require('../settings/settings.dev.json')
const stubs = require('./stubs')

const port = settings.server.port

test.before(t => {
  // settings.verbose = false
  altruist.init(settings)
  console.log(`Starting server on port ${port}...`)
  console.log('Waiting for all actions to set up...\n')
})
test.before(async t => {
  await new Promise(resolve => setTimeout(() => {
    console.log('Everything is on track.\n')
    t.pass()
    resolve()
  }, 1000))
})
test('server is running', t => {
  return axios.get(`http://127.0.0.1:${port}`)
  .then((res) => {
    t.is(res.status, 200)
  })
  .catch((res) => { t.fail() })
})
test('actions routes are availables', t => {
  const promises = Object.keys(settings.actions)
    .map(action =>
      axios.post(`http://127.0.0.1:${port}/api/v1/actions/${action}`)
      .then((res) => {
        t.not(res.status, 404, action)
      })
      .catch((err) => {
        t.not(err.response.status, 404, action)
      })
    )
  return axios.all(promises)
})
test('authentication routes are availables', t => {
  return axios
  .get(`http://127.0.0.1:${port}${settings.authRedirectURL}`)
    .then((res) => {
      const promises = res.data.map
      .map(redirect =>
        axios.get(`http://127.0.0.1:${port}${redirect.URL}`)
        .then((res) => {
          t.not(res.status, 404, redirect.name)
        })
        .catch((err) => {
          !err.response && t.fail(redirect.name)
          err.response && t.not(err.response.status, 404, redirect.name)
        })
      )
      return axios.all(promises)
    })
    .catch(() => {
      t.fail(`error with route http://127.0.0.1:${port}${settings.authRedirectURL}`)
    })
})
test('actions routes are availables', t => {
  const promises = Object.keys(settings.actions)
    .map(action =>
      axios.post(`http://127.0.0.1:${port}/api/v1/actions/${action}`, stubs[action])
      .then((res) => {
        t.is(res.data.code, 200, action)
      })
      .catch(() => {
        t.fail(action)
      })
    )
  return axios.all(promises)
})
