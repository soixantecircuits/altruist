'use strict'

const fs = require('fs-extra')
const path = require('path')

let getActionModule = (actionName) => {
  return new Promise((resolve, reject) => {
    if (typeof actionName !== 'string' || actionName.length === 0) {
      return reject('Error loading module. Action name is invalid.')
    }
    const modulePath = path.resolve(`${__dirname}/../../actions/${actionName}.js`)
    fs.access(modulePath, (err) => {
      if (!err) {
        const module = require(modulePath)
        return resolve(module)
      } else {
        return reject(`Error loading module "${modulePath}": ${err}`)
      }
    })
  })
}

let init = (app, router, settings) => {
  const authRedirectURL = settings.authRedirectURL ? settings.authRedirectURL : '/authRedirect'
  const authRedirect = []

  for (let action in settings.actions) {
    getActionModule(action)
    .then(module => {
      typeof (module.auth) === 'function' && module.auth(app)
      typeof (module.loginURL) === 'string' && authRedirect.push({ name: action, URL: module.loginURL })
      typeof (module.addRoutes) === 'function' && module.addRoutes(app)

      router.post(`/actions/${action}`, (req, res) => {
        module.run(req.body, req)
          .then(response => {
            try {
              if (typeof response === 'string') {
                response = JSON.parse(response)
              }
              res.json(response)
            } catch (err) {
              console.error('can not parse response')
            }
          })
          .catch(reason => {
            console.log(reason)
            res.status(500).send(reason)
          })
      })
    })
    .catch(err => {
      console.warn(err)
    })
  }

  app.get(authRedirectURL, (req, res) => {
    res.send({ 'map': authRedirect })
  })
}

module.exports = {
  init
}
