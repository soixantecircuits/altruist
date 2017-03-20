'use strict'

const test = require('ava')
const mailjet = require('../../actions/mailjet')
const config = require('../../src/lib/config')

test('Mailjet - Send valid mail (need fromEmail and templateID in config.json)', t => {
  const validSimpleOptions = {
    "fromEmail": config.actions.mailjet.fromEmail,
    "recipients": [{"Email": config.actions.mailjet.fromEmail}],
    "subject": "Simple mailjet template test"
  }
  return mailjet.run(validSimpleOptions, {})
  .then(res => {
    t.true(res.body.Sent.length > 0)
  })
  .catch(err => {
    t.fail()
  })
})

test('Mailjet - Send empty query', t => {
  const emptyOptions = {}
  return mailjet.run(emptyOptions, {})
  .then(res => {
    t.fail('Action did not return an error')
  })
  .catch(err => {
    t.pass()
  })
})