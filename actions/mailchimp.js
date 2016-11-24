'use strict'

const Mailchimp = require('mailchimp-api-v3')
const config = require('../config/config.json')
const API_KEY = config.actions.mailchimp.api_key

if (API_KEY) {
  const mailchimp = new Mailchimp(config.actions.mailchimp.api_key)
} else {
  console.warn('no API key found for mailchimp action.')
}

module.exports = {
  init: () => `mailchimp ${API_KEY ? 'inited' : 'not inited' }.`
}
