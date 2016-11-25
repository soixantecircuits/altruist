'use strict';

const nodemailer = require('nodemailer')
const mandrill = require('nodemailer-mandrill-transport')

const config = require('../config/config.json')
const API_KEY = config.actions.mandrill.APIkey
const from = config.actions.mandrill.from
const subject = config.actions.mandrill.subject
const template = config.actions.mandrill.template

const transport = nodemailer.createTransport(mandrill({
  auth: { apiKey: API_KEY }
}))

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
    vars: obj.vars.map(v => mapMandrillGlobals(v))
  }
}

module.exports = (options) => {
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
    to: options.email,
    from,
    subject,
    mandrillOptions: {
      template_name: template,
      template_content: {},
        message: {
          merge: true,
          merge_language: 'handlebars',
          global_merge_vars: options.vars.globals ? options.vars.globals.map(v => mapMandrillGlobals(v)) : [],
          merge_vars: options.vars.targeted ? options.vars.targeted.map(v => mapMandrillTargeted(v)) : [],
        }
    }
  }

  return new Promise((resolve, reject) => {
    transport
      .sendMail(params, (err, info) => {
        if (err) return reject(err)
        resolve(info)
      })
  })
}
