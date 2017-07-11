### Mandrill transactionnal emails

### Setup

For mandrill template, the default language is **handlebars**, you should use `{{}}` instead of `*||*`.

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
        "path": "/path/to/my/media.ext"
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
    <img src="{{cid:media}}" />
  </body>
</html>
```

&rarr; [more](https://mandrill.zendesk.com/hc/en-us/articles/205582537-Using-Handlebars-for-Dynamic-Content) about Mandrill variables

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string` or `array`|&times;|address(es) that will receive the email|
|**mergeLanguage**|`string`|&minus;|string stating which merge language should be used for the template: `mailchimp` or `handlebars`|
|**vars.globals**|`array`|&minus;|array of object defining your Mandrill `merge_vars` (with key = name and value = content)|
|**vars.targeted**|`array`|&minus;||
|**vars.targeted.target**|`string`|&minus;|address targeted|
|**vars.targeted.vars**|`array`|&minus;|create/override `merge_vars` for the concerned address. Works the same as `vars.global`|
|**media**|`object` or `string` or `File`|&minus;|can be a form data uploaded file, a path, a URL or an object with the media's infos|
|**media.path**|`string`|&minus|(if media is an object) path to the local file|
|**media.url**|`string`|&minus|(if media is an object) url to the file|
|**media.content**|`string`|_if no path or url_|(if media is an object) base64 data from the media|
|**media.name**|`string`|&minus;|(if media is an object) name of the media that you will retrieve via `cid:name`|

##### Examples

###### Video with thumbnail
```
let data = { 
  email: 'user@site.com',
  vars: { globals: [{ share: 'http://path.to/url/of/user/page' }] }
  media: [
    { name: 'video', path: '/path/to/video.mp4' },
    { name: 'IMAGEID', path: '/path/to.thumbnail' }
  ]
}
```

