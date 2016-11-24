'use strict'

const Mailchimp = require('mailchimp-api-v3')
const chalk = require('chalk')
const config = require('../config/config.json')

var mailchimp = new Mailchimp(config.actioner.mailchimp.api_key)

mailchimp.post('/lists/id', {
  email_address : '...'
  
})
.then(function(results) {
  
})
.catch(function (err) {
  console.error()
})

