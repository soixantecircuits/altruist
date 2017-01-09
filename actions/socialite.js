'use strict'

const config = require('../src/lib/config')
const socialiteAPI = require('../src/lib/socialite-api')

function run (options, request) {
  return new Promise((resolve, reject) => {
    let bucket = options.bucket || config.actions.socialite.bucket
    let token = options.token || config.actions.socialite.token
    let name = options.name

    // Prepare data to post to the socialite server
    var params = {
      bucket: bucket,
      token: token,
      name: name,
      files: []
    }

    if (!request.files && request.files.length === 0) {
      return reject({
        error: 'invalid request',
        details: 'No file given in request.'
      })
    }

    for (let i = 0; i < request.files.length; ++i) {
      params.files.push({
        value: request.files[i].buffer,
        options: {
          filename: request.files[i].originalname,
          contentType: request.files[i].mimetype
        }
      })
    }

    socialiteAPI.uploadFiles(params, (err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res)
    })
  })
}

module.exports = {
run}
