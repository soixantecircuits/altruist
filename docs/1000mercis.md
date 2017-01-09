### 1000mercis transactionnal emails

### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
  "actions": {
    "1000mercis": {
      "url": "https://1000mercis.com",
      "login": "login",
      "password": "pass",
      "templateName": "my-template"
    }
  }
```

#### Usage

`POST /api/v1/actions/1000mercis`

```cURL
curl -X POST -H "Content-Type: application/json" -d '
[{
  "name": "EMAIL",
  "value": "altruist@shh.ac"
  },
  {
  "name": "NAME",
  "value": "john doe"
}]' "http://localhost:6060/api/v1/actions/1000mercis"
```

#### Options

*note: attachments (including embeded images) **need** to be hosted somewhere else. 1000mercis does not support any form of media upload*

You **have** to provide an `EMAIL` option like so:

```
{
  "name": "EMAIL",
  "value": "me@example.net"
}
```

Any other variable you'd want to pass, simply provide an object for each and set the name you'll use in your template in the `name` field, and the value in the `value` field.
