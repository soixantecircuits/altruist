'use strict'

import _ from 'lodash'
import path from 'path'
import mediaHelper from 'media-helper'

async function formatMedia (media) {
  try {
    if (mediaHelper.isFile(media)) {
      return {
        path: media,
        name: path.basename(media),
        mimetype: await mediaHelper.getMimeType(media),
        content: await mediaHelper.fileToBase64(media)
      }
    }

    if (mediaHelper.isURL(media)) {
      return {
        url: media,
        mimetype: await mediaHelper.getMimeType(media),
        content: await mediaHelper.urlToBase64(media)
      }
    }

    if (mediaHelper.isBuffer(media)) {
      return {
        mimetype: await mediaHelper.getMimeType(media),
        content: await mediaHelper.toBase64(media)
      }
    }

    if (mediaHelper.isBase64(media)) {
      return {
        mimetype: await mediaHelper.getMimeType(media),
        content: media
      }
    }
  } catch (e) {
    console.error(e)
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

  options.media = await Promise.all(_.map(options.media, formatMedia))
}

async function getFormDataFiles (options, req) {
  await formatOptionsMedia(options)

  if (req && req.files) {
    let filesToAdd = await Promise.all(_.map(req.files, async (file) => {
      try {
        return {
          name: file.originalname,
          mimetype: await mediaHelper.getMimeType(file.buffer),
          content: await mediaHelper.toBase64(file.buffer)
        }
      } catch (e) {
        console.error(e)
        return null
      }
    }))

    options.media = _.concat([options.media, filesToAdd])
  }
}

export default {
  formatOptionsMedia,
  getFormDataFiles
}
