# GAB

This is a dockerized app for listing and approving GAB requests

# Install and run

Clone the repo by running the following command:
```
git clone gabutz/p5tools/gab
```

Once cloned, go the the `gab` folder and build the app:
```
docker build -t gab .
```

Run the app with the following command:
```
docker run gab "[action options]"
```

In order see the list of available actions and options run the following command:
```
docker run gab "-h"
```

# Examples

Here are some examples:

## Get info about all pending requests
```
docker run gab "info"
```

## Get info about all pending paid vacation requests
```
docker run gab "info -t paid"
```

## Approve first 5 remote work requests
```
docker run gab "approve -t wfh -l 5"
```