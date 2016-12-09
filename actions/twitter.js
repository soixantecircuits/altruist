'use strict'

var fs = require('fs'),
    Twit = require('twit'),
    mime = require('mime'),
    request = require('request').defaults({encoding: null}),
    config = require('../config/config.json')

var T = new Twit({
  consumer_key: config.actions.twitter.consumer_key,
  consumer_secret: config.actions.twitter.consumer_secret,
  access_token: config.actions.twitter.access_token,
  access_token_secret: config.actions.twitter.access_token_secret,
  timeout_ms: 60 * 1000
})

var globalResolve, globalReject, twitMessage

function twitSuccess (message) { globalResolve('altruist - twitter.js - ' + message) }
function twitFailure (message) { globalReject('altruist - twitter.js - ' + message) }

function updateStatus (mediaIdStr) {
  console.log(mediaIdStr)
  T.post('statuses/update', { status: twitMessage, media_ids: [mediaIdStr] }, function (err, data, response) {
    if (!err) { twitSuccess('Success')
    } else { twitFailure(err) }
  })
}

function uploadImage (mediaData) {
  T.post('media/upload',
    {media_data: mediaData},
    function (err, data, response) {
      if (!err) {
        updateStatus(data.media_id_string)
      } else { twitFailure(err) }
  })
}

function handleHttpUrl (media) {
  request.get(media, function (err, response, body) {
    if (response.statusCode !== 200)
      twitFailure('Error: http response status code ' + response.statusCode)
    if (!err) {
      uploadImage(body.toString('base64'), twitMessage)
    } else { twitFailure(err) }
  })
}

function handleLocalFile (media) {
  // Only MP4 format is supported for videos
  if (mime.lookup(media) === 'video/mp4')
  {
    T.postMediaChunked({file_path: media}, function (err, data, response) {
      if (!err) {
        updateStatus(data.media_id_string)
      } else { twitFailure(err) }
    })
  } else {
    uploadImage(fs.readFileSync(media, { encoding: 'base64' }))
  }
}

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    globalResolve = resolve
    globalReject = reject
    // The 'message' field has to be defined in request
    if (options.message === undefined || options.message === '') {
      twitFailure('Error: No text message in request')
    } else {
      twitMessage = options.message
    }
    // Supported formats: JPG, PNG, GIF, WEBP, MP4
    if (options.media !== undefined && options.media !== '') {
      // Regular expressions to match base64 or http url
      var base64Match = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
      var httpMatch = /^https?:\/\//i
      if (base64Match.test(options.media)) {
        // Base64 string
        uploadImage(options.media)
      } else if (httpMatch.test(options.media)) {
        // HTTP URL
        handleHttpUrl(options.media)
      } else if (fs.existsSync(options.media)) {
        // Filesystem path
        handleLocalFile(options.media)
      } else {
        twitFailure('Error: media request not well formated')
      }
    } else {
      // Text-only tweet
      updateStatus(undefined)
    }
  })
}
