# Instagram

## Setup
  
We are not using the official Instagram API but this [private Instagram API](https://github.com/mgp25/Instagram-API), because the official Instagram API doesn't allow you to post things on your account.  
  
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
  "media": "/path/to/image.jpg"
  "caption": "I love ponies !"
}' "http://localhost:6060/api/v1/actions/instagram"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`string`|&times;|path to the image you want to share|
|**caption**|`string`|&minus;|optionnal caption|

Only **JPG** files are supported for now
