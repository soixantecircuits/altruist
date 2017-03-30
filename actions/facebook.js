'use strict'

const passport = require('passport')
const _ = require('lodash')
const FacebookStrategy = require('passport-facebook').Strategy
var fb = new require('fb')
fb.options({ version: 'v2.8' })
const settings = require('nconf').get('app')
const localStorage = require('../src/lib/localstorage')

let facebookSession = JSON.parse(localStorage.getItem('facebook-session')) || {}
let userProfile = JSON.parse(localStorage.getItem('user-profile')) || {}
let userAccounts = JSON.parse(localStorage.getItem('user-accounts')) || []
let currentID = facebookSession.currentID

const callbackURL = settings.actions.facebook.callbackURL || '/login/facebook'
const loginURL = settings.actions.facebook.loginURL || '/login/facebook/return'
const failureURL = settings.actions.facebook.failureURL || '/?failure=facebook'
const successURL = settings.actions.facebook.successURL || '/?success=facebook'
const profileURL = settings.actions.facebook.profileURL || '/profile/facebook'
const accountsURL = settings.actions.facebook.accountsURL || '/accounts/facebook'

function saveSession () {
  localStorage.setItem('facebook-session', JSON.stringify(facebookSession))
}

function storeUserAccessToken (token) {
  facebookSession.userAccessToken = token
  saveSession()
}

function storeUserProfile (profile) {
  userProfile = profile
  localStorage.setItem('user-profile', JSON.stringify(userProfile))
}

function storeUserAccounts (accounts) {
  userAccounts = accounts
  localStorage.setItem('user-accounts', JSON.stringify(userAccounts))
}

function setCurrent (ID, token) {
  currentID = ID
  facebookSession.currentID = ID
  fb.setAccessToken(token)
  saveSession()
}

function getPagesList (callback) {
  var lastID = facebookSession.currentID
  setID('me')
  fb.api('/me/accounts', (res) => {
    if (res && !res.error) {
      setID(lastID)
      storeUserAccounts(res.data)
    } else {
      res = {
        error: res.error.type,
        details: res.error.message
      }
    }
    callback(res)
  })
}

// Set the currentID and the current access token according to newID
function setID (newID) {
  if (newID === userProfile.id || newID === 'me') {
    setCurrent('me', facebookSession.userAccessToken)
  } else {
    userAccounts.forEach((account) => {
      ;(account.id === newID) && setCurrent(newID, account.access_token)
    })
  }
  saveSession()
}

function getMediaType (media) {
  if (media) {
    if (media.isBinary) {
      return media.contentType.search(/video/gi) > -1 ? 'videos' : 'photos'
    } else {
      // this will only match filepath, but since there's no such things as base64 videos it's no issue
      return /(\.mov|\.mpe?g?4?|\.wmv)/gi.test(media) ? 'videos' : 'photos'
    }
  } else {
    return null
  }
}

function handlePostRequest ({message, link, media}, resolve, reject) {
  const isMedia = (media)
  const mediaType = getMediaType(media)
  const datas = {}
  datas[isMedia ? (mediaType === 'videos' ? 'description' : 'caption') : 'message'] = message

  const reHTTP = /^https?:\/\//i
  const reBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

  if (isMedia) {
    if (reHTTP.test(media)) {
      mediaType === 'videos' ? datas.file_url = media : datas.url = media
    } else if (reBase64.test(media)) {
      // ???
    } else if (media.isBinary) {
      datas.source = {
        value: media.data,
        options: {
          contentType: media.contentType,
          filename: media.filename
        }
      }
    } else {
      datas.source = require('fs').createReadStream(media)
    }
  }

  if (link) {
    datas.link = link
  }

  fb.api(`/${currentID}/${isMedia ? mediaType : 'feed'}`, 'post', datas, (res) => {
    if (!res || res.error) {
      reject({ error: res.error.code, details: res.error.message })
    }
    resolve(res)
  })
}

function auth (app) {
  passport.use(new FacebookStrategy({
    clientID: settings.actions.facebook.appID,
    clientSecret: settings.actions.facebook.appSecret,
  callbackURL}, function (accessToken, refreshToken, profile, done) {
    storeUserAccessToken(accessToken)
    storeUserProfile(profile)
    getPagesList(() => {
      done(null, profile)
    })
  }))

  app.get(loginURL, passport.authenticate('facebook', {
    authType: 'reauthenticate',
    scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions']
  }))
  app.get(callbackURL, passport.authenticate('facebook', {
    failureRedirect: failureURL
  }), (req, res) => {
    storeUserProfile(req.user)
    if (settings.actions.facebook.pageID) {
      setID(settings.actions.facebook.pageID)
    } else {
      setID(req.user.id)
    }
    res.redirect(successURL)
  })
}

function addRoutes (app) {
  app.get(profileURL, (req, res) => {
    res.send(Object.keys(userProfile).length !== 0 ? userProfile : {
      error: 'not logged in',
      details: 'userProfile has not been set. Please log in.'
    })
  })

  app.get(accountsURL, (req, res) => {
    res.send(Object.keys({userAccounts}).length !== 0 ? userAccounts : {
      error: 'not logged in',
      details: 'userAccounts has not been set. Please log in.'
    })
  })
}

function run (options, request) {
  return new Promise((resolve, reject) => {
    const media = _.get(options, 'path') || _.get(settings, 'actions.facebook.path')
    const message = _.get(options, 'meta.message') || _.get(settings, 'actions.facebook.message')
    const link = _.get(options, 'meta.link') || _.get(settings, 'actions.facebook.link')

    if (!facebookSession || !facebookSession.userAccessToken) {
      return reject({
        error: 'invalid TOKEN',
        details: `No facebook user access token found in local storage. Please log in at ${loginURL}.`
      })
    } else if ((!message) && (!media) && !request.file && link) {
      return reject({
        error: 'invalid argument',
        details: 'No message or media in facebook POST request.'
      })
    }

    // If multer detects a file upload, get the first file and set options to upload to facebook
    if (request.files && request.files[0]) {
      media = {
        isBinary: true,
        filename: request.files[0].originalname,
        data: request.files[0].buffer,
        contentType: request.files[0].mimetype
      }
    }

    setID(facebookSession.currentID)
    handlePostRequest({ message, link, media}, resolve, reject)
  })
}

module.exports = {
  loginURL,
  auth,
  addRoutes,
run}
