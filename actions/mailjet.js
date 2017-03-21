'use strict'

const settings = require('nconf').get()
const mediaUtils = require('../src/lib/media')
const mailjet = require('node-mailjet').connect(settings.actions.mailjet.apiKey, settings.actions.mailjet.secretKey)

function run (options, request) {
  return new Promise((resolve, reject) => {
    if (!options.fromEmail && !settings.actions.mailjet.fromEmail) {
      return reject({
        error: 'missing parameter',
        details: 'The "fromEmail" parameter is missing in the request.'
      })
    }
    if (!options.recipients) {
      return reject({
        error: 'missing parameter',
        details: 'The "recipients" parameter is missing in the request.'
      })
    }
    if (!options.subject) {
      return reject({
        error: 'missing parameter',
        details: 'The "subject" parameter is missing in the request.'
      })
    }
    if (!options.textPart && !options.htmlPart && !options.templateID && !settings.actions.mailjet.templateID) {
      return reject({
        error: 'missing parameter',
        details: 'No "textPart" or "htmlPart" or "templateID" parameter was found in the request. Provide at least one of those parameters.'
      })
    }

    let fromEmail = options.fromEmail || settings.actions.mailjet.fromEmail
    let templateID = options.templateID || settings.actions.mailjet.templateID
    let medias
    if (request.files && request.files.length > 0) {
      medias = []
      for (let i = 0; i < request.files.length; ++i) {
        medias[i] = {
          'Content-type': request.files[i].mimetype,
          'Filename': request.files[i].originalname,
          'content': mediaUtils.isBase64(request.files[i].buffer) ? request.files[i].buffer : request.files[i].buffer.toString('base64')
        }
      }
    }

    let mailProperties = {
      'FromEmail': fromEmail,
      'Recipients': options.recipients,
      'Subject': options.subject,
      'Text-part': options.textPart,
      'Html-part': options.htmlPart,
      'MJ-TemplateID': templateID,
      'MJ-TemplateLanguage': templateID ? true : false,
      'Vars': options.vars ? JSON.parse(options.vars) : options.vars,
      'Attachments': medias
    }
console.log(mailProperties)
    mailjet.post('send')
      .request(mailProperties)
      .then((result) => {
        return resolve(result)
      })
      .catch((error) => {
        return reject(error)
      })
  })
}

module.exports = {
run}
