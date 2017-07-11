'use strict'

const settings = require('../src/lib/settings')
const scpClient = require('scp2')

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!options.source || options.source === '') {
      return reject(new Error('"source" does not exist or is empty.'))
    } else if ((!options.user || options.user === '') && (!settings.actions.scp.user || settings.actions.scp.user === '')) {
      return reject(new Error('"user" does not exist or is empty.'))
    } else if ((!options.hostname || options.hostname === '') && (!settings.actions.scp.hostname || settings.actions.scp.hostname === '')) {
      return reject(new Error('"hostname" does not exist or is empty.'))
    } else if ((!options.destination || options.destination === '') && (!settings.actions.scp.destination || settings.actions.scp.destination === '')) {
      return reject(new Error('"destination" does not exist or is empty.'))
    }

    const user = options.user || settings.actions.scp.user
    const password = options.password || settings.actions.scp.password || ''
    const hostname = options.hostname || settings.actions.scp.hostname
    const destination = options.destination || settings.actions.scp.destination

    const dest = `${user}:${password}@${hostname}:${destination}`

    scpClient.scp(options.source, dest, function (err) {
      if (err) {
        return reject(err)
      }
      resolve({ success: true })
    })
  })
}

module.exports = {
  run
}
