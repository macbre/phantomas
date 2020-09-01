DIR=`dirname $0`

cd $DIR
docker-compose -f nginx-docker-compose.yaml up -d

# wait for it...
sleep 5
docker ps

curl -svo /dev/null 0.0.0.0:8888 --compressed
