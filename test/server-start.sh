PORT=8888
DIR=`dirname $0`

$DIR/../node_modules/.bin/http-serve $DIR/webroot -p $PORT -c 84600 --gzip

