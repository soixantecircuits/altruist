'use strict'

const path = require('path')
const request = require('superagent')
const test = require('ava')
const instagram = require('../../actions/instagram')
const settings = require('../../src/lib/settings')
const testSettings = require('../settings.json')
const altruist = require('../../')

test.before(t => {
  altruist.init(settings)
})

// should end in error to pass
test('Instagram - Send empty query', t => {
  const emptyOptions = {}
  return instagram.run(emptyOptions, {})
    .then(res => {
      t.fail('Action did not return an error')
    })    
    .catch(err => {
      t.pass('Error was thrown, because no message in request')
    })
})

/*test('Instagram - send empty query', t => {
  return new Promise((resolve, reject) => {
    request.post('http://localhost:${settings.server.port}/api/v1/actions/instagram')
      .send({})
      .then((res) => {
        t.fail('Action did not return an error')
        resolve()
      })
      .catch((err => {
        t.pass('Error was thrown, because no message in request')
        reject()
      }))
  })
})*/


test('Instagram - share image with post request', t => {
  return new Promise((resolve, reject) => {
    request.post(`http://localhost:${settings.server.port}/api/v1/actions/instagram`)
      .send({"caption": "Altruist Instagram test", "media": path.resolve(__dirname, 'test.jpg')})
      .then((res) => {
        t.pass(res.ok, true)
        resolve()
      })
      .catch((err) => {
        t.fail(new Error(err))
        reject()
      })
  })
})