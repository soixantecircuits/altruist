'use strict'

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const fb = require('fb')
const app = require('../src/index').app
var localStorage = require('../src/index').localStorage

const config = require('../src/lib/config')

var facebookSession = localStorage.getItem('facebookSession')
facebookSession = facebookSession ? JSON.parse(facebookSession) : {}

function saveSession () {
  localStorage.setItem('facebookSession', JSON.stringify(facebookSession))
}

function storeUserAccessToken (token) {
  facebookSession.userAccessToken = token
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
      console.log(!res ? 'An error occured while getting accounts' : res.error)
    }
    callback(res)
  })
}

function setCurrentId (newId) {
  facebookSession.currentId = newId
  saveSession()
}

// Set the currentId and the current access token according to newId
function switchToId (newId) {
  if (newId === 'me') {
    setCurrentId(facebookSession.userProfile.id)
    fb.setAccessToken(facebookSession.userAccessToken)
  } else {
    for (var i = 0; i < facebookSession.userAccounts.length; ++i) {
      if (facebookSession.userAccounts[i].id === newId) {
        setCurrentId(newId)
        return fb.setAccessToken(facebookSession.userAccounts[i].access_token)
      }
    }
  }
  // If newId was not found in facebookSession.userAccounts, assume it is the user's id
  setCurrentId(newId)
  fb.setAccessToken(facebookSession.userAccessToken)
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

function auth () {
  passport.use(new FacebookStrategy({
    clientID: config.actions.facebook.appId,
    clientSecret: config.actions.facebook.appSecret,
    callbackURL: config.actions.facebook.callbackURL
  },
    function (accessToken, refreshToken, profile, done) {
      storeUserAccessToken(accessToken)
      storeUserProfile(profile)
      return done(null, profile)
    }
  ))

  app.get(config.actions.facebook.loginUrl, passport.authenticate('facebook', { scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions'] }))
  app.get(config.actions.facebook.callbackUrl, passport.authenticate('facebook', { failureRedirect: config.actions.facebook.failureUrl })
    , function (req, res) {
      storeUserProfile(req.user)
      getPagesList(() => {
        res.redirect(config.actions.facebook.successUrl)
      })
    })
}

function run (options, request) {
  if (!facebookSession || !facebookSession.userAccessToken) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid TOKEN', 'details': 'No facebook user access token found in local storage. Please log in at "/login/facebook".' })
    })
  } else if ((!options.message || options.message === '') && (!options.pictureUrl || options.pictureUrl === '') && !request.file) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid argument', 'details': 'No message or picture in facebook POST request.' })
    })
  }

  // If multer detects a file upload, get the first file and set options to upload to facebook
  if (request.files && request.files.file) {
    options = {
      caption: options.message,
      filename: request.files.file[0].originalname,
      data: request.files.file[0].buffer,
      contentType: request.files.file[0].mimetype
    }
  }

  return new Promise((resolve, reject) => {
    if (facebookSession.currentId) {
      switchToId(facebookSession.currentId)
    } else {
      switchToId('me')
    }
    handlePostRequest(options, resolve, reject)
  })
}

module.exports = {
  auth: auth,
  run: run,
  switchToId: switchToId
}
