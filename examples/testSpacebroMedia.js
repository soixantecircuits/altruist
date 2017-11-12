const spacebroClient = require('spacebro-client')
const config = require('../settings/settings.json')

spacebroClient.connect(config.service.spacebro.host, config.service.spacebro.port, {
  clientName: 'media-provider',
  channelName: 'media-stream',
  verbose: false
})

setTimeout(function () {
  spacebroClient.emit('new-media-from-etna', {
    url: 'http://snapbox01.estu.la:36700/?action=snapshot',
    meta: {
      altruist: {
        action: ['socialite']
      }
    }
  })
  console.log('Event emitted')
}, 1500)

spacebroClient.on('altruist-success', (data) => {
  console.log('success', data)
})

spacebroClient.on('altruist-failure', (data) => {
  console.log('failure', data)
})
