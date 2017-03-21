### Mandrill transactionnal emails

### Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
  "actions": {
    "mandrill": {
      "APIkey": "",
      "from": {
        "name": "Altruist 🚀",
        "email": "altruist@shh.ac"
      },
      "subject": "Altruist",
      "template": "altruist-test"
    }
  }
```

#### Usage

`POST /api/v1/actions/mandrill`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "email": "mail@example.com",
  "vars": {
    "globals": [{
      "name": "Altruist"
    }],
    "targeted": [{
      "target": "mail@example.com",
      "vars": [{
        "hello": "Hello mail,"
      }],
      "media": [{
        "name": 'media.ext',
        "content": "/path/to/my/media.ext"
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
    <img src="{{cid:media}}" />
  </body>
</html>
```

&rarr; [more](https://mandrill.zendesk.com/hc/en-us/articles/205582537-Using-Handlebars-for-Dynamic-Content) about Mandrill variables

#### Options

*note: you can only attach one media*

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string|array`|&times;|address(es) that will receive the email|
|**vars.globals**|`array`|&minus;|array of object defining your Mandrill `merge_vars` (with key = name and value = content)|
|**vars.targeted**|`array`|&minus;||
|**vars.targeted.target**|`string`|&minus;|address targeted|
|**vars.targeted.vars**|`array`|&minus;|create/override `merge_vars` for the concerned address. Works the same as `vars.global`|
|**media**|`Object`|&minus;||
|**media.name**|`string`|&minus;|name of the media that you will retrieve via `cid:name`|
|**media.content**|`string`|&minus;|Can be either a path the media (in the filesystem or via http) or straight base64 datas|
