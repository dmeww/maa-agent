import { Device } from "./device.js";
import { exec, execSync } from 'node:child_process'
import { File } from "./file.js";
import Pocketbase from 'pocketbase'
import type { RecordModel } from "pocketbase";


const env = process.env
export class Executor {


    /**
     *  任务队列
     *  异步插入，同步执行
     */
    queue: (() => Promise<void>)[] = []

    /**
     * 当前执行的任务UUID
     */
    current = ''

    /**
     * PocketBase后台
     */
    pb: Pocketbase

    /**
     * 文件操作类
     */
    file: File = new File()


    constructor(pb: Pocketbase) {
        this.pb = pb
    }

    /**
     * 启动Agent
     */
    run() {
        return this.exec()
    }

    /**
     * 当有任务时，执行任务 ，
     * 当没有任务时，每3秒轮询确认队列
     */
    async exec() {
        if (!this.queue.length) {
            this.queue.push(async () => {
                await Bun.sleep(3000)
                await this.exec()
            })
        }
        let task = this.queue.shift()
        await task!()
    }

    /**
     * 向队列中添加任务
     */
    pushTask(record: RecordModel) {
        this.queue.push(async () => {
            await this.do(record)
            await this.exec()
        })
    }

    /**
     * 执行MAA任务
     */
    do(record: RecordModel) {

        return new Promise(async (resolve) => {
            console.log(`Task-Executing:=> ${record.id}`)

            const prepare = async () => {
                this.current = task!.id
                try {
                    await device.prepare()
                    this.file.saveProfile(profile!['name'], profile!['content'])
                    this.file.saveTask(task!.id, task!['content'])
                    await this.report(record.id, 'Agent Start Working\n')
                } catch (e) {
                    complete(String(e))
                }
            }

            const complete = async (endStr: string) => {
                this.current = ''
                try {
                    await this.report(record.id, endStr)
                    this.file.removeTask(task!.id)
                    await device.complete()
                    await Bun.sleep(3000)
                    await this.summary(task!['name'], summary)
                    if (!Number(env.AGENT_DEV)) { // 开发模式下不删日志 0:False 1:True
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
                    }
                    await this.pb.collection('exec')
                        .delete(record.id)
                        .catch(handleError)
                } catch (e) {
                    console.log('onCompleteTask Error' + String(e))
                }
                resolve(null)
            }


            // TODO 获取任务内容
            let task: RecordModel | void = await this.pb.collection('task')
                .getOne(record['taskid'])
                .catch(handleError)

            if (task === undefined) {
                console.log('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                await complete('没有在数据库找到对应的任务(task)，准备执行下一个任务')
                return
            }

            // TODO 加载MAA配置文件
            let profile: RecordModel | void = await this.pb.collection('profile')
                .getOne(record['profileid'])
                .catch(handleError)

            if (profile === undefined) {
                console.log('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                await complete('没有在数据库找到对应的配置文件(profile)，准备执行下一个任务')
                return
            }

            let device = new Device(profile['content']['connection']['address'])

            await prepare()

            /**
             * 总结内容
             */
            let summary: string[] = []
            /**
             * 通过maa_cli执行指令,并监听输出
             */
            let run = exec(`maa 2>&1 run ${task.id} -p ${profile['name']} -v `)

            // 日志输出
            run.stdout!.on('data', data => {
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
                resolve(null)
            });
            // 异常推出
            run.on('error', async (error) => {
                await complete(`MAA 运行异常 :=>${error}`)
                resolve(null)
            });

        })
    }

    /**
     * 当删除的任务执行详情的任务id是当前正在执行的任务id时，停止任务
     */
    stop(taskid: string) {
        if (taskid === this.current) {
            execSync('pkill maa')
        }
    }

    /**
     * 发送日志
     */
    async report(execid: string, content: string) {
        await this.pb.collection('log')
            .create({
                execid,
                content
            })
            .catch(handleError)
    }

    /**
     * 任务执行后进行总结
     */
    async summary(name: string, summary: string[]) {
        return await this.pb.collection('history')
            .create({
                taskname: name,
                summary: summary.join('')
            })
            .catch(handleError)
    }


}



/**
 * 当PocketBase发生异常时，向控制台输出
 * @param err
 */
function handleError(err: any) {
    console.log('PocketBase Error :=>' + err)
}

