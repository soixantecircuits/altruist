'use strict'

const Mailchimp = require('mailchimp-api-v3')
const settings = require('../src/lib/settings')

const API_KEY = settings.actions.mailchimp.apiKey
const mailchimp = (API_KEY) ? new Mailchimp(API_KEY) : null

function mapListMember (member) {
  return {
    email_address: member.email,
    merge_fields: {
      LNAME: member.lname,
      FNAME: member.fname
    },
    status: 'subscribed'
  }
}

function run (options) {
  return new Promise((resolve, reject) => {
    if (!options.to || !Array.isArray(options.to) || options.to.length < 1) {
      reject(new Error('No email to subscribe in the request'))
    }

    const members = options.to.map(m => mapListMember(m))
    mailchimp
      .post(`/lists/${settings.actions.mailchimp.listID}`, {
        members: members
      }).then((results) => {
        if (results.errors.length) {
          return reject(new Error(JSON.stringify(results.errors)))
        }
        resolve(results)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports.run = run
