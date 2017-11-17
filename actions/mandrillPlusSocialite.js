'use strict'
const mandrill = require('./mandrill.js')
const socialite = require('./socialite.js')
const assignment = require('assignment')
const { Media } = require('../src/lib/Media')

async function run (media) {
  try {
    let apiMeta = media.meta.altruist.mandrillPlusSocialite

    // socialite
    let resSocialite = await socialite.run(media)

    // mandrill
    if (apiMeta.doNotSentMediaButOnlyThumbnailInEmail) {
      if (media.details && media.details.thumbnail) {
        media.details.thumbnail = assignment(media.details.thumbnail, {meta: media.meta})
        media = new Media(media.details.thumbnail)
      }
    }
    media.meta.share = JSON.parse(resSocialite).url
    console.log('socialite url' + media.meta.share)
    let resMandrill = await mandrill.run(media)

    // return
    resMandrill.socialite = resSocialite
    return resMandrill
  } catch (err) {
    throw err
  }
}

module.exports.run = run
