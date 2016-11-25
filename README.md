# Altruist

> Altruist lets you share your content with others

## Installation

Install dependencies:

`$ npm install` or `$ yarn`

then, provide a configuration file based on the template we provide:

```sh
$ cp config/config.example.json config/congif.json
```

for details about what to write in this file, See the `Actions` section below.

## Run

```sh
$ npm start
$ # or
$ yarn start
```

The API is in v1 so every routes is prefixed with v1`. You can find your actions under :

`http://localhost:6060/api/v1/actions/{action}`

## Actions

### Mailchimp list subscription

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```js
"actions": {
  "mailchimp": {
    "apiKey": "abcd-xyz",
    "listID": "1234"
  }
}
```

#### Usage

`POST /api/v1/actions/mailchimp`

with an `application/json` body:

```js
{
  "email": "me@example.com" // required
  "fname": "John", // optionnal
  "lname": "Doe" // optionnal
}
```
