#!/bin/bash

set -e

if [[ -z $1 ]]; then
    echo "Enter new version: "
    read VERSION
else
    VERSION=$1
fi
read -p "Releasing $VERSION - are you sure? (y/n) " -n 1 -r

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # build
    VERSION=$VERSION npm run build

    # package
    cd src/fingerd
    npm version $VERSION
    npm publish
    cd -

    cd src/moved
    npm version $VERSION
    npm publish
    cd -

    # plugins
    cd src/plugins/fmover-slide-x
    npm version $VERSION
    npm publish
    cd -

    cd src/plugins/fmover-slide-y
    npm version $VERSION
    npm publish
    cd -

    cd src/plugins/simulation-scroll-x
    npm version $VERSION
    npm publish
    cd -

    cd src/plugins/simulation-scroll-y
    npm version $VERSION
    npm publish
    cd -

    #main
    git add -A
    git commit -m "[build] $VERSION"
    # git push origin refs/tags/v$VERSION
    git push
    npm version $VERSION
    npm publish
fi