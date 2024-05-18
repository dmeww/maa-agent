import {execSync} from 'node:child_process'
import * as dotenv from "dotenv";
import pino from "pino";

const env = dotenv.config().parsed;
const logger = pino()

export class Device {

    constructor(device) {
        this.device = device
    }

    prepare() {
        return new Promise((resolve, reject) => {
            try {
                this.connect()
                this.openScreen()
                this.setResolution()
                resolve(true)
            } catch (e) {
                reject(e)
            }
        })
    }

    complete() {
        return new Promise((resolve, reject) => {
            try {
                this.resetResolution()
                this.closeScreen()
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    connect() {
        try {
            execSync(`adb connect ${this.device}`)
        } catch (e) {
            logger.info('onError' + String(e))
        }
    }

    setResolution() {
        let res = Resolution[env.DEVICE_RESOLUTION]
        if (!res) {
            logger.info('Resolution NOT FOUND, Default to 720P')
            res = Resolution["720"]
        }
        try {
            execSync(`adb -s ${this.device} shell wm size ${res.width}x${res.height}`)
        } catch (e) {
            logger.info('onError' + String(e))
            throw e
        }
    }

    resetResolution() {
        try {
            execSync(`adb -s ${this.device} shell wm reset`)
        } catch (e) {
            logger.info('onError' + String(e))
            throw e
        }
    }

    /**
     * 检查屏幕状态
     * @return {boolean}
     */
    isScreenOn() {
        try {
            let out = execSync(`adb -s ${this.device} shell dumpsys deviceidle | grep mScreenOn`)
            let on = out.toString().trim().split('=')[1]
            return on === 'true'
        } catch (e) {
            logger.info('onError' + String(e))
            throw e
        }
    }

    openScreen() {
        if (this.isScreenOn()) return
        try {
            execSync(`adb -s ${this.device} shell input keyevent 26`)
        } catch (e) {
            logger.info('onError' + String(e))
            throw e
        }
    }

    closeScreen() {
        if (!this.isScreenOn()) return
        try {
            execSync(`adb -s ${this.device} shell input keyevent 26`)
        } catch (e) {
            logger.info('onError' + String(e))
            throw e
        }
    }


}

const Resolution = {
    1080: {
        height: '1920',
        width: '1080'
    },
    720: {
        height: '1280',
        width: '720'
    }
}