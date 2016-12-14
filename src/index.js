'use strict'

const config = require('./lib/config')

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')
const passport = require('passport')

const router = express.Router()
const app = express()

const authRedirect = []

const version = 'v1'

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(upload.fields([{ name: 'file' }]))
app.use(require('cookie-parser')())
app.use(require('express-session')({ secret: config.secret, resave: true, saveUninitialized: true }))
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

for (let action in config.actions) {
  const modulePath = `${process.cwd()}/actions/${action}.js`
  fs.access(modulePath, (err) => {
    const module = require(modulePath)
    typeof (module.auth) === 'function' && module.auth(app)
    typeof (module.loginURL) === 'string' && authRedirect.push({ name: action, URL: module.loginURL })
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
  })
}

app.get('/', (req, res) => {
  res.send(`
    <h1>Altruist</h1>
    <h3>Available auth URLs:</h3>
    <small>${req.query.success ? `${req.query.success} auth success` : ''}</small>
    <small>${req.query.failure ? `${req.query.failure} auth failure` : ''}</small>
    <ul>
      ${authRedirect.map(({name, URL}) => `<li><a href="${URL}">${name}</a></li>`).join('')}
    </ul>
    <p><small>Go to the <a href="https://github.com/soixantecircuits/altruist" target="_blank">Altruist GitHub</a> for more details.</small></p>
  `)
})

app.listen(config.server.port, () => {
  console.log(`altruist running on: http://localhost:${config.server.port} with actions: [ ${Object.keys(config.actions)} ]`)
})
