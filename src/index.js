'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const config = require('./lib/config')
console.log('index.js - ', config)


const router = express.Router()
const app = express()

const version = 'v1'

passport.use(new FacebookStrategy({
  clientID: config.actions.facebook.appId,
  clientSecret: config.actions.facebook.appSecret,
  callbackURL: 'http://localhost:6060/login/facebook/return'
},
  function (accessToken, refreshToken, profile, done) {
    console.log(`accesstoken: ${accessToken}`)
    exports.accessToken = accessToken
    return done(null, profile)
  }
))

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Authenticate with passport
app.use(passport.initialize())
app.use(passport.session())

// Support pre-flight https://github.com/expressjs/cors#enabling-cors-pre-flight
app.options('*', cors())

app.use(`/api/${version}`, router)
app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

// Route facebook login
app.get('/login/facebook', passport.authenticate('facebook', { scope: ['manage_pages', 'publish_pages', 'publish_actions'] }))
app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/' }), function (req, res) {
  res.redirect('/')
})

router.get('/status', (req, res) => { res.send('up') })

for (let action in config.actions) {
  const module = `${process.cwd()}/actions/${action}.js`
  router.post(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(404).send('No such action.')
      } else {
        console.log(req.user)
        require(module)(req.body)
          .then(response => res.send(response))
          .catch(reason => {
            console.log(reason)
            res.status(500).send(reason)
          })
      }
    })
  })
}

app.listen(config.server.port, () => {
  console.log(`altruist running on: http://localhost:${config.server.port}`)
})
