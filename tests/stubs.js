const path = require('path')
const fs = require('fs')

const url = 'https://source.unsplash.com/random'
const filepath = path.resolve(__dirname, './stub.jpg')
const base64 = new Buffer(fs.readFileSync(filepath)).toString('base64')
const filename = `stub-${Date.now()}.jpg`

const media = [ url, filepath, base64 ]
const email = 'altruist.software@gmail.com'
const message = 'hello from AVA tests'

module.exports = {
  slack: {
    media: url,
    message
  },
  mandrill: {
    media: url,
    email
  },
  dropbox: {
    media: url,
    filename
  },
  instagram: {
    media: filepath,
    message
  }
}
