import * as fs from "node:fs";
import pino from "pino";
import * as http from "node:http";


const logger = pino();


export class File {

    BasePath = '/root/.config/maa'

    TasksPath = `${this.BasePath}/tasks`

    ProfilesPath = `${this.BasePath}/profiles`

    CopilotURL = 'https://prts.plus'

    CopilotPath = '/root/.cache/maa/copilot'

    constructor() {
        this.init()
    }

    init() {
        try {
            if (!fs.existsSync(this.BasePath)) {
                logger.info(`MAA base path ${this.BasePath} not exists, creating`)
                fs.mkdirSync(this.BasePath)
            }
            if (!fs.existsSync(this.TasksPath)) {
                logger.info(`MAA tasks path ${this.TasksPath} not exists, creating`)
                fs.mkdirSync(this.TasksPath)
            }
            if (!fs.existsSync(this.ProfilesPath)) {
                logger.info(`MAA profiles base path ${this.ProfilesPath} not exists, creating`)
                fs.mkdirSync(this.ProfilesPath)
            }
            if (!fs.existsSync(this.CopilotPath)) {
                logger.info(`MAA profiles base path ${this.CopilotPath} not exists, creating`)
                fs.mkdirSync(this.CopilotPath)
            }
        } catch (err) {
            logger.error('init maa dir error, exit')
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