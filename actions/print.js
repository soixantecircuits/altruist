const execa = require('execa')
const settings = require('../src/lib/settings').actions.print

function listAvailablePrinters () {
  var printers = execa.shellSync("lpstat -a | awk '{print $1}'").stdout
  console.log('Available printers are:\n' + printers)
}

function listAvailableFormats (printer) {
  var formats = execa.shellSync('lpoptions -p ' + printer + ' -l').stdout.split(' ')
  console.log('Available formats for', printer, 'are:')
  formats.forEach((format, index) => {
    if (index > 1) {
      console.log(format)
    }
  })
}

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      var printer = options.printer || settings.printer
      var format = options.format || settings.format || 'A4'
      var copies = options.copies || settings.copies || 1
      var media = options.media || settings.media
      var customOptions = options.options || settings.options || ''

      if (media === undefined) {
        reject(new Error('Error: No media in settings/request'))
      }
      if (printer === undefined) {
        listAvailablePrinters()
        reject(new Error('Error: No printer in settings/request'))
      }

      execa('lp', [ '-d', printer,
        '-o', 'media=' + format,
        '-n', copies.toString(),
        '-o', customOptions,
        media])
      .then(res => {
        console.log('Printing', copies, 'copie(s) with', printer)
        console.log(res.stdout)
        resolve(res.stdout)
      }).catch(error => {
        listAvailableFormats(printer)
        reject(new Error(JSON.stringify(error.stderr)))
      })
    })
  }
}
