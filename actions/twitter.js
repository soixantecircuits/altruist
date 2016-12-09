'use strict'

var fs = require('fs')
var Twit = require('twit')
var request = require('request').defaults({encoding: null})
var config = require('../config/config.json')

var T = new Twit({
  consumer_key: config.actions.twitter.consumer_key,
  consumer_secret: config.actions.twitter.consumer_secret,
  access_token: config.actions.twitter.access_token,
  access_token_secret: config.actions.twitter.access_token_secret,
  timeout_ms: 60 * 1000
})

function updateWithMedia (mediaData, message, resolve, reject) {
  T.post('media/upload',
    {media_data: mediaData},
    function (err, data, response) {
      if (!err) {
        var mediaIdStr = data.media_id_string
        var metaParams = { media_id: mediaIdStr, alt_text: { text: message } }
        T.post('media/metadata/create', metaParams, function (err, data, response) {
          if (!err) {
            T.post('statuses/update', {status: message, media_ids: [mediaIdStr]}, function (err, data, response) {
              if (!err) {
                return resolve('altruist - twitter.js - Success')
              } else { return reject('altruist - twitter.js - ' + err) }
            })
          } else { return reject('altruist - twitter.js - ' + err) }
        })
      } else { return reject('altruist - twitter.js - ' + err) }
    })
}

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    if (options.message === undefined || options.message === '') {
      return reject('altruist - twitter.js - Error: No text message in request')
    }
    // Reading 'media' value from request
    if (options.media !== undefined && options.media !== '') {
      // Regular expressions
      var base64Match = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
      var httpMatch = /^https?:\/\//i
      if (base64Match.test(options.media)) {
        // Base64 string
        return updateWithMedia(options.media, options.message, resolve, reject)
      } else if (httpMatch.test(options.media)) {
        // HTTP URL
        request.get(options.media, function (err, response, body) {
          if (!err && response.statusCode === 200) {
            return updateWithMedia(body.toString('base64'), options.message, resolve, reject)
          } else {
            return reject('altruist - twitter.js - ' + err)
          }
        })
      } else if (fs.existsSync(options.media)) {
        // Filesystem path
        var data = fs.readFileSync(options.media, { encoding: 'base64' })
        return updateWithMedia(data, options.message, resolve, reject)
      } else { return reject('altruist - twitter.js - Error: media request not well formated') }
    } else {
      // No media in request
      T.post('statuses/update', {status: options.message}, function (err, data, response) {
        if (!err) {
          return resolve('altruist - twitter.js - Success')
        } else { return reject('altruist - twitter.js - ' + err) }
      })
    }
  })
}
