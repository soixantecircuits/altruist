'use strict'

const settings = require('nconf').get()
const request = require('request')

function callAction(actionName, options) {
  return new Promise((resolve, reject) => {
    request.post({url:'http://localhost:6060/api/v1/actions/' + actionName,
    form: options}, function(error, response, body) {
      resolve({ action: actionName,
        statusCode: response.statusCode,
        body: body,
        error: error
      })
    })
  })
}

function run (options) {
  return new Promise((resolve, reject) => {
    var promises = []
    let actions = settings.actions.share.actions
    actions.forEach(actionName => {
      var p = callAction(actionName, options)
      promises.push(p)
    })
    Promise.all(promises).then(results => resolve(results))
  })
}

module.exports = { run }
