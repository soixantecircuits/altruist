'use strict'

const settings = require('../src/lib/settings').actions.socialite
const request = require('request')
const fs = require('fs')

const baseURL = settings.baseURL
const route = settings.uploadRoute

/*
function formDataFile (value, name, type) {
  return {
    value: value,
    options: {
      filename: name,
      contentType: type
    }
  }
}
*/

function sendRequest (formData) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      err && reject(new Error(err))
      resolve(body)
    })
  })
}

function standardMediaToApiMedia (media) {
  let apiMeta = media.meta.altruist.socialite
  let apiMedia = {
    bucket: apiMeta.bucket,
    token: apiMeta.token,
    name: media.filename,
    file: {
      value: fs.createReadStream(media.path),
      options: {
        filename: media.filename,
        contentType: media.type
      }
    }
  }
  return apiMedia
}

async function checkMedia (media) {
  if (!media.type) {
    await media.getMimeType()
  }
  if (!media.filename) {
    media.getFilename()
  }
}

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    checkMedia(options)
    .then(() => {
      let media = standardMediaToApiMedia(options)

      sendRequest(media)
        .then(body => resolve(body))
        .catch(error => reject(error))
    })
  })
}

module.exports = { run }
