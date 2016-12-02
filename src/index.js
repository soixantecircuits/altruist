'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')
const passport = require('passport')
const LocalStorage = require('node-localstorage').LocalStorage
var localStorage = new LocalStorage('./scratch')
exports.localStorage = localStorage

const facebookSession = require('./lib/facebookSession')

const config = require('./lib/config')

const router = express.Router()
const app = express()

const version = 'v1'

app.use(morgan('dev'))

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
const formdataParser = require('multer')().fields([])
app.use(formdataParser)
app.use(require('cookie-parser')())
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

app.use(`/api/${version}`, router)

// Support pre-flight https://github.com/expressjs/cors#enabling-cors-pre-flight
app.options('*', cors())

app.use(`/api/${version}`, router)
app.get('/', (req, res) => {
  res.send('See https://github.com/soixantecircuits/altruist for details. <br> <a href="/login/facebook">Log in Facebook</a>')})

// Route facebook login
app.get('/login/facebook', passport.authenticate('facebook', { scope: ['pages_show_list', 'manage_pages', 'publish_pages', 'publish_actions'] }))
app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/' })
  , function (req, res) {
    facebookSession.user = req.user
    res.redirect('/')
  })

router.get('/status', (req, res) => {
  res.send('up')})

for (let action in config.actions) {
  const module = `${process.cwd()}/actions/${action}.js`
  router.post(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(404).send('No such action.')
      } else {
        require(module)(req.body, req)
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
