'use strict'

const test = require('ava')
const request = require('superagent')
const settings = require('../../src/lib/settings')
const altruist = require('../../')

test.before(t => {
  altruist.init(settings)
})

var authRedirects

test.serial('Get authentication URLs', t => {
  return new Promise((resolve, reject) => {
    request.get(`http://localhost:${settings.server.port}${settings.authRedirectURL}`)
      .end((err, res) => {
        if (err) {
          t.fail(err)
          reject(new Error(err))
        } else {
          authRedirects = res.body.map
          t.true(Array.isArray(authRedirects))
          resolve()
        }
      })
  })
})

test('Check authentication URLs availability', t => {
  if (Array.isArray(authRedirects)) {
    var promises = authRedirects.map(link => {
      return new Promise((resolve, reject) => {
        request.get(`http://localhost:${settings.server.port}${link.URL}`)
          .end((err, res) => {
            t.true((res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 302), `Authentication URL for ${link.name} should be available`)
            resolve()
          })
      })
    })

    return Promise.all(promises)
  } else {
    t.fail(authRedirects, [], 'Auth redirects should be an array')
    t.end()
  }
})

test('Check action URLs availability', t => {
  if (settings.actions) {
    var promises = Object.keys(settings.actions).map(action => {
      return new Promise((resolve, reject) => {
        request.post(`http://localhost:${settings.server.port}/api/v1/actions/${action}`)
          .end((err, res) => {
            t.true((res.statusCode === 200 || res.statusCode === 500), `http://localhost:${settings.server.port}/api/v1/actions/${action} should be available`)
            resolve()
          })
      })
    })
    return Promise.all(promises)
  } else {
    t.fail(settings.actions, {}, "The object 'actions' should exist in the settings")
    t.end()
  }
})
