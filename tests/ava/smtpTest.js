'use strict'

const test = require('ava')
const settings = require('../../src/lib/settings')
const smtp = require('../../actions/smtp')
const testSettings = require('../settings.json')

test('SMTP - Send valid mail', t => {
  const validSimpleOptions = {
    'from': settings.actions.smtp.user,
    'to': testSettings.actions.mailjet.to,
    'subject': 'Simple mail test',
    'text': 'Simple mail working'
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
    t.is(JSON.parse(err.message).err, 'invalid request')
  })
})
