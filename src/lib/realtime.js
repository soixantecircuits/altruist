'use strict'

const spacebroClient = require('spacebro-client')
const settings = require('standard-settings').getSettings()

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

function registerEvent (eventName, callback) {
  spacebroClient.on(eventName, callback)
}

function emitEvent (eventName, data) {
  spacebroClient.emit(eventName, data)
}

module.exports = {
  registerEvent,
  emitEvent
}
