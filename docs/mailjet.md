### Mailjet

#### Setup

You will need your API key and your secret key from your mailjet account.

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "mailjet": {
    "apiKey": "xxxxxxx",
    "secretKey": "xxxxxxxx",
    "fromEmail": "your@e.mail"
  }
}
```

#### Usage

You can send emails by sending a POST request to this action :

_**Note**: If you want to attach files to your email, you have to send your request using form-data._
_The files' total size must not exceed 15MB_
```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxxxx"
-F "media=@your.file"
-F "fromEmail=your@email.net"
-F "recipients=[ { "Email": "first@mail.fr", "Name": "Name1" }, { "Email": "second@mail.com" } ]"
-F "subject=Sending attached file to multiple adresses"
-F "textPart=This is the simple text part."
-F "htmlPart=<h3>This is the html part</h3>"
"http://localhost:6060/api/v1/actions/mailjet"
```

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
	"fromEmail": "your@email.org",
	"recipients": [
		{"Email": "first@mail", "Name": "Foo"},
		{"Email": "second@mail"}
	],
	"subject": "Mail using template",
	"textPart": "I will be overriden by the template.",
	"htmlPart": "I will also be overriden by the template",
	"templateID": "00000",
	"vars": {
		"foo": "this is a variable for the template"
	}
}' "http://localhost:6060/api/v1/actions/mailjet"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**fromEmail**|`string`|&times;|adress the email is sent from|
|**recipients**|`string`|&times;|array of adresses to send the mail to (JSON formatted string)|
|**subject**|`string`|&times;|the mail's subject|
|**textPart**|`string`|_if no htmlPart and no templateID_|text version of the mail|
|**htmlPart**|`string`|_if no textPart and no templateID_|html version of the mail|
|**templateID**|`string`|if no textPart and no htmlPart|id of the template to use|
|**vars**|`string`|&minus;|object containing variables for the template(JSON formatted string)|
|**media**|`file`|&minus;|file to attach to your mail. name doesn't matter. multiple files possible|
