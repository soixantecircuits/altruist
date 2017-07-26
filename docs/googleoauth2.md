### Create a Google application to use OAuth2

To be able to use Google's Oauth2 authentication and use altruist's actions like `youtube` or `googledrive`, you will need to create a Google API Console project.

Go to [Google API Console](https://console.developers.google.com/) and [create a new project](https://console.developers.google.com/projectselector/apis/credentials).
When your project is created, click on `Credentials` and select OAuth consent screen. You'll have to provide an email adress and a product name.

After that, create new credentials for this project and select `OAuth client ID` and `Web application`.
In `Authorized redirect URI`, you have to a URI that matches the altruist action's `callbackURL`, then create the credentials.
You will be prompted your client ID and client secret. Put them in settings.json.
**The redirect URI might take a few minutes before you can use it.**

Depending on what google API is used in the altruist action, you will have to activate them in Google API console.
Click on library, select the API you want to use, activate it, and it's done !
