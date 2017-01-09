const execa = require('execa')
const config = require('../src/lib/config').actions.print

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
      var printer = options.printer || config.printer
      var format = options.format || config.format || 'A4'
      var copies = options.copies || config.copies || 1
      var file = options.file || config.file

      if (file === undefined) {
        reject('Error: No file in config/request')
      }
      if (printer === undefined) {
        listAvailablePrinters()
        reject('Error: No printer in config/request')
      }

      execa('lp', [ '-d', printer,
        '-o', 'media=' + format,
        '-n', copies.toString(),
        file])
      .then(res => {
        console.log('Printing', copies, 'copie(s) with', printer)
        listAvailableFormats(printer)
        console.log(res.stdout)
        resolve('Success')
      }).catch(error => reject(error.stderr))
    })
  }
}
