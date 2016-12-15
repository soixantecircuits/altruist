'use strict'

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const FB = require('fb')
const fb = new FB.Facebook()
const config = require('../src/lib/config')
const localStorage = require('../src/lib/localstorage')

const session = localStorage.getItem('facebook-session')
const facebookSession = session ? JSON.parse(session) : {}
let currentID = facebookSession.currentID

const callbackURL = config.actions.facebook.callbackURL || '/login/facebook'
const loginURL = config.actions.facebook.loginURL || '/login/facebook/return'
const failureURL = config.actions.facebook.failureURL || '/?failure=facebook'
const successURL = config.actions.facebook.successURL || '/?success=facebook'

function saveSession () {
  localStorage.setItem('facebook-session', JSON.stringify(facebookSession))
}

function storeUserAccessToken (token) {
  facebookSession.userAccessToken = token
  saveSession()
}

function storeUserProfile (profile) {
  facebookSession.userProfile = profile
  saveSession()
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
      facebookSession.userAccounts = res.data
      saveSession()
    } else {
      console.log(!res ? 'An error occured while getting accounts' : res.error)
    }
    callback(res)
  })
}

// Set the currentID and the current access token according to newID
function setID (newID) {
  if (newID === facebookSession.userProfile.id || newID === 'me') {
    setCurrent('me', facebookSession.userAccessToken)
  } else {
    facebookSession.userAccounts.forEach((account) => {
      ;(account.id === newID) && setCurrent(newID, account.access_token)
    })
  }
  saveSession()
}

function getMediaType (media) {
  if (media) {
    if (media.isBinary) {
      return media.contentType.indexOf(/video/gi) > 0 ? 'videos' : 'photos'
    } else {
      // this will only match filepath, but since there's no such things as base64 videos it's no issue
      return /(\.mov|\.mpe?g?4?|\.wmv)/gi.test(media) ? 'videos' : 'photos'
    }
  } else {
    return null
  }
}

function handlePostRequest ({message, media}, resolve, reject) {
  const isMedia = (media)
  const mediaType = getMediaType(media)
  const datas = {}
  datas[isMedia ? 'caption' : 'message'] = message

  const reHTTP = /^https?:\/\//i
  const reBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

  if (isMedia) {
    if (reHTTP.test(media)) {
      datas.url = media
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

  fb.api(`/${currentID}/${isMedia ? mediaType : 'feed'}`, 'post', datas, (res) => {
    if (!res || res.error) {
      reject(res.error ? res.error : 'An error occured while posting.')
    }
    resolve(res)
  })
}

function auth (app) {
  passport.use(new FacebookStrategy({
    clientID: config.actions.facebook.appID,
    clientSecret: config.actions.facebook.appSecret,
  callbackURL}, function (accessToken, refreshToken, profile, done) {
    storeUserAccessToken(accessToken)
    storeUserProfile(profile)
    getPagesList(() => {
      done(null, profile)
    })
  }))

  app.get(loginURL, passport.authenticate('facebook', {
    scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions']
  }))
  app.get(callbackURL, passport.authenticate('facebook', {
    failureRedirect: failureURL
  }), (req, res) => {
    storeUserProfile(req.user)
    if (config.actions.facebook.pageID) {
      const id = config.actions.facebook.pageID || facebookSession.userProfile.id
      setID(id)
    } else {
      setID(req.user.id)
    }
    res.redirect(successURL)
  })
}

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!facebookSession || !facebookSession.userAccessToken) {
      reject({
        error: 'invalid TOKEN',
        details: 'No facebook user access token found in local storage. Please log in at "/login/facebook".'
      })
    } else if ((!options.message || options.message === '') && (!options.media || options.media === '') && !request.file) {
      reject({
        error: 'invalid argument',
        details: 'No message or media in facebook POST request.'
      })
    }

    // If multer detects a file upload, get the first file and set options to upload to facebook
    if (request.files && request.files[0]) {
      options.media = {
        isBinary: true,
        filename: request.files[0].originalname,
        data: request.files[0].buffer,
        contentType: request.files[0].mimetype
      }
    }

    setID(facebookSession.currentID)
    handlePostRequest(options, resolve, reject)
  })
}

module.exports = {
  loginURL,
  auth,
run}
