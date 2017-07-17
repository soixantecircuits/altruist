'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')

const cors = require('cors')
const passport = require('passport')
const actions = require('./lib/action')
const realtime = require('./lib/realtime')
const stateServe = require('./lib/state-serve')
var packageInfos = require('../package.json')

let init = (settings, cb) => {
  const router = express.Router()
  const app = express()

  const version = 'v1'

  const multer = require('multer')
  const upload = multer({ storage: multer.memoryStorage() })

  app.use(morgan('dev'))
  app.use(cors())
  app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }))
  app.use(bodyparser.json({ limit: '50mb' }))
  app.use(upload.any())
  app.use(require('cookie-parser')())
  app.use(require('express-session')({ secret: settings.secret, resave: true, saveUninitialized: true }))
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser(function (user, callback) {
    callback(null, user)
  })
  passport.deserializeUser(function (obj, callback) {
    callback(null, obj)
  })

  app.use(`/api/${version}`, router)

  // Support pre-flight https://github.com/expressjs/cors#enabling-cors-pre-flight
  app.options('*', cors())

  app.use(`/api/${version}`, router)

  stateServe.init(app, {
    app: {
      name: packageInfos.name,
      version: packageInfos.version,
      site: {
        url: packageInfos.repository.url,
        name: packageInfos.name
      }
    }
  })

  router.get('/status', (req, res) => {
    res.send('up')
  })

  actions.init(app, router, settings)
  app.listen(settings.server.port, (err) => {
    realtime.init(settings)
    console.log(`altruist running on: http://localhost:${settings.server.port} with actions: [ ${Object.keys(settings.actions)} ]`)
    if (!err) {
      cb && cb(null, {port: settings.server.port})
    } else {
      cb && cb(err)
    }
  })
  return app
}

module.exports = {
  init
}
