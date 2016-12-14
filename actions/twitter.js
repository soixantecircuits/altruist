'use strict'

const fs = require('fs')
const Twit = require('twit')
const mime = require('mime')
const request = require('request').defaults({encoding: null})
const config = require('../src/lib/config')

const T = new Twit({
  consumer_key: config.actions.twitter.consumer_key,
  consumer_secret: config.actions.twitter.consumer_secret,
  access_token: config.actions.twitter.access_token,
  access_token_secret: config.actions.twitter.access_token_secret,
  timeout_ms: 60 * 1000
})

function updateStatus (message, mediaIdStr) {
  return new Promise((resolve, reject) => {
    T.post('statuses/update',
    { status: message, media_ids: [mediaIdStr] },
    function (err, data, response) {
      if (!err) {
        resolve('Success')
      } else { reject(err) }
    })
  })
}

function uploadImage (message, mediaData) {
  return new Promise((resolve, reject) => {
    T.post('media/upload',
      { media_data: mediaData },
      function (err, data, response) {
        if (!err) {
          updateStatus(message, data.media_id_string)
            .then(response => resolve(response))
            .catch(error => reject(error))
        } else {
          reject(err)
        }
      })
  })
}

function handleHttpUrl (message, media) {
  return new Promise((resolve, reject) => {
    request.get(media, function (err, response, body) {
      if (response.statusCode !== 200) {
        reject('Error: http response status code ' + response.statusCode)
      }
      if (!err) {
        uploadImage(message, body.toString('base64'))
          .then(response => resolve(response))
          .catch(error => reject(error))
      } else {
        reject(err)
      }
    })
  })
}

function handleLocalFile (message, media) {
  return new Promise((resolve, reject) => {
    // Only MP4 format is supported for videos
    if (mime.lookup(media) === 'video/mp4') {
      T.postMediaChunked({ file_path: media },
      function (err, data, response) {
        if (!err) {
          updateStatus(message, data.media_id_string)
            .then(response => resolve(response))
            .catch(error => reject(error))
        } else { reject(err) }
      })
    } else {
      uploadImage(message, fs.readFileSync(media, { encoding: 'base64' }))
        .then(response => resolve(response))
        .catch(error => reject(error))
    }
  })
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      // The 'message' field has to be defined in request
      if (options.message === undefined || options.message === '') {
        reject('Error: No text message in request')
      }
      // Supported formats: JPG, PNG, GIF, WEBP, MP4
      if (options.media !== undefined && options.media !== '') {
        // Regular expressions to match base64 or http url
        var base64Match = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
        var httpMatch = /^https?:\/\//i
        if (base64Match.test(options.media)) {
          // Base64 string
          uploadImage(options.message, options.media)
            .then(response => resolve(response))
            .catch(error => reject(error))
        } else if (httpMatch.test(options.media)) {
          // HTTP URL
          handleHttpUrl(options.message, options.media)
            .then(response => resolve(response))
            .catch(error => reject(error))
        } else if (fs.existsSync(options.media)) {
          // Filesystem path
          handleLocalFile(options.message, options.media)
            .then(response => resolve(response))
            .catch(error => reject(error))
        } else {
          reject('Error: media request not well formated')
        }
      } else {
        // Text-only tweet
        updateStatus(options.message)
          .then(response => resolve(response))
          .catch(error => reject(error))
      }
    })
  }
}
