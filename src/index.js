'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')
const passport = require('passport')
const LocalStorage = require('node-localstorage').LocalStorage
var localStorage = new LocalStorage('./storage/')
exports.localStorage = localStorage
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const config = require('./lib/config')

const router = express.Router()
const app = express()
exports.app = app

const version = 'v1'

app.use(morgan('dev'))

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(upload.fields([{ name: 'file' }]))
app.use(require('cookie-parser')())

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))

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
app.get('/', (req, res) => {
  res.send('See https://github.com/soixantecircuits/altruist for details. <br> <a href="/login/facebook">Log in Facebook</a>')
})

// Route facebook login
require(`${process.cwd()}/actions/facebook`).auth()

router.get('/status', (req, res) => {
  res.send('up')
})

for (let action in config.actions) {
  const module = `${process.cwd()}/actions/${action}.js`
  router.post(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(404).send('No such action.')
      } else {
        require(module).run(req.body, req)
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
  console.log(`altruist running on: http://localhost:${config.server.port} with actions: [ ${Object.keys(config.actions)} ]`)
})
