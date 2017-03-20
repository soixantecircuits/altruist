'use strict'

const test = require('ava')
const mandrill = require('../../actions/mandrill')
const config = require('../../src/lib/config')

test(`Mandrill - Send template '${config.actions.mandrill.template}' to ${config.actions.mandrill.from.email} (need email and template in config.json)`, t => {
  const validOptions = {
    email: config.actions.mandrill.from.email
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