'use strict'

const Mailchimp = require('mailchimp-api-v3')
const config = require('../config/config.json')

const API_KEY = config.actions.mailchimp.APIkey
const mailchimp = (API_KEY) ? new Mailchimp(API_KEY) : null

module.exports = (options) => {
  const member = {
    email_address: options.email,
    merge_fields: {
      LNAME: options.lname,
      FNAME: options.fname
    },
    status: 'subscribed'
  }

  return new Promise((resolve, reject) => {
    mailchimp
      .post(`/lists/${config.actions.mailchimp.listID}`, {
        members: [member]
      }).then((results) => {
        if (results.errors.length) return reject(results.errors)
        resolve(results)
      })
      .catch((err) => {
        console.log(err)
        reject(err.errors)
      })
  })
}