#!/bin/sh
sh test/server-start.sh &
SERVER_PID=$!
sleep 1

npm test && npm run-script lint

kill $SERVER_PID
