const assert = require('assert')
const request = require('request')
const settings = require('../src/lib/settings')

var authRedirects
/**
 * This test should be run with the command `npm test`. Your Altruist server must be running locally.
 */
const altruist = require('../')
altruist.init(settings)

describe('Altruist', checkAuthenticationURLsArray)

function checkAuthenticationURLsArray () {
  describe('Authentication URLs array', function () {
    it('should return an array of authentication URLs', function (done) {
      request(`http://localhost:${settings.server.port}${settings.authRedirectURL}`, function (err, res, body) {
        authRedirects = JSON.parse(res.body).map
        assert(!err && authRedirects)
        done()
      })
    })
    after(checkAvailableAuthenticationURLs)
  })
}

function checkAvailableAuthenticationURLs () {
  describe('Authentication URLs available', function () {
    for (let i = 0; i < authRedirects.length; ++i) {
      it(`${authRedirects[i].name} at ${authRedirects[i].URL} should exist`, function (done) {
        request.get(`http://localhost:${settings.server.port}${authRedirects[i].URL}`, function (err, res, body) {
          assert(!err && (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 302))
          done()
        })
      })
    }
    after(checkActionURLs)
  })
}

function checkActionURLs () {
  describe('Action URLs', function () {
    Object.keys(settings.actions).forEach(function (action) {
      it(`http://localhost:${settings.server.port}/api/v1/actions/${action} should exist.`, function (done) {
        request.post(`http://localhost:${settings.server.port}/api/v1/actions/${action}`, function (err, res, body) {
          assert(!err && (res.statusCode === 200 || res.statusCode === 500))
          done()
        })
      })
    })
  })
}
