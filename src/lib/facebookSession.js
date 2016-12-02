const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
var localStorage = require('../index').localStorage

const config = require('./config')

passport.use(new FacebookStrategy({
  clientID: config.actions.facebook.appId,
  clientSecret: config.actions.facebook.appSecret,
  callbackURL: 'http://localhost:' + config.server.port + '/login/facebook/return'
},
  function (accessToken, refreshToken, profile, done) {
    localStorage.setItem('userAccessToken', accessToken)
    return done(null, profile)
  }
))

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

exports.FacebookStrategy = FacebookStrategy
