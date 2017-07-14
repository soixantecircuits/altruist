'use strict'

const _ = require('lodash')
const path = require('path')
const mediaHelper = require('media-helper')

async function formatMedia (media) {
  try {
    if (mediaHelper.isFile(media)) {
      let type = await mediaHelper.getMimeType(media)
      let content = await mediaHelper.fileToBase64(media)
      return {
        path: media,
        name: path.basename(media),
        type,
        content
      }
    }

    if (mediaHelper.isURL(media)) {
      let content = await mediaHelper.urlToBase64(media)
      let type = await mediaHelper.getMimeType(Buffer.from(content, 'base64'))
      return {
        url: media,
        type,
        content
      }
    }

    if (mediaHelper.isBuffer(media)) {
      let type = await mediaHelper.getMimeType(media)
      let content = await mediaHelper.toBase64(media)
      return {
        type,
        content
      }
    }

    if (mediaHelper.isBase64(media)) {
      let type = await mediaHelper.getMimeType(Buffer.from(media, 'base64'))
      return {
        type,
        content: media
      }
    }

    if (typeof media === 'object' && (media.content || media.path || media.url)) {
      if (media.path) {
        media.name = media.name || path.basename(media.path)
        media.type = media.type || await mediaHelper.getMimeType(media.path)
        media.content = media.content || await mediaHelper.fileToBase64(media.path)
      } else if (media.url) {
        media.content = media.content || await mediaHelper.urlToBase64(media.url)
        media.type = media.type || await mediaHelper.getMimeType(Buffer.from(media.content, 'base64'))
      }
      return media
    }

    return null
  } catch (e) {
    console.error('Error when formatting media', e)
    return null
  }
}

async function formatOptionsMedia (options) {
  // If there is already a media in the options, put it in an array
  if (options.media && Array.isArray(options.media) === false) {
    options.media = [options.media]
  } else if (!options.media) {
    options.media = []
  }

  try {
    options.media = await Promise.all(_.map(options.media, formatMedia))
  } catch (e) {
    return e
  }
}

async function getFormDataFiles (options, req) {
  if (req && req.files && req.files.length > 0) {
    try {
      let filesToAdd = await Promise.all(_.map(req.files, async (file) => {
        try {
          return {
            name: file.originalname,
            type: await mediaHelper.getMimeType(file.buffer),
            content: await mediaHelper.toBase64(file.buffer)
          }
        } catch (e) {
          return e
        }
      }))

      options.media = _.concat(options.media, filesToAdd)
    } catch (err) {
      return err
    }
  }
}

module.exports = {
  formatMedia,
  formatOptionsMedia,
  getFormDataFiles
}
