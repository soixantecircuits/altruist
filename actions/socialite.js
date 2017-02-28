'use strict'

const config = require('../src/lib/config')
const med = require('media-helper')
const request = require('request')
const fs = require('fs')

const baseURL = config.actions.socialite.baseURL
const route = config.actions.socialite.uploadRoute

function run (options, req) {
  return new Promise((resolve, reject) => {
    console.log(options)
    if (options.media === undefined) {
      return reject({ error: 'Invalid request', details: 'No media provided' })
    }
    if (options.id === undefined) {
      return reject({ error: 'Invalid request', details: 'No id provided' })
    }
    // Prepare data to post to the socialite server
    let formData = {
      id: options.id,
      file: {
        value: fs.readFileSync(options.media),
        options:{
          filename: options.id,
          contentType: 'image/png'
        }
      }
    }
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      err && reject(err)
      resolve(body)
    })
  })
}

module.exports = { run }
