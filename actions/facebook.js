'use strict'

const passport = require('passport')
const graph = require('fbgraph')
const FacebookStrategy = require('passport-facebook').Strategy
const app = require('../src/index').app
var localStorage = require('../src/index').localStorage

const config = require('../src/lib/config')

var facebookSession = localStorage.getItem('facebookSession')
facebookSession = typeof facebookSession !== undefined ? JSON.parse(facebookSession) : {}
var pageId = config.actions.facebook.pageId

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

function getPagesList (callback) {
  graph.setAccessToken(facebookSession.userAccessToken)
  graph.get('/me/accounts', null, (err, res) => {
    if (typeof err === undefined) {
      facebookSession.userAccounts = res.data
      saveSession()
    }
    callback(res, err)
  })
}

function setCurrentId (pageId) {
  facebookSession.currentId = pageId
  saveSession()
}

function handlePostRequest (options, resolve, reject) {
  if (typeof options.pictureUrl !== undefined && options.pictureUrl !== '') {
    postPictureFromUrl(facebookSession.currentId, options.pictureUrl, typeof options.message !== undefined ? options.message : '', resolve, reject)
  } else if (typeof options.message !== undefined && options.message !== '') {
    postMessage(facebookSession.currentId, options.message, resolve, reject)
  } else {
    postUploadedPicture(facebookSession.currentId, options, null, resolve, reject)
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

function postUploadedPicture (objectId, pictureData, postMessage, resolve, reject) {
  graph.post(`/${objectId}/photos`, pictureData, function (err, res) {
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
      getPagesList()
      res.redirect('/')
    })
}

function run (options, request) {
  if (typeof facebookSession.userAccessToken === undefined) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid TOKEN', 'details': 'No facebook user access token found in local storage. Please log in at "/login/facebook".' })
    })
  } else if ((typeof options.message === undefined || options.message === '') && (typeof options.pictureUrl === undefined || options.pictureUrl === '') && typeof request.file === undefined) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid argument', 'details': 'No message or picture in facebook POST request.' })
    })
  }

  if (typeof request.file !== undefined) {
    options = request.file.buffer
  }

  return new Promise((resolve, reject) => {
    pageId = typeof pageId !== undefined ? `${pageId}` : ''
    graph.setAccessToken(facebookSession.userAccessToken)
    setCurrentId(facebookSession.userProfile.id)

    if (pageId !== '') {
      if (typeof facebookSession.pageAccessToken !== undefined) {
        getPageToken(options, resolve, reject, (options, resolve, reject) => {
          graph.setAccessToken(facebookSession.pageAccessToken)
          setCurrentId(pageId)
          handlePostRequest(options, resolve, reject)
        })
      } else {
        graph.setAccessToken(facebookSession.pageAccessToken)
        setCurrentId(pageId)
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
