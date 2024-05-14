#!/usr/bin/sh

echo "正在下载PocketBase"

wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.12/pocketbase_0.22.12_linux_arm64.zip

mkdir pocketbase
echo "解压PocketBase"
unzip pocketbase_0.22.12_linux_arm64.zip -d ./pocketbase

echo "安装PocketBase"
chmod +x ./pocketbase/pocketbase
mv ./pocketbase/pocketbase /usr/local/bin

rm ./pocketbase/LICENSE.md
rm ./pocketbase/CHANGELOG.md

echo "正在下载Agent前端"
wget https://github.com/dmeww/maa-agent-ui/releases/download/pb_release/pb_public.zip
echo "解压前端"
unzip pb_public.zip -d ./pocketbase

echo "你现在可以在本目录使用 pm2 来启动PocketBase了"
