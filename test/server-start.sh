PORT=8888
DIR=`dirname $0`

$DIR/../node_modules/.bin/http-server $DIR/webroot -p $PORT

