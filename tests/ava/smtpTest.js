'use strict'

const test = require('ava')
const settings = require('standard-settings')()
const smtp = require('../../actions/smtp')

test('SMTP - Send valid mail', t => {
  const validSimpleOptions = {
    "from": settings.actions.smtp.user,
    "to": settings.actions.smtp.user,
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
