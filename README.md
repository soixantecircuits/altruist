# 💌 Altruist

Gateway micro service for sharing content with ease ✌️

## ❓Why

Altruist is a bridge to a pletory of services. It acts as a server. All the wiring hard work has been done, no more:
  - manual coding of social services API,
  - reading outdated docs for each services you want to use,
  - comparing and finding the right module,
  - developing a new custom lib for a specific service.

It focuses on **Social Network** and **File SAAS** and it abstract the internal differences of all of this services.

If you need to share with one of the following [services](#list-of-available-actions), then 💌 Altruist is for you.

Simply connect your prefered account through the web server altruist provide and post your data to 💌 Altruist.

All the APIs have been meticulously integrated to respond to the same form of media POST to 💌 Altruist.

Currently 💌 Altruist supports the following data form POST:

* [x] `application/json` raw
* [x] `application/x-www-form-urlencode`
* [x] `multipart/form-data`

![image](./altruist-diagram.png)

## 🌍 Installation as a binary

Install the tool:

```sh
$ yarn global add altruist
# or
$ npm install -g altruist
```

then, provide a settings file:

```sh
# get the template
$ wget https://raw.githubusercontent.com/soixantecircuits/altruist/master/settings/settings.default.json
# rename it
$ mv settings.default.json settings.json
# start altruist web server
$ altruist --settings settings.json
```

For details about what to write in the settings file, See the [Actions](#list-of-available-actions) section below.

## 👋 Usage

To share with a service, you need to make a request to an action linked to this service.
One action = one service

When sending a request to an action, you can send different parameters to change the content you want to share and how you want to share it.
Those parameters are called `options` and can be sent with any request. The way to send them changes a little depending on how you send your request.

There are two ways to send your request:
- Sending an HTTP POST request to the route of the action you want to run. More explanation [here](docs/postRequest.md)
- Sending a [spacebro](https://github.com/spacebro/spacebro-client) event with media object. More explanation [here](docs/spacebroRequest.md)

Some of the content you send with the options can also be set in your settings.
This can be useful when you know you will always send the same content and don't want to bother sending the same options with your requests over and over.
To know what you can put in your settings and what you can send in the options for an action, check the documentation for it below.

##### List of available actions:

* [1000mercis](/docs/1000mercis.md)
* [dropbox](/docs/dropbox.md)
* [facebook](/docs/facebook.md)
* [ftp](/docs/ftp.md)
* [google drive](/docs/googledrive.md)
* [instagram](/docs/instagram.md)
* [mailchimp](/docs/mailchimp.md)
* [mailjet](/docs/mailjet.md)
* [mandrill](/docs/mandrill.md)
* [print](/docs/print.md)
* [scp](/docs/scp.md)
* [slack](/docs/slack.md)
* [smtp](/docs/smtp.md)
* [socialite](/docs/socialite.md)
* [twitter](/docs/twitter.md)
* [youtube](/docs/youtube.md)


⚠️  *Some actions may require that you log in before using them. You can get a list of those actions with their login url by sending a GET request to the url matching `authRedirect` in the settings file (`/authRedirect` by default).*

##### Tests

You can check your action URLs and authentication URLs availability by running `npm test`.
_You will have to start your altruist server before running the test._

## 🕳 Troubleshoot

#### POSTMAN + MULTER
You can meet some issue while uploading file and JSON. This is a bug in POSTMAN. See here:
https://github.com/postmanlabs/postman-app-support/issues/2602
A way to fix it is to close and reopen the tab you are using to test the query. (http://stackoverflow.com/questions/35851660/multer-req-file-always-undefined/38461398#38461398)

## ❤️ Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](http://nvie.com/posts/a-successful-git-branching-model/)

Please use the `develop` branch if you want to contribute.
