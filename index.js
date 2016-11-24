const express = require('express')
const morgan = require('morgan')
const fs = require('fs-extra')

const router = express.Router()
const app = express()

let actions = [ 'mailchimp' ]

app.use(morgan('dev'))
app.use('/api/v1', router)

app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

router.get('/status', (req, res) => { res.send('up') })

actions.forEach((action) => {
  const module = `${__dirname}/actions/${action}.js`
  router.get(`/actions/${action}`, (req, res) => {
    fs.access(module, (err) => {
      if (err) {
        res.status(403).send('no such action')
      } else {
        require(module).init()
        res.send('exists')
      }
    })
  })
})

app.listen(6060)