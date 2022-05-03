#!/bin/sh
# https://github.com/FiloSottile/mkcert#installation
mkcert -cert-file localhost.crt -key-file localhost.key localhost 127.0.0.1 0.0.0.0 ::1

