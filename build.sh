#!/usr/bin/env sh
rm -rf build
rm -rf tsc-build
npm run build:swc
npm run build:tsc
rsync -avh --ignore-existing tsc-build/src/* build/
cp build/bin/mobius.js build/bin/mobius
