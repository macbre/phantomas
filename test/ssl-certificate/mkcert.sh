#!/bin/sh
DIR=$(realpath `dirname $0`)
echo "Generating SSL certificates for localhost in ${DIR} ... ";

set -x

mkcert -install
mkcert -cert-file ${DIR}/localhost.crt -key-file ${DIR}/localhost.key localhost
