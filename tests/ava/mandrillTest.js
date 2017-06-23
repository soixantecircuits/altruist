'use strict'

const test = require('ava')
const settings = require('../../src/lib/settings')
const mandrill = require('../../actions/mandrill')
const testSettings = require('../settings.json')

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
