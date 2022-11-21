#!/bin/sh
# https://github.com/FiloSottile/mkcert#installation
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

echo "Using $SCRIPTPATH directory ..."

mkcert -cert-file ${SCRIPTPATH}/localhost.crt -key-file ${SCRIPTPATH}/localhost.key localhost 127.0.0.1 0.0.0.0 ::1
