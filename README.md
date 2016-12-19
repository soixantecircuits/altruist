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
    "appId": "abcd-xyz",
    "appSecret": "shhh",
    "pageId": "" // optionnal
  }
}
```

#### Usage

Before being able to post, you will need to log in facebook by going to: `/login/facebook` and authorizing the application. When logged in, you can post a message on your feed via:

`POST /api/v1/actions/facebook`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "message": "Hello Facebook!",
  "pictureUrl": "http://example.com/my-image.jpg"
}' "http://localhost:7070/api/v1/actions/facebook"
```

#### Options

_**Note**: MP4 files MUST be local files on your system (no url or base64)_

|name|type|required|description|
|:---|:---|:---:|:---|
|**message**|`string`|*if no picture*|message to post on your feed|
|**pictureUrl**|`string`|*if no message*|url of the picture to post on your feed|

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
|**message**|`string`|&times;|new tweet message|
|**media**|`string`|&minus;|image or video|

The 'media' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

### Instagram

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "instagram": {
    "account": "johndoe",
    "password": "pony123"
  }
}
```

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "media": "/path/to/image.jpg"
  "caption": "I love ponies !"
}' "http://localhost:6060/api/v1/actions/instagram"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`string`|&times;|path to the image you want to share|
|**caption**|`string`|&minus;|optionnal caption|

Only **JPG** files are supported for now

### FTP / SFTP

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "ftp": {
    "host": "127.0.0.1",
    "port": 21,
    "user": "user",
    "password": "password"
  },
  "sftp": {
    "host": "127.0.0.1",
    "port": 22,
    "user": "user",
    "password": "password"
  }
}
```

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "source": "/path/to/local/file",
  "destination": "/path/to/remote/file"
}' "http://localhost:6060/api/v1/actions/(s)ftp"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**source**|`string`|&times;|local path to a file|
|**destination**|`string`|&minus;|remote path to a file, default is your home directory (~)|

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
