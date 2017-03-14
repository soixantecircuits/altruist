const execa = require('execa')
const path = require('path')
const config = require('../src/lib/config').actions.win32printer

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      var printer = options.printer || config.printer
      // var format = options.format || config.format || 'A4'
      var copies = options.copies || config.copies || 1
      var file = options.file || config.file
      // var customOptions = options.options || config.options || ''
      var host = options.host || config.host
      var guest = options.guest || config.guest
      var user = options.user || config.user
      var password = options.password || config.password
      var sambaFolderName = options.sambaFolderName || config.sambaFolderName
      var sambaUser = options.sambaUser || config.sambaUser
      var sambaPassword = options.sambaPassword || config.sambaPassword

      if (file === undefined) {
        reject('Error: No file in config/request')
      }
      /*
      if (printer === undefined) {
        listAvailablePrinters()
        reject('Error: No printer in config/request')
      }
      */

      // execa('lp', [ '-d', printer,
      //  '-o', 'media=' + format,
      //  '-n', copies.toString(),
      //  '-o', customOptions,
      //  file])
      // execa('winexe', [ ' -U HOME/sci%scisci //192.168.1.153', "\'C:\Python27\python.exe C:\Python27\Scripts\print.py",' -i "x:\airdrome-media-yg4ckg4kvv.jpg" --sambafolder "\\192.168.1.152\smilecooker" --sambauser "whatEver\player" --sambapassword "pareidoliesA" --sambadriveletter "x:" --printer "Color Label 500"',"'",
      execa('winexe', [ '-U HOME/' + user + '%' + password, '//' + guest, 'C:\\Python27\\python.exe C:\\Python27\\Scripts\\print.py -i "y:\\' + path.basename(file) + '" --sambafolder "\\\\' + host + '\\' + sambaFolderName + '" --sambauser "whatEver\\' + sambaUser + '" --sambapassword "' + sambaPassword + '" --sambadriveletter "y:" --printer "' + printer + '"'
      ])
      .then(res => {
        console.log('Printing', copies, 'copie(s) with', printer)
        console.log(res.stdout)
        resolve(res.stdout)
      }).catch(error => {
        console.log(error)
        reject(error.stderr)
      })
    })
  }
}
