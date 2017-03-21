### FTP / SFTP

#### Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "ftp": {
    "host": "127.0.0.1",
    "port": 21,
    "user": "user",
    "password": "password",
    "ssh": false
  }
}
```
Set "ssh" to `true` if you want to use SFTP instead

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "source": "/path/to/local/file",
  "destination": "/path/to/remote/file"
}' "http://localhost:6060/api/v1/actions/ftp"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**source**|`string`|&times;|absolute path to a local file|
|**destination**|`string`|&times;|absolute path to a remote file|
