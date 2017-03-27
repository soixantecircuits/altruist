# Instagram

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "instagram": {
    "account": "johndoe",
    "password": "pony123"
  }
}
```

## Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "path": "/path/to/image.jpg"
  "meta": { "message": "Hello Instagram !" }
}' "http://localhost:6060/api/v1/actions/instagram"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**path**|`string`|&times;|path to the image you want to share|
|**meta.message**|`string`|&minus;|optionnal message|

Only **JPG** files are supported for now
