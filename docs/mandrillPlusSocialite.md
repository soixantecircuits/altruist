### MandrillPlusSocialite

This action combines sending the media to mandrill for sending an
email, and on socialite to have the media on a platform..
The link of the platform is sent in the vars of the email.

#### Setup

Set the settings of the two actions mandrill and socialite.


#### Options

|name|type|required|description|
|:---|:---|:---:|:---|
|**doNotSentMediaButOnlyThumbnailInEmail**|`bool`|_no_|Set to false if you want the media in the mail too|
