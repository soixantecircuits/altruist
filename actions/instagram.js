const path = require('path')
const Client = require('instagram-private-api').V1

const settings = require('../src/lib/settings').actions.instagram
const cookiePath = path.join('/tmp', settings.account + '.json')

var device = new Client.Device(settings.account)
var storage = new Client.CookieFileStorage(cookiePath)

module.exports = {
  run: async (options) => {
    try {
      if (!options.media || !Array.isArray(options.media) || options.media.length < 1) {
        throw new Error('No media provided in request')
      }
      if (!options.media[0].path) {
        throw new Error('The media provided has no path')
      }

      var session = await Client.Session.create(device, storage, settings.account, settings.password)
      var upload = await Client.Upload.photo(session, options.media[0].path)
      console.log('Uploading ' + options.media[0].name)
      var response = await Client.Media.configurePhoto(session, upload.params.uploadId, options.message)
      return response
    } catch (err) {
      throw err
    }
  }
}
