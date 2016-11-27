'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')

const config = require('./lib/config')
console.log('index.js - ', config)


const router = express.Router()
const app = express()

const version = 'v1'

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(`/api/${version}`, router)

// Support pre-flight https://github.com/expressjs/cors#enabling-cors-pre-flight
app.options('*', cors())

app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

router.get('/status', (req, res) => { res.send('up') })

for (let action in config.actions) {
  const module = `${process.cwd()}/actions/${action}.js`
  router.post(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(404).send('No such action.')
      } else {
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
