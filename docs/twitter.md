# Twitter

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

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
  "path": "/path/to/media or URL",
  "meta": { "message": "Hello Twitter !" }
}' "http://localhost:6060/api/v1/actions/twitter"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**meta.message**|`string`|&minus;|new tweet message|
|**path**|`string`|&minus;|image or video|

The 'path' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You **have** to provide at least one of the two options (`path` or `message`).
