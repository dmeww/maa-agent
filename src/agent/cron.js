import pino from "pino";
import cron from 'node-cron';

const logger = pino()

export class Cron {


    cronTable = new Map()


    constructor(commitFunc) {
        /**
         * @type {function(taskid:string,profileid:string):Promise<void>}
         */
        this.commitTaskFunc = commitFunc
    }


    /**
     *
     * @param {string} id
     * @param {string} cronExp
     * @param {string} taskId
     * @param {string} profileId
     * @return {Promise<void>}
     */
    async addCron(id, cronExp, taskId,profileId) {
        let task = cron.schedule(cronExp, () => {
            logger.info(`Cron Task ${taskId} Emits`)
            this.commitTaskFunc(taskId,profileId)
        });
        this.cronTable.set(id, task)
    }

    async removeCron(id) {
        let task = this.cronTable.get(id);
        if (task !== undefined)
            task.stop()
        this.cronTable.delete(id)
    }

}




