'use strict'

const test = require('ava')
const smtp = require('../../actions/smtp')
const config = require('../../src/lib/config')

test('SMTP - Send valid mail', t => {
  const validSimpleOptions = {
    "from": config.actions.smtp.user,
    "to": config.actions.smtp.user,
    "subject": "Simple mail test",
    "text": "Simple mail working"
  }
  return smtp.run(validSimpleOptions, {})
  .then(res => {
    t.true(res.accepted.length > 0)
  })
  .catch(err => {
    console.error(err)
    t.fail()
  })
})

test('SMTP - Send empty query', t => {
  const emptyOptions = {}
  return smtp.run(emptyOptions, {})
  .then(res => {
    t.fail('Action did not return an error')
  })
  .catch(err => {
    t.is(err.error, 'invalid request')
  })
})