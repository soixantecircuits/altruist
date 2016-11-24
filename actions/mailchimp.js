'use strict'

const Mailchimp = require('mailchimp-api-v3')
const chalk = require('chalk')
const config = require('../config/config.json')
const fakeData = require('../mock/fakdedata.json')

var mailchimp = new Mailchimp(config.actioner.mailchimp.apiKey)

var email = fakeData.receiver.email
var lname = fakeData.receiver.lname
var fname = fakeData.receiver.fname

mailchimp.post(`/lists/${config.actioner.mailchimp.listID}`, {
  email_address : email,
  merge_fields:{
    LNAME: 'DELATTRE',
    FNAME: 'GABRIEL'
  }
})
.then(function(results) {
  console.log(chalk.blue(results))
})
.catch(function (err) {
  console.error(chalk.red(err))
})

