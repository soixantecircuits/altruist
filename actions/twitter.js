'use strict'

const Twit = require('twit')
const config = require('../src/lib/config')
const med = require('../src/lib/media')

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

// Only MP4 format is supported for videos
function uploadVideo (message, media) {
  return new Promise((resolve, reject) => {
    T.postMediaChunked({ file_path: media },
    (err, data, response) => {
      if (!err) {
        updateStatus(message, data.media_id_string)
          .then(response => resolve(response))
          .catch(error => reject(error))
      } else { reject(err) }
    })
  })
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      const message = (options.message || options.caption)
        ? options.message || options.caption
        : config.actions.slack.message || ''
      const media = options.media
        ? options.media
        : config.actions.slack.media || ''

      // Supported formats: JPG, PNG, GIF, WEBP, MP4
      if (media) {
        if (med.isBase64(media)) {
          uploadImage(message, media)
          .then(response => resolve(response))
          .catch(error => reject(error))
        } else if (med.isFile(media)) {
          med.getMimeType(media)
          .then(type => {
            if (type === 'video/mp4') {
              uploadVideo(message, media)
              .then(response => resolve(response))
              .catch(error => reject(error))
            } else {
              med.fileToBase64(media)
              .then(data => {
                uploadImage(message, data)
                .then(response => resolve(response))
                .catch(error => reject(error))
              })
              .catch(error => reject(error))
            }
          })
          .catch(error => reject(error))
        } else if (med.isURL(media)) {
          med.urlToBase64(media)
          .then(data => {
            uploadImage(message, data)
            .then(response => resolve(response))
            .catch(error => reject(error))
          })
          .catch(error => reject(error))
        }
      } else if (message) {
        // Text-only tweet
        updateStatus(message)
          .then(response => resolve(response))
          .catch(error => reject(error))
      } else {
        reject('Error: No message or media in request')
      }
    })
  }
}
