# Facebook user and page post

You will need a Facebook app to authenticate an account via OAuth2.
If you do not have one set up, you can follow the instructions on the [facebook app development documentation](https://developers.facebook.com/docs/apps/register).
Choose `website` as a platform for your app. When your app is created, go to the settings and add the domain the app will be running on in `App Domains`.
Get your app ID and your app secret, and copy them to your `settings.json` file.

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```js
"actions": {
  "facebook": {
    "appID": "abcd-xyz",
    "appSecret": "shhh",
    "loginURL": "/login/facebook",
    "callbackURL": "/login/facebook/return",
    "failureURL": "/",
    "successURL": "/",
    "profileURL": "/profile/facebook",
    "accountsURL": "/accounts/facebook",
    "pageID": "" // optionnal
  }
}
```

## Usage

Before being able to post, you will need to log in facebook by going to the url matching `loginURL` in your config file and authorizing the application.
When logged in, you can post on your feed using JSON or form-data :

`POST /api/v1/actions/facebook`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "path": "/path/to/my/img.jpg",
  "meta": {
    "message": "Hello Facebook !"
  }
}' "http://localhost:7070/api/v1/actions/facebook"
```

The 'path' option must be one of the following:
 * path to a file on your system (example: `/path/to/image.png`)
 * url (example: `http://some_site.com/image.png`)
 * ~~base64 encoded string~~ *(soon)*

Supported formats are **JPG**, **PNG**, **GIF**, **WEBP** (for images) and **MOV**, **WMV** or **MP4** (for videos)

You can get your profile's informations and a list of accounts (like pages) you manage by sending a GET request to urls matching respectively `profileURL` and `accountsURL`.
You will be returned JSON object containing the datas requested.

`GET /profileURL`
```json
{
  "id": "xxx",
  "displayName": "xxx",
  "name": {}
}
```

`GET /accountsURL`
```json
{
  [
    {
      "access_token": "xxx",
      "category": "xxx",
      "name": "xxx",
      "id": "xxx",
      "perms": []
    }
  ]
}
```

<!-- When you log in, an array of pages you manage is stored in `userAccounts`.
You can switch the current used id to post on a page or on your feed by calling the function `setID(newId)` and it will set the access token accordingly.
To switch back to your account, you can call `setID('me')` or just call it with you account's ID. -->

## Options

_**Note**: MP4 files MUST be local files on your system or url (no base64)_

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`string`|*if no message*|image or video|
|**meta.message**|`string`|*if no media*|message to post on your feed|

You can also set `message` and/or `path` into your config directly, if they don't need to be set by the user.

You **have** to provide at least one of the two options (be it in config or in request).
