'use strict'

const path = require('path')
const test = require('ava')
const request = require('superagent')
const settings = require('../../src/lib/settings')
const slack = require('../../actions/slack')
const testSettings = require('../settings.json')
const altruist = require('../../')

test.before(t => {
  // launch altruist web server with settings.json
  altruist.init(settings)
})

// should end in error to pass
test('Slack - Send empty query', t => {
  const emptyOptions = {}
  return slack.run(emptyOptions, {})
    .then(res => {
      t.fail('Action did not return an error')
    })    
    .catch(err => {
      t.pass('Error was thrown, because no message in request')
    })
})

//test without run() funciton -- as callback
test('Slack- send Message with post request', t => {
  return new Promise((resolve, reject) => {
  request.post(`http://localhost:${settings.server.port}/api/v1/actions/slack`)
    .send({"caption": testSettings.actions.slack.simpleSlackMessage, "media": path.resolve(__dirname, 'test.jpg')})
    .end((err, res) => {
      if(err) {
        t.fail(err)
        reject(new Error(err))
      } else {
          try {
            t.is(res.ok, true)
            resolve()
          } catch (e) {
            t.fail(e)
            reject(new Error(e))
          }
        }
    })
  })
})