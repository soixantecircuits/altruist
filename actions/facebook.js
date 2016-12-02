'use strict'

var localStorage = require('../src/index').localStorage
const facebookSession = require('../src/lib/facebookSession')
const graph = require('fbgraph')
const config = require('../src/lib/config')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
const userAccessToken = localStorage.getItem('userAccessToken')
var pageAccessToken = localStorage.getItem('pageAccessToken')
var pageId = config.actions.facebook.pageId

function StoreUserAccessToken (token) {
  userAccessToken = token
  localStorage.setItem('userAccessToken', userAccessToken)
}

function StorePageAccessToken (token) {
  pageAccessToken = token
  localStorage.setItem('pageAccessToken', pageAccessToken)
}

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
        StorePageAccessToken(res.access_token)
        graph.setAccessToken(pageAccessToken)
        PostMessage(options.message, resolve, reject)
      })
    } else {
      PostMessage(options.message, resolve, reject)
    }
  })
}
