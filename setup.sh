#!/usr/bin/env sh

echo "import EventSource from 'eventsource';" | cat - node_modules/pocketbase/dist/pocketbase.es.mjs > temp && mv temp node_modules/pocketbase/dist/pocketbase.es.mjs

bun build-agent

cp sample.env .env
echo "配置 .env 文件后，通过 ./agent 允许Agent"

