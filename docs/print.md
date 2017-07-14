# Print

## Setup

In your `settings.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "print": {
    "printer": "...",
    "format": "...",
    "copies": 1
  }
}
```

## Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "media": "/path/to/image.jpg"
}' "http://localhost:36500/api/v1/actions/print"
```

## Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`string`|&times;|path to a media file|
|**printer**|`string`|&times;|your printer name|
|**format**|`string`|&minus;|optionnal format description, default is 'A4'|
|**copies**|`string`|&minus;|optionnal number of copies to print, default is 1|
|**options**|`string`|&minus;|optionnal custom lp options|

All options can be described in the POST request and/or the settings.json file

You can list available printers by running `lpstat -p` in your terminal

You can list available formats for a given printer by running `lpoptions -p <your-printer> -l` in your terminal

You can add custom lp options (`man lp`), example:
```
-o landscape
-o scale=75
...
```
