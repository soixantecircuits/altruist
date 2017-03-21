'use strict'

const settings = require('nconf').get()
const request = require('request')

function callAction(actionName, actionOptions) {
  return new Promise((resolve, reject) => {
    request.post({url:'http://localhost:6060/api/v1/actions/' + actionName,
    form: actionOptions}, function(error, response, body) {
      resolve({ action: actionName, statusCode: response.statusCode })
    })
  })
}

function run (options) {
  return new Promise((resolve, reject) => {
    var promises = []
    for (let actionName in options) {
      var p = callAction(actionName, options[actionName])
      promises.push(p)
    }
    Promise.all(promises).then(results => resolve(results))
  })
}

module.exports = { run }
