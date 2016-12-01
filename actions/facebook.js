'use strict'

const facebookSession = require('../src/lib/facebookSession')
const graph = require('fbgraph')
const config = require('../src/lib/config')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
console.log(facebookSession)
const accessToken = facebookSession.accessToken

module.exports = (options) => {
  // try {
  //   options.vars = options.vars ?
  //     typeof options.vars === 'object'
  //       ? options.vars
  //       : JSON.parse(options.vars)
  //     : {}
  // } catch (e) {
  //   return new Promise((resolve, reject) => reject(e.toString()))
  // }

  return new Promise((resolve, reject) => {
    console.log('facebook token ' + accessToken)
    graph.setAccessToken(accessToken)
    graph.post('/feed', { message: 'This is a test message' }, function (err, res) {
      if (err)
        return reject(err)

      return resolve(res)
    })
  })
}
