'use strict'

const test = require('ava')
const mailjet = require('../../actions/mailjet')
const config = require('../../src/lib/config')

test('Mailjet - Send valid mail (need a template named \'test\')', t => {
  const validSimpleOptions = {
    "fromEmail": config.actions.smtp.user,
    "recipients": [config.actions.smtp.user],
    "templateID": "test",
    "textPart": "Waw",
    "htmlPart": "Waw",
    "vars": {}
  }
  return mailjet.run(validSimpleOptions, {})
  .then(res => {
    t.true(res.accepted.length > 0)
  })
  .catch(err => {
    console.error(err)
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