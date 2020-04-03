# GAB

This is app allows you to see and approve pending GAB requests

# Info

In order see the list of available actions and options run the following command:
```
docker-compose run gab "-h"
```

# Examples

Here are some examples:

## Get the number of pending requests
```
docker-compose run gab "info"
```

## Get a list of pending requests
```
docker-compose run gab "info -v"
```

## Get info about all pending remote work requests
```
docker-compose run gab "info -t wfh -v"
```

## Approve first 5 remote work requests
```
docker-compose run gab "approve -t wfh -l 5"
```

## Approve all remote work requests
```
docker-compose run gab "approve -t wfh"
```