const config = require('./config/config.json')
const express = require('express')
const morgan = require('morgan')
const fs = require('fs-extra')

const router = express.Router()
const app = express()

app.use(morgan('dev'))
app.use('/api/v1', router)

app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

router.get('/status', (req, res) => { res.send('up') })

for (action in config.actions) {
  const module = `${__dirname}/actions/${action}.js`
  router.get(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(403).send('no such action')
      } else {
        const response = require(module).init()
        res.send(response)
      }
    })
  })
}

app.listen(6060)