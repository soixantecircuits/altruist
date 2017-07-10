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
  "message": "Hello Twitter !",
  "media": "/path/to/media"
}' "http://localhost:6060/api/v1/actions/twitter"
```

## Options

_*Only one media is sent per request for the moment*_

|name|type|required|description|
|:---|:---|:---:|:---|
|**message**|`string`|&minus;|new tweet message|
|**media**|`string` or `object` or `File`|&minus;|object or path or url to image or video|
|**media.path**|`string`|&minus|(if media is an object) path to the local file|
|**media.url**|`string`|&minus|(if media is an object) url to the file|
|**media.content**|`string`|_if no path or url_|(if media is an object) base64 data from the media|

The 'media' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * base64 encoded string
 * object with at least one of those properties: `path`, `url` or `content`

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You can also set `message` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).
