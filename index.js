const express = require('express')
const morgan = require('morgan')

const router = express.Router()
const app = express()

app.use(morgan('dev'))
app.use('/api/v1', router)

app.get('/', (req, res) => { res.send('See https://github.com/soixantecircuits/altruist for details.') })

router.get('/status', (req, res) => { res.send('up') })

app.listen(6060)