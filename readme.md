# P5 Tools

This repo will contain a set of tools for facilitating interaction with P5 platforms.

## Prerequisites

In order to use the P5 Tools you will need docker engine installed locally. You can get it from [here](https://docs.docker.com/get-docker/). 
The required version is 17.06.0+, although I encourage keeping the engine up to date.

# Install

Since we are talking about docker, the install process is fairly simple. You just need to get the code from the repo.

You can do that either by cloning the repo in a local folder of your choosing:
```
git clone gabutz/p5tools
```

or by downloading a zip and extracting it locally (this way has the advantage of not requiring git to be installed)
```
https://github.com/gabutz/p5tools/archive/master.zip
```

# Config

Since the tools will require that you authenticate against various P5 platforms, you will need to provide your credentials.

In order to make that easy, all you need to do is rename the `.env.sample` file from the root of the project into `.env` and add in your username and password. In the end, the `.env` file should look similar to this:

```
P5_USERNAME=pentalog_id
P5_PASSWORD=pentalog_password
```

> Make sure that that you don't leave a blank space between the `=` sign and the username or password.

The advantages of using a `.env` file is that your credentials will not he hard-coded (meaning in the code of the app, they will still live in the `.env` file), versioned, and can be easily updated.

# Run

Once the files have been extracted and the `.env` file contains your credentials, you can use **docker compose** to run the tools.

The standard format is 
```
docker-compose run <tool name> "<tool options>"
```

For example, in order to run the `GAB` tool and see the list of pending requests, you can do that by running:
```
docker-compose run gab "info -v"
```

For more details regarding any specific tool, consult the links below:

[GAB](gab/readme.md)