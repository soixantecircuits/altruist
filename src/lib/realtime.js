'use strict'

const spacebroClient = require('spacebro-client')
const settings = require('standard-settings').getSettings()
const request = require('request')

spacebroClient.connect(settings.service.spacebro.address, settings.service.spacebro.port, {
  clientName: settings.service.spacebro.clientName,
  channelName: settings.service.spacebro.channelName,
  verbose: false,
  sendBack: false
})

spacebroClient.on('connect', () => {
  console.log(`spacebro: ${settings.service.spacebro.clientName} connected to ${settings.service.spacebro.address}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
})

spacebroClient.on('new-member', (data) => {
  console.log(`spacebro: ${data.member} has joined.`)
})

spacebroClient.on('disconnect', () => {
  console.error('spacebro: connection lost.')
})

if (settings.autoshare) {
  spacebroClient.on(settings.service.spacebro.inputMessage, (data) => {
    share(data)
  })
}

var share = (media, action) => {
  console.log(media)
  let today = new Date()
  request
  .post(`http://localhost:${settings.server.port}/api/v1/actions/${settings.autoshare.actionName}`,
  {form: {filename: today.getTime(), media: media.url}, json: true},
  (err, httpResponse, body) => {
    if (err) {
      console.error(err)
    } else {
      const meta = Object.assign({}, media.meta, {
        socialite: {
          url: body.url
        }
      })
      media.meta = meta
      spacebroClient.emit('media-update', media)
    }
  })
}
