# Slack

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "slack": {
    "token": "abdc-xyz",
    "channel": "random"
  },
}
```

## Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "path": "/path/to/media.jpg",
  "meta": { "message": "Hello Slack !" }
}' "http://localhost:6060/api/v1/actions/slack"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**path**|`string`|&minus;|image or video|
|**meta.message**|`string`|&minus;|text message. Required if no media sent|

The 'path' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You can also set `message` and/or `path` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).
