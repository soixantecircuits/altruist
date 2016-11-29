# Altruist

> Altruist lets you share your content with others

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
}' "http://localhost:7070/api/v1/actions/mailchimp"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string`|&times;|email to be suscribed|
|**fname**|`string`|&minus;|firstname of the account|
|**lname**|`string`|&minus;|lastname of the account|

&rarr; to subscribe multiple accounts, simply pass an array of objects following the above scheme.

### Mandrill transactionnal emails

### Setup

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
}' "http://localhost:7070/api/v1/actions/mandrill"
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

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
