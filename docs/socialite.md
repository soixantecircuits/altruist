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
-F "name=post_name"
-F "file1=@firstPicture.jpg"
-F "file2=@secondPicture.png"
"http://app.shh.ac/wp-json/form/v1/postForm"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**bucket**|`string`|_if not in config.json_|your bucket's name|
|**token**|`string`|_if not in config.json_|your bucket's token|
|**name**|`string`|&times;|the name to give to the post|
|**file**|`file`|&times;|the picture to upload (you can upload as many files as you want)|
