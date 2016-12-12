'use strict'

const app = require('../src/index').app
var localStorage = require('../src/index').localStorage
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const graph = require('fbgraph')
const config = require('../src/lib/config')

var facebookSession = localStorage.getItem('facebookSession')
facebookSession = facebookSession != undefined ? JSON.parse(facebookSession) : {}
var pageId = config.actions.facebook.pageId
var currentId

function saveSession () {
  localStorage.setItem('facebookSession', JSON.stringify(facebookSession))
}

function storeUserAccessToken (token) {
  facebookSession.userAccessToken = token
  saveSession()
}

function storePageAccessToken (token) {
  facebookSession.pageAccessToken = token
  saveSession()
}

function storeUserProfile (profile) {
  facebookSession.userProfile = profile
  saveSession()
}

function handlePostRequest (options, resolve, reject) {
  if (options.pictureUrl != undefined && options.pictureUrl !== '') {
    postPictureFromUrl(currentId, options.pictureUrl, options.message != undefined ? options.message : '', resolve, reject)
  } else {
    postMessage(currentId, options.message, resolve, reject)
  }
}

function postMessage (objectId, postMessage, resolve, reject) {
  graph.post(`/${objectId}/feed`, { message: postMessage }, function (err, res) {
    if (err) {
      return reject(err)
    }
    return resolve(res)
  })
}

function postPictureFromUrl (objectId, pictureUrl, postMessage, resolve, reject) {
  graph.post(`/${objectId}/photos`, { url: pictureUrl, caption: postMessage }, function (err, res) {
    if (err) {
      return reject(err)
    }
    return resolve(res)
  })
}

function getPageToken (options, resolve, reject, callback) {
  graph.get(`/${pageId}`, { fields: 'access_token' }, (err, res) => {
    if (err) {
      return reject(err)
    }
    storePageAccessToken(res.access_token)
    callback(options, resolve, reject)
  })
}

function auth () {
  passport.use(new FacebookStrategy({
    clientID: config.actions.facebook.appId,
    clientSecret: config.actions.facebook.appSecret,
    callbackURL: 'http://localhost:' + config.server.port + '/login/facebook/return'
  },
    function (accessToken, refreshToken, profile, done) {
      storeUserAccessToken(accessToken)
      storeUserProfile(profile)
      return done(null, profile)
    }
  ))

  app.get('/login/facebook', passport.authenticate('facebook', { scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions'] }))
  app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/' })
    , function (req, res) {
      storeUserProfile(req.user)
      res.redirect('/')
    })
}

function run (options, request) {
  if (facebookSession.userAccessToken == undefined) {
    return new Promise((resolve, reject) => {
      return reject('No user accessToken found. Please log in at "/login/facebook"')
    })
  } else if ((options.message == undefined || options.message === '') && options.pictureUrl == undefined) {
    return new Promise((resolve, reject) => {
      return reject('No message in request.')
    })
  }

  return new Promise((resolve, reject) => {
    pageId = pageId != undefined ? `${pageId}` : ''
    graph.setAccessToken(facebookSession.userAccessToken)
    currentId = facebookSession.userProfile.id

    if (pageId !== '') {
      if (facebookSession.pageAccessToken == undefined) {
        getPageToken(options, resolve, reject, (options, resolve, reject) => {
          graph.setAccessToken(facebookSession.pageAccessToken)
          currentId = pageId
          handlePostRequest(options, resolve, reject)
        })
      } else {
        graph.setAccessToken(facebookSession.pageAccessToken)
        currentId = pageId
        handlePostRequest(options, resolve, reject)
      }
    } else {
      handlePostRequest(options, resolve, reject)
    }
  })
}

module.exports = {
  auth: auth,
  run: run,
  FacebookStrategy: FacebookStrategy,
  facebookSession: facebookSession
}
