'use strict'

const graph = require('fbgraph')
const config = require('../src/lib/config')

const accessToken = config.actions.facebook.accessToken
const userId = config.actions.facebook.userId
graph.setAccessToken(accessToken)

module.exports = (options) => {

}

// return new Promise((resolve, reject) => {
//   var http = new XMLHttpRequest();
//   var url = 'graph.facebook.com/' + userId + '/feed'
//   var params = 'message=yup&access_token=' + accessToken
//   http.open('POST', url, true)

//   http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

//   http.onreadystatechange = function () {
//     if (http.readyState == 4 && http.status == 200) {
//       console.log("done")
//       resolve(http.response)
//     }
//     else
//       reject()
//   }
//   http.send(params)
// })

console.log(userId + ' id')

return new Promise((resolve, reject) => {
  graph.post(userId + "/feed?access_token=007", 'test', function (err, res) {
    if (res) {
      resolve(res)
      // returns the post id
      console.log(res); // { id: xxxxx}
    }
    else
      reject(err)
  })
})


// return new Promise((resolve, reject) => {
//   graph.post('/feed', 'Does this look infected ?', function (err, res) {
//     if (err)
//       return reject(err)
//     resolve(res)
//   })
// })