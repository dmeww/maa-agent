import {execSync} from 'node:child_process'


export class Device {

    constructor(device) {
        this.device = device
    }

    connect() {
        execSync(`adb connect ${this.device}`)
    }

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
