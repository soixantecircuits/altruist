'use strict'

const settings = require('nconf').get('app')
const scpClient = require('scp2')
const _ = require('lodash')

function run (options, request) {
  return new Promise((resolve, reject) => {
    const user = _.get(options, 'meta.user') || _.get(settings, 'actions.scp.user')
    const password = _.get(options, 'meta.password') || _.get(settings, 'actions.scp.password') || ''
    const hostname = _.get(options, 'meta.hostname') || _.get(settings, 'actions.scp.hostname')
    const target = _.get(options, 'meta.target') || _.get(settings, 'actions.scp.target')
    const source = _.get(options, 'meta.source')

    if (!source || source === '') {
      return reject({
        error: 'invalid request',
        details: '"source" does not exist or is empty.'
      })
    } else if (!user || user === '') {
      return reject({
        error: 'invalid request',
        details: '"user" does not exist or is empty.'
      })
    } else if (!hostname || hostname === '') {
      return reject({
        error: 'invalid request',
        details: '"hostname" does not exist or is empty.'
      })
    } else if (!target || target === '') {
      return reject({
        error: 'invalid request',
        details: '"target" does not exist or is empty.'
      })
    }

    const dest = `${user}:${password}@${hostname}:${target}`

    scpClient.scp(source, dest, function (err) {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

module.exports = { run }
