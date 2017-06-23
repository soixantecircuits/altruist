const execa = require('execa')
const path = require('path')
const settings = require('../src/lib/settings').actions.win32printer

module.exports = {
  run: (options) => {
    return new Promise((resolve, reject) => {
      var printer = options.printer || settings.printer
      // var format = options.format || settings.format || 'A4'
      var copies = options.copies || settings.copies || 1
      var file = options.file || settings.file
      // var customOptions = options.options || settings.options || ''
      var host = options.host || settings.host
      var guest = options.guest || settings.guest
      var user = options.user || settings.user
      var password = options.password || settings.password
      var sambaFolderName = options.sambaFolderName || settings.sambaFolderName
      var sambaUser = options.sambaUser || settings.sambaUser
      var sambaPassword = options.sambaPassword || settings.sambaPassword

      if (file === undefined) {
        reject(new Error('Error: No file in settings/request'))
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
        reject(new Error(JSON.stringify(error.stderr)))
      })
    })
  }
}
