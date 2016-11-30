'use strict'

const graph = require('fbgraph')
const config = require('../src/lib/config')
const index = require('../src/index')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
const accessToken = index.accessToken

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
    graph.setAccessToken(accessToken)
    graph.post('/feed', { message: 'Does this look infected ?' }, function (err, res) {
      if (err)
        return reject(err)

      return resolve(res)
    })
  })
}
