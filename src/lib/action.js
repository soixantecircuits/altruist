'use strict'

const fs = require('fs-extra')
const path = require('path')
const requestHelper = require('./request')

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
      response = JSON.parse(response)
    }
    return response
  } catch (reason) {
    console.error(`An error occured with ${actionName}`)

    if (reason instanceof Error) {
      try {
        return JSON.parse(reason.message)
      } catch (err) {
        console.error(reason.message)
        return reason
      }
    }
  }
}

async function handlePostRequest (action, req, res) {
  var options = req.body
  // If files are uploaded through form-data, add them to the options object
  requestHelper.getFormDataFiles(options, req)

  try {
    let response = await runAction(action, options)
    res.send(response)
  } catch (e) {
    res.status(500).send(e)
  }
}

async function init (app, router, settings) {
  const authRedirectURL = settings.authRedirectURL ? settings.authRedirectURL : '/authRedirect'
  const authRedirect = []

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
      console.warn(err)
    }
  }

  app.get(authRedirectURL, (req, res) => {
    res.send({ 'map': authRedirect })
  })
}

module.exports = {
  init,
  runAction
}
