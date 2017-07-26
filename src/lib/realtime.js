'use strict'

const spacebroClient = require('spacebro-client')
const request = require('request')

let init = (settings) => {
  spacebroClient.connect(settings.service.spacebro.host, settings.service.spacebro.port, {
    clientName: settings.service.spacebro.clientName,
    channelName: settings.service.spacebro.channelName,
    verbose: false,
    sendBack: false
  })

  spacebroClient.on('connect', () => {
    console.log(`spacebro: ${settings.service.spacebro.clientName} connected to ${settings.service.spacebro.host}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
  })

  spacebroClient.on('new-member', (data) => {
    console.log(`spacebro: ${data.member} has joined.`)
  })

  spacebroClient.on('disconnect', () => {
    console.error('spacebro: connection lost.')
  })

  if (settings.autoshare) {
    spacebroClient.on(settings.service.spacebro.inputMessage, (data) => {
      share(data, data.action)
    })
  }

  var share = (media, action) => {
    let today = new Date()
    request
    .post(`http://localhost:${settings.server.port}/api/v1/actions/${action || settings.autoshare.actionName}`,
    {form: {filename: media.file || today.getTime(), media: media.url || media.path}, json: true},
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
        console.log(media)
        spacebroClient.emit(settings.service.spacebro.outputMessage, media)
        // Cant't update the media if we do not have its id in media-manager. This only works when catching media-to-db event.
        // spacebroClient.emit('media-update', media)
      }
    })
  }
}

module.exports = {
  init
}
