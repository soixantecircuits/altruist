'use strict'

const passport = require('passport')
const DropboxStrategy = require('passport-dropbox-oauth2').Strategy
const Dropbox = require('dropbox')

const config = require('../src/lib/config')
const localStorage = require('../src/lib/localstorage')

var dropboxSession = JSON.parse(localStorage.getItem('dropbox-session')) || { accessToken: '', refreshToken: '' }

const loginURL = config.actions.dropbox.loginURL || '/login/dropbox'
const callbackURL = config.actions.dropbox.callbackURL || '/login/dropbox/return'
const failureURL = config.actions.dropbox.failureURL || '/?failure=dropbox'
const successURL = config.actions.dropbox.successURL || '/?success=dropbox'
const uploadDirectoryPath = config.actions.dropbox.uploadDirectoryPath ? config.actions.dropbox.uploadDirectoryPath : '/'

function storeTokens (aToken, rToken) {
  dropboxSession.accessToken = aToken
  dropboxSession.refreshToken = rToken
  localStorage.setItem('dropbox-session', JSON.stringify(dropboxSession))
}

function auth (app) {
  passport.use(new DropboxStrategy({
    apiVersion: '2',
    clientID: config.actions.dropbox.clientID,
    clientSecret: config.actions.dropbox.clientSecret,
    callbackURL: callbackURL
  }, function (aToken, rToken, profile, done) {
    storeTokens(aToken, rToken)
    return done(null, profile)
  }))

  app.get(loginURL, passport.authenticate('dropbox-oauth2'))
  app.get(callbackURL, passport.authenticate('dropbox-oauth2', { failureRedirect: failureURL }), function (req, res) {
    res.redirect(successURL)
  })
}

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!dropboxSession || !dropboxSession.accessToken) {
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

    let targetDir = options.uploadDirectoryPath && options.uploadDirectoryPath !== '' ? options.uploadDirectoryPath : uploadDirectoryPath
    let filename = options.filename && options.filename !== '' ? options.filename : request.files[0].originalname

    let dropbox = new Dropbox({accessToken: dropboxSession.accessToken})
    dropbox.filesUpload({path: uploadDirectoryPath + filename, contents: request.files[0].buffer})
      .then(function (res) {
        resolve(res)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports =
  {
    loginURL,
    auth,
  run}
