# Secure copy

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
  "actions": {
    "scp": {
      "user": "foo",
      "password": "bar",
      "hostname": "example:5050",
      "target": "/directory/or/file"
    }
  }
```

## Usage

`POST /api/v1/actions/scp`

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
	"source": "/source/file/or/directory"
	"user": "foo",
	"password": "bar",
	"hostname": "example:port",
	"target": "/target/directory/or/file"
}' "http://localhost:6060/api/v1/actions/scp"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**source**|`string`|&times;|path to the source file or directory to copy|
|**user**|`string`|_if not in settings.json_|user name to connect to the host|
|**password**|`string`|_if not in settings.json_|password to connect to the host|
|**hostname**|`string`|_if not in settings.json_|host to connect to. _you can append the port_|
|**target**|`string`|_if not in settings.json_|target directory or target file for the copy|
