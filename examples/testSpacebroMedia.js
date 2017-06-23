const spacebroClient = require('spacebro-client')
const config = require('../settings/settings.default.json')

spacebroClient.connect(config.service.spacebro.host, config.service.spacebro.port, {
  clientName: 'media-provider',
  channelName: 'media-stream',
  verbose: false
})

setTimeout(function () {
  spacebroClient.emit('new-media-from-etna', {
    url: '/path/to/file',
    action: 'socialite'
  })
  console.log('Event emitted')
}, 1500)
