'use strict'

const nodemailer = require('nodemailer')
const config = require('../src/lib/config')

function run (options, request) {
  return new Promise((resolve, reject) => {
    const user = options.user || config.actions.smtp.user
    const password = options.password || config.actions.smtp.password
    const smtpServer = options.smtpServer || config.actions.smtp.smtpServer

    try {
      var transporter = nodemailer.createTransport(`smtps://${user}:${password}@${smtpServer}`)
    } catch (e) {
      return reject(e)
    }

    if ((!options.from || options.from === '') && (!config.actions.smtp.from || config.actions.smtp.from === '')) {
      return reject({
        error: 'invalid request',
        details: 'Parameter "from" is missing.'
      })
    }
    if (!options.to || options.to === '') {
      return reject({
        error: 'invalid request',
        details: 'Parameter "to" is missing.'
      })
    }

    const mailData = options
    mailData.from = options.from || config.actions.smtp.from
    if (typeof mailData.attachments === 'string') {
      try {
        mailData.attachments = JSON.parse(mailData.attachments)
      } catch (err) {
        return reject(err)
      }
    }

    if (request.files && request.files.length > 0) {
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
        return reject(err)
      }
      return resolve(res)
    })
  })
}

module.exports = {
run}
