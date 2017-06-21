const FTPClient = require('ftp')
const SSHClient = require('ssh2').Client
const path = require('path')
const settings = require('../src/lib/settings').actions.ftp

function isDefined (variable) {
  return !(variable === undefined || variable === '' || variable === null)
}

function putFTP (source, destination) {
  return new Promise((resolve, reject) => {
    var c = FTPClient()
    c.on('ready', function () {
      c.put(source, destination, function (err) {
        if (err) { reject(new Error(err)) }
        c.end()
        resolve('File uploaded to: ' + destination)
      })
    })

    c.connect({
      host: settings.host,
      port: settings.port,
      user: settings.user,
      password: settings.password
    })
  })
}

function putSFTP (source, destination) {
  return new Promise((resolve, reject) => {
    var c = new SSHClient()
    c.on('ready', function () {
      c.sftp((err, sftp) => {
        if (err) { reject(new Error(err)) }
        sftp.fastPut(source, destination, (err) => {
          if (err) { reject(new Error(err)) }
          resolve('File uploaded to: ' + destination)
        })
      })
    }).connect({
      host: settings.host,
      port: settings.port,
      user: settings.user,
      password: settings.password
    })
  })
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      // Error if no 'source' path in request
      if (isDefined(options.source) === false) {
        reject(new Error('Error: No source path in request'))
      }
      // Error if no 'destination' path in request
      if (isDefined(options.destination) === false) {
        reject(new Error('Error: No destination path in request'))
      }
      // Error if one of 'source' or 'destination' is not absolute
      if (path.isAbsolute(options.source) === false || path.isAbsolute(options.destination) === false) {
        reject(new Error('Error: source and destination paths must be absolute'))
      }

      if (settings.ssh === true) {
        putSFTP(options.source, options.destination)
          .then((response) => { resolve(response) })
          .catch((reason) => { reject(new Error(reason)) })
      } else {
        putFTP(options.source, options.destination)
          .then((response) => { resolve(response) })
          .catch((reason) => { reject(new Error(reason)) })
      }
    })
  }
}
