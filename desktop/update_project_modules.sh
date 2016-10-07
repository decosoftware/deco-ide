#!/bin/bash

cd ./libs/Project
rm -rf node_modules
npm i
tar -cjf modules.tar.bz2 ./node_modules
rm ../modules.tar.bz2
mv modules.tar.bz2 ../
rm -rf node_modules
