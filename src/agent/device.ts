import { execSync } from 'node:child_process'
import { Resolution, type Res } from '../types'

export class Device {

    /**
     * 操作的设备字符串，用于ADB命令执行
     */
    device: string

    constructor(device: string) {
        this.device = device
    }

    /**
     * 执行任务前的准备动作
     * 1、调用ADB连接指定设备
     * 2、点亮设置屏幕
     * 3、设置屏幕分辨率为16:9 => 1080x1920 或 720x1280
     */
    async prepare() {
        try {
            this.connect()
            this.openScreen()
            this.setResolution()
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * 任务执行后的恢复动作
     * 1、重置屏幕为默认分辨率
     * 2、关闭屏幕
     */
    async complete() {
        try {
            this.resetResolution()
            this.closeScreen()
            return true
        } catch (e) {
            return false
        }
    }

    /**
     * 调用ADB连接指定设备
     */
    connect() {
        try {
            execSync(`adb connect ${this.device}`)
        } catch (e) {
            console.log('onError' + String(e))
        }
    }
    /**
     * 设置设备分辨率
     */
    setResolution() {
        let res = Resolution.get(process.env['DEVICE_RESOLUTION'] as any) as Res
        if (!res) {
            console.log('Resolution NOT FOUND, Default to 720P')
            res = Resolution.get('720')!
        }
        try {
            execSync(`adb -s ${this.device} shell wm size ${res!.width}x${res!.height}`)
        } catch (e) {
            console.log('onError' + String(e))
            throw e
        }
    }
    /**
     * 还原设备分辨率
     */
    resetResolution() {
        try {
            execSync(`adb -s ${this.device} shell wm reset`)
        } catch (e) {
            console.log('onError' + String(e))
            throw e
        }
    }

    /**
     * 检查屏幕状态
     */
    isScreenOn() {
        try {
            let out = execSync(`adb -s ${this.device} shell dumpsys deviceidle | grep mScreenOn`)
            let on = out.toString().trim().split('=')[1]
            return on === 'true'
        } catch (e) {
            console.log('onError' + String(e))
            throw e
        }
    }
    /**
     * 点亮屏幕
     */
    openScreen() {
        if (this.isScreenOn()) return
        try {
            execSync(`adb -s ${this.device} shell input keyevent 26`)
        } catch (e) {
            console.log('onError' + String(e))
            throw e
        }
    }
    /**
     * 关闭屏幕
     */
    closeScreen() {
        if (!this.isScreenOn()) return
        try {
            execSync(`adb -s ${this.device} shell input keyevent 26`)
        } catch (e) {
            console.log('onError' + String(e))
            throw e
        }
    }


}


