'use strict'

const settings = require('../src/lib/settings').actions.socialite
const request = require('request')
const mh = require('media-helper')

const baseURL = settings.baseURL
const route = settings.uploadRoute

function formDataFile (value, name, type) {
  return {
    value: value,
    options: {
      filename: name,
      contentType: type
    }
  }
}

function sendRequest (formData) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        reject({ error: err || `${res.statusCode} ${res.statusMessage}` })
      } else {
        resolve(body)
      }
    })
  })
}

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    if (!options.name && !options.file) {
      reject(new Error('No name provided in request'))
    }

    let formData = {
      bucket: options.bucket || settings.bucket,
      token: options.token || settings.token,
      name: options.name || options.file,
      file: null
    }

    if (options.media && Array.isArray(options.media) && options.media.length > 0) {
      mh
        .toBuffer(options.media[0].content)
        .then((buffer) => {
          formData.file = formDataFile(buffer, formData.name, options.media[0].type)
          // formData.file = formDataFile(Buffer.from(options.media[0].content, 'base64'), formData.name, options.media[0].type)
          sendRequest(formData)
            .then(body => resolve(body))
            .catch(error => reject(error))
        })
        .catch(reject)
    } else {
      reject(new Error('No media provided in request'))
    }
  })
}

module.exports = { run }
