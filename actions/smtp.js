'use strict'

const nodemailer = require('nodemailer')
const settings = require('../src/lib/settings')

function run (options, request) {
  return new Promise((resolve, reject) => {
    const user = options.user || settings.actions.smtp.user
    const password = options.password || settings.actions.smtp.password
    const smtpServer = options.smtpServer || settings.actions.smtp.smtpServer

    try {
      var transporter = nodemailer.createTransport(`smtps://${user}:${password}@${smtpServer}`)
    } catch (err) {
      return reject(new Error(JSON.stringify(err)))
    }

    if ((!options.from || options.from === '') && (!settings.actions.smtp.from || settings.actions.smtp.from === '')) {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: 'Parameter "from" is missing.'
      })))
    }
    if (!options.to || options.to === '') {
      return reject(new Error(JSON.stringify({
        err: 'invalid request',
        details: 'Parameter "to" is missing.'
      })))
    }

    const mailData = options
    mailData.from = options.from || settings.actions.smtp.from
    if (typeof mailData.attachments === 'string') {
      try {
        mailData.attachments = JSON.parse(mailData.attachments)
      } catch (err) {
        return reject(new Error(JSON.stringify(err)))
      }
    }

    if (request && request.files && request.files.length > 0) {
      mailData.attachments = mailData.attachments || []
      for (let i = 0; i < request.files.length; ++i) {
        mailData.attachments.push({
          filename: request.files[i].originalname,
          content: request.files[i].buffer,
          contentType: request.files[i].mimetype
        })
      }
    }

    transporter.sendMail(mailData, function (err, res) {
      if (err) {
        return reject(new Error(JSON.stringify(err)))
      }
      return resolve(res)
    })
  })
}

module.exports = {
  run
}
