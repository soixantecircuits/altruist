# Mandrill transactionnal emails

## Setup

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

## Usage

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

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string|array`|&times;|address(es) that will receive the email|
|**vars.globals**|`array`|&minus;|array of object defining your Mandrill `merge_vars` (with key = name and value = content)|
|**vars.targeted**|`array`|&minus;||
|**vars.targeted.target**|`string`|&minus;|address targeted|
|**vars.targeted.vars**|`array`|&minus;|create/override `merge_vars` for the concerned address. Works the same as `vars.global`|
