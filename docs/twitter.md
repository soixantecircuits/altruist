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
}' "http://localhost:36500/api/v1/actions/twitter"
```

## Options

_*Only one media is sent per request for the moment*_

|name|type|required|description|
|:---|:---|:---:|:---|
|**message**|`string`|_if no media_|new tweet message|
|**media**|`array`|_if no message_|array with the image or video to upload (more infos on sending media [here](/postRequest.md))|

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MP4** (for videos)

You can also set `message` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).
