'use strict'

const Twit = require('twit')
const settings = require('../src/lib/settings').actions.twitter

const T = new Twit({
  consumer_key: settings.consumer_key,
  consumer_secret: settings.consumer_secret,
  access_token: settings.access_token,
  access_token_secret: settings.access_token_secret,
  timeout_ms: 60 * 1000
})

async function updateStatus (message, mediaIdStr) {
  try {
    let res = await T.post('statuses/update', { status: message, media_ids: [mediaIdStr] })
    return res.data
  } catch (e) {
    throw e
  }
}

async function uploadImage (message, mediaData) {
  try {
    let uploadRes = await T.post('media/upload', { media_data: mediaData })

    try {
      let postRes = await updateStatus(message, uploadRes.data.media_id_string)
      return postRes
    } catch (err) {
      throw err
    }
  } catch (err) {
    throw err
  }
}

// Only MP4 format is supported for videos
async function uploadVideo (message, media) {
  try {
    let uploadRes = await new Promise((resolve, reject) => {
      T.postMediaChunked({ file_path: media }, function (err, data, response) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })

    try {
      let postRes = await updateStatus(message, uploadRes.media_id_string)
      return postRes
    } catch (err) {
      throw err
    }
  } catch (err) {
    throw err
  }
}

module.exports = {
  run: async (options) => {
    const tweet = Object.assign({}, settings, options)
    const message = tweet.message
    var media = tweet.media

    // Supported formats: JPG, PNG, GIF, WEBP, MP4
    try {
      if (media && Array.isArray(media) && media.length > 0 && media[0]) { // If there are media to send
        if (media[0].type.indexOf('image') > -1) {
          let res = await uploadImage(message, media[0].content)
          return res
        } else if (media[0].type.indexOf('video') > -1) { // Video upload only works with path right now
          if (!media[0].path) {
            throw new Error('Video upload only works when media is a path to the local file. Ex: "media" : "/home/altruist/soixante.mp4"')
          }
          let res = await uploadVideo(message, media[0].path)
          return res
        } else {
          throw new Error('Could not define media\'s type')
        }
      } else if (typeof message === 'string') { // If there is only a message to send
        let res = await updateStatus(message)
        return res
      } else { // No message or media to send
        throw new Error('Error: No message or media in request')
      }
    } catch (e) {
      throw e
    }
  }
}
