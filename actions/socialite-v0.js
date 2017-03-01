'use strict'

const config = require('../src/lib/config')
const med = require('media-helper')
const request = require('request')
const fs = require('fs')
const path = require('path')

const baseURL = config.actions['socialite-v0'].baseURL
const route = config.actions['socialite-v0'].uploadRoute

function run (options, req) {
  return new Promise((resolve, reject) => {
    console.log(options)
    if (options.media === undefined) {
      return reject({ error: 'Invalid request', details: 'No media provided' })
    }
    med.toBase64(options.media)
    .catch(error => reject(error))
    .then(result => {
      if (options.filename === undefined) {
        options.filename = path.basename(options.media)
      }
      // Prepare data to post to the socialite server
      let formData = {
        id: options.filename,
        img: result
      }
      request.post({
        url: `${baseURL}${route}`,
        formData: formData
      }, (err, res, body) => {
        err && reject(err)
        resolve(body)
      })
    })
  })
}

module.exports = { run }
