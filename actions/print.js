const execa = require('execa')
const settings = require('nconf').get()

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
      const meta = Object.assign({}, settings.meta, options.meta)
      const store = Object.assign({}, _.get(settings, 'actions.print'), meta)
      let printer = _.get(store, 'printer')
      let format = _.get(store, 'format') || 'A4'
      let copies = _.get(store, 'copies') || 1
      let customOptions = _.get(store, 'options') || ''
      let media = _.get(options, 'path')

      if (media === undefined) {
        reject({ error: 'Invalid request', details: 'No path in request' })
      }
      if (printer === undefined) {
        listAvailablePrinters()
        reject({ error: 'Invalid request', details: 'No printer in request or settings' })
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
        reject(error.stderr)
      })
    })
  }
}
