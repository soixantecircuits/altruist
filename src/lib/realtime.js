'use strict'

const { SpacebroClient } = require('spacebro-client')
const actionHelper = require('./action')
// const requestHelper = require('./request')
const { Media } = require('./Media')
const assignment = require('assignment')
const standardSettings = require('standard-settings')
var settings = standardSettings.getSettings()

// var autoshareActions = []
let log = true
let spacebro = null

function getActions (media) {
  let actions = media.meta.altruist.action
  actions = Array.isArray(actions) ? actions : [actions] // make sure that actions is an array
  return actions
}

/*
function extractMediaProperties (media) {
  return { // extract only the properties needed by altruist
    // path: mh.isFile(media.path) ? path : '',
    content: media.content || null,
    name: media.name || media.file || media.filename,
    file: media.file || media.name || media.filename,
    url: media.url || media.src,
    type: media.type || ''
  }
}
*/

/*
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
*/

async function handleSpacebroRequest (media) {
  if (media && media.meta && media.meta.altruistResponse) {
    throw Error('media was already processed by altruist, please delete media.meta.altruistReponse to use again')
  }
  try {
    media = new Media(media)
    console.log(`* received media ${media.getFilename()} from ${media._from}`)
    // add default meta from settings
    media.meta = standardSettings.getMeta(media)

    // add meta
    media.meta = assignment({
      altruist: settings.actions
    }, media.meta)

    // get the actions to run in an array
    let actionNames = getActions(media)
    // run
    actionNames.forEach((actionName) => {
      actionHelper
        .runAction(actionName, media)
        .then(res => {
          emitSuccessEvent(actionName, media, res)
        })
        .catch(err => {
          emitFailureEvent(actionName, media, err)
        })
    })
    if (actionNames.length === 0) {
      log && console.log('No action to run for this media. Should you add one in the meta or in settings?')
    }
  } catch (e) {
    emitFailureEvent('', media, e)
  }
}

function emitSuccessEvent (action, media, data) {
  let response = {
    action,
    success: true,
    code: 200
  }
  response = Object.assign(response, data)

  try {
    console.log(`* action ${action} successful`)
    console.log(response)
    spacebro.emit(settings.service.spacebro.client['out'].response.eventName, response)
  } catch (e) {
    log && console.error('Error on emit success event', e)
    log && console.error('Response: ', media)
  }
}

function emitFailureEvent (action, media, err) {
  if (err instanceof Error) {
    var errorResponse = err.message
    log && console.error('Error: ', errorResponse)
    try {
      // the error's message might be a stringified object
      errorResponse = JSON.parse(errorResponse)
    } catch (ignore) {
    } finally {
      if (typeof errorResponse === 'object') {
        errorResponse.action = action
        errorResponse.success = false
      } else {
        // Assuming errorResponse is a string
        errorResponse = {
          action,
          success: false,
          code: 500,
          response: errorResponse
        }
      }
      media.meta.altruistResponse = errorResponse
      errorResponse = Object.assign(errorResponse, media)
      spacebro.emit(settings.service.spacebro.client['out'].response.eventName, errorResponse)
    }
  } else {
    console.error('not an Error: ' + err)
  }
}
let init = (settings) => {
  log = settings.verbose === undefined ? true : settings.verbose

  spacebro = new SpacebroClient()

  spacebro.on('connect', () => {
    log && console.log(`spacebro: ${settings.service.spacebro.client.name} connected to ${settings.service.spacebro.host}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
  })

  spacebro.on('disconnect', () => {
    log && console.error('spacebro: connection lost.')
  })

  spacebro.on(settings.service.spacebro.client['in'].inMedia.eventName, (data) => {
    try {
      handleSpacebroRequest(data)
    } catch (e) {
      log && console.error('Error: ', e)
    }
  })
}

module.exports = {
  init,
  emitSuccessEvent,
  emitFailureEvent
}
