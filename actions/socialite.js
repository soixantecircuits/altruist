'use strict'

const settings = require('../src/lib/settings')
const med = require('media-helper')
const request = require('request')
const fs = require('fs')
const path = require('path')
const url = require('url')

const baseURL = 'http://app.shh.ac'
const route = '/wp-json/form/v1/postForm'

function formDataFile (value, name, type) {
  return {
    value: value,
    options: {
      filename: name,
      contentType: type
    }
  }
}

function getExtension (urlstring) {
  return path.extname(url.parse(urlstring).pathname)
}

function sendRequest (formData) {
  return new Promise((resolve, reject) => {
    request.post({
      url: `${baseURL}${route}`,
      formData: formData
    }, (err, res, body) => {
      err && reject(err)
      resolve(body)
    })
  })
}

function run (options, req) {
  return new Promise((resolve, reject) => {
    // Prepare data to post to the socialite server
    if (options.filename === undefined) {
      reject({ error: 'Invalid request', details: 'No filename provided' })
    }
    let formData = {
      bucket: options.bucket || settings.actions.socialite.bucket,
      token: options.token || settings.actions.socialite.token,
      name: options.filename,
      file: null
    }

    let media
    // NEED REFACTOR
    if (req && req.files && req.files.length > 0) {
      media = req.files[0]
      formData.file = formDataFile(media.buffer, media.originalname, media.mimetype)
      sendRequest(formData)
      .then(body => resolve(body))
      .catch(error => reject(error))
    } else if (med.isFile(options.media)) {
      media = options.media
      med.getMimeType(media)
      .then(type => {
        let ext = '.' + path.basename(type)
        formData.file = formDataFile(fs.readFileSync(media), options.filename + ext, type)
        sendRequest(formData)
        .then(body => resolve(body))
        .catch(error => reject(error))
      }).catch(error => reject(error))
    } else if (med.isURL(options.media)) {
      let ext = getExtension(options.media)
      let type = med.getMimeFromName(ext)
      let mediaTmp = path.join('/tmp', options.filename + ext)
      let streamTmp = request(options.media).on('error', (err) => {
        return reject(err)
      }).pipe(fs.createWriteStream(mediaTmp))
      streamTmp.on('finish', () => {
        formData.file = formDataFile(fs.readFileSync(mediaTmp), options.filename + ext, type)
        sendRequest(formData)
        .then(body => {
          fs.unlink(mediaTmp)
          resolve(body)
        })
        .catch(error => reject(error))
      })
    } else {
      reject({ error: 'Invalid request', details: 'No media provided' })
    }
  })
}

module.exports = { run }
