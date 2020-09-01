DIR=`dirname $0`

cd $DIR
docker-compose -f nginx-docker-compose.yaml up
