'use strict'

const fs = require('fs')
const path = require('path')
const med = require('media-helper')
const request = require('request')

const settings = require('nconf').get()
const API_KEY = settings.actions.mandrill.APIkey
const from = settings.actions.mandrill.from
const subject = settings.actions.mandrill.subject
const template = settings.actions.mandrill.template

const Mandrill = require('mandrill-api/mandrill')
const mandrill = new Mandrill.Mandrill(API_KEY)

function mapMandrillGlobals (obj) {
  const name = Object.getOwnPropertyNames(obj)[0]
  return {
    name,
    content: obj[name]
  }
}

function mapMandrillTargeted (obj) {
  return {
    rcpt: obj.target,
    vars: obj.vars ? obj.vars.map(v => mapMandrillGlobals(v)) : []
  }
}

function sendMail (params) {
  return new Promise((resolve, reject) => {
    mandrill.messages.sendTemplate(params, (result) => {
      resolve(result)
    }, (err) => {
      if (err) return reject({ error: err.name, details: err.message })
    })
  })
}

function run (options, req) {
  if (options.media === undefined) {
    options.media = []
    req.files.forEach((el, index) => {
      let mediaEl = {
        name: el.fieldname,
        mimetype: el.mimetype,
        content: el.buffer.toString('base64'),
        originalname: el.originalname
      }
      options.media.push(mediaEl)
    })
  }

  try {
    options.vars = options.vars ?
      typeof options.vars === 'object'
        ? options.vars
        : JSON.parse(options.vars)
      : {}
  } catch (e) {
    return new Promise((resolve, reject) => reject(e.toString()))
  }

  const params = {
    template_name: template,
    template_content: {},
    message: {
      to: [{
        email: options.email
      }],
      from_email: from.email,
      from_name: from.name,
      subject,
      merge: true,
      attachments: [],
      images: [],
      merge_language: 'handlebars',
      global_merge_vars: options.vars.globals ? options.vars.globals.map(v => mapMandrillGlobals(v)) : [],
      merge_vars: options.vars.targeted ? options.vars.targeted.map(v => mapMandrillTargeted(v)) : []
    }
  }

  if (options.media) {
    return new Promise((resolve, reject) => {
      let uploadedContent = 0

      options.media.forEach((media, index) => {
        med.toBase64(media.content)
          .then((content) => {
            let ext = (media.mimetype) ? path.extname(media.originalname) : path.extname(media.content)
            if ((/\.(mp4|mpeg|mkv|webm|avi)$/i).test(ext)) {
              params.message.attachments.push({
                type: 'video/' + ext.substring(1),
                name: media.name || 'video' + ext.substring(1),
                content: content
              })
            } else {
              params.message.images.push({
                type: 'image/' + ext.substring(1),
                name: media.name || 'IMAGEID',
                content: content
              })
            }
            uploadedContent += 1
            if (uploadedContent === options.media.length) {
              sendMail(params)
                .then(response => resolve(response))
                .catch(error => reject(error))
            }
          })
          .catch((err) => {
            console.log(err)
            uploadedContent += 1
            if (uploadedContent === options.media.length) {
              sendMail(params)
                .then(response => resolve(response))
                .catch(error => reject(error))
            }
          })
      })
    })
  } else {
    return sendMail(params)
  }
}

module.exports.run = run
