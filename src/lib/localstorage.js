const settings = require('nconf').get('app')
const LocalStorage = require('node-localstorage').LocalStorage
const localstorage = new LocalStorage(settings.storageDir)

module.exports = localstorage
