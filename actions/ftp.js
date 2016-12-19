const Client = require('ftp')
const path = require('path')
const fs = require('fs')
const config = require('../src/lib/config').actions.ftp

function isDefined (variable) {
  return !(variable === undefined || variable === '' || variable === null)
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      var dst
      // Error if no 'source' path in request
      if (isDefined(options.source) === false) {
        reject('Error: No source content in request')
      }
      // Error if file described in source doesn't exists
      if (fs.existsSync(options.source) === false) {
        reject('Error: ' + options.source + ' does not exists')
      }
      // Get remothe path from request...
      if (isDefined(options.destination) === true) {
        dst = options.destination
      } else {
      // ...or use default one (home)
        dst = path.join('~', path.basename(options.source))
      }

      var c = new Client()
      c.on('ready', function () {
        c.put(options.source, dst, function (err) {
          if (err) { reject(err) }
          c.end()
          resolve('File uploaded to: ' + dst)
        })
      })

      c.connect({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
      })
    })
  }
}
