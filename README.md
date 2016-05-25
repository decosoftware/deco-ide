![Deco IDE](https://camo.githubusercontent.com/310b468e29288459ca36b1a54b3b311cf9e31bd4/68747470733a2f2f73332d75732d776573742d322e616d617a6f6e6177732e636f6d2f696d686f73742f4465636f4944454c6f676f25343032782e706e67)

### The all-in-one solution for building React Native applications.

You can get started right away on your React Native project by installing Deco and creating a new project — it's fast and there's no manual setup needed. File scaffolding handles your boilerplate. Ready-made components drop right into your code. Properties are graphically editable through the property inspector. It's an entirely new way to write, tweak, and re-use code.

![Deco Screenshot](http://i.imgur.com/KoZrWoF.png)

#### [Download Deco](https://www.decosoftware.com/beta/downloads) to try out the latest release.
#### [Documentation](https://www.decosoftware.com/docs) to get you started on Deco IDE.
#### [Open an Issue](#opening-issues) for bug reports and feature requests.
#### [Join Slack](https://decoslackin.herokuapp.com) to talk with us.

## Table of Contents

- [Setup for Development](#setup-for-development)
  - [Environment](#environment)
  - [Install](#clone-and-install-dependencies)
  - [Development](#development)
  - [Production Build](#testing-a-production-build)
- [Contributing](#contributing)
  - [Opening Issues](#opening-issues)
  - [Becoming a Contributor](#becoming-a-contributor)
- [Feedback](#feedback)

## Setup for Development

### Environment

#### OSX

It is recommended that you use node v5.x and npm 3.x for best results. This project also requires the Ruby 'Bundler' gem.

Installing these on your Mac is easy with [Homebrew](brew.sh)
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Now that [Homebrew](brew.sh) is installed you can run these commands:

```
brew install node
brew install ruby
gem install bundler
```

#### Linux

Linux is not supported at this time.

#### Windows

Windows is not supported at this time.

### Clone and Install Dependencies
```
$ git clone git@github.com:decosoftware/deco-ide
$ cd ./deco-ide/web
$ npm install
$ bundle install
$ cd ../desktop
$ npm install
$ npm run copy-libs
$ cd ../shared
$ npm install
```

### Development

Deco core is split into three sub-projects...

1. [Web](web/README.md)
  - A webpack bundle that assumes it's been loaded by Electron's BrowserWindow.
2. [Desktop](desktop/README.md)
  - A webpack bundle that runs in Electron's NodeJS environment and controls the desktop APIs.
3. [Shared](shared/README.md)
  - Shared constants for communicating over our IPC (inter-process communication) abstraction layer.

#### Quick Start
```
$ cd ./deco-ide
$ ./run-dev.js
```

#### Manual Start
Occasionally it is helpful to stop and restart the `desktop` gulp task without stopping the `web` gulp task. To do this you can run the following commands...

```
$ cd ./web
$ npm run watch

```
This command will:
1. Watch the `./web/src` directory and re-build on any changes to the code
2. Serve the build on localhost:8080

```
# Open a new terminal window
$ cd ./desktop
$ npm run start
```

This command will:
1. Build `./desktop/src` and place the result into `./desktop/build/app.js`
2. Launch a local Electron binary and load in the bundle from `desktop/build/app.js`

### Testing a Production Build

```
$ cd ./desktop
$ npm run pack
```

The resulting .pkg file will be output to `./dist/osx/Deco-$VERSION.pkg`

This build is for local testing only. When you install, the system will generate a warning about this being from an unapproved developer — this is because the package is not signed when building locally.

## Contributing

### Opening Issues

##### Issues are intended for bug reporting and feature requests.

Before you open a new issue, make sure it isn't already in the list of [existing issues.](http://www.github.com/decosoftware/deco-ide/issues) If you believe you've found a new bug, it helps to include any relevant logs in your description.

You can find the logs file at `~/Library/Application Support/com.decosoftware.Deco/logs.out`

### Becoming a Contributor

All information on how to become a contributor is in our [Contribution Guidelines.](CONTRIBUTING.md)

## Feedback

We :heart: feedback!

##### Join the discussion in our [community chat.](https://decoslackin.herokuapp.com)

## Copyright

Copyright 2015 © Deco Software Inc - All rights reserved
