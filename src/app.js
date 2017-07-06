'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')

const cors = require('cors')
const passport = require('passport')
const actions = require('./lib/action')
const realtime = require('./lib/realtime')

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

  router.get('/status', (req, res) => {
    res.send('up')
  })

  app.get('/', (req, res) => {
    res.send(`
      <h1>Altruist</h1>
      <p><small>Go to the <a href="https://github.com/soixantecircuits/altruist" target="_blank">Altruist GitHub</a> for more details.</small></p>
    `)
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
