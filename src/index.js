'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const passport = require('passport')
const fs = require('fs-extra')
const cors = require('cors')
const path = require('path')
const ip = require('ip')

const standardSettings = require('standard-settings')
const settings = require('nconf').get()

const router = express.Router()
const app = express()

const authRedirectURL = settings.authRedirectURL ? settings.authRedirectURL : '/authRedirect'
const authRedirect = []

const version = 'v1'

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
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
  const modulePath = path.resolve(`${__dirname}/../actions/${action}.js`)
  fs.access(modulePath, (err) => {
    if (!err) {
      const module = require(modulePath)
      typeof (module.auth) === 'function' && module.auth(app)
      typeof (module.loginURL) === 'string' && authRedirect.push({ name: action, URL: module.loginURL })
      typeof (module.addRoutes) === 'function' && module.addRoutes(app)
      router.post(`/actions/${action}`, (req, res) => {
        if (err) {
          res.status(404).send('No such action.')
        } else {
          module.run(req.body, req)
            .then(response => res.send(response))
            .catch(reason => {
              console.log(reason)
              res.status(500).send(reason)
            })
        }
      })
    } else {
      console.log(`Error loading module "${modulePath}": ${err}`)
    }
  })
}

app.get(authRedirectURL, (req, res) => {
  res.send({ 'map': authRedirect })
})

app.get('/', (req, res) => {
  res.send(`
    <h1>Altruist</h1>
    <p><small>Go to the <a href="https://github.com/soixantecircuits/altruist" target="_blank">Altruist GitHub</a> for more details.</small></p>
  `)
})

app.listen(settings.server.port, settings.server.host, () => {
  console.log(`altruist running on: http://${ip.address()}:${settings.server.port} with actions: [ ${Object.keys(settings.actions)} ]`)
})
