# MAA Agent 
MAA 任务执行器

## 功能
- 推送任务给MAA
- 定时推送任务给MAA
- 任务日志记录

## 使用之前
- 本项目依赖于`PocketBase`作为数据库后端，需配合PocketBase使用

## 运行
- 在src目录下创建`.env`文件，根据`sample.env`设置PocketBase连接信息
- 运行 `npm install pino-pretty -g` (如果你不需要美化pino的日志输出，请修改package.json中scripts的run内容,去掉 `| pino-pretty`)
- 运行 `npm install`
- 修改PocketBase库文件

    目标文件 `node_modules/pocketbase/dist/pocketbase.es.mjs`

    在文件的最前方添加 `import EventSource from 'eventsource';`

- 运行 `npm run dev`

## 要求
- 安装 maa_cli


## 提示
- 请不要在单个终端上运行多个Agent 
- 建议使用 PM2 进行管理

