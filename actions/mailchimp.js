'use strict'

const Mailchimp = require('mailchimp-api-v3')

const config = require('../config/config.json')
const fakeData = require('../mock/fakedata.json')
const API_KEY = config.actions.mailchimp.apiKey

const mailchimp = (API_KEY) ? new Mailchimp(API_KEY) : null

const email = fakeData.receiver.email
const lname = fakeData.receiver.lname
const fname = fakeData.receiver.fname

module.exports = () => {
  return new Promise((resolve, reject) => {
    mailchimp
      .post(`/lists/${config.actions.mailchimp.listID}`, {
        members: [{
          email_address: email,
          merge_fields: { LNAME: lname, FNAME: fname },
          status: 'subscribed'
        }]
      }).then((results) => {
        if (results.errors.length) return reject(results.errors)
        resolve(results)
      })
      .catch((err) => {
        reject(err)
      })
  })
}