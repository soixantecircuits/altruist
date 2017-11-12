const { SpacebroClient } = require('spacebro-client')
var settings = require('standard-settings').getSettings()

settings.service.spacebro.client.name = settings.service.spacebro.client.name + 'test'
const spacebro = new SpacebroClient()

setTimeout(function () {
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    url: 'http://snapbox01.estu.la:36700/?action=snapshot',
    meta: {
      altruist: {
        action: ['socialite']
      }
    }
  })
  console.log('Event emitted')
}, 1500)

spacebro.on('response', (data) => {
  console.log('response', data)
})

