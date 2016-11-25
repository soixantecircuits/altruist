const config = require('./config/config.json')
const express = require('express')
const morgan = require('morgan')
const bodyparser = require('body-parser')
const fs = require('fs-extra')
const cors = require('cors')

const router = express.Router()
const app = express()

const version = 'v1'

app.use(morgan('dev'))
app.use(cors())
app.use(bodyparser.json())
app.use(`/api/${version}`, router)

app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

router.get('/status', (req, res) => { res.send('up') })

for (action in config.actions) {
  const module = `${__dirname}/actions/${action}.js`
  router.post(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(404).send('No such action.')
      } else {
        require(module)(req.body)
          .then(response => res.send(response))
          .catch(reason => res.status(500).send(reason))
      }
    })
  })
}

app.listen(config.server.port, function(){
  console.log(`altruist runs on: http://localhost:${config.server.port}`)
  console.log(`Point your browser at: http://localhost:${config.server.port}/api/${version}/actions/{action} to test`)
})
