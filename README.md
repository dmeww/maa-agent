# MAA Agent 
MAA 任务执行器

## 功能
- 推送任务给MAA
- 定时推送任务给MAA
- 任务日志记录

## 使用之前
- 本项目依赖于`PocketBase`作为数据库后端，需配合PocketBase使用
- .env Key信息
```shell
POCKETBASE_URL    : 部署PocketBase的IP+PORT,注意这个需要以http/https开头,并且客户端需要能访问到
POCKETBASE_USER   : PocketBase管理员用户名
POCKETBASE_PASS   : PocketBase管理员密码
DEVICE_RESOLUTION : 执行MAA前设置设备分辨率,支持1080|720,默认是720
```

## 运行
- 在src目录下创建`.env`文件，根据`sample.env`设置PocketBase连接信息
- 运行 `npm install pino-pretty -g` (如果你不需要美化pino的日志输出，请使用 `npm run dev`运行本项目)
- 运行 `npm install`
- 修改PocketBase库文件(PocketBase JS SDK 默认是用于浏览器，控制台环境需要修改)

    目标文件 `node_modules/pocketbase/dist/pocketbase.es.mjs`

    在文件的最前方添加 `import EventSource from 'eventsource';`

- 运行 `npm run dev-pino`

## 要求
- 安装 maa_cli
- Nodejs 运行环境

## 提示
- 请不要在单个终端上运行多个Agent 
- 建议使用 PM2 进行管理

