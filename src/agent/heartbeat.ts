import PocketBase from 'pocketbase'

const env = process.env

class HeartBeat {

    private pb: PocketBase

    constructor(pb: PocketBase) {
        this.pb = pb

        if (env.AGENT_ID === undefined) {
            console.log('Please set AGENT_ID in .env')
            process.exit(0)
        }

    }

    async beat() {
        this.pb.collection('heartbeat')
            .getOne(env.AGENT_ID as string)
            .then(pkg => {
                pkg.updated = new Date().toISOString()
                return pkg
            })
            .then(pkg => {
                this.pb.collection('heartbeat')
                    .update(pkg.id, pkg)

            })
            .catch(err => {
                console.log('Error at heartbeating, ' + err + JSON.stringify(err))
            })

    }

    async run() {
        while (true) {
            await this.beat()
            await Bun.sleep(60000)
        }
    }

}

export default HeartBeat