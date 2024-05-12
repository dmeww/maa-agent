import {Executor} from "./executor.js";
import {usePocketBase} from "../db/index.js";
import pino from 'pino';
import {Cron} from "./cron.js";

import PocketBase from "pocketbase";


const logger = pino();


export class Agent {


    /**
     * PocketBase SimpleBackend
     * @type {PocketBase}
     */
    pb


    constructor() {
        this.excutor = new Executor()
        this.cron = new Cron(async (taskId = '', profileId = '') => {
            await this.pb.collection('exec')
                .create({
                    taskid: taskId,
                    profileid: profileId,
                    running: false
                })
        })
    }

    async init() {
        this.pb = await usePocketBase()
        this.excutor.setPocketBase(this.pb)
        await this.loadCron()
        return this
    }

    async loadCron() {
        let cronList = await this.pb.collection('cron')
            .getFullList()
        cronList.forEach(cronRecord => {
            logger.info('Loading Cron : ' + cronRecord.id)
            this.cron.addCron(cronRecord.id, cronRecord.cron, cronRecord.taskid,cronRecord.profileid)
        })
    }


    run() {
        logger.info('Agent is already running')
        // TODO 监听 exec 表， 作为任务执行队列
        this.pb.collection('exec')
            .subscribe("*", e => {
                switch (e.action) {
                    // 启动任务 加入队列
                    case 'create': {
                        logger.info('Get Task Exec :=> ' + e.record['taskid'])
                        this.excutor.pushTask(e.record)
                        break
                    }
                    // 结束任务 从队列删除
                    case 'delete': {
                        logger.info('Delete Task Exec :=> ' + e.record['taskid'])
                        this.excutor.stop(e.record['taskid'])
                        break
                    }
                }
            })
        // TODO 监听 profiles 表， 同步至 MAA 配置中
        this.pb.collection('profile')
            .subscribe("*", e => {
                switch (e.action) {
                    case 'create': {
                        logger.info('Add Profile :=> ' + e.record['name'])
                        this.excutor.file.saveProfile(e.record['name'], e.record['content'])
                        break
                    }
                    case 'delete': {
                        logger.info('Delete Profile :=> ' + e.record)
                        this.excutor.file.removeProfile(e.record['name'])
                        break
                    }
                    case 'update': {
                        logger.info('Update Profile :=> ' + e.record)
                        this.excutor.file.saveProfile(e.record['name'], e.record['content'])
                        break
                    }
                }
            })
        // TODO 监听 cron 表，作为定时任务表
        this.pb.collection('cron')
            .subscribe('*', e => {
                switch (e.action) {
                    case 'create': {
                        logger.info('Add Cron :=> ' + e.record.id)
                        this.cron.addCron(e.record.id, e.record.cron, e.record.taskid,e.record.profileid)
                        break
                    }
                    case 'delete': {
                        logger.info('Delete Cron :=> ' + e.record.id)
                        this.cron.removeCron(e.record.id)
                        break
                    }
                    case 'update': {
                        logger.info('Update Cron :=> ' + e.record.id)
                        this.cron.removeCron(e.record.id)
                        this.cron.addCron(e.record.id, e.record.cron, e.record.taskid,e.record.profileid)
                        break
                    }
                }
            })

    }


}



