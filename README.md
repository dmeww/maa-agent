# MAA Agent

MAA 任务执行器

## 功能

- 推送任务给MAA
- 定时推送任务给MAA
- 任务日志记录

## 使用之前

- 本项目依赖于`PocketBase`作为数据库后端，需配合PocketBase使用
- .env 配置信息
  
  ```shell
  POCKETBASE_URL    : 部署PocketBase的IP+PORT,格式为http(s)://IP:PORT
  POCKETBASE_USER   : PocketBase管理员用户名
  POCKETBASE_PASS   : PocketBase管理员密码
  DEVICE_RESOLUTION : 执行MAA前会设置设备分辨率,支持 1080|720 ,默认720
  AGENT_ID=xxx      : Agent的数据库ID，在PocketBase中创建获取
  AGENT_DEV=0       : 开发模式,这个模式下任务执行结束后不会清空该次执行的日志
  ```

## 运行 - PocketBase

- A:运行get-pocketbase.sh (arm64)

- B:下载PocketBase二进制文件 [PocketBase Github Repo](https://github.com/pocketbase/pocketbase)
  
  运行PocketBase， 设置好用户名密码后，点击Settings -> Import collections -> Load from JSON file 选择本项目下的`pb_schema.json`进行导入

## 运行 - Agent

- 配置方案A: 打包允许=> 运行 `npm run setup` 后，修改`.env`文件内容即可通过 `./agent`启动Agent

- 配置方案B: 从源码运行=>
  
  - 在src目录下创建`.env`文件，根据`example.env`设置PocketBase连接信息
  
  - 运行 `bun install`
  
  - 修改PocketBase库文件(PocketBase JS SDK 默认是用于浏览器，控制台环境需要修改)
    
      目标文件 `node_modules/pocketbase/dist/pocketbase.es.mjs`
    
      在文件的最前方添加 `import EventSource from 'eventsource';`
  
  - 运行 `bun dev`

## 要求

- 安装 maa_cli
- Nodejs 运行环境(从源码运行时需要)

## 提示

- 请不要在单个终端上运行多个Agent 
- 建议使用 PM2 进行管理
