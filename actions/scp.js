'use strict'

const config = require('../src/lib/config')
const scpClient = require('scp2')

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!options.source || options.source === '') {
      return reject({
        error: 'invalid request',
        details: '"source" does not exist or is empty.'
      })
    } else if ((!options.user || options.user === '') && (!config.actions.scp.user || config.actions.scp.user === '')) {
      return reject({
        error: 'invalid request',
        details: '"user" does not exist or is empty.'
      })
    } else if ((!options.hostname || options.hostname === '') && (!config.actions.scp.hostname || config.actions.scp.hostname === '')) {
      return reject({
        error: 'invalid request',
        details: '"hostname" does not exist or is empty.'
      })
    } else if ((!options.target || options.target === '') && (!config.actions.scp.target || config.actions.scp.target === '')) {
      return reject({
        error: 'invalid request',
        details: '"target" does not exist or is empty.'
      })
    }

    const user = options.user || config.actions.scp.user
    const password = options.password || config.actions.scp.password || ''
    const hostname = options.hostname || config.actions.scp.hostname
    const target = options.target || config.actions.scp.target

    const dest = `${user}:${password}@${hostname}:${target}`

    scpClient.scp(options.source, dest, function (err) {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

module.exports = {
run}
