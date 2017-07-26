# SMTP email

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
  "actions": {
    "smtp": {
      "user": "your@mail.com",
      "password": "yourpassword",
      "smtpServer": "your.smtp.server",
      "from": "Altruist 🚀 <altruist@example.com>" // optional if sent in request
    }
  }
```

## Usage

You can send emails by sending a POST request using JSON or form-data:

`POST /api/v1/actions/smtp`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
	"from": "from@email.fr",
	"to": "to@email.com",
	"subject": "the subject",
	"text": "text part",
	"html": "html part",
	"attachments": [{
    "path": "/path/or/url",
    "filename": "example.txt"
    }]
}' "http://localhost:6060/api/v1/actions/smtp"
```

Attach files uploaded by form-data
```cURL
curl -X POST -H "Content-Type: multipart/form-data; boundary=----xxxxxxxxxxxxxxxx"
-F "from=from@email.net"
-F "to=to@email.org"
-F "subject=example"
-F "text=text part"
-F "html=html part"
-F "media=@file.ext"
"http://localhost:6060/api/v1/actions/smtp"
```

## Options

The full list of parameters is available [here](https://github.com/nodemailer/nodemailer#e-mail-message-fields).

|name|type|required|description|
|:---|:---|:---:|:---|
|**from**|`string`|&times;|address that will send the email|
|**to**|`string|array`|&times;|address(es) that will receive the email|
|**subject**|`string`|&minus;|the email's subject|
|**text**|`string`|&minus;|text part of the email|
|**html**|`string`|&minus;|html part of the email|
|**media**|`file`|&minus;|file to upload and attach to the email|
|**attachments**|`array`|&minus;|array of attachment objects|
