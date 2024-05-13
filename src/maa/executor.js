import {Device} from "./device.js";
import pino from 'pino';
import {exec, execSync} from 'node:child_process'
import {LogModel} from "../db/types.js";
import {File} from "./file.js";
import PocketBase from "pocketbase";

const logger = pino();

export class Executor {


    /**
     *  任务队列，异步插入，同步执行
     * @type {Function[]}
     */
    queue = []


    /**
     * 当前执行的任务UUID
     * @type {string}
     */
    current = ''

    /**
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
            logger.error('出错了' + err)
            logger.info('任务执行器 退出')
        })
    }

    /**
     * @param {PocketBase} pb
     */
    setPocketBase(pb) {
        this.pb = pb
    }


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

    async pushTask(record) {
        this.queue.push(async () => {
            await this.do(record)
            await this.exec()
        })
    }

    do(record) {
        return new Promise(async (resolve) => {

            const prepare = () => {
                this.device = new Device(profile['content']['connection']['device'])
                logger.info('Running Task: ' + task['name'])
                this.current = task.id
                this.device.connect()
                this.device.openScreen()
                this.file.saveProfile(profile['name'], profile['content'])
                this.file.saveTask(task.id, task['content'])
                this.report(new LogModel(task.id, 'Agent 开始工作'))
            }

            const complete = (endStr) => {
                this.current = ''
                this.report(new LogModel(task.id, endStr))
                this.file.removeTask(task.id)
                this.device.closeScreen()
                this.pb.collection('exec')
                    .delete(record['id'])
                    .catch(handleError)
                this.pb.collection('log')
                    .delete(task.id, {
                        fields: 'taskid'
                    })
                    .catch(handleError)
            }
            // TODO 检查exec表
            let execModel = await this.pb.collection('exec')
                .getOne(record['id'])
                .catch(handleError)

            if (execModel === undefined) {
                logger.info('没有在数据库找到执行详情(exec)，准备执行下一个任务')
                complete('没有在数据库找到执行详情(exec)，准备执行下一个任务')
                return
            }
            // TODO 获取任务内容
            let task = await this.pb.collection('task')
                .getOne(record['taskid'])
                .catch(handleError)

            if (task === undefined) {
                logger.info('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                complete('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                return
            }
            // TODO 告诉UI当前Agent正在执行的任务名
            execModel['taskname'] = task['name']

            // update exec status
            await this.pb.collection('exec')
                .update(record['id'], execModel)
                .catch(handleError)

            // load exec's profile
            let profile = await this.pb.collection('profile')
                .getOne(record['profileid'])
                .catch(handleError)

            if (profile === undefined) {
                logger.info('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                complete('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                return
            }


            prepare()

            /**
             * @type {ChildProcess}
             */
            let run = exec(`maa 2>&1 run ${task.id} -p ${profile['name']} -v `)

            // 日志输出
            run.stdout.on('data', data => {
                let log = data.toString()
                if (!log.startsWith('[INFO]') && !log.includes('onnxruntime'))
                    this.report(new LogModel(task.id, log))
            });
            // 正常退出
            run.on('close', code => {
                complete(`Exit with code ${code}`)
                resolve()
            });
            // 异常推出
            run.on('error', error => {
                complete(`Exit with error ${error}`)
                resolve()
            });

        })
    }

    async stop(taskid = '') {
        if (taskid === this.current) {
            // TODO 停止正在运行的 MAA 进程
            execSync('pkill maa')
        }
    }

    /**
     * @type {Function}
     * @return {void}
     */
    report(log = new LogModel()) {
        this.pb.collection('log')
            .create(log)
            .catch(handleError)
    }

}

function delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function handleError(err) {
    logger.error('Fetch error ' + err)
}