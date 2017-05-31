'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')
const path = require('path')

const settings = require(path.resolve(__dirname, './lib/settings'))
const passport = require('passport')

const router = express.Router()
const app = express()

const authRedirectURL = settings.authRedirectURL ? settings.authRedirectURL : '/authRedirect'
const authRedirect = []

const version = 'v1'

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const realtime = require('./lib/realtime')

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyparser.json({ limit: '50mb' }))
app.use(upload.any())
app.use(require('cookie-parser')())
app.use(require('express-session')({ secret: settings.secret, resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
  cb(null, user)
})
passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

app.use(`/api/${version}`, router)

// Support pre-flight https://github.com/expressjs/cors#enabling-cors-pre-flight
app.options('*', cors())

app.use(`/api/${version}`, router)

router.get('/status', (req, res) => {
  res.send('up')
})

for (let action in settings.actions) {
  getActionModule(action)
    .then(module => {
      typeof (module.auth) === 'function' && module.auth(app)
      typeof (module.loginURL) === 'string' && authRedirect.push({ name: action, URL: module.loginURL })
      typeof (module.addRoutes) === 'function' && module.addRoutes(app)

      router.post(`/actions/${action}`, (req, res) => {
        module.run(req.body, req)
          .then(response => res.send(response))
          .catch(reason => {
            console.log(reason)
            res.status(500).send(reason)
          })
      })
    })
}

app.get(authRedirectURL, (req, res) => {
  res.send({ 'map': authRedirect })
})

function getActionModule (actionName) {
  return new Promise((resolve, reject) => {
    if (typeof actionName !== 'string' || actionName.length === 0) {
      return reject('Error loading module. Action name is invalid.')
    }

    const modulePath = path.resolve(`${__dirname}/../actions/${actionName}.js`)
    fs.access(modulePath, (err) => {
      if (!err) {
        const module = require(modulePath)
        return resolve(module)
      } else {
        return reject(`Error loading module "${modulePath}": ${err}`)
      }
    })
  })
}

// Register a call to a default action on a spacebro event
// It only works for the socialite action for now.
realtime.registerEvent('new-media', (data) => {
  var action = settings.defaultAction || ''
  if (data.action !== undefined) {
    action = data.action
  }

  getActionModule(action)
    .then(module => {
      var socialiteData = {
        filename: path.basename(data.path),
        media: data.path
      }
      module.run(socialiteData, null)
        .then(response => {
          console.log(`${action} executed on new-media event.`)
          realtime.emitEvent('altruist-action', {
            action,
            response
          })
        })
        .catch(reason => {
          console.log(reason)
          realtime.emitEvent('altruist-error', {
            action,
            error: reason
          })
        })
    })
    .catch(err => {
      console.error(err)
      realtime.emitEvent('altruist-error', {
        action,
        error: err
      })
    })
})

app.get('/', (req, res) => {
  res.send(`
    <h1>Altruist</h1>
    <p><small>Go to the <a href="https://github.com/soixantecircuits/altruist" target="_blank">Altruist GitHub</a> for more details.</small></p>
  `)
})

app.listen(settings.server.port, () => {
  console.log(`altruist running on: http://localhost:${settings.server.port} with actions: [ ${Object.keys(settings.actions)} ]`)
})
