'use strict'

const config = require('../src/lib/config')
const med = require('media-helper')
const request = require('request')
const fs = require('fs')

const baseURL = 'http://app.shh.ac'
const route = '/wp-json/form/v1/postForm'

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    let formData = {
      bucket: options.bucket || config.actions.socialite.bucket,
      token: options.token || config.actions.socialite.token,
      name: options.filename || 'image.jpg',
      file: null
    }

    let media = req.files ? req.files[0] : options.media
    if (media) {
      if (med.isFile(media)) {
        formData.file = {
          value: fs.readFileSync(media),
          options: {
            filename: options.filename,
            contentType: 'image/jpg'
          }
        }
      } else {
        formData.file = {
          value: media.buffer,
          options: {
            filename: media.originalname,
            contentType: media.mimetype
          }
        }
      }
    } else {
      reject({ error: 'Invalid request', details: 'No media provided.' })
    }

    console.log(formData)

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
