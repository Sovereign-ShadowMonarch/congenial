#!/usr/bin/env bash

REVISION=$(git rev-parse HEAD)
BACKEND_VERSION=$(cat .bumpversion.cfg | grep 'current_version = ' | sed -n -e 's/current_version = //p')
POSTFIX=$(if git describe --tags --exact-match "$REVISION" &>/dev/null; then echo ''; else echo '-dev'; fi)
BACKEND_VERSION=${BACKEND_VERSION}${POSTFIX}

docker build -t backend . --build-arg REVISION="$REVISION" --build-arg BACKEND_VERSION="$BACKEND_VERSION"