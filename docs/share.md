### Share

The `share` action is used to call multiple actions using only one route.

#### Usage

`POST /api/v1/actions/share`

```cURL
curl -X POST -H "Content-Type: application/json" -d '
{
  "twitter": {
    "message": "Hello world!",
    "media": "/path/to/media.jpg"
  },
  "mandrill": {
    "email": "my@email.com",
    "media" [
      { "name": "media.jpg", "content": "/path/to/media.jpg" }
    ]
  }
}' "http://localhost:6060/api/v1/actions/share"
```

#### Options

You can include any available altruist's action in your request to `share` (here `twitter` and `mandrill`).  
The documentation lists what options are needed by each action.  
