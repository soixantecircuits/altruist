'use strict'

const _ = require('lodash')
const google = require('googleapis')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const localStorage = require('../src/lib/localstorage')
const settings = require('../src/lib/settings').actions.googledrive

var driveSession = JSON.parse(localStorage.getItem('googledrive-session')) || { accessToken: '', refreshToken: '' }
var userProfile = JSON.parse(localStorage.getItem('googledrive-profile')) || {}
var uploadDirectoryID = settings.uploadDirectoryID ? settings.uploadDirectoryID : ''

const loginURL = settings.loginURL || '/login/gdrive'
const callbackURL = settings.callbackURL || '/login/gdrive/return'
const failureURL = settings.failureURL || '/?failure=drive'
const successURL = settings.successURL || '/?success=drive'
const profileURL = settings.profileURL || '/profile/gdrive'

var OAuth2 = google.auth.OAuth2
var googleAuth = new OAuth2(
  settings.clientID,
  settings.clientSecret,
  settings.callbackURL
)
var drive = google.drive({ version: 'v3', auth: googleAuth })

function storeTokens (atoken, rtoken) {
  driveSession.accessToken = atoken
  driveSession.refreshToken = rtoken
  localStorage.setItem('googledrive-session', JSON.stringify(driveSession))
}

function storeProfile (profile) {
  userProfile = profile
  localStorage.setItem('googledrive-profile', JSON.stringify(userProfile))
}

function uploadFile (media) {
  return new Promise((resolve, reject) => {
    let fileResource = {
      name: media.name,
      mimeType: media.type
    }
    if (uploadDirectoryID && uploadDirectoryID !== '') {
      fileResource.parents = [uploadDirectoryID]
    }

    drive.files.create({
      resource: fileResource,
      media: {
        mimeType: media.type,
        body: media.content
      }
    }, (error, result) => {
      if (error) {
        reject(new Error(error.errors[0].message))
      } else {
        resolve(result)
      }
    })
  })
}

function auth (app) {
  passport.use('google-drive', new GoogleStrategy({
    clientID: settings.clientID,
    clientSecret: settings.clientSecret,
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

  app.get(loginURL, passport.authenticate('google-drive', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file'
    ],
    accessType: 'offline',
    prompt: 'select_account'
  }))
  app.get(callbackURL, passport.authenticate('google-drive', {
    failureRedirect: failureURL
  }), (req, res) => {
    res.redirect(successURL)
  })
}

function addRoutes (app) {
  app.get(profileURL, (req, res) => {
    res.send(userProfile)
  })
}

function run (options) {
  return new Promise((resolve, reject) => {
    if (!driveSession || !driveSession.accessToken || driveSession.accessToken === '') {
      return reject(new Error('No access token has been found. Please log in.'))
    } else if (!options.media || !Array.isArray(options.media) || options.media.length < 1) {
      return reject(new Error('No file has been found in request. Please upload a file with your request.'))
    }

    googleAuth.setCredentials({ access_token: driveSession.accessToken, refresh_token: driveSession.refreshToken })
    googleAuth.refreshAccessToken((err, tokens) => {
      if (err) {
        return reject(err)
      }

      storeTokens(tokens.access_token, driveSession.refreshToken)
      uploadDirectoryID = options.uploadDirectoryID ? options.uploadDirectoryID : uploadDirectoryID
      Promise.all(_.map(options.media, uploadFile))
      .then(results => resolve(results))
      .catch(err => reject(err))
    })
  })
}

module.exports = {
  loginURL,
  auth,
  addRoutes,
  run
}
