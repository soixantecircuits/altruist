'use strict'

const Mailchimp = require('mailchimp-api-v3')
const chalk = require('chalk')
const _ = require('lodash')

const config = require('../config/config.json')
const fakeData = require('../mock/fakedata.json')
const API_KEY = config.actions.mailchimp.apiKey

var mailchimp

var email = fakeData.receiver.email
var lname = fakeData.receiver.lname
var fname = fakeData.receiver.fname

var share = function () {
  mailchimp.post(`/lists/${config.actions.mailchimp.listID}`, {
    members: [
      {
        email_address: email,
        merge_fields: {
          LNAME: lname,
          FNAME: fname
        },
        status: 'subscribed'
      }
    ]
  })
    .then(function (results) {
      if (results.errors !== undefined && results.errors.length > 0) {
        console.error(chalk.red('Error'))
        _.each(results.errors, function (error) {
          console.error(chalk.red(`${error.email_address}: ${error.error}`))
        })
      } else {
        console.log(chalk.blue('Success:'))
        if (results.new_members) {
          console.log(results.new_members[0])
        }
      }
    })
    .catch(function (err) {
      console.error(chalk.red(err))
      console.error(err.errors)
    })
    return 'mailchimp share exec'
}
module.exports = {
  init: () => {
    if(API_KEY){
      mailchimp = new Mailchimp(API_KEY)
      return share()
    } else {
      return 'APIKEY is missing'
    }
  },
  run: () => share()
}
