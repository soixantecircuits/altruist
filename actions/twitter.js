'use strict'

var twit = require('twit')
var fs = require('fs')
var config = require('../config/config.json')

var T = new twit({
	consumer_key:			config.actions.twitter.consumer_key,
	consumer_secret:		config.actions.twitter.consumer_secret,
	access_token:			config.actions.twitter.access_token,
	access_token_secret:	config.actions.twitter.access_token_secret,
	timeout_ms:				60 * 1000
})

function updateStatus (params, resolve, reject) {

	T.post('statuses/update', params, function (err, data, response) {
		if (!err) {
			return resolve('altruist - twitter.js - Success')
		} else {
			return reject('altruist - twitter.js - ' + err)
		}
	})

}

module.exports = (options) => {
	var params = {status: '', media_ids: []};

	return new Promise((resolve, reject) => {

		// Reading twit status message from request
		if (options.message != undefined && options.message !== '') {
			params.status = options.message
		} else {
			return reject('altruist - twitter.js - ERROR: No text message in request')
		}

		// Reading twit media file from request
		if (options.media != undefined && options.media !== '') {

			T.post('media/upload', {

      			media_data: fs.readFileSync(options.media, {encoding: 'base64'})

    			}, function (err, data, response) {

					if (!err) {

						var mediaIdStr = data.media_id_string
						var meta_params = { media_id: mediaIdStr, alt_text: { text: options.message } }

						T.post('media/metadata/create', meta_params, function (err, data, response) {
    						if (!err) {

      							params.media_ids = [mediaIdStr]
								console.log('altruist - twitter.js - Meta data sucessfully created')

								updateStatus(params, resolve, reject)


    						} else {
								return reject('altruist - twitter.js - ' + err);
							}
  						})

						console.log('altruist - twitter.js - File upload to twitter complete. Now sending status update')

					} else {
						return reject('altruist - twitter.js - ' + err);
					}
				})

		} else {
			updateStatus(params, resolve, reject)
		}

	})
}
