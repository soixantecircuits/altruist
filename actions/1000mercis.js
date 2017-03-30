'use strict'

const settings = require('nconf').get('app')
const request = require('request')

function run (options) {
  return new Promise((resolve, reject) => {
    const url = settings.actions['1000mercis'].url
    const login = settings.actions['1000mercis'].login
    const password = settings.actions['1000mercis'].password
    const templateName = settings.actions['1000mercis'].templateName

    const params = options

    const datas = {
      login: login,
      password: password,
      order: {
        code: templateName,
        parameters: params
      }
    }

    request({
        method: 'POST',
        uri: url,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datas)
      }, (err, res, data) => {
        if (err) {
          reject(err)
        } else {
          try {
            data = JSON.parse(data)
            resolve(data)
          } catch (err) {
            reject(err)
          }
        }
      })
  })
}

module.exports.run = run
