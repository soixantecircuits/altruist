'use strict'

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const fb = require('fb')
const config = require('../src/lib/config')
const localStorage = require('../src/lib/localStorage')

const session = localStorage.getItem('facebookSession')
const facebookSession = session ? JSON.parse(session) : {}
let currentID = null

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

function setCurrentID (newID) {
  facebookSession.currentID = newID
  saveSession()
}

// Set the currentID and the current access token according to newId
function switchToID (newID) {
  if (newID === 'me') {
    setCurrentID(facebookSession.userProfile.ID)
    fb.setAccessToken(facebookSession.userAccessToken)
  } else {
    for (var i = 0; i < facebookSession.userAccounts.length; ++i) {
      if (facebookSession.userAccounts[i].ID === newID) {
        setCurrentID(newID)
        return fb.setAccessToken(facebookSession.userAccounts[i].access_token)
      }
    }
  }
  // If newID was not found in facebookSession.userAccounts, assume it is the user's ID
  setCurrentID(newID)
  fb.setAccessToken(facebookSession.userAccessToken)
}

function handlePostRequest (options, resolve, reject) {
  const message = options.message || ''
  if (options.pictureURL) {
    postPictureFromURL(currentID, options.pictureURL, message, resolve, reject)
  } else if (message.length) {
    postMessage(currentID, message, resolve, reject)
  }
}

function postMessage (objectID, postMessage, resolve, reject) {
  fb.api(`/${objectID}/feed`, 'post', { message: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while posting a message.' : res.error)
    }
    return resolve(res)
  })
}

function postPictureFromURL (objectID, pictureURL, postMessage, resolve, reject) {
  fb.api(`/${objectID}/photos`, 'post', { URL: pictureURL, caption: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while posting a picture.' : res.error)
    }
    return resolve(res)
  })
}

function postUploadedPicture (objectID, pictureData, postMessage, resolve, reject) {
  fb.api(`/${objectID}/photos`, 'post', { source: { value: pictureData.data, options: { contentType: pictureData.contentType, filename: pictureData.filename } }, caption: postMessage }, function (res) {
    if (!res || res.error) {
      return reject(!res ? 'An error occured while uploading a picture.' : res.error)
    }
    return resolve(res)
  })
}

function auth (app) {
  passport.use(new FacebookStrategy({
    clientID: config.actions.facebook.appID,
    clientSecret: config.actions.facebook.appSecret,
    callbackURL: config.actions.facebook.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    storeUserAccessToken(accessToken)
    storeUserProfile(profile)
    return done(null, profile)
  }))

  app.get(config.actions.facebook.loginURL, passport.authenticate('facebook', {
    scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions']
  }))
  app.get(config.actions.facebook.callbackURL, passport.authenticate('facebook', {
    failureRedirect: config.actions.facebook.failureURL
  }), function (req, res) {
    storeUserProfile(req.user)
    getPagesList(() => {
      res.redirect(config.actions.facebook.successURL)
    })
  })
}

function run (options, request) {
  if (!facebookSession || !facebookSession.userAccessToken) {
    return new Promise((resolve, reject) => {
      return reject({ 'error': 'invalid TOKEN', 'details': 'No facebook user access token found in local storage. Please log in at "/login/facebook".' })
    })
  } else if ((!options.message || options.message === '') && (!options.pictureURL || options.pictureURL === '') && !request.file) {
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
    // if (facebookSession.currentID) {
    //   switchToID(facebookSession.currentID)
    // } else {
    //   switchToID('me')
    // }
    handlePostRequest(options, resolve, reject)
  })
}

module.exports = {
  auth,
  run,
  redirectURL: config.actions.facebook.loginURL
}
