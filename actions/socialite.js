'use strict'

const config = require('../src/lib/config')
const med = require('media-helper')
const request = require('request')
const fs = require('fs')
const path = require('path')

const baseURL = config.actions.socialite.baseURL
const route = config.actions.socialite.uploadRoute

function run (options, req) {
  return new Promise((resolve, reject) => {
    console.log(options)
    if (options.media === undefined) {
      return reject({ error: 'Invalid request', details: 'No media provided' })
    }
    if (med.isFile(options.media) === false) {
      return reject({ error: 'No such file', details: options.media })
    }
    if (options.filename === undefined) {
      options.filename = path.basename(options.media)
    }
    // Prepare data to post to the socialite server
    let formData = {
      id: options.filename,
      file: {
        value: fs.readFileSync(options.media),
        options:{
          filename: options.filename,
          contentType: 'image/jpg'
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
