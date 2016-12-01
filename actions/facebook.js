'use strict'

const facebookSession = require('../src/lib/facebookSession')
const graph = require('fbgraph')
const config = require('../src/lib/config')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
const accessToken = facebookSession.accessToken

module.exports = (options) => {
  if (options.message === 'undefined' || options.message === '') {
    console.log('POST request to facebook without a message')
    return new Promise((resolve, reject) => {
      return reject('Could not get message in request.')
    })
  }

  return new Promise((resolve, reject) => {
    var postMessage = options.message
    console.log(postMessage)
    graph.setAccessToken(accessToken)
    graph.post('/feed', { message: postMessage }, function (err, res) {
      if (err) {
        return reject(err)
      }

      return resolve(res)
    })
  })
}
