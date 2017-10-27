### Socialite

#### Setup

_Socialite is still in BETA._

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

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
"http://localhost:36500/api/v1/actions/socialite"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**bucket**|`string`|_if not in settings.json_|your bucket's name|
|**token**|`string`|_if not in settings.json_|your bucket's token|
|**filename**|`string`|&times;|the filename to give to the post (extension is required)|
|**media**|`array`|&times;|array with the pictures to upload (more infos on sending media [here](/postRequest.md))|


### Socialite-v0 (depreciated)

#### Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "socialite": {
    "baseURL": "http://url.com",
    "uploadRoute": "/upload.php"
  }
}
```

> If your URL (baseURL + uploadRoute) is not correct, you'll get a 404 error HTML page as a response.

#### Usage

You can upload pictures via a POST request:

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "filename": "optional_file_name",
  "media": "/path/to/your/file.jpg"
  }' "http://localhost:36500/api/v1/actions/socialite"
  ```

  #### Options

  |name|type|required|description|
  |:---|:---|:---:|:---|
  |**filename**|`string`|&minus;|optional filename to rename your file|
  |**media**|`path`|&times;|path to your file|
