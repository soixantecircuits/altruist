const settings = require('standard-settings').getSettings()
const LocalStorage = require('node-localstorage').LocalStorage
const localstorage = new LocalStorage(settings.storageDir)

module.exports = localstorage
