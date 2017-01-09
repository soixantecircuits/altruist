'use strict'

const fs = require('fs')
const med = require('media-helper')

const config = require('../src/lib/config')
const API_KEY = config.actions.mandrill.APIkey
const from = config.actions.mandrill.from
const subject = config.actions.mandrill.subject
const template = config.actions.mandrill.template

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

function getMedia (content) {
  return new Promise((resolve, reject) => {
    if (med.isBase64(content)) {
      resolve(content)
    } else if (med.isURL(content)) {
      request.get(content, (err, response, body) => {
        if (!err && response.statusCode === 200) {
          resolve(body.toString('base64'))
        } else {
          reject(err)
        }
      })
    } else if (med.isFile(content)) {
      resolve(med.toBase64(content))
    } else {
      reject('Altruist - Error with request')
    }
  })
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

function run (options) {
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
      images: [],
      merge_language: 'handlebars',
      global_merge_vars: options.vars.globals ? options.vars.globals.map(v => mapMandrillGlobals(v)) : [],
      merge_vars: options.vars.targeted ? options.vars.targeted.map(v => mapMandrillTargeted(v)) : []
    }
  }

  if (options.media) {
    return getMedia(options.media.content)
      .then((content) => {
        params.message.images.push({
          type: 'image/png',
          name: options.media.name || 'IMAGECID.png',
          content: content
        })
        return sendMail(params)
      })
      .catch((err) => {
        console.log(err)
        return sendMail(params)
      })
  } else {
    return sendMail(params)
  }
}

module.exports.run = run
