'use strict'

const path = require('path')

module.exports = require(path.resolve(process.argv[2] ? process.argv[2] : `${__dirname}/../../config/config.json`))
