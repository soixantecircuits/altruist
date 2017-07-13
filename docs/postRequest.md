## Request using http POST

### Request and Options

To run actions using a POST request you need to post the URL mapped to the action you want to run. It should look like `http://localhost:36500/api/v1/actions/twitter`.

You can send options to the action to modify the content being sent with it. Altruist accepts POST request with JSON objects or multipart form data You will probably be interested in sending media to the action.