#!/bin/sh
sh test/server-start.sh &
SERVER_PID=$!
sleep 1

npm test && kill $SERVER_PID
