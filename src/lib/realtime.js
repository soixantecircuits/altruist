'use strict'

const spacebroClient = require('spacebro-client')
const actionHelper = require('./action')
const requestHelper = require('./request')
const mh = require('media-helper')

let autoshareActions = []
let successEvent = 'altruist-relatime-success'
let failureEvent = 'altruist-relatime-failure'
let log = true

function getActions (options) {
  let actions = options.action || autoshareActions
  actions = Array.isArray(actions) ? actions : [actions] // make sure that actions is an array
  return actions
}

function extractMediaProperties (media) {
  return { // extract only the properties needed by altruist
    path: mh.isFile(media.path) ? path : '',
    content: media.content || null,
    name: media.name || media.file || media.filename,
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
  return await requestHelper.formatOptionsMedia(options.media)
}

async function handleSpacebroRequest (media) {
  console.log(`* received media ${media.file} from ${media._from}`)
  try {
    // get the parameters to send to actions
    let options = media.meta ? media.meta.altruist || {} : media
    // get the media in the options object and format them for altruist
    options.media = await formatOptionsMedia({ media })

    getActions(options).forEach((actionName) => {
      actionHelper
        .runAction(actionName, options)
        .then(res => {
          emitSuccessEvent(actionName, media, res)
        })
        .catch(err => {
          emitFailureEvent(actionName, media, err)
        })
    })
  } catch (error) {
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
    spacebroClient.emit(successEvent, response)
  } catch (e) {
    log && console.error('Error on emit success event', e)
    log && console.error('Response: ', media)
  }
}

function emitFailureEvent (action, media, err) {
  console.log(`* failure on action '${action}'`)
  console.error(err)
  let response = null
  try {
    response = JSON.parse(err.message)
  } finally {
    if (typeof response === 'object') {
      response.action = action
      response.success = false
      spacebroClient.emit(failureEvent, response)
    } else {
      const altruistResponse = {
        action,
        success: false,
        code: 500,
        response
      }
      spacebroClient.emit(failureEvent, altruistResponse)
    }
  }
}
let init = (settings) => {
  log = settings.verbose === undefined ? true : settings.verbose

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
    log && console.log(`spacebro: ${settings.service.spacebro.clientName} connected to ${settings.service.spacebro.host}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
  })

  spacebroClient.on('new-member', (data) => {
    log && console.log(`spacebro: ${data.member} has joined.`)
  })

  spacebroClient.on('disconnect', () => {
    log && console.error('spacebro: connection lost.')
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
