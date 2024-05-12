import pino from "pino";
import cron from 'node-cron';

const logger = pino()

export class Cron {


    cronTable = new Map()


    constructor(commitFunc) {
        /**
         * @type {function(taskid:string):Promise<void>}
         */
        this.commitTaskFunc = commitFunc
    }


    /**
     *
     * @param {string} id
     * @param {string} cronExp
     * @param {string} taskId
     * @return {Promise<void>}
     */
    async addCron(id, cronExp, taskId) {
        let task = cron.schedule(cronExp, () => {
            logger.info(`on Cron Task ${taskId}`)
            this.commitTaskFunc(taskId)
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




