'use strict'

const spacebroClient = require('spacebro-client')
const actionHelper = require('./action')
const requestHelper = require('./request')

var autoshareActions = []
var successEvent
var failureEvent

function getActions (options) {
  let actions = options.action || autoshareActions
  actions = Array.isArray(actions) ? actions : [actions] // make sure that actions is an array
  return actions
}

function extractMediaProperties (media) {
  return { // extract only the properties needed by altruist
    name: media.name,
    type: media.type,
    path: media.path,
    url: media.url,
    content: media.content
  }
}

async function formatOptionsMedia (options, media) {
  let mediaArray = [extractMediaProperties(media)]
  // if there are other media to send, put them in the array as well
  if (media.details && Object.keys(media.details).length) {
    Object.keys(media.details).forEach(key => {
      mediaArray.push(extractMediaProperties(media.details[key]))
    })
  }

  options.media = mediaArray
  // apply the generic formatting
  await requestHelper.formatOptionsMedia(options)
}

async function handleSpacebroRequest (media) {
  try {
    if (media.meta && media.meta.altruist) {
      // get the parameters to send to actions
      let options = media.meta.altruist
      // get the actions to run in an array
      let actionNames = getActions(options)
      // get the media in the options object and format them for altruist
      await formatOptionsMedia(options, media)

      actionNames.forEach((actionName) => {
        actionHelper.runAction(actionName, options)
          .then(res => {
            emitSuccessEvent(actionName, media, res)
          })
          .catch(err => {
            emitFailureEvent(actionName, media, err)
          })
      })
    }
  } catch (e) {
    emitFailureEvent('', media, e)
  }
}

function emitSuccessEvent (action, media, data) {
  let response = {
    action,
    success: true,
    code: 200,
    response: data
  }
  media.meta.altruistResponse = response

  try {
    spacebroClient.emit(successEvent, media)
  } catch (e) {
    console.error('Error on emit success event', e)
    console.error('Response: ', media)
  }
}

function emitFailureEvent (action, media, err) {
  if (err instanceof Error) {
    var errorResponse = err.message
    try {
      // the error's message might be a stringified object
      errorResponse = JSON.parse(errorResponse)
    } finally {
      if (typeof errorResponse === 'object') {
        errorResponse.action = action
        errorResponse.success = false
        media.meta.altruistResponse = errorResponse
        spacebroClient.emit(failureEvent, media)
      } else {
        // Assuming errorResponse is a string
        media.meta.altruistResponse = {
          action,
          success: false,
          code: 500,
          response: errorResponse
        }
        spacebroClient.emit(failureEvent, media)
      }
    }
  }
}
let init = (settings) => {
  spacebroClient.connect(settings.service.spacebro.host, settings.service.spacebro.port, {
    clientName: settings.service.spacebro.clientName,
    channelName: settings.service.spacebro.channelName,
    verbose: false,
    sendBack: false
  })

  if (settings.autoshare && settings.autoshare.action) {
    autoshareActions = settings.autoshare.action
  }
  successEvent = settings.service.spacebro.successMessage
  failureEvent = settings.service.spacebro.failureMessage

  spacebroClient.on('connect', () => {
    console.log(`spacebro: ${settings.service.spacebro.clientName} connected to ${settings.service.spacebro.host}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
  })

  spacebroClient.on('new-member', (data) => {
    console.log(`spacebro: ${data.member} has joined.`)
  })

  spacebroClient.on('disconnect', () => {
    console.error('spacebro: connection lost.')
  })

  spacebroClient.on(settings.service.spacebro.inputMessage, (data) => {
    handleSpacebroRequest(data)
  })
}

module.exports = {
  init,
  emitSuccessEvent,
  emitFailureEvent
}
