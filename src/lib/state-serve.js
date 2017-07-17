'use strict'

let init = (app, infos) => {
  app.get('/', (req, res) => {
    res.send(`
      <h1>${infos.app.name}</h1>
      <h2>${infos.app.version}</h2>
      <h3><a href='/index.json' title='JSON version'>JSON version</a></h3>
      <p>
        <small>
        Go to the <a href="${infos.app.site.url}" target="_blank">${infos.app.site.name}</a>
        for more details.
        </small>
      </p>
    `)
  })
  app.get('/index.json', (req, res) => {
    res.json(infos)
  })
}

module.exports = {
  init
}
