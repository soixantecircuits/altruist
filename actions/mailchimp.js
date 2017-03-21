'use strict'

const Mailchimp = require('mailchimp-api-v3')
const settings = require('nconf').get()

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
  const members = Array.isArray(options) ? options.map(m => mapListMember(m)) : [ mapListMember(options) ]
  return new Promise((resolve, reject) => {
    mailchimp
      .post(`/lists/${settings.actions.mailchimp.listID}`, {
        members: members
      }).then((results) => {
      if (results.errors.length) {
        console.log(`error on post ${results.errors[0]}`)
        return reject(results.errors)
      }
      resolve(results)
    })
      .catch((err) => {
        console.log(err)
        reject({
          error: err.title,
          details: err.detail
        })
      })
  })
}

module.exports.run = run
