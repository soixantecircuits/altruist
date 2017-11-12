'use strict'

const { SpacebroClient } = require('spacebro-client')
const actionHelper = require('./action')
const requestHelper = require('./request')
const mh = require('media-helper')
var settings = require('standard-settings').getSettings()

var autoshareActions = []
let log = true
let spacebro = null

function getActions (options) {
  let actions = options.action || autoshareActions
  actions = Array.isArray(actions) ? actions : [actions] // make sure that actions is an array
  return actions
}

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
  console.log(`* received media ${media.file} from ${media._from}`)
  try {
    // get the parameters to send to actions
    let options = media.meta ? media.meta.altruist || {} : media
    // get the actions to run in an array
    let actionNames = getActions(options)
    // get the media in the options object and format them for altruist
    await formatOptionsMedia(options, media)

    actionNames.forEach((actionName) => {
      actionHelper
        .runAction(actionName, options)
        .then(res => {
          emitSuccessEvent(actionName, media, res)
        })
        .catch(err => {
          emitFailureEvent(actionName, media, err)
        })
    })
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
    try {
      // the error's message might be a stringified object
      errorResponse = JSON.parse(errorResponse)
    } finally {
      if (typeof errorResponse === 'object') {
        errorResponse.action = action
        errorResponse.success = false
        spacebro.emit(settings.service.spacebro.client['out'].response.eventName, errorResponse)
      } else {
        // Assuming errorResponse is a string
        const altruistResponse = {
          action,
          success: false,
          code: 500,
          response: errorResponse
        }
        spacebro.emit(settings.service.spacebro.client['out'].response.eventName, altruistResponse)
      }
    }
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
    handleSpacebroRequest(data)
  })
}

module.exports = {
  init,
  emitSuccessEvent,
  emitFailureEvent
}
