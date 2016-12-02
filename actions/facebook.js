'use strict'

var localStorage = require('../src/index').localStorage
const facebookSession = require('../src/lib/facebookSession')
const graph = require('fbgraph')
const config = require('../src/lib/config')

const appId = config.actions.facebook.appId
const appSecret = config.actions.facebook.appSecret
const userAccessToken = localStorage.getItem('userAccessToken')
const userProfile = JSON.parse(localStorage.getItem('userProfile'))
var pageAccessToken = localStorage.getItem('pageAccessToken')
var pageId = config.actions.facebook.pageId
var currentId

function StoreUserAccessToken (token) {
  userAccessToken = token
  localStorage.setItem('userAccessToken', userAccessToken)
}

function StorePageAccessToken (token) {
  pageAccessToken = token
  localStorage.setItem('pageAccessToken', pageAccessToken)
}

function GetPageToken (options, resolve, reject, callback) {
  graph.get(`/${pageId}`, { fields: 'access_token' }, (err, res) => {
    if (err) {
      return reject(err)
    }
    StorePageAccessToken(res.access_token)
    callback(options, resolve, reject)
  })
}

function HandlePostRequest (options, resolve, reject) {
  if (options.pictureUrl != undefined && options.pictureUrl !== '') {
    PostPictureFromUrl(currentId, options.pictureUrl, options.message != undefined ? options.message : '', resolve, reject)
  }  else {
    PostMessage(options.message, resolve, reject)
  }
}

function PostMessage (objectId, postMessage, resolve, reject) {
  graph.post(`/${objectId}/feed`, { message: postMessage }, function (err, res) {
    if (err) {
      return reject(err)
    }
    return resolve(res)
  })
}

function PostPictureFromUrl (objectId, pictureUrl, postMessage, resolve, reject) {
  graph.post(`/${objectId}/photos`, { url: pictureUrl, caption: postMessage }, function (err, res) {
    if (err) {
      return reject(err)
    }
    return resolve(res)
  })
}

module.exports = (options, request) => {
  if (facebookSession.user == undefined) {
    return new Promise((resolve, reject) => {
      console.log('No passport session started.')
      return reject('No session started.')
    })
  }
  else if ((options.message == undefined || options.message === '') && options.pictureUrl == undefined) {
    return new Promise((resolve, reject) => {
      console.log('POST request to facebook without a message or picture')
      return reject('Could not get message in request.')
    })
  }

  return new Promise((resolve, reject) => {
    pageId = pageId != undefined ? `${pageId}` : ''
    graph.setAccessToken(userAccessToken)
    currentId = userProfile.id

    if (pageId != '') {
      GetPageToken(options, resolve, reject, (options, resolve, reject) => {
        graph.setAccessToken(pageAccessToken)
        currentId = pageId
        HandlePostRequest(options, resolve, reject)
      })
    } else {
      HandlePostRequest(options, resolve, reject)
    }
  })
}
