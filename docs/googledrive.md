### Google Drive

#### Setup

You will need a Google API Console project to authenticate an account via OAuth2. If you do not have one set up, you can follow the instructions [here](/docs/googleoauth2.md).
You need to activate Google+ API and Google Drive API for your application.

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

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
-F "media=@your_file"
-F "uploadDirectoryID=xxxxxxxxxxxxxxxx"
"http://localhost:6060/api/v1/actions/googledrive"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`File` or `string` or `object`|&times;|buffer or path to the file to upload|
|**uploadDirectoryID**|`string`|&minus;|ID of the directory to upload to|
