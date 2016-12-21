'use strict'

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const config = require('../src/lib/config')
const localStorage = require('../src/lib/localstorage')
const google = require('googleapis')
const mmmagic = require('mmmagic')
const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE)

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

function uploadFile (options, resolve, reject) {
  let fileResource = {
    name: (options.filename && options.filename !== '') ? options.filename : options.media.filename,
    mimeType: options.media.contentType
  }
  if (uploadDirectoryID !== '') {
    fileResource.parents = [ uploadDirectoryID ]
  }

  drive.files.create({
    resource: fileResource,
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

  app.get(loginURL, passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file', accessType: 'offline' }))
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
  return new Promise((resolve, reject) => {
    if (!driveSession || !driveSession.accessToken || driveSession.accessToken === '') {
      return reject({
        error: 'invalid token',
        details: 'No access token has been found. Please log in.'
      })
    } else if (!request.files || !request.files[0]) {
      return reject({
        error: 'invalid request',
        details: 'No file has been found. Please upload a file with your request.'
      })
    }

    options.media = {
      filename: request.files[0].originalname,
      data: request.files[0].buffer,
      contentType: request.files[0].mimetype
    }

    magic.detect(options.media.data, (err, res) => {
      if (err) {
        return reject(err)
      }
      options.media.mimeType = res

      googleAuth.setCredentials({ access_token: driveSession.accessToken, refresh_token: driveSession.refreshToken })
      googleAuth.refreshAccessToken((err, tokens) => {
        if (err) {
          return reject(err)
        }

        storeTokens(tokens.access_token, driveSession.refreshToken)
        uploadDirectoryID = options.uploadDirectoryID ? options.uploadDirectoryID : uploadDirectoryID
        uploadFile(options, resolve, reject)
      })
    })
  })
}

module.exports = {
  loginURL,
  auth,
  addRoutes,
run}
