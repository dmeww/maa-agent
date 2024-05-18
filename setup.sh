#!/usr/bin/env sh

npm install -g pino-pretty

npm install

echo "import EventSource from 'eventsource';" | cat - node_modules/pocketbase/dist/pocketbase.es.mjs > temp && mv temp node_modules/pocketbase/dist/pocketbase.es.mjs

cp sample.env .env

echo "配置 .env 文件后，使用 npm run dev 来启动项目"

echo "或者你使用 pm2 start ./ecosystem.config.js 来启动Agent"