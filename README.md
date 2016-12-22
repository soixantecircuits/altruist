# Altruist

> 💌 Altruist lets you share your content with people ✌️

Altruist supports the following data formats:

* raw `application/json`
* URL-encoded
* form-data

## Installation

Install the tool:

```sh
$ yarn global add altruist
# or
$ npm install -g altruist
```

then, provide a configuration file based on the template we provide:

```sh
# get the template
$ wget https://raw.githubusercontent.com/soixantecircuits/altruist/master/config/config.example.json
# rename it
$ mv config.example.json my-config.json
# profit
$ altruist my-config.json
```

For details about what to write in the config file, See the `Actions` section below.

Then:

```
POST http://localhost:6060/api/v1/actions/{action}
```
*More details in the actions docs*

## Actions

##### List of available actions:
* [mailchimp](/docs/mailchimp.md)
* [mandrill](/docs/mandrill.md)
* [facebook](/docs/facebook.md)
* [twitter](/docs/twitter.md)
* [slack](/docs/slack.md)
* [google drive](/docs/googledrive.md)

⚠️  *Some actions may require that you log in before using them. You can get a list of those actions with their login url by sending a GET request to the url matching `authRedirect` in the config file (`/authRedirect` by default).*

### Instagram

#### Setup

In your `config.json` file, you'll need to add the following configuration object to the `actions` property:

```json
"actions": {
  "instagram": {
    "account": "johndoe",
    "password": "pony123"
  }
}
```

#### Usage

```cURL
curl -X POST -H "Content-Type: application/json" -d '{
  "media": "/path/to/image.jpg"
  "caption": "I love ponies !"
}' "http://localhost:6060/api/v1/actions/instagram"
```

#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**media**|`string`|&times;|path to the image you want to share|
|**caption**|`string`|&minus;|optionnal caption|

Only **JPG** files are supported for now

## Contribute

Thanks for helping us! 👏

Please follow:

* [JavaScript standard style](http://standardjs.com/)
* [This git branching model](nvie.com/posts/a-successful-git-branching-model/)
