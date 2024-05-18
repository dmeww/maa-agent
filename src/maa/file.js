import * as fs from "node:fs";
import pino from "pino";



const logger = pino();


export class File {

    BasePath = '/root/.config/maa'

    TasksPath = `${this.BasePath}/tasks`

    ProfilesPath = `${this.BasePath}/profiles`

    constructor() {
        this.init()
    }

    init() {
        try {
            if (!fs.existsSync(this.BasePath)) {
                logger.info(`MAA 配置路径 ${this.BasePath} 不存在, 正在创建`)
                fs.mkdirSync(this.BasePath)
            }
            if (!fs.existsSync(this.TasksPath)) {
                logger.info(`MAA 任务(tasks)路径 ${this.TasksPath} 不存在, 正在创建`)
                fs.mkdirSync(this.TasksPath)
            }
            if (!fs.existsSync(this.ProfilesPath)) {
                logger.info(`MAA 相关配置(profiles)路径 ${this.ProfilesPath} 不存在, 正在创建`)
                fs.mkdirSync(this.ProfilesPath)
            }
        } catch (err) {
            logger.error('初始化MAA目录失败，Agent退出')
            process.exit(0)
        }
    }

    saveTask(id, task) {
        try {
            fs.writeFileSync(`${this.TasksPath}/${id}.json`, JSON.stringify(task), 'utf8')
        } catch (e) {
            logger.error('保存任务文件错误' + e)
        }
    }

    removeTask(id) {
        try {
            fs.unlinkSync(`${this.TasksPath}/${id}.json`)
        } catch (e) {
            logger.error('移除任务文件错误' + e)
        }
    }

    saveProfile(name = 'default', profile) {
        try {
            fs.writeFileSync(`${this.ProfilesPath}/${String(name)}.json`, JSON.stringify(profile), 'utf8')
        } catch (e) {
            logger.error('保存配置错误' + e)
        }
    }


    removeProfile(name = '') {
        try {
            fs.unlinkSync(`${this.ProfilesPath}/${name}.json`)
        } catch (e) {
            logger.error('移除配置错误' + e)
        }
    }
}