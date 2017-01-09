'use strict'

const request = require('request')
var baseURL = 'app.shh.ac'
var route = '/wp-json/form/v1/postForm'

module.exports = {
  uploadFiles,
setURL}

/**
 * Upload files to a socialite server by making a POST request in form-data
 * @param {Object} params - Object containing the data to send with the request
 * @param {string} params.bucket - Name of the bucket to upload to
 * @param {string} params.token - The token to use the bucket
 * @param {string} params.name - The name of your post
 * @param {Object[]}  params.files - Array of objects containing the uploaded files data
 * @param {Buffer|File|string}  params.files[].value - The path or the data of the file
 * @param {Object}  params.files[].options - The file's metadata
 * @param {string}  params.files[].options.filename - The file's name
 * @param {string}  params.files[].options.contentType - The file's mime type
 * @callback {uploadCallback} callback
 */
function uploadFiles (params, callback) {
  callback = typeof callback === 'function' ? callback : function () {}

  let formData = {
    bucket: params.bucket,
    token: params.token,
    name: params.name
  }

  if (params.files && params.files.length === 1) {
    if (typeof params.files[0].value === 'string') {
      params.files[0].value = fs.createReadStream(params.files[0].value)
    }
    formData.file = params.files[0]
  } else if (params.files && params.files.length > 1) {
    for (let i = 0; i < params.files.length; ++i) {
      addFileToForm(formData, params.files[i], i + 1)
    }
  }

  request.post({ url: 'https://' + baseURL + route, formData: formData}, function (err, res, body) {
    if (err) {
      request.post({ url: 'http://' + baseURL + route, formData: formData}, function (err, res, body) {
        if (err) {
          return callback({
            error: err.response,
            details: err.error
          }, null)
        } else {
          callback(null, body)
        }
      })
    } else {
      callback(null, body)
    }
  })
}

function addFileToForm (formData, file, id) {
  if (typeof file.value === 'string') {
    file.value = fs.createReadStream(file.value)
  }

  formData['file' + id] = file
  formData.fileamount = id
}

/**
 * Sets the host and route to build the URL to the socialite server
 * @param {string} host - Ex: socialite.net | 192.168.0.42:8888
 * @param {string} route - Ex: /upload
 */
function setURL (host, route) {
  baseURL = host
  route = route
}
