import {Device} from "./device.js";
import pino from 'pino';
import {exec, execSync} from 'node:child_process'
import {File} from "./file.js";
import PocketBase from "pocketbase";
import {RecordModel} from "pocketbase";

const logger = pino();

export class Executor {


    /**
     *  任务队列，异步插入，同步执行
     * @type {(()=>Promise<any>)[]}
     */
    queue = []


    /**
     * 当前执行的任务UUID
     * @type {string}
     */
    current = ''

    /**
     *
     * @type {PocketBase}
     */
    pb

    /**
     * @type {Device}
     */
    device

    constructor() {
        this.file = new File()
        this.exec().catch(err => {
            logger.error('Error:=>' + err)
            logger.info('Agent On Unhandled error, exiting...')
        })
    }

    /**
     * @param {PocketBase} pb
     */
    setPocketBase(pb) {
        this.pb = pb
    }

    /**
     * 当有任务时，执行任务 ，
     * 当没有任务时，每3秒轮询确认队列中是否有任务，并执行
     * @return {Promise<void>}
     */
    async exec() {
        if (!this.queue.length) {
            this.queue.push(async () => {
                await delay(3000)
                await this.exec()
            })
        }
        let task = this.queue.shift()
        await task()
    }

    /**
     * 向队列中添加任务
     * @param {RecordModel} record
     * @return {void}
     */
    pushTask(record) {
        this.queue.push(async () => {
            await this.do(record)
            await this.exec()
        })
    }

    /**
     * 执行MAA任务
     * @param {RecordModel} record
     * @return {Promise<unknown>}
     */
    do(record) {
        return new Promise(async (resolve) => {
            logger.info(`onTask-Executing:=> ${record.id}`)
            const prepare = async () => {
                // TODO 切换连接设备
                this.device = new Device(profile['content']['connection']['address'])
                logger.info(`Running Task: ${task['name']}`)
                // TODO 切换当前执行任务的ID
                this.current = task.id
                // TODO 让设备执行MAA<连接ADB，修改屏幕分辨率>
                await this.device.prepare().catch((e) => complete(String(e)))
                // TODO 保存配置文件
                this.file.saveProfile(profile['name'], profile['content'])
                // TODO 保存任务文件
                this.file.saveTask(task.id, task['content'])
                // TODO TODO 发送日志
                await this.report(record.id, 'Agent 开始工作')
            }

            const complete = async (endStr) => {
                this.current = ''
                // TODO 发送日志
                await this.report(record.id, endStr)
                // TODO 删除任务文件
                this.file.removeTask(task.id)
                // TODO 关闭设备屏幕
                await this.device.complete()
                // TODO 等待3秒
                await delay(3000)
                // TODO 从队列中删除任务执行详情
                await this.pb.collection('exec')
                    .delete(record.id)
                    .catch(handleError)
                // TODO 任务执行记录
                await this.summary(task['name'], summary)
                // TODO 删除已执行任务的日志
                await this.pb.collection('log')
                    .getFullList({
                        filter: `execid="${record.id}"`
                    })
                    .then(list => {
                        list.forEach(log => {
                            this.pb.collection('log')
                                .delete(log.id)
                                .catch(handleError)
                        })
                    })
                    .catch(handleError)
                resolve()
            }

            // TODO 获取任务执行详情
            let execModel = await this.pb.collection('exec')
                .getOne(record.id)
                .catch(handleError)

            if (execModel === undefined) {
                logger.info('没有在数据库找到执行详情(exec)，准备执行下一个任务')
                await complete('没有在数据库找到执行详情(exec)，准备执行下一个任务')
                return
            }
            // TODO 获取任务内容
            let task = await this.pb.collection('task')
                .getOne(record['taskid'])
                .catch(handleError)

            if (task === undefined) {
                logger.info('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                await complete('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                return
            }
            // TODO 告诉UI当前Agent正在执行的任务名
            execModel['taskname'] = task['name']

            // TODO 更新exec的执行任务名
            await this.pb.collection('exec')
                .update(record['id'], execModel)
                .catch(handleError)

            // TODO 加载MAA配置文件
            let profile = await this.pb.collection('profile')
                .getOne(record['profileid'])
                .catch(handleError)

            if (profile === undefined) {
                logger.info('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                await complete('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                return
            }


            await prepare()

            let summary = []
            /**
             * 输出合并到标准输出流中
             * @type {ChildProcess}
             */
            let run = exec(`maa 2>&1 run ${task.id} -p ${profile['name']} -v `)

            // 日志输出
            run.stdout.on('data', data => {
                let log = data.toString()
                if (log.startsWith('[INFO]') || log.includes('onnxruntime')) {
                    // 库日志不上报，因为我看不明白
                    return
                }
                this.report(record.id, log)
                if (summary.length > 0 || log.includes('Summary')) {
                    summary.push(log)
                }
            });
            // 正常退出
            run.on('close', async (code) => {
                await complete(`MAA 运行结束 代码:=>${code}`)
                resolve()
            });
            // 异常推出
            run.on('error', async (error) => {
                await complete(`MAA 运行异常 :=>${error}`)
                resolve()
            });

        })
    }

    /**
     * 当删除的任务执行详情的任务id是当前正在执行的任务id时，停止任务
     * @param taskid
     * @return {void}
     */
    stop(taskid = '') {
        if (taskid === this.current) {
            // TODO 停止正在运行的 MAA 进程
            execSync('pkill maa')
        }
    }

    /**
     * 发送日志
     * @param {string} execid
     * @param {string} content
     * @return {Promise<void>}
     */
    async report(execid, content) {
        await this.pb.collection('log')
            .create({
                execid,
                content
            })
            .catch(handleError)
    }

    /**
     *
     * @param name
     * @param {string[]} summary
     * @return {Promise<void>}
     */
    async summary(name = '', summary = []) {
        await this.pb.collection('history')
            .create({
                taskname: name,
                summary: summary.join('')
            })
            .catch(handleError)
    }


}

/**
 * 延时函数
 * @param ms
 * @return {Promise<unknown>}
 */
function delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 当PocketBase发生异常时，向控制台输出
 * @param err
 */
function handleError(err) {
    logger.error('PocketBase Error :=>' + err)
}