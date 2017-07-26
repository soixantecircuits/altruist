'use strict'

const _ = require('lodash')
const passport = require('passport')
const DropboxStrategy = require('passport-dropbox-oauth2').Strategy
const Dropbox = require('dropbox')

const settings = require('../src/lib/settings').actions.dropbox
const localStorage = require('../src/lib/localstorage')

var dropboxSession = JSON.parse(localStorage.getItem('dropbox-session')) || { accessToken: '', refreshToken: '' }

const loginURL = settings.loginURL || '/login/dropbox'
const callbackURL = settings.callbackURL || '/login/dropbox/return'
const failureURL = settings.failureURL || '/?failure=dropbox'
const successURL = settings.successURL || '/?success=dropbox'
var uploadDirectoryPath = settings.uploadDirectoryPath ? settings.uploadDirectoryPath : '/'
var autoRename = settings.autoRename || true

function storeTokens (aToken, rToken) {
  dropboxSession.accessToken = aToken
  dropboxSession.refreshToken = rToken
  localStorage.setItem('dropbox-session', JSON.stringify(dropboxSession))
}

function auth (app) {
  passport.use(new DropboxStrategy({
    apiVersion: '2',
    clientID: settings.clientID,
    clientSecret: settings.clientSecret,
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

async function run (options, request) {
  try {
    if (!dropboxSession || !dropboxSession.accessToken) {
      throw new Error(JSON.stringify({response: 'No access token has been found. Please log in.'}))
    } else if (!options.media || !Array.isArray(options.media) || options.media.length < 1) {
      throw new Error(JSON.stringify({response: 'No file has been found. Please upload a file with your request.'}))
    }

    let dropbox = new Dropbox({ accessToken: dropboxSession.accessToken })
    uploadDirectoryPath = options.path || uploadDirectoryPath
    autoRename = typeof options.autoRename !== 'undefined' ? options.autoRename : autoRename

    // Send all media to the upload directory one by one
    let results = await Promise.all(_.map(options.media, async (media) => {
      let filename = options.filename || media.name

      try {
        let res = await dropbox.filesUpload({
          contents: media.content,
          path: uploadDirectoryPath + filename,
          autorename: autoRename
        })
        return res
      } catch (e) {
        throw e
      }
    }))

    return results
  } catch (e) {
    throw e
  }
}

module.exports = {
  loginURL,
  auth,
  run
}
