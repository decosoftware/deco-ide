#!/usr/bin/env sh
npm install -g npm
npm install -g gulp

cd ./shared

echo '*************************************'
echo 'Running install on shared'
echo '*************************************'
npm i

cd ../web

echo '*********************************'
echo 'Running install on web'
echo '*********************************'
bundle install
npm i

cd ../desktop

echo '*****************************************************'
echo 'Adding keys and provisioning profiles for codesigning'
echo '*****************************************************'
./auth/add-key.sh

echo '*************************************'
echo 'Running install on desktop'
echo '*************************************'
npm i
