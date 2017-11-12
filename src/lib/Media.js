'use strict'
const mediaHelper = require('media-helper')
const fs = require('fs')
const path = require('path')
const request = require('request').defaults({ encoding: null })
const standardSettings = require('standard-settings')
var settings = standardSettings.getSettings()

class Media {
  constructor (data) {
    if (typeof data === 'object') {
      Object.assign(this, data)
    } else if (typeof data === 'string') {
      if (mediaHelper.isFile(data)) {
        this.path = data
      } else if (mediaHelper.isURL(data)) {
        this.url = data
      }
    }
  }

  fromMulter (data) {
    if (!Array.isArray(data)) {
      Object.assign(this, data)
    } else {
      for (let i in data) {
        if (i === 0) {
          Object.assign(this, data[i])
        } else {
          let details = {}
          details[data[i].fieldname] = data[i]
          Object.assign(this.details, details)
        }
      }
    }
  }

  async getBase64 () {
    this.base64 = await mediaHelper.fileToBase64(this.path)
    return this.base64
  }

  async getMimeType () {
    this.type = await mediaHelper.getMimeType(this.path)
    return this.type
  }

  get array () {
    if (this.details) {
      return [this, ...this.details]
    } else {
      return [this]
    }
  }

  urlToPath () {
    return new Promise((resolve, reject) => {
      let filePath = path.join(settings.folder.output, this.getFilename())
      request(this.url)
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          this.path = filePath
          resolve(filePath)
        })
        .on('error', reject)
    })
  }

  getFilename () {
    this.filename = this.filename || this.file || path.basename(this.url)
    return this.filename
  }
}

module.exports = {
  Media
}

/*
const media = new Media({path: '/home/emmanuel/Downloads/00-header', url: 'that'})
console.log(media.path)
media.getBase64().then(() => {
  console.log(media.base64)
})
media.getMimeType().then(() => {
  console.log(media.type)
})
console.log(media.array)
console.log(JSON.stringify(media))
*/
