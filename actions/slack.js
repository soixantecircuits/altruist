'use strict'

const optionFormat = require('../src/lib/request')
const settings = require('../src/lib/settings').actions.slack

const WebClient = require('@slack/client').WebClient
let webclient = null

const Slack = require('node-slack-upload')
let slack = null

function upload ({ content, filetype, filename }, message) {
  return new Promise((resolve, reject) => {
    filename = filename || filetype.replace('/', '.')
    slack.uploadFile({
      content,
      filetype,
      filename,
      channels: settings.channel,
      initial_comment: message
    }, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

function handlePost (media, message) {
  return new Promise((resolve, reject) => {
    if (media.length > 0) {
      upload({
        content: Buffer.from(media[0].content, 'base64'),
        filetype: media[0].type,
        filename: media[0].name
      }, message)
        .then((success) => {
          resolve(success)
        })
        .catch((err) => {
          reject(err)
        })
    } else if (message) {
      webclient.chat.postMessage(settings.channel, message, (err, res) => {
        if (err) {
          return reject(err)
        }
        resolve(res)
      })
    } else {
      reject(new Error('No media or message in request.'))
    }
  })
}

function run (options) {
  webclient = new WebClient(settings.token)
  slack = new Slack(settings.token)

  return new Promise((resolve, reject) => {
    const message = options.message || settings.message
    var media = options.media

    // if no media sent in request, try to load from settings
    if (!options.media || !Array.isArray(options.media) || options.media.length < 1) {
      optionFormat.formatMedia(settings.media)
        .then(res => {
          media = res ? [res] : []
          handlePost(media, message)
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
        .catch(err => reject(err))
    } else {
      handlePost(media, message)
        .then(res => resolve(res))
        .catch(err => reject(err))
    }
  })
}

module.exports = {
  run
}
