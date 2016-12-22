### Google Drive

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "googledrive": {
    "clientID": "xxxxxxxx",
    "clientSecret": "xxxxxxxxxxxxxx",
    "uploadDirectoryID": "",
    "loginURL": "/login/gdrive",
    "callbackURL": "/login/gdrive/return",
    "failureURL": "/?failure=gdrive",
    "successURL": "/?success=gdrive",
    "profileURL": "/profile/gdrive"
  }
}
```

#### Usage

Before being able to post, you will need to log in to your google account by going to the url matching `loginURL` in your config file and authorizing the application.
When logged in, you can upload files using form-data :

```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxxxxxxxxxx"
-F "file=@your_file"
-F "filename=your_file_name"
-F "uploadDirectoryID=xxxxxxxxxxxxxxxx"
"http://localhost:6060/api/v1/actions/googledrive"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**file**|`file`|&times;|file to upload (the key doesn't matter)|
|**filename**|`string`|&minus;|name to assign to the uploaded file|
|**uploadDirectoryID**|`string`|&minus;|ID of the directory to upload to|
