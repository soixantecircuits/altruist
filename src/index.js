'use strict'

const settings = require('standard-settings').getSettings()
const altruist = require('./app')
altruist.init(settings, (err, infos) => {
  if (err) {
    console.error(err)
  } else {
    console.log(`Altruist is initialized on ${infos.port}`)
  }
})
