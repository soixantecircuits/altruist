# Twitter

## Setup

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

## Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "message": "Hello Twitter !",
  "media": "/path/to/media"
}' "http://localhost:6060/api/v1/actions/twitter"
```

## Options

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