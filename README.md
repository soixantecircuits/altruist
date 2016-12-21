# Altruist

> Altruist lets you share your content with others

Altruist supports the following data formats:

* raw `application/json`
* URL-encoded
* form-data

## Installation

Install dependencies:

`$ npm install` or `$ yarn`

then, provide a configuration file based on the template we provide:

```sh
$ cp config/config.example.json config/config.json
```

for details about what to write in this file, See the `Actions` section below.

## Run

```sh
$ npm start [./path/to/custom-config.json]
$ # or
$ yarn start
```

The API is in v1 so every routes is prefixed with v1`. You can find your actions under :

`http://localhost:6060/api/v1/actions/{action}`

## Actions

##### List of available actions:
* [mailchimp](/documentation/mailchimp.md)
* [mandrill](/documentation/mandrill.md)
* [facebook](/documentation/facebook.md)
* [twitter](/documentation/twitter.md)
* [slack](/documentation/slack.md)

⚠️  *Some actions may require that you log in before using them. You can get a list of those actions with their login url by sending a GET request to the url matching `authRedirect` in the config file (`/authRedirect` by default).*

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
