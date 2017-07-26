## Request using http POST

### Request and Options

To run actions using a POST request you need to post the URL mapped to the action you want to run.
It should look like `http://localhost:36500/api/v1/actions/{ACTION_NAME}`

You can send options to the action to change the content being sent.
Altruist accepts POST requests with JSON objects and multipart form data.

_JSON POST request_
```
curl -X POST -H "Content-Type: application/json" -d '{
  "message": "Hello Twitter !"
}' "http://localhost:36500/api/v1/actions/twitter"
```

_Multipart form data_
```
curl -X POST -H "Content-Type: multipart/form-data"
 -F "message=Hello Twitter !"
 "http://localhost:36500/api/v1/actions/twitter"
```

#### Media

You will probably be interested in sharing media like pictures and videos.
If you are sending your request with a JSON object, you need to put the media you want to send in an array called `media`.
There are several form of media you can put in this array:

- A string with a path to a local file
- A string with a URL to the file
- A string with the media's content encoded in base64
- An object with at least one of those properties: `path`, `url` or `content`. Those properties are the same as the three media sources above.
  You can also set two optional properties in the object: `name` which is the file's name, `type` which is the file's mime type.

```
curl -X POST -H "Content-Type: application/json" -d '{
  "media" : [
	"/path/to/local/file",
	"http://example.net/fileURL",
	"base64 encoded data",
	{
		"name" : "custom name.png",
		"type" : "image/png",
		"path" : "/path/to/image.png",
		"url" : "http://example.net/"
	}
  ]
}' "http://localhost:36500/api/v1/actions/mandrill"
```

If you are sending your request as multipart form data, you can send your local files as values with any key you want.

```
curl -X POST -H "Content-Type: multipart/form-data"
 -F "file=@/path/to/first/file"
 -F "randomImage=@/path/to/my/image.jpg"
 -F "media=@/path/to/this/media"
 "http://localhost:36500/api/v1/actions/googledrive"
```
Alternatively, you can also send media the same way as a JSON POST request.

#### Response

When the action finishes running or encounters an error, it will return a JSON object with the service's response or the error.

_Success_
```
{
	"action": "mandrill",
	"success": true,
	"code": 200,
	"response": [
		{
			"email": "example@soixantecircuits.fr",
			"status": "sent",
			"reject_reason": "",
			"_id": "abc123abc123abc123abc123abc123"
		}
	]
}
```

_Error_
```
{
	"action": "mandrill",
	"success": false,
	"code": 12,
	"response": {
		"status": "error",
		"code": 12,
		"name": "Unknown_Subaccount",
		"message": "No subaccount exists with the id 'customer-123'"
	}
}
```

|name|description|
|:---|:---|
|**action**|the name of the action executed|
|**success**|wether the call to the service has succeeded or not (some services return errors as normal responses, so it might be true even errors are returned)|
|**code**|the response's code (usually 200 on success)|
|**response**|an error string or the service's response (usually an object or a string)|
