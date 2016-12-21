'use strict'

const request = require('request')

module.exports = (url) => new Promise((resolve, reject) => {
    !/^https?:\/\//i.test(url) && reject('Not a valid HTTP URL.')

    request.get(url, (err, response, body) => {
      if (err || response.statusCode !== 200) {
        reject(err ? err : response.statusCode)
      } else {
        resolve(body.toString('base64'))
      }
    })
  })