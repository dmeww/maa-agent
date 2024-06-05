import { Executor } from "./executor.ts";
import { usePocketBase } from "../pocketbase/index.ts";
import { Cron } from "./cron.ts";
import PocketBase, { type RecordModel } from "pocketbase";
import HeartBeat from "./heartbeat.ts";


class Agent {


    /**
     * PocketBase后台
     */
    pb!: PocketBase


    /**
     * 任务执行器
     */
    excutor!: Executor

    /**
     * 定时任务管理
     */
    cron: Cron

    constructor() {
        this.cron = new Cron(async (taskid: string, profileid: string) => {
            await this.pb.collection('exec')
                .create({ taskid, profileid })
                .catch(e => console.log('Error CronTask: Add Error'))
        })
    }

    async init() {
        this.pb = await usePocketBase()
        this.excutor = new Executor(this.pb)
        await this.loadCron()
        return this
    }

    async loadCron() {
        let cronList: RecordModel[] | void = await this.pb.collection('cron')
            .getFullList()
            .catch(e => console.log('Load Cron Error: Get Cron List Error' + String(e)))
        cronList!.forEach((cronRecord: RecordModel) => {
            console.log('Loading CRON : ' + cronRecord.id)
            this.cron.addCron(cronRecord.id, cronRecord.cron, cronRecord.taskid, cronRecord.profileid)
        })
    }


    run() {
        console.log('Agent Start Successfully')
        // TODO 监听 exec 表， 作为任务执行队列
        this.pb.collection('exec')
            .subscribe("*", e => {
                switch (e.action) {
                    // 启动任务 加入队列
                    case 'create': {
                        console.log('Get Task Exec :=> ' + e.record['taskid'])
                        this.excutor.pushTask(e.record)
                        break
                    }
                    // 结束任务 从队列删除
                    case 'delete': {
                        console.log('Delete Task Exec :=> ' + e.record['taskid'])
                        this.excutor.stop(e.record['taskid'])
                        break
                    }
                }
            })
        // TODO 监听 cron 表，作为定时任务表
        this.pb.collection('cron')
            .subscribe('*', e => {
                switch (e.action) {
                    case 'create': {
                        console.log('Add Cron :=> ' + e.record.id)
                        this.cron.addCron(e.record.id, e.record.cron, e.record.taskid, e.record.profileid)
                        break
                    }
                    case 'delete': {
                        console.log('Delete Cron :=> ' + e.record.id)
                        this.cron.removeCron(e.record.id)
                        break
                    }
                    case 'update': {
                        console.log('Update Cron :=> ' + e.record.id)
                        this.cron.removeCron(e.record.id)
                        this.cron.addCron(e.record.id, e.record.cron, e.record.taskid, e.record.profileid)
                        break
                    }
                }
            })
        // TODO 启动任务执行器
        this.excutor.run()
        // TODO 发送心跳，让用户知道Agent是否存活
        new HeartBeat(this.pb).run()
    }


}



export default Agent