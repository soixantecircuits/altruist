'use strict'

const fs = require('fs')
const mime = require('mime')

const settings = require('../src/lib/settings')
const fetchImage = require('../src/lib/fetch-image')

const WebClient = require('@slack/client').WebClient
let webclient = null

const Slack = require('node-slack-upload')
let slack = null

function upload ({ file, filetype, filename }) {
  return new Promise((resolve, reject) => {
    slack.uploadFile({
      file,
      filetype,
      filename,
      channels: settings.actions.slack.channel
    }, (err, data) => {
      err && reject(new Error(JSON.stringify({ err: err })))
      resolve(data)
    })
  })
}

function uploadB64 (dataURL) {
  return new Promise((resolve, reject) => {
    const re = /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
    const base64 = dataURL.replace(re, '')
    const file = fs.createReadStream(Buffer.from(base64, 'base64'))
    // const file = base64

    const type = dataURL.match(re) || []
    const filetype = type.length ? type[1] : 'image/jpg'
    const filename = filetype.replace(/\//, '.')

    upload({file, filetype, filename})
      .then((success) => {
        resolve(success)
      })
      .catch((err) => {
        reject(new Error(JSON.stringify(err)))
      })
  })
}

function run (options) {
  webclient = new WebClient(settings.actions.slack.token)
  slack = new Slack(settings.actions.slack.token)

  return new Promise((resolve, reject) => {
    const message = (options.message || options.caption)
      ? options.message || options.caption
      : settings.actions.slack.message || ''
    const media = options.media
      ? options.media
      : settings.actions.slack.media || ''

    const isPath = fs.existsSync(media)
    const isPictureData = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(media)
    const isURL = /^https?:\/\//i.test(media)

    if (isPath) {
      try {
        const file = fs.createReadStream(media)
        const filetype = mime.lookup(media)
        const filename = media.split(/\//g).pop()

        upload({file, filetype, filename})
          .then((success) => {
            resolve(success)
          })
          .catch((err) => {
            reject(new Error(JSON.stringify(err)))
          })
      } catch (err) {
        reject(new Error(JSON.stringify(err)))
      }
    } else if (isPictureData) {
      uploadB64(media)
        .then((success) => {
          resolve(success)
        })
        .catch((err) => {
          reject(new Error(JSON.stringify(err)))
        })
    } else if (isURL) {
      fetchImage(media)
        .then((imageData) => {
          uploadB64(imageData)
            .then((success) => {
              resolve(success)
            })
            .catch((err) => {
              reject(JSON.stringify(err))
            })
        })
        .catch((err) => {
          reject(err)
        })
    } else if (message) {
      webclient.chat.postMessage(settings.actions.slack.channel, message, (err, res) => {
        err && reject(new Error(JSON.stringify({ error: err })))
        resolve(res)
      })
    } else {
      reject(new Error(JSON.stringify({
        error: 'invalid request',
        details: 'No media or message in request.'
      })))
    }
  })
}

module.exports = {
  run
}
