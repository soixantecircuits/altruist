'use strict'

const fs = require('fs')
const path = require('path')

let configPath = process.argv[2] ? process.argv[2] : ''
if (fs.existsSync(configPath) === false) {
  configPath = `${__dirname}/../../config/config.json`
}
module.exports = require(path.resolve(configPath))
