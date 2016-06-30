#!/usr/bin/env sh

./node_modules/.bin/node-pre-gyp --target=1.1.2 --runtime=electron --fallback-to-build --directory node_modules/v8-debug/ --dist-url=https://atom.io/download/atom-shell reinstall
./node_modules/.bin/node-pre-gyp --target=1.1.2 --runtime=electron --fallback-to-build --directory node_modules/v8-profiler/ --dist-url=https://atom.io/download/atom-shell reinstall
