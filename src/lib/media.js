const fs = require('fs')
const mmm = require('mmmagic')
const Magic = mmm.Magic
const request = require('request').defaults({encoding: null})

/**
 * Determines if a string is base64 encoded
 * @param {string} str - The string to be tested
 * @returns {boolean}
 */
function isBase64 (str) {
  var base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/
  return base64Regex.test(str)
}

/**
 * Determines if a string is an URL
 * @param {string} str - The string to be tested
 * @returns {boolean}
 */
function isURL (str) {
  var urlRegex = /^https?:\/\//i
  return urlRegex.test(str)
}

/**
 * Determines if a file exists
 * @param {string} path - Path to a file
 * @returns {boolean}
 */
function isFile (path) {
  return fs.existsSync(path)
}

/**
 * Determines the mime-type of a file
 * @param {string} path - Path to a file
 * @returns {Promise}
 */
function getMimeType (path) {
  return new Promise((resolve, reject) => {
    new Magic(mmm.MAGIC_MIME_TYPE)
      .detectFile(path, function (err, result) {
        if (err) { reject(err) }
        resolve(result)
      })
  })
}

/**
 * Determines if a file is an image
 * @param {string} path - Path to a file
 * @returns {Promise}
 */
function isImage (path) {
  return new Promise((resolve, reject) => {
    getMimeType(path)
      .then(type => {
        if (type.indexOf('image') > -1) { resolve(true) } else { reject(false) }
      })
      .catch(err => reject(err))
  })
}

/**
 * Determines if a file is a video
 * @param {string} path - Path to a file
 * @returns {Promise}
 */
function isVideo (path) {
  return new Promise((resolve, reject) => {
    getMimeType(path)
      .then(type => {
        if (type.indexOf('video') > -1) { resolve(true) } else { reject(false) }
      })
      .catch(err => reject(err))
  })
}

/**
 * Reads an image from url and convert it to base64
 * @param {string} url
 * @returns {Promise}
 */
function urlToBase64 (url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, response, body) => {
      if (err) { reject(err) } else { resolve(body.toString('base64')) }
    })
  })
}

/**
 * Reads an image file and convert it to base64
 * @param {string} path - Path to a file
 * @returns {Promise}
 */
function fileToBase64 (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, {encoding: 'base64'},
      (err, data) => {
        if (err) { reject(err) } else { resolve(data) }
      })
  })
}

/**
 * Reads an image from file or url and convert it to base64
 * @param {string} media - url or path
 * @returns {Promise}
 */
function toBase64 (media) {
  return new Promise((resolve, reject) => {
    if (isURL(media)) {
      urlToBase64(media)
      .then(data => resolve(data))
      .catch(error => reject(error))
    } else if (isFile(media)) {
      fileToBase64(media)
      .then(data => resolve(data))
      .catch(error => reject(error))
    } else { reject('Error: toBase64(): argument must be url or file') }
  })
}

module.exports = {
  isBase64: isBase64,
  isURL: isURL,
  isFile: isFile,
  fileToBase64: fileToBase64,
  urlToBase64: urlToBase64,
  toBase64: toBase64,
  isVideo: isVideo,
  isImage: isImage,
  getMimeType: getMimeType
}
