'use strict'

const settings = require('../src/lib/settings').actions.socialite
const request = require('request')
const mh = require('media-helper')

const baseURL = settings.baseURL
const route = settings.uploadRoute
const url = `${baseURL}${route}`

function sendRequest (formData) {
  return new Promise((resolve, reject) => {
    request.post({ url, formData }, (err, res, body) => {
      console.log(body)
      if (err || res.statusCode !== 200) {
        reject({ error: err || `${res.statusCode} ${res.statusMessage}` })
      } else {
        resolve(body)
      }
    })
  })
}

async function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    if (!options.name && !options.file) {
      reject(new Error('No name provided in request'))
    }

    if (options.media && Array.isArray(options.media) && options.media.length > 0) {
      mh.toBuffer(options.media[0].content)
        .then((value) => {
          const bucket = options.bucket || settings.bucket
          const token = options.token || settings.token
          const name = options.name || options.file
          const contentType = mh.getMimeFromName(name)
          console.log(value)
          sendRequest({
            bucket,
            token,
            name,
            file: {
              value,
              options: { name, contentType }
            }
          }).then(body => resolve(body)).catch(error => reject(error))
        })
    } else {
      reject(new Error('No media provided in request'))
    }
  })
}

module.exports = { run }
