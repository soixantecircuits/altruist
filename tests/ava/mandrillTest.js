'use strict'

const path = require('path')
const request = require('superagent')
const test = require('ava')
const settings = require('../../src/lib/settings')
const mandrill = require('../../actions/mandrill')
const testSettings = require('../settings.json')

const altruist = require('../../')
altruist.init(settings)

test(`Mandrill - Send template '${settings.actions.mandrill.template}' to ${settings.actions.mandrill.from.email} (need email and template in settings.json)`, t => {
  const validOptions = {
    email: testSettings.actions.mailjet.to
  }
  return mandrill.run(validOptions, {})
    .then(res => {
      t.is(res[0].status, 'sent')
    })
    .catch(err => {
      t.fail()
    })
})

test('Mandrill - Send without email', t => {
  const invalidOptions = {}
  return mandrill.run(invalidOptions, {})
    .then(res => {
      t.is(res[0].status, 'invalid')
    })
    .catch(err => {
      t.fail()
    })
})

test(`Mandrill - Send template '${settings.actions.mandrill.template}' with attachment via form data to ${settings.actions.mandrill.from.email} (need email and template in settings.json)`, t => {
  return new Promise((resolve, reject) => {
    request.post(`http://localhost:${settings.server.port}/api/v1/actions/mandrill`)
      .field('email', testSettings.actions.mailjet.to)
      .attach('media', path.resolve(__dirname, 'test.jpg'))
      .end((err, res) => {
        if (err) {
          t.fail(err)
          reject(new Error(err))
        } else {
          t.is(res.body[0].status, 'sent')
          resolve()
        }
      })
  })
})
