#!/usr/bin/env sh
echo "Downloading PocketBase"

wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.12/pocketbase_0.22.12_linux_arm64.zip

mkdir pocketbase
echo "Unzip PocketBase"
unzip pocketbase_0.22.12_linux_arm64.zip

echo "Install PocketBase to /usr/local/bin"
chmod +x ./pocketbase
mv ./pocketbase /usr/local/bin

echo "Remove unused files"
rm ./LICENSE.md
rm ./CHANGELOG.md
rm ./pocketbase_0.22.12_linux_arm64.zip

echo "Making Dictionary 'Agent'"

mkdir pocketbase

echo "Downloading Agent UI"
wget https://github.com/dmeww/maa-agent-ui/releases/download/pb_release/pb_public.zip
echo "Unzip Agent UI to ./pocketbase"
unzip pb_public.zip -d ./pocketbase

cat <<EOF > ecosystem.config.js
module.exports = {
  apps : [{
    script: 'pocketbase serve --http 0.0.0.0:8090 --dir ./pb_data --publicDir ./pb_public',
    name: 'pocketbase'
  }]
};
EOF

echo "你现在可以使用 pm2 start ./pocketbase/ecosystem.config.js 来启动PocketBase(with AgentUI)了"
