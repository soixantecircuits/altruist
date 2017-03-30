# Altruist

> 💌 Altruist lets you share your content with people ✌️

Altruist supports the following data formats:

* raw `application/json`
* URL-encoded
* form-data

## Installation

Install the tool:

```sh
$ yarn global add altruist
# or
$ npm install -g altruist
```

then, provide a configuration file based on the template we provide:

```sh
# get the template
$ wget https://raw.githubusercontent.com/soixantecircuits/altruist/master/settings/settings.default.json
# rename it
$ mv settings.default.json settings.json
# profit
$ altruist -- -settings settings.json
```

For details about what to write in the settings file, See the `Actions` section below.

Then:

```
POST http://localhost:6060/api/v1/actions/{action}
```
*More details in the actions docs*

## Actions

##### List of available actions:

* [share](/docs/share.md)
* [mailchimp](/docs/mailchimp.md)
* [mandrill](/docs/mandrill.md)
* [facebook](/docs/facebook.md)
* [twitter](/docs/twitter.md)
* [slack](/docs/slack.md)
* [dropbox](/docs/dropbox.md)
* [google drive](/docs/googledrive.md)
* [youtube](/docs/youtube.md)
* [instagram](/docs/instagram.md)
* [mailjet](/docs/mailjet.md)
* [smtp](/docs/smtp.md)
* [scp](/docs/scp.md)
* [ftp](/docs/ftp.md)
* [1000mercis](/docs/1000mercis.md)
* [socialite](/docs/socialite.md)
* [print](/docs/print.md)

⚠️  *Some actions may require that you log in before using them. You can get a list of those actions with their login url by sending a GET request to the url matching `authRedirect` in the settings file (`/authRedirect` by default).*

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
