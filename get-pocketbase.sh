#!/usr/bin/env sh
echo "Downloading PocketBase"

wget -q --show-progress https://github.com/pocketbase/pocketbase/releases/download/v0.22.12/pocketbase_0.22.12_linux_arm64.zip

mkdir pocketbase
echo "Unzip PocketBase"
unzip pocketbase_0.22.12_linux_arm64.zip -d ./pocketbase

echo "Install PocketBase to /usr/local/bin"
chmod +x ./pocketbase/pocketbase
mv ./pocketbase/pocketbase /usr/local/bin

echo "Remove unused files"
rm ./pocketbase/LICENSE.md
rm ./pocketbase/CHANGELOG.md
rm ./pocketbase_0.22.12_linux_arm64.zip


echo "Downloading Agent UI"
wget -q --show-progress https://github.com/dmeww/maa-agent-ui/releases/download/pb_release/pb_public.zip
echo "Unzip Agent UI to ./pocketbase"
unzip pb_public.zip -d ./pocketbase

cat <<EOF > ./pocketbase/start.sh
#!/usr/bin/bash
PB="$0"
if expr "PB" : '.*/' > /dev/null; then
  PB="${PB%/*}"
else
  PB="./"
fi

pocketbase serve --http 0.0.0.0:8090 --dir "${PB}/pb_data" --publicDir "${PB}/pb_public"
EOF

rm ./pb_public.zip
echo "你现在可以使用 ./pocketbase/start.sh 来启动PocketBase(with AgentUI)了"
