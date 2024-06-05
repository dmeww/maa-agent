import PocketBase from 'pocketbase'
import process from "node:process";

/**
 * 环境变量
 */
let env = process.env
/**
 * Pocketbase后台
 */
let pb: null | PocketBase = null

export const initPocketBase = async () => {
    try {
        if (!env.POCKETBASE_URL || !env.POCKETBASE_USER || !env.POCKETBASE_PASS) {
            console.log('set POCKETBASE_URL | POCKETBASE_USER | POCKETBASE_PASS in .env for PocketBase')
            process.exit(0)
        }
        pb = new PocketBase(env.POCKETBASE_URL)
        pb.autoCancellation(false)
        await pb.admins.authWithPassword(env.POCKETBASE_USER, env.POCKETBASE_PASS)
    } catch (e) {
        console.log('PocketBase Connect Error')
        process.exit(0)
    }
}


export const usePocketBase = async () => {
    if (pb === null) {
        await initPocketBase()
    }
    return pb as PocketBase
}
