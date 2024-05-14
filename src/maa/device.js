import {execSync} from 'node:child_process'
import * as dotenv from "dotenv";
import pino from "pino";

const env = dotenv.config().parsed;
const logger = pino()

export class Device {

    constructor(device) {
        this.device = device
    }

    connect() {
        execSync(`adb connect ${this.device}`)
    }

    prepare() {
        this.connect()
        this.openScreen()
        this.setResolution()
    }

    complete() {
        this.resetResolution()
        this.closeScreen()
    }

    setResolution() {
        let res = Resolution[env.DEVICE_RESOLUTION]
        if (!res) {
            logger.info('Resolution NOT FOUND, Default to 720P')
            res = Resolution["720"]
        }
        execSync(`adb -s ${this.device} shell wm size ${res.width}x${res.height}`)
    }

    resetResolution() {
        execSync(`adb -s ${this.device} shell wm reset`)
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
            console.log('onError', e)
            return false
        }
    }

    openScreen() {
        if (this.isScreenOn()) return
        execSync(`adb -s ${this.device} shell input keyevent 26`)
    }

    closeScreen() {
        if (!this.isScreenOn()) return
        execSync(`adb -s ${this.device} shell input keyevent 26`)
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