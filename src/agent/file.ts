import * as fs from "node:fs";

export class File {

    /**
     * MAA配置路径
     */
    BasePath = '/root/.config/maa'

    /**
     * MAA任务文件路径
     */
    TasksPath = `${this.BasePath}/tasks`

    /**
     * MAA配置文件路径
     */
    ProfilesPath = `${this.BasePath}/profiles`

    constructor() {
        this.init()
    }

    init() {
        try {
            if (!fs.existsSync(this.TasksPath)) {
                console.log(`MAA Path ${this.BasePath} 不存在, 正在创建`)
                fs.mkdirSync(this.BasePath)
            }
            if (!fs.existsSync(this.TasksPath)) {
                console.log(`MAA TaskPath ${this.TasksPath} 不存在, 正在创建`)
                fs.mkdirSync(this.TasksPath)
            }
            if (!fs.existsSync(this.ProfilesPath)) {
                console.log(`MAA ProfilePath ${this.ProfilesPath} 不存在, 正在创建`)
                fs.mkdirSync(this.ProfilesPath)
            }
        } catch (err) {
            console.log('Agent exited cause MAA-Path create failed \n' + err)
            process.exit(0)
        }
    }

    /**
     * 保存任务内容到MAA任务目录
     * @param id 任务ID
     * @param task 任务内容
     */
    saveTask(id: string, task: any) {
        try {
            fs.writeFileSync(`${this.TasksPath}/${id}.json`, JSON.stringify(task), 'utf8')
        } catch (e) {
            console.log('保存任务文件错误' + e)
        }
    }
    /**
     * 移除任务文件
     * @param id 任务ID
     */
    removeTask(id: string) {
        try {
            fs.unlinkSync(`${this.TasksPath}/${id}.json`)
        } catch (e) {
            console.log('移除任务文件错误' + e)
        }
    }
    /**
     * 保存配置到MAA配置目录
     * @param name 配置文件名
     * @param profile 配置内容
     */
    saveProfile(name = 'default', profile: any) {
        try {
            fs.writeFileSync(`${this.ProfilesPath}/${String(name)}.json`, JSON.stringify(profile), 'utf8')
        } catch (e) {
            console.log('保存配置错误' + e)
        }
    }

    /**
     * 移除配置文件
     * @param name 配置文件名
     */
    removeProfile(name = '') {
        try {
            fs.unlinkSync(`${this.ProfilesPath}/${name}.json`)
        } catch (e) {
            console.log('移除配置错误' + e)
        }
    }
}