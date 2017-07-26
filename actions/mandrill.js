'use strict'

const _ = require('lodash')
const path = require('path')
const med = require('media-helper')
const settings = require('../src/lib/settings')

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
      reject(err)
    })
  })
}

async function run (options) {
  try {
    options.vars = options.vars
      ? typeof options.vars === 'object'
        ? options.vars
        : JSON.parse(options.vars)
      : {}

    const params = {
      template_name: template,
      template_content: {},
      message: {
        to: [{
          email: options.email
        }],
        from_email: from.email,
        from_name: from.name,
        subject: subject,
        merge: true,
        attachments: [],
        images: [],
        merge_language: options.mergeLanguage || 'handlebars',
        global_merge_vars: options.vars.globals ? options.vars.globals.map(v => mapMandrillGlobals(v)) : [],
        merge_vars: options.vars.targeted ? options.vars.targeted.map(v => mapMandrillTargeted(v)) : []
      }
    }

    if (options.media && Array.isArray(options.media) && options.media.length > 0) {
      let images = _.filter(options.media, media => /image/.test(media.type))

      images.forEach(image => {
        params.message.images.push({
          name: image.name || 'IMAGEID',
          type: image.type,
          content: image.content
        })
      })

      options.media.forEach(media => {
        if (/image/.test(media.type) === false) {
          params.message.attachments.push({
            name: media.name || /video/.test(media.type) ? media.type.replace('/', '.') : 'FILE',
            type: media.type,
            content: media.content
          })
        }
      })
    }

    let res = await sendMail(params)
    return res
  } catch (err) {
    throw err
  }
}

module.exports.run = run
