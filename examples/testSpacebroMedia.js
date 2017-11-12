const { SpacebroClient } = require('spacebro-client')
var settings = require('standard-settings').getSettings()

settings.service.spacebro.client.name = settings.service.spacebro.client.name + 'test'
const spacebro = new SpacebroClient()

setTimeout(function () {
  /*
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    url: 'http://snapbox01.estu.la:36700/?action=snapshot',
    file: 'test.jpg',
    meta: {
      altruist: {
        action: ['mandrill'],
        mandrill: {
          to: {
            email: 'e@soixantecircuits.fr'
          }
        }
      }
    }
  })
  */
  spacebro.emit(settings.service.spacebro.client['in'].inMedia.eventName, {
    path: '/home/emmanuel/Downloads/2017-11-10T20-37-27-779.mp4',
    details: {
      thumbnail: {
        url: 'http://snapbox01.estu.la:36700/?action=snapshot',
        file: 'test.jpg'
      }
    },
    meta: {
      altruist: {
        action: ['socialite'],
        mandrill: {
          to: {
            email: 'e@soixantecircuits.fr'
          }
        }
      }
    }
  })
  console.log('Event emitted')
}, 1500)

spacebro.on('response', (data) => {
  console.log('response', JSON.stringify(data, null, 2))
})
