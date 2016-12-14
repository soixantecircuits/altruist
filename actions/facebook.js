'use strict'

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const fb = require('fb')
const app = require('../src/index').app
var localStorage = require('../src/index').localStorage

const config = require('../src/lib/config')

var facebookSession = localStorage.getItem('facebookSession')
facebookSession = facebookSession ? JSON.parse(facebookSession) : {}
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
  fb.setAccessToken(facebookSession.userAccessToken)

  fb.api('/me/accounts', (res) => {
    if (res && !res.error) {
      facebookSession.userAccounts = res.data
      saveSession()
    } else {
      console.log(!res ? 'An error occured' : res.error)
    }

    callback(res)
  })
}

function setCurrentId (newId) {
  facebookSession.currentId = newId
  saveSession()
}

function handlePostRequest (options, resolve, reject) {
  if (options.pictureUrl && options.pictureUrl !== '') {
    postPictureFromUrl(facebookSession.currentId, options.pictureUrl, options.message ? options.message : '', resolve, reject)
  } else if (options.message && options.message !== '') {
    postMessage(facebookSession.currentId, options.message, resolve, reject)
  } else {
    postUploadedPicture(facebookSession.currentId, options, options.caption, resolve, reject)
  }
}

function postMessage (objectId, postMessage, resolve, reject) {
  fb.api(`/${objectId}/feed`, 'post', { message: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while posting a message.' : res.error)
    }
    return resolve(res)
  })
}

function postPictureFromUrl (objectId, pictureUrl, postMessage, resolve, reject) {
  fb.api(`/${objectId}/photos`, 'post', { url: pictureUrl, caption: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while posting a picture.' : res.error)
    }
    return resolve(res)
  })
}

function postUploadedPicture (objectId, pictureData, postMessage, resolve, reject) {
  fb.api(`/${objectId}/photos`, 'post', { source: { value: pictureData.data, options: { contentType: pictureData.contentType, filename: pictureData.filename } }, caption: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while uploading a picture.' : res.error)
    }
    return resolve(res)
  })
}

function getPageToken (options, resolve, reject, callback) {
  fb.api(`/${pageId}`, { fields: ['access_token'] }, (res) => {
    if (!res || res.error) {
      return reject(!res ? "An error occured while getting page's token" : res.error)
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
      getPagesList(() => {
        res.redirect('/')
      })
    })
}

function run (options, request) {
  if (!facebookSession.userAccessToken) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid TOKEN', 'details': 'No facebook user access token found in local storage. Please log in at "/login/facebook".' })
    })
  } else if ((!options.message || options.message === '') && (!options.pictureUrl || options.pictureUrl === '') && !request.file) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid argument', 'details': 'No message or picture in facebook POST request.' })
    })
  }

  if (request.file) {
    options = {
      caption: options.message,
      filename: request.file.originalname,
      data: request.file.buffer,
      contentType: request.file.mimetype
    }
  }

  return new Promise((resolve, reject) => {
    pageId = pageId ? `${pageId}` : ''
    fb.setAccessToken(facebookSession.userAccessToken)
    setCurrentId(facebookSession.userProfile.id)

    if (pageId !== '') {
      if (!facebookSession.pageAccessToken) {
        getPageToken(options, resolve, reject, (options, resolve, reject) => {
          fb.setAccessToken(facebookSession.pageAccessToken)
          setCurrentId(pageId)
          handlePostRequest(options, resolve, reject)
        })
      } else {
        fb.setAccessToken(facebookSession.pageAccessToken)
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
