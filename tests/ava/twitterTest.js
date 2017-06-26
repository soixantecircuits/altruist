'use strict'

const test = require('ava')
const twitter = require('../../actions/twitter')

test(`Twitter - Send simple tweet`, t => {
  const validOptions = {
    message: 'Altruist Twitter test'
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