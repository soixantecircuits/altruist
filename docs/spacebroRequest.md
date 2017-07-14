## Request using spacebro

### Settings

If you want to make a request to altruist using spacebro, you have to make sure you have a valid spacebro configuration in your settings:

```
{
  "service": {
    "spacebro": {
      "host": "spacebro.space",
      "port": 3333,
      "clientName": "altruist",
      "channelName": "media-stream",
      "inputMessage": "new-media-from-etna",
      "successMessage": "altruist-success",
      "failureMessage": "altruist-failure"
    }
  }
}
```

|name|type|required|description|
|:---|:---|:---:|:---|
|**host**|`string`|&times;|*|
|**port**|`number`|&times;|*|
|**clientName**|`string`|&minus;|name altruist will take when connecting to spacebro|
|**channelName**|`string`|&minus;|channel that altruist will be listening on|
|**inputMessage**|`string`|&times;|spacebro event that will trigger altruist actions|
|**successMessage**|`string`|&times;|spacebro event that will be emitted by altruist when an action succeeded|
|**failureMessage**|`string`|&times;|spacebro event that will be emitted by altruist when an action failed|

### Request and Options

To run actions using a spacebro event, you need to send an object as a media with the options you want to pass to your actions in `media.meta.altruist`

You can specify the actions you want to run for this request by passing an array of action names in the options as well. If this array is not found in the options, it will be loaded from your settings instead (in `autoshare.action`).

The options object doesn't change from the one you send in an http POST request to altruist, with the exception of the media object.
The media you want to send to your actions must be outside of your options object, with the first media being the root object you send through spacebro, and the other media being in the `details` property.
The media objects follow the same format as the one you would send in an HTTP POST request: see [here](/postRequest.md#media)

Here's a sample of the data you would send:
```
{
  "_id": "235b3535f32aab55325",
  "name": "PhotoMatte1.jpg",
  "type": "image/jpg",
  "url": "http://photomat.te/235b3535f32aab55325",
  "details": {
    "0": {
      "_id": "77b6afee663cea11",
      "name": "PhotoMatte2.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/77b6afee663cea11"
    },
    "1": {
      "_id": "9015b3a3ff393e39",
      "name": "PhotoMatte3.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/9015b3a3ff393e39"
    }
  },
  "meta": {
    "altruist": {
      "action": [
        "mandrill",
        "googledrive"
      ],
      "from": "photomaton@soixantecircuits.fr",
      "to": "example@soixantecircuits.fr",
      "templateID": "16337312"
    }
  }
}
```

### Response

When an action that has been requested through spacebro finishes, the response is sent back with a spacebro event corresponding to `successMessage` when the action has succeeded and `failureMessage` when an error occured.

The response object will be the exact same object that has been sent in the request with an additional property `meta.altruistResponse`

#### Success response

```
{
  "_id": "235b3535f32aab55325",
  "name": "PhotoMatte1.jpg",
  "type": "image/jpg",
  "url": "http://photomat.te/235b3535f32aab55325",
  "details": {
    "0": {
      "_id": "77b6afee663cea11",
      "name": "PhotoMatte2.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/77b6afee663cea11"
    },
    "1": {
      "_id": "9015b3a3ff393e39",
      "name": "PhotoMatte3.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/9015b3a3ff393e39"
    }
  },
  "meta": {
    "altruist": {
      "action": [
        "mandrill"
      ],
      "from": "photomaton@soixantecircuits.fr",
      "to": "example@soixantecircuits.fr",
      "templateID": "16337312"
    },
    "altruistResponse": {
      "action": "mandrill",
      "success": true,
      "code": 200,
      "response": [
        {
          "email": "yael@soixantecircuits.fr",
          "status": "sent",
          "reject_reason": "",
          "_id": "abc123abc123abc123abc123abc123"
        }
      ]
    }
  }
}
```

#### Failure response

```
{
  "_id": "235b3535f32aab55325",
  "name": "PhotoMatte1.jpg",
  "type": "image/jpg",
  "url": "http://photomat.te/235b3535f32aab55325",
  "details": {
    "0": {
      "_id": "77b6afee663cea11",
      "name": "PhotoMatte2.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/77b6afee663cea11"
    },
    "1": {
      "_id": "9015b3a3ff393e39",
      "name": "PhotoMatte3.jpg",
      "type": "image/jpg",
      "url": "http://photomat.te/9015b3a3ff393e39"
    }
  },
  "meta": {
    "altruist": {
      "action": [
        "mandrill"
      ],
      "from": "photomaton@soixantecircuits.fr",
      "to": "example@soixantecircuits.fr",
      "templateID": "16337312"
    },
    "altruistResponse": {
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
  }
}
```