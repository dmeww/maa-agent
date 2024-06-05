import cron from 'node-cron';


export class Cron {

    /**
     * 定时任务集合，key为定时任务的ID
     */
    cronTable = new Map()

    /**
     * 定时任务内容
     */
    commitTaskFunc: (taskid: string, profileid: string) => Promise<void>


    constructor(commitFunc: (taskid: string, profileid: string) => Promise<void>) {
        this.commitTaskFunc = commitFunc
    }

    /**
     * 添加定时任务，参数为定时任务Table中的字段
     */
    async addCron(id: string, cronExp: string, taskId: string, profileId: string) {
        let task = cron.schedule(cronExp, () => {
            console.log(`Cron Task ${taskId} Emits`)
            this.commitTaskFunc(taskId, profileId)
        })
        this.cronTable.set(id, task)
    }

    /**
    * 移除定时任务
    */
    async removeCron(id: string) {
        let task = this.cronTable.get(id)
        if (task !== undefined)
            task.stop()
        this.cronTable.delete(id)
    }

}




