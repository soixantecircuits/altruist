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
  "path": "/path/to/my/file.jpg",
  "file": "myFileName.jpg",
  "meta": {
    "email": {
      "to": "my@email.com"
      "attachments": [
        {
          "name": "someFile.jpg",
          "content": "/path/to/some/file.jpg"
        },
        {
          "name": "someOtherFile.jpg",
          "content": "/path/to/some/other/file.jpg"
        }
      ]
      "vars": {
        "globals": [],
        "targeted": []
      }
    }
  }
}' "http://localhost:6060/api/v1/actions/mandrill"
```

&rarr; [more](https://mandrill.zendesk.com/hc/en-us/articles/205582537-Using-Handlebars-for-Dynamic-Content) about Mandrill variables

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**file**|`string`|&minus;|name of the media that you will retrieve via `cid:name`|
|**path**|`string`|&minus;|Can be either a path the media (in the filesystem or via http) or straight base64 datas|
|**meta.email.to**|`string|array`|&times;|address(es) that will receive the email|
|**meta.email.vars.globals**|`array`|&minus;|array of object defining your Mandrill `merge_vars` (with key = name and value = content)|
|**meta.email.vars.targeted**|`array`|&minus;||
|**meta.email.vars.targeted.target**|`string`|&minus;|address targeted|
|**meta.email.vars.targeted.vars**|`array`|&minus;|create/override `merge_vars` for the concerned address. Works the same as `vars.global`|
