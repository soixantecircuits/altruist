const assert = require('assert')
const request = require('request')
const config = require('../src/lib/config')

var authRedirects
/**
 * This test should be run with the command `npm test`. Your Altruist server must be running locally.
 */
describe('Altruist', checkAuthenticationURLsArray)

function checkAuthenticationURLsArray () {
  describe('Authentication URLs array', function () {
    it('should return an array of authentication URLs', function (done) {
      request(`http://localhost:${config.server.port}${config.authRedirectURL}`, function (err, res, body) {
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
        request.get(`http://localhost:${config.server.port}${authRedirects[i].URL}`, function (err, res, body) {
          assert(!err && res.statusCode === 200)
          done()
        })
      })
    }
    after(checkActionURLs)
  })
}

function checkActionURLs () {
  describe('Action URLs', function () {
    Object.keys(config.actions).forEach(function (action) {
      it(`http://localhost:${config.server.port}/api/v1/actions/${action} should exist.`, function (done) {
        request.post(`http://localhost:${config.server.port}/api/v1/actions/${action}`, function (err, res, body) {
          assert(!err && (res.statusCode === 200 || res.statusCode === 500))
          done()
        })
      })
    })
  })
}
