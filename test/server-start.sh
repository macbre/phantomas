DIR=`dirname $0`

cd $DIR
docker-compose -f nginx-docker-compose.yaml up -d

# wait for it...
sleep 5

set -x
docker ps

curl -svo /dev/null --compressed 0.0.0.0:8888 
curl -svo /dev/null --compressed 0.0.0.0:8888/static/style.css
