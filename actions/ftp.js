const FTPClient = require('ftp')
const SSHClient = require('ssh2').Client
const path = require('path')
const config = require('../src/lib/config').actions.ftp

function isDefined (variable) {
  return !(variable === undefined || variable === '' || variable === null)
}

function putFTP (source, destination) {
  return new Promise((resolve, reject) => {
    var c = FTPClient()
    c.on('ready', function () {
      c.put(source, destination, function (err) {
        if (err) { reject(err) }
        c.end()
        resolve('File uploaded to: ' + destination)
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

function putSFTP (source, destination) {
  return new Promise((resolve, reject) => {
    var c = new SSHClient()
    c.on('ready', function () {
      c.sftp((err, sftp) => {
        if (err) { reject(err) }
        sftp.fastPut(source, destination, (err) => {
          if (err) { reject(err) }
          resolve('File uploaded to: ' + destination)
        })
      })
    }).connect({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    })
  })
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      // Error if no 'source' path in request
      if (isDefined(options.source) === false) {
        reject('Error: No source path in request')
      }
      // Error if no 'destination' path in request
      if (isDefined(options.destination) === false) {
        reject('Error: No destination path in request')
      }
      // Error if one of 'source' or 'destination' is not absolute
      if (path.isAbsolute(options.source) === false || path.isAbsolute(options.destination) === false) {
        reject('Error: source and destination paths must be absolute')
      }

      if (config.ssh === true) {
        putSFTP(options.source, options.destination)
          .then((response) => { resolve(response) })
          .catch((reason) => { reject(reason) })
      } else {
        putFTP(options.source, options.destination)
          .then((response) => { resolve(response) })
          .catch((reason) => { reject(reason) })
      }
    })
  }
}
