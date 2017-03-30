const path = require('path')
const Client = require('instagram-private-api').V1
const _ = require('lodash')

const settings = require('nconf').get('app').actions.instagram
const cookiePath = path.join('/tmp', settings.account + '.json')

var device = new Client.Device(settings.account)
var storage = new Client.CookieFileStorage(cookiePath)

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      let media = _.get(options, 'path')
      let message = _.get(options, 'meta.message')
      if (media === undefined) {
        return reject({
          error: 'Invalid request',
          details: 'No path in request'
        })
      }

      Client.Session.create(device, storage, settings.account, settings.password)
        .then((session) => {
          Client.Upload.photo(session, media)
            .then((upload) => {
              return Client.Media.configurePhoto(session, upload.params.uploadId, message)
            })
            .then((response) => resolve('Success'))
            .catch((err) => reject({
              error: err.name,
              details: err.message
            }))
        })
    })
  }
}
