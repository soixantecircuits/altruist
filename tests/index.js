'use strict'

const test = require('ava')

const axios = require('axios')

const altruist = require('../')
const settings = require('../settings/settings.dev.json')
const port = settings.server.port

test.before('setup server', t => {
  settings.verbose = false
  altruist.init(settings)
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
        t.not(res.status, 404)
      })
      .catch((err) => {
        t.not(err.response.status, 404)
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
          t.not(res.status, 404)
        })
        .catch((err) => {
          !err.response && t.fail()
          err.response && t.not(err.response.status, 404)
        })
      )
      return axios.all(promises)
    })
    .catch((err) => {
      console.log(err)
      t.fail()
    })
})
