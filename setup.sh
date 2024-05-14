#!/usr/bin/sh

npm install -g pino-pretty

npm install

echo "import EventSource from 'eventsource';" | cat - node_modules/pocketbase/dist/pocketbase.es.mjs > temp && mv temp node_modules/pocketbase/dist/pocketbase.es.mjs

cp sample.env .env

echo "修改 .env 文件后，使用 npm run dev-pino 或 npm run dev 来启动项目"

echo "或者你可以在本目录使用 pm2 start pm2/agent.js 来启动Agent"