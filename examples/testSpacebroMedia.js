const spacebroClient = require('spacebro-client')
const config = require('../settings/settings.json')

spacebroClient.connect(config.service.spacebro.host, config.service.spacebro.port, {
  clientName: 'media-provider',
  channelName: 'media-stream',
  verbose: false
})

setTimeout(function () {
  spacebroClient.emit('altruist-test-input', {
    path: '/home/mina/Downloads/profile.jpg',
    meta: {
      altruist: {
        action: ['instagram'],
        message: 'oi'
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
