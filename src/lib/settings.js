'use strict'

const fs = require('fs')
const path = require('path')
const program = require('commander')
const nconf = require('nconf')

// Reading command line options
program
.option('-s, --settings <file>', 'Use a specific settings file')
.parse(process.argv)

let settingsDir = path.resolve(__dirname, '../../settings/')
if (program.settings) {
  console.log('Settings loaded from:', program.settings)
  nconf.file({ file: program.settings })
} else if (fs.existsSync(path.join(settingsDir, 'settings.json'))) {
  console.log('Settings loaded from:', path.join(settingsDir, 'settings.json'))
  nconf.file({ file: path.join(settingsDir, 'settings.json') })
} else {
  console.log('Settings loaded from:', path.join(settingsDir, 'settings.example.json'))
  nconf.file({ file: path.join(settingsDir, 'settings.example.json') })
}

module.exports = nconf.get()
