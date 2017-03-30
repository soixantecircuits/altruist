'use strict'

const fs = require('fs')
const path = require('path')
const med = require('media-helper')
const request = require('request')
const _ = require('lodash')

const settings = require('nconf').get('app')
const API_KEY = _.get(settings, 'actions.mandrill.APIkey')
const from = _.get(settings,'actions.mandrill.from')
const subject = _.get(settings, 'actions.mandrill.subject')
const template = _.get(settings, 'actions.mandrill.template')

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

function run (options) {

  const meta = Object.assign({}, settings.meta, options.meta)

  try {
    meta.vars = meta.vars ?
      typeof meta.vars === 'object'
        ? meta.vars
        : JSON.parse(meta.vars)
      : {}
  } catch (e) {
    return new Promise((resolve, reject) => reject(e.toString()))
  }

  const params = {
    template_name: template,
    template_content: {},
    message: {
      to: [{
        email: _.get(meta, 'email.to')
      }],
      from_email: from.email,
      from_name: from.name,
      subject,
      merge: true,
      attachments: [],
      images: [],
      merge_language: 'handlebars',
      global_merge_vars: _.get(meta, 'vars.globals') ? _.get(meta, 'vars.globals').map(v => mapMandrillGlobals(v)) : [],
      merge_vars: _.get(meta, 'vars.targeted') ? _.get(meta, 'vars.targeted').map(v => mapMandrillTargeted(v)) : []
    }
  }

return new Promise ((resolve, reject) => {

  let promises = []
  let nt = []
  const attachments = _.get(meta, 'email.attachments')
  if (attachments) {

    attachments.forEach((at, index) => {
      let p = med.toBase64(at.content)
      nt.push({
        name: at.name || 'attachment' + index.toString(),
        type: at.type
      })
      promises.push(p)
    })

    Promise.all(promises).then(results => {
      params.attachments = results
      results.forEach((data, index) => {
        params.message.attachments.push({
          content: data,
          name: nt[index].name,
          type: nt[index].type
        })
      })
      resolve()
    })

  } else { resolve() }
})
.then(a => {
  if (options.path) {
    let media = options.path
    return med.toBase64(media)
    .then((content) => {
      params.message.images.push({
        name: options.file || 'IMAGEID',
        content: content
      })
      return sendMail(params)
    }).catch((err) => sendMail(params) )
  } else { return sendMail(params) }
})
}
module.exports.run = run
