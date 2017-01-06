const config = require('./config')
const LocalStorage = require('node-localstorage').LocalStorage
const localstorage = new LocalStorage(config.storageDir)

module.exports = localstorage
