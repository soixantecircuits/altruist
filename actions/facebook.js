'use strict'

const facebookSession = require('../src/lib/facebookSession')
const graph = require('fbgraph')
const config = require('../src/lib/config')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
const userAccessToken = facebookSession.accessToken
var pageAccessToken = ''
var pageId = config.actions.facebook.pageId

function PostMessage (postMessage, resolve, reject) {
  graph.post(`/${pageId}/feed`, { message: postMessage }, function (err, res) {
    if (err) {
      return reject(err)
    }
    return resolve(res)
  })
}

module.exports = (options) => {
  if (options.message === 'undefined' || options.message === '') {
    return new Promise((resolve, reject) => {
      console.log('POST request to facebook without a message')
      return reject('Could not get message in request.')
    })
  }

  return new Promise((resolve, reject) => {
    pageId = pageId !== 'undefined' ? `${pageId}` : ''
    graph.setAccessToken(userAccessToken)

    if (pageId !== '') {
      graph.get(`/${pageId}`, { fields: 'access_token' }, (err, res) => {
        if (err) {
          return reject(err)
        }
        pageAccessToken = res.access_token
        graph.setAccessToken(pageAccessToken)
        PostMessage(options.message, resolve, reject)
      })
    } else {
      PostMessage(options.message, resolve, reject)
    }
  })
}
