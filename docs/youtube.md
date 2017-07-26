### Youtube

#### Setup

You will need a Google API Console project to authenticate an account via OAuth2. If you do not have one set up, you can follow the instructions [here](/docs/googleoauth2.md).
You need to activate Google+ API and Youtube Data API v3 for your application.

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "youtube": {
    "clientID": "xxxxxxxx",
    "clientSecret": "xxxxxxxxxxxxxx",
    "loginURL": "/login/youtube",
    "callbackURL": "/login/youtube/return",
    "failureURL": "/?failure=youtube",
    "successURL": "/?success=youtube",
    "profileURL": "/profile/youtube",
    "privacyStatus": "public"
  }
}
```

#### Usage

Before being able to post, you will need to log in to your google account by going to the url matching `loginURL` in your config file and authorizing the application.
When logged in, you can upload videos using form-data :

```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxxxxx"
-F "media=@your_video.mp4"
-F "title=your_title"
-F "description=your_description"
-F "pricacyStatus=private"
"http://localhost:6060/api/v1/actions/youtube"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`file`|&times;|file to upload (the name doesn't matter)|
|**title**|`string`|&minus;|title for the uploaded video|
|**description**|`string`|&minus;|description for the uploaded video|
|**privacyStatus**|`string`|&minus;|`private`, `public` or `unlisted`|
