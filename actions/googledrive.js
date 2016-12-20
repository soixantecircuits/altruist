'use strict'

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const config = require('../src/lib/config')
const localStorage = require('../src/lib/localstorage')
const google = require('googleapis')

var driveSession = JSON.parse(localStorage.getItem('googledrive-session')) || { accessToken: '', refreshToken: '' }
var userProfile = JSON.parse(localStorage.getItem('googledrive-profile')) || {}
var uploadDirectoryID = config.actions.googledrive.uploadDirectoryID ? config.actions.googledrive.uploadDirectoryID : ''

const loginURL = config.actions.googledrive.loginURL || '/login/gdrive'
const callbackURL = config.actions.googledrive.callbackURL || '/login/gdrive/return'
const failureURL = config.actions.googledrive.failureURL || '/?failure=drive'
const successURL = config.actions.googledrive.successURL || '/?success=drive'
const profileURL = config.actions.googledrive.profileURL || '/profile/gdrive'

var OAuth2 = google.auth.OAuth2
var googleAuth = new OAuth2(
  config.actions.googledrive.clientID,
  config.actions.googledrive.clientSecret,
  config.actions.googledrive.callbackURL
)
var drive = google.drive({ version: 'v3', auth: googleAuth})

function storeTokens (atoken, rtoken) {
  driveSession.accessToken = atoken
  driveSession.refreshToken = rtoken
  localStorage.setItem('googledrive-session', JSON.stringify(driveSession))
}

function storeProfile (profile) {
  userProfile = profile
  localStorage.setItem('googledrive-profile', JSON.stringify(userProfile))
}

function auth (app) {
  passport.use(new GoogleStrategy({
    clientID: config.actions.googledrive.clientID,
    clientSecret: config.actions.googledrive.clientSecret,
    callbackURL: callbackURL
  },
    function (token, refreshToken, profile, done) {
      googleAuth.setCredentials({
        access_token: token,
        refresh_token: refreshToken
      })
      storeTokens(token, refreshToken)
      storeProfile(profile)
      done(null, profile)
    }
  ))

  app.get(loginURL, passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file' }))
  app.get(callbackURL, passport.authenticate('google', {failureRedirect: failureURL}), (req, res) => {
    res.redirect(successURL)
  })
}

function addRoutes (app) {
  app.get(profileURL, (req, res) => {
    res.send(userProfile)
  })
}

function run (options, request) {
  if (!driveSession || !driveSession.accessToken || driveSession.accessToken === '') {
    return new Promise((resolve, reject) => {
      reject({
        error: 'invalid token',
        details: 'No access token has been found. Please log in.'
      })
    })
  } else {
    googleAuth.setCredentials({ access_token: driveSession.accessToken, refresh_token: driveSession.refreshToken })
  }

  return new Promise((resolve, reject) => {
    if (request.files && request.files[0]) {
      options.media = {
        filename: request.files[0].originalname,
        data: request.files[0].buffer,
        contentType: request.files[0].mimetype
      }
    } else {
      return reject({ error: 'invalid request', details: 'There is no file to upload in your request.'})
    }

    uploadDirectoryID = options.uploadDirectoryID ? options.uploadDirectoryID : uploadDirectoryID

    drive.files.create({
      resource: {
        name: (options.filename && options.filename !== '') ? options.filename : options.media.filename,
        mimeType: options.media.contentType,
        parents: [ uploadDirectoryID ]
      },
      media: {
        mimeType: options.media.contentType,
        body: options.media.data
      }
    }, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

module.exports = {
  loginURL,
  auth,
  addRoutes,
run}
