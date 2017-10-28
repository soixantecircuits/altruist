'use strict'

const fs = require('fs-extra')
const path = require('path')
const requestHelper = require('./request')

let log = true
var actionModules = {}

function getActionModule (actionName) {
  return new Promise((resolve, reject) => {
    if (typeof actionName !== 'string' || actionName.length === 0) {
      return reject(new Error('Error loading module. Action name is invalid.'))
    }

    const modulePath = path.resolve(`${__dirname}/../../actions/${actionName}.js`)
    fs.access(modulePath, (err) => {
      if (!err) {
        const module = require(modulePath)
        return resolve(module)
      } else {
        return reject(new Error(`Error loading module "${modulePath}": ${err}`))
      }
    })
  })
}

async function runAction (actionName, options) {
  try {
    let response = await actionModules[actionName].run(options)

    if (typeof response === 'string') {
      try {
        response = JSON.parse(response)
        if (response.error) {
          throw response.error
        }
      } catch (ignore) {}
    }
    return response
  } catch (reason) {
    log && console.error(`An error occured with ${actionName}`)
    log && console.error(reason)
    throw new Error(reason)
  }
}

async function handlePostRequest (action, req, res) {
  var options = req.body

  try {
    await requestHelper.formatOptionsMedia(options)
    // If files are uploaded through form-data, add them to the options object
    await requestHelper.getFormDataFiles(options, req)

    let response = await runAction(action, options)
    res.send({
      action,
      success: true,
      code: 200,
      response
    })
  } catch (e) {
    if (e instanceof Error) {
      var errorResponse = e.message
      try {
        // the error's message might be a stringified object
        errorResponse = JSON.parse(errorResponse)
      } catch (ignore) {
      } finally {
        if (typeof errorResponse === 'object') {
          errorResponse.action = action
          errorResponse.success = false
          res.status(errorResponse.code || 500).send(errorResponse)
        } else {
          // Assuming errorResponse is a string
          res.status(500).send({
            action,
            success: false,
            code: 500,
            response: errorResponse
          })
        }
      }
    }
  }
}

async function init (app, router, settings) {
  const authRedirectURL = settings.authRedirectURL ? settings.authRedirectURL : '/authRedirect'
  const authRedirect = []
  log = settings.verbose === undefined ? true : settings.verbose

  for (let action in settings.actions) {
    try {
      let module = await getActionModule(action)
      // Store the required module for later calls
      actionModules[action] = module

      // Create the eventual routes for authentication
      typeof (module.auth) === 'function' && module.auth(app)
      typeof (module.loginURL) === 'string' && authRedirect.push({ name: action, URL: module.loginURL })
      typeof (module.addRoutes) === 'function' && module.addRoutes(app)

      // Create route for http requests
      router.post(`/actions/${action}`, (req, res) => { handlePostRequest(action, req, res) })
    } catch (err) {
      log && console.warn(err)
    }
  }

  // Create route that returns all the available authentication URLs
  app.get(authRedirectURL, (req, res) => {
    res.send({ 'map': authRedirect })
  })
}

module.exports = {
  init,
  runAction,
  handlePostRequest
}
