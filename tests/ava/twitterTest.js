'use strict'

const path = require('path')
const request = require('superagent')
const test = require('ava')
const twitter = require('../../actions/twitter')
const settings = require('../../src/lib/settings')
const testSettings = require('../settings.json')
const altruist = require('../../')

test.before(t => {
  altruist.init(settings)
})

test(`Twitter - Send simple tweet (twitter rejects duplicate tweets)`, t => {
  const validOptions = {
    message: testSettings.actions.twitter.simpleTweetMessage
  }
  return twitter.run(validOptions, {})
    .then(res => {
      try {
        var parsedResult = JSON.parse(res)
        t.truthy(parsedResult.id)
      } catch (e) {
        t.fail(e)
      }
    })
    .catch(err => {
      t.fail(err)
    })
})

test('Twitter - Send empty query', t => {
  const emptyOptions = {}
  return twitter.run(emptyOptions, {})
    .then(res => {
      t.fail('Action did not return an error')
    })
    .catch(err => {
      t.pass()
    })
})

test(`Twitter - Send tweet with media via form data`, t => {
  return new Promise((resolve, reject) => {
    request.post(`http://localhost:${settings.server.port}/api/v1/actions/twitter`)
      .field('message', testSettings.actions.twitter.formDataTweetMessage)
      .attach('media', path.resolve(__dirname, 'test.jpg'))
      .end((err, res) => {
        if (err) {
          t.fail(err)
          reject(new Error(err))
        } else {
          try {
            t.truthy(res.body.id)
            resolve()
          } catch (e) {
            t.fail(e)
            reject(new Error(e))
          }
        }
      })
  })
})
