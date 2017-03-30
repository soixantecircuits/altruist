'use strict'

const settings = require('nconf').get('app')
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
    const meta = Object.assign({}, settings.meta, options.meta)
    // Prepare data to post to the socialite server
    if (_.get(options, 'file') === undefined) {
      return reject({ error: 'Invalid request', details: 'No file name provided' })
    }
    if (_.get(options, 'path') === undefined) {
      return reject({ error: 'Invalid request', details: 'No file path provided' })
    }
    let formData = {
      bucket: _.get(meta, 'bucket') || _.get(settings, 'actions.socialite.bucket'),
      token: _.get(meta, 'token') || _.get(settings, 'actions.socialite.token'),
      name: options.file,
      file: null
    }

    let media = undefined
    if (req.files) {
      media = req.files[0]
      formData.file = formDataFile(media.buffer, media.originalname, media.mimetype)
      sendRequest(formData)
      .then(body => resolve(body))
      .catch(error => reject(error))

    } else if (med.isFile(options.path)) {
      formData.file = formDataFile(fs.readFileSync(options.path), options.file, options.type)
      sendRequest(formData)
      .then(body => resolve(body))
      .catch(error => reject(error))

    } else {
      reject({ error: 'Invalid media', details: options.path })
    }
  })
}

module.exports = { run }
