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

Some actions may require that you log in before using them.
You can get a list of those actions with their login url by sending a GET request to the url matching `authRedirect` in the config file (`/authRedirect` by default).

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

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "me@example.com",
  "fname": "John",
  "lname": "Doe"
}' "http://localhost:6060/api/v1/actions/mailchimp"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string`|&times;|email to be suscribed|
|**fname**|`string`|&minus;|firstname of the account|
|**lname**|`string`|&minus;|lastname of the account|

&rarr; to subscribe multiple accounts, simply pass an array of objects following the above scheme.

### Mandrill transactionnal emails

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
  "actions": {
    "mandrill": {
      "APIkey": "",
      "from": "Altruist 🚀 <altruist@example.com>",
      "subject": "Altruist",
      "template": "altruist-test"
    }
  }
```

#### Usage

`POST /api/v1/actions/mandrill`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "email": ["mail@example.com", "johndoe@example.com"],
  "vars": {
    "globals": [{
      "name": "Altruist"
    }],
    "targeted": [{
      "target": "mail@example.com",
      "vars": [{
        "hello": "Hello mail,"
      }]
    }]
  }
}' "http://localhost:6060/api/v1/actions/mandrill"
```

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    {{#if hello}}<h2>{{hello}}</h2>{{/if}}
    <p>{{#if name}}{{name}} says{{/if}} hello !</p>
  </body>
</html>
```

&rarr; [more](https://mandrill.zendesk.com/hc/en-us/articles/205582537-Using-Handlebars-for-Dynamic-Content) about Mandrill variables

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string|array`|&times;|address(es) that will receive the email|
|**vars.globals**|`array`|&minus;|array of object defining your Mandrill `merge_vars` (with key = name and value = content)|
|**vars.targeted**|`array`|&minus;||
|**vars.targeted.target**|`string`|&minus;|address targeted|
|**vars.targeted.vars**|`array`|&minus;|create/override `merge_vars` for the concerned address. Works the same as `vars.global`|

### Facebook user and page post

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```js
"actions": {
  "facebook": {
    "appID": "abcd-xyz",
    "appSecret": "shhh",
    "loginURL": "/login/facebook",
    "callbackURL": "/login/facebook/return",
    "failureURL": "/",
    "successURL": "/",
    "profileURL": "/profile/facebook",
    "accountsURL": "/accounts/facebook",
    "pageID": "" // optionnal
  }
}
```

#### Usage

Before being able to post, you will need to log in facebook by going to the url matching `loginURL` in your config file and authorizing the application.
When logged in, you can post on your feed using JSON or form-data :

`POST /api/v1/actions/facebook`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "message": "Hello Facebook!",
  "media": "/path/to/my/img.jpg"
}' "http://localhost:7070/api/v1/actions/facebook"
```

The 'media' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * ~~base64 encoded string~~ *(soon)*

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MOV**, **WMV** or **MP4** (for videos)

You can get your profile's informations and a list of accounts (like pages) you manage by sending a GET request to urls matching respectively `profileURL` and `accountsURL`.
You will be returned JSON object containing the datas requested.

`GET /profileURL`
```json
{
  "id": "xxx",
  "displayName": "xxx",
  "name": {}
}
```

`GET /accountsURL`
```json
{
  [
    {
      "access_token": "xxx",
      "category": "xxx",
      "name": "xxx",
      "id": "xxx",
      "perms": []
    }
  ]
}
```

<!-- When you log in, an array of pages you manage is stored in `userAccounts`.
You can switch the current used id to post on a page or on your feed by calling the function `setID(newId)` and it will set the access token accordingly.
To switch back to your account, you can call `setID('me')` or just call it with you account's ID. -->

#### Options

_**Note**: MP4 files MUST be local files on your system or url (no base64)_

|name|type|required|description|
|:---|:---|:---:|:---|
|**message**|`string`|*if no picture*|message to post on your feed|
|**media**|`string`|*if no message*|image or video|

You can also set `message` and/or `media` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).

### Twitter

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "twitter": {
    "consumer_key": "<your_consumer_key>",
    "consumer_secret": "<your_consumer_secret>",
    "access_token": "<your_access_token>",
    "access_token_secret": "<your_access_token_secret>"
  }
}
```

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "message": "Hello Twitter !",
  "media": "/path/to/media"
}' "http://localhost:6060/api/v1/actions/twitter"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**message**|`string`|&minus;|new tweet message|
|**media**|`string`|&minus;|image or video|

The 'media' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You can also set `message` and/or `media` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)

### Slack

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "slack": {
    "token": "abdc-xyz",
    "channel": "random"
  },
}
```

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "caption": "hello!",
  "path": "/path/to/my/img.jpg"
}' "http://localhost:6060/api/v1/actions/slack"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**caption/message**|`string`|&minus;|text message. Required if no media sent|
|**media**|`string`|&minus;|image or video|

The 'media' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You can also set `message` and/or `media` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
