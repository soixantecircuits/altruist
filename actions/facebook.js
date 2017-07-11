'use strict'

const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
var FB = require('fb')
var fb = new FB.Facebook()
fb.options({ version: 'v2.8' })
const settings = require('../src/lib/settings').actions.facebook
const localStorage = require('../src/lib/localstorage')

let facebookSession = JSON.parse(localStorage.getItem('facebook-session')) || {}
let userProfile = JSON.parse(localStorage.getItem('user-profile')) || {}
let userAccounts = JSON.parse(localStorage.getItem('user-accounts')) || []
let currentID = facebookSession.currentID

const loginURL = settings.loginURL || '/login/facebook'
const callbackURL = settings.callbackURL || '/login/facebook/return'
const failureURL = settings.failureURL || '/?failure=facebook'
const successURL = settings.successURL || '/?success=facebook'
const profileURL = settings.profileURL || '/profile/facebook'
const accountsURL = settings.accountsURL || '/accounts/facebook'

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
      (account.id === newID) && setCurrent(newID, account.access_token)
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

function handlePostRequest ({ message, link, media }, resolve, reject) {
  const isMedia = (media && Array.isArray(media) && media.length > 0)
  const datas = {}
  const mediaType = isMedia ? getMediaType(media[0]) : null
  datas[isMedia ? (mediaType === 'videos' ? 'description' : 'caption') : 'message'] = message

  if (isMedia) {
    if (media[0].url) {
      mediaType === 'videos' ? datas.file_url = media[0].url : datas.url = media[0].url
    } else {
      datas.source = {
        value: Buffer.from(media[0].content, 'base64'),
        options: {
          contentType: media[0].type,
          filename: media[0].name
        }
      }
    }
  }

  if (link) {
    datas.link = link
  }

  fb.api(`/${currentID}/${isMedia ? mediaType : 'feed'}`, 'post', datas, (res) => {
    if (!res || res.error) {
      reject(new Error(res.error.message))
    }
    resolve(res)
  })
}

function auth (app) {
  passport.use(new FacebookStrategy({
    clientID: settings.appID,
    clientSecret: settings.appSecret,
    callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    storeUserAccessToken(accessToken)
    storeUserProfile(profile)
    getPagesList(() => {
      done(null, profile)
    })
  }))

  app.get(loginURL, passport.authenticate('facebook', {
    // authType: 'reauthenticate', // Commented because the login page returned an error 302
    scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions']
  }))
  app.get(callbackURL, passport.authenticate('facebook', {
    failureRedirect: failureURL
  }), (req, res) => {
    storeUserProfile(req.user)
    if (settings.pageID) {
      setID(settings.pageID)
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
    res.send(Object.keys({ userAccounts }).length !== 0 ? userAccounts : {
      error: 'not logged in',
      details: 'userAccounts has not been set. Please log in.'
    })
  })
}

function run (options, request) {
  return new Promise((resolve, reject) => {
    const message = (options.message || options.caption)
      ? options.message || options.caption
      : settings.message || ''
    const media = options.media
    const link = options.link || settings.link

    if (!facebookSession || !facebookSession.userAccessToken) {
      reject(new Error(`No facebook user access token found in local storage. Please log in at ${loginURL}.`))
    } else if (!message && (!media || !Array.isArray(media) || media.length < 1) && !link) {
      reject(new Error('No message or media in facebook POST request.'))
    }

    setID(facebookSession.currentID)
    handlePostRequest({ message, link, media }, resolve, reject)
  })
}

module.exports = {
  loginURL,
  auth,
  addRoutes,
  run
}
