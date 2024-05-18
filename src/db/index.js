import PocketBase from 'pocketbase'
import process from "node:process";
import * as dotenv from "dotenv";

const env = dotenv.config().parsed;


/**
 * @type {PocketBase}
 */
let pb = null

export const initPocketBase = async () => {
    if (!env.POCKETBASE_URL || !env.POCKETBASE_USER || !env.POCKETBASE_PASS) {
        console.log('set POCKETBASE_URL | POCKETBASE_USER | POCKETBASE_PASS in .env for PocketBase')
        process.exit(0)
    }
    pb = new PocketBase(env.POCKETBASE_URL)
    pb.autoCancellation(false)
    // 过期自动重登录
    pb.authStore.onChange(async () => {
        await pb.admins.authRefresh()
    }, true)
    await pb.admins.authWithPassword(env.POCKETBASE_USER, env.POCKETBASE_PASS)
}


export const usePocketBase = async () => {
    if (pb === null) {
        await initPocketBase()
    }
    return Promise.resolve(pb)
}
