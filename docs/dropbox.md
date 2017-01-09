# Dropbox

You will need a Dropbox app to authenticate an account via OAuth2.
If you do not have one set up, go to [this link](https://www.dropbox.com/developers/apps/create) and create an app using the Dropbox API with the full Dropbox access.
Then, in your app's settings, you will have to add the URI matching `callbackURL` to the `Redirect URIs` section.
Finally, copy your app key and your app secret to your `config.json` file, and you're all set!

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```js
"actions": {
  "dropbox": {
    "clientID": "xxxxxxx",
    "clientSecret": "xxxxxxxxxx",
    "loginURL": "/login/dropbox", // optional, this is the default value
    "callbackURL": "/login/dropbox/return", // optional, this is the default value
    "failureURL": "/?failure=dropbox", // optional, this is the default value
    "successURL": "/?success=dropbox", // optional, this is the default value
    "uploadDirectoryPath": "" // optional
  }
}
```

## Usage

Before being able to post, you will need to authorize the application by going to the url matching `loginURL` in your config file.
When the application is authorized, you can upload files to your dropbox using form-data :

`POST /api/v1/actions/dropbox`

```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxxxxxxx"
 -F "media=@your.file"
 -F "filename=uploadedFile.name"
 -F "uploadDirectoryPath=/targetDirectory/"
 "http://localhost:6060/api/v1/actions/dropbox"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`file`|&times;|the file to upload|
|**filename**|`string`|&minus;|a new name to assign to the uploaded file|
|**uploadDirectoryPath**|`string`|&minus;|the path to the directory to upload to|
