# Mailchimp list subscription

## Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

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
  "email": "me@example.com",
  "fname": "John",
  "lname": "Doe"
}' "http://localhost:6060/api/v1/actions/mailchimp"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**email**|`string`|&times;|email to be suscribed|
|**fname**|`string`|&minus;|firstname of the account|
|**lname**|`string`|&minus;|lastname of the account|

&rarr; to subscribe multiple accounts, simply pass an array of objects following the above scheme.
