'use strict'

const Mailchimp = require('mailchimp-api-v3')
const config = require('../config/config.json')

var mailchimp = new Mailchimp(config.actioner.mailchimp.api_key)

