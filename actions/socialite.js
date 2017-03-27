'use strict'

const settings = require('nconf').get()
const med = require('media-helper')
const request = require('request')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const baseURL = 'http://app.shh.ac'
const route = '/wp-json/form/v1/postForm'

function formDataFile(value, name, type) {
  return {
    value: value,
    options: {
      filename: name,
      contentType: type
    }
  }
}

function sendRequest(formData) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      err && reject(err)
      resolve(body)
    })
  })
}

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    if (_.get(options, 'media.name') === undefined) {
      return reject({ error: 'Invalid request', details: 'No media name provided' })
    }
    if (_.get(options, 'media.content') === undefined) {
      return reject({ error: 'Invalid request', details: 'No media content provided' })
    }
    let formData = {
      bucket: options.bucket || settings.actions.socialite.bucket,
      token: options.token || settings.actions.socialite.token,
      name: options.media.name,
      file: null
    }

    let media = undefined
    if (req.files) {
      media = req.files[0]
      formData.file = formDataFile(media.buffer, media.originalname, media.mimetype)
      sendRequest(formData)
      .then(body => resolve(body))
      .catch(error => reject(error))

    } else if (med.isFile(options.media.content)) {
      media = options.media
      med.getMimeType(media.content)
      .then(type => {
        formData.file = formDataFile(fs.readFileSync(media.content), media.name, type)
        sendRequest(formData)
        .then(body => {
          console.log(body)
          resolve(body)})
        .catch(error => reject(error))

      }).catch(error => reject(error))
    } else {
      reject({ error: 'Invalid media', details: options.media.content })
    }
  })
}

module.exports = { run }
