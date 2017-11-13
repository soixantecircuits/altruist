'use strict'

const _ = require('lodash')
const settings = require('../src/lib/settings')

const API_KEY = settings.actions.mandrill.APIkey

const Mandrill = require('mandrill-api/mandrill')
const mandrill = new Mandrill.Mandrill(API_KEY)
const assignment = require('assignment')

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

function sendMedia (params) {
  return new Promise((resolve, reject) => {
    mandrill.messages.sendTemplate(params, (result) => {
      resolve(result)
    }, (err) => {
      reject(err)
    })
  })
}

function standardMediaToApiMedia (media) {
  media = standardMetaToApiMeta(media)
  let apiMeta = media.meta.altruist.mandrill
  let options = {
    vars: apiMeta.vars
  }
  options.vars = options.vars
      ? typeof options.vars === 'object'
        ? options.vars
        : JSON.parse(options.vars)
      : {}

  let apiMedia = {
    template_name: apiMeta.template,
    template_content: {},
    message: {
      to: [{
        email: apiMeta.to.email
      }],
      merge: true,
      attachments: [],
      images: [],
      merge_language: options.mergeLanguage || 'handlebars',
      global_merge_vars: options.vars.globals ? options.vars.globals.map(v => mapMandrillGlobals(v)) : [],
      merge_vars: options.vars.targeted ? options.vars.targeted.map(v => mapMandrillTargeted(v)) : []
    }
  }
  if (apiMeta.from && apiMeta.from.email) {
    apiMedia.message.from_email = apiMeta.from.email
  }
  if (apiMeta.from && apiMeta.from.name) {
    apiMedia.message.from_name = apiMeta.from.name
  }
  if (apiMeta.subject) {
    apiMedia.message.subject = apiMeta.subject
  }
  let medias = media.array
  let images = _.filter(medias, media => /image/.test(media.type))

  images.forEach(image => {
    if (image.base64) {
      apiMedia.message.images.push({
        name: image.name || 'IMAGEID',
        type: image.type,
        content: image.base64
      })
    }
  })

  medias.forEach(media => {
    if (/image/.test(media.type) === false && media.base64) {
      apiMedia.message.attachments.push({
        name: media.name || /video/.test(media.type) ? media.type.replace('/', '.') : 'FILE',
        type: media.type,
        content: media.base64
      })
    }
  })

  return apiMedia
}

async function checkMedia (media) {
  if (!media.type) {
    await media.getMimeType()
  }
  if (!media.base64) {
    await media.getBase64()
  }
  if (!media.filename) {
    media.getFilename()
  }
}

function standardMetaToApiMeta (media) {
  if (media.meta.email) {
    let apiMeta = media.meta.altruist.mandrill
    apiMeta = assignment(apiMeta, {
      to: {
        email: media.meta.email
      }
    })
  }
  return media
}

async function run (media) {
  try {
    await checkMedia(media)
    media = standardMediaToApiMedia(media)
    let res = await sendMedia(media)
    return res
  } catch (err) {
    throw err
  }
}

module.exports.run = run
