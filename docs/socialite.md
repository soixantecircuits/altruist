### Socialite

#### Setup

_Socialite is still in BETA._

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "socialite": {
    "bucket": "xxxxx",
    "token": "xxxxxx"
  }
}
```

#### Usage

You can upload pictures to your bucket by sending them over by form-data :

```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxxxxxxxxxxxx"
-F "bucket=your_bucket"
-F "token=xxxxxxxxx"
-F "filename=picture"
-F "media=@picture.jpg"
"http://localhost:6060/api/v1/actions/socialite"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**bucket**|`string`|_if not in config.json_|your bucket's name|
|**token**|`string`|_if not in config.json_|your bucket's token|
|**filename**|`string`|&times;|the filename to give to the post (extension is required)|
|**media**|`file` or `path`|&times;|the picture to upload (you can upload as many files as you want)|
