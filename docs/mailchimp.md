# Mailchimp list subscription

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```js
"actions": {
  "mailchimp": {
    "apiKey": "abcd-xyz",
    "listID": "1234"
  }
}
```

## Usage

`POST /api/v1/actions/mailchimp`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "to": [
    {
      "email": "me@example.com",
      "fname": "John",
      "lname": "Doe"
    }
  ]
}' "http://localhost:36500/api/v1/actions/mailchimp"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**to**|`array`|&times;|an array of objects with the emails to subscribe|

The table below represents an object in the array
|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string`|&times;|email to be suscribed|
|**fname**|`string`|&minus;|firstname of the account|
|**lname**|`string`|&minus;|lastname of the account|
